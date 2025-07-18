import { blink } from '@/blink/client'

interface ProcessedEmail {
  messageId: string
  subject: string
  sender: string
  recipient: string
  body: string
  source: 'booking_form' | 'leadpoint' | 'leadmail'
}

interface EmailProcessingResult {
  success: boolean
  leadId?: string
  error?: string
}

interface GmailOAuthTokens {
  access_token: string
  refresh_token: string
  expires_at: string
}

class GmailService {
  private readonly GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify'
  ]

  // Gmail OAuth Flow
  async initiateGmailAuth(): Promise<string> {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      const redirectUri = `${window.location.origin}/gmail-callback`
      
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      authUrl.searchParams.set('client_id', clientId)
      authUrl.searchParams.set('redirect_uri', redirectUri)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', this.GMAIL_SCOPES.join(' '))
      authUrl.searchParams.set('access_type', 'offline')
      authUrl.searchParams.set('prompt', 'consent')
      
      return authUrl.toString()
    } catch (error) {
      console.error('Error initiating Gmail auth:', error)
      throw error
    }
  }

  async handleGmailCallback(code: string): Promise<boolean> {
    try {
      // For now, return true as a placeholder
      // In production, you'd exchange the code for tokens and store them
      console.log('Gmail callback handled with code:', code)
      return true
    } catch (error) {
      console.error('Error handling Gmail callback:', error)
      return false
    }
  }

  private async storeGmailTokens(userId: string, tokens: GmailOAuthTokens): Promise<void> {
    try {
      // Store tokens using Blink SDK
      await blink.db.gmailTokens.upsert({
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: tokens.expires_at,
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error storing Gmail tokens:', error)
      throw error
    }
  }

  async getGmailTokens(userId: string): Promise<GmailOAuthTokens | null> {
    try {
      const tokens = await blink.db.gmailTokens.list({
        where: { userId },
        limit: 1
      })

      if (tokens.length === 0) return null

      const token = tokens[0]
      
      // Check if token needs refresh
      const expiresAt = new Date(token.expiresAt)
      const now = new Date()
      
      if (expiresAt <= now) {
        // Refresh token
        return await this.refreshGmailToken(userId, token.refreshToken)
      }

      return {
        access_token: token.accessToken,
        refresh_token: token.refreshToken,
        expires_at: token.expiresAt
      }
    } catch (error) {
      console.error('Error getting Gmail tokens:', error)
      return null
    }
  }

  private async refreshGmailToken(userId: string, refreshToken: string): Promise<GmailOAuthTokens | null> {
    try {
      // For now, return null as placeholder
      // In production, you'd call Google's token refresh endpoint
      console.log('Token refresh requested for user:', userId)
      return null
    } catch (error) {
      console.error('Error refreshing Gmail token:', error)
      return null
    }
  }

  async isGmailConnected(): Promise<boolean> {
    try {
      const user = await blink.auth.me()
      const tokens = await this.getGmailTokens(user.id)
      return !!tokens
    } catch (error) {
      console.error('Error checking Gmail connection:', error)
      return false
    }
  }

  // Email Processing
  async processNewEmails(): Promise<ProcessedEmail[]> {
    try {
      // For now, return empty array as placeholder
      // In production, you'd fetch emails from Gmail API
      console.log('Processing new emails...')
      return []
    } catch (error) {
      console.error('Error processing new emails:', error)
      return []
    }
  }

  async processEmailWithAI(email: ProcessedEmail): Promise<EmailProcessingResult> {
    try {
      // Use Blink AI to extract lead information
      const aiPrompt = `
Analyser følgende email og udtræk kunde information til et dansk rengørings firma (Rendetalje):

EMAIL INDHOLD:
Fra: ${email.sender}
Emne: ${email.subject}
Indhold: ${email.body}

Udtræk følgende information og returner som JSON:
{
  "customerName": "kundens fulde navn",
  "customerEmail": "email adresse",
  "customerPhone": "telefonnummer (dansk format +45 XX XX XX XX)",
  "serviceType": "type af rengøring (Kontorrengøring, Hjemmerengøring, Vinduespolering, etc.)",
  "address": "adresse",
  "city": "by",
  "postalCode": "postnummer",
  "estimatedHours": antal_timer_som_tal,
  "priority": "low/medium/high baseret på urgency",
  "notes": "relevante noter fra emailen"
}

Hvis information mangler, gæt intelligent baseret på kontekst. Brug danske navne og adresser.
`

      const { object: aiResult } = await blink.ai.generateObject({
        prompt: aiPrompt,
        schema: {
          type: 'object',
          properties: {
            customerName: { type: 'string' },
            customerEmail: { type: 'string' },
            customerPhone: { type: 'string' },
            serviceType: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            postalCode: { type: 'string' },
            estimatedHours: { type: 'number' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            notes: { type: 'string' }
          },
          required: ['customerName', 'customerEmail', 'customerPhone', 'serviceType', 'address', 'city', 'estimatedHours', 'priority', 'notes']
        }
      })

      // Calculate pricing (349 DKK/hour)
      const hourlyRate = 349
      const estimatedPrice = aiResult.estimatedHours * hourlyRate

      // Create lead in database using Blink SDK
      const user = await blink.auth.me()
      const newLead = await blink.db.leads.create({
        userId: user.id,
        customerName: aiResult.customerName,
        customerEmail: aiResult.customerEmail,
        customerPhone: aiResult.customerPhone,
        source: email.source,
        serviceType: aiResult.serviceType,
        address: aiResult.address,
        city: aiResult.city,
        postalCode: aiResult.postalCode || '',
        estimatedHours: aiResult.estimatedHours,
        estimatedPrice: estimatedPrice,
        status: 'new',
        priority: aiResult.priority,
        notes: `${aiResult.notes} - AI analyseret fra ${email.source}`,
        aiAnalysis: JSON.stringify(aiResult),
        emailContent: email.body,
        responseSent: false
      })

      // Log the email processing
      await this.logEmail(email, newLead.id)

      // Generate and send automatic response
      await this.sendAutomaticResponse(newLead)

      return { success: true, leadId: newLead.id }
    } catch (error) {
      console.error('Error processing email with AI:', error)
      return { success: false, error: error.message }
    }
  }

  private async sendAutomaticResponse(lead: any): Promise<void> {
    try {
      // Generate AI email response
      const emailPrompt = `
Generer et professionelt dansk email svar til en kunde der har anmodet om rengøring.

KUNDE INFO:
- Navn: ${lead.customerName}
- Service: ${lead.serviceType}
- Adresse: ${lead.address}, ${lead.city}
- Estimeret tid: ${lead.estimatedHours} timer
- Estimeret pris: ${lead.estimatedPrice} kr

Skriv et venligt, professionelt svar på dansk der:
1. Takker for henvendelsen
2. Bekræfter service type og adresse
3. Foreslår 3 ledige tidspunkter (i morgen kl. 10:00, overmorgen kl. 14:00, næste uge kl. 09:00)
4. Nævner prisen (${lead.estimatedPrice} kr for ${lead.estimatedHours} timer)
5. Beder dem svare med SMS med valg 1, 2 eller 3
6. Inkluderer kontaktinfo: 22 65 02 26

Brug Rendetalje's venlige og professionelle tone.
`

      const { text: emailResponse } = await blink.ai.generateText({
        prompt: emailPrompt
      })

      // Send email via Blink notifications
      await blink.notifications.email({
        to: lead.customerEmail,
        from: 'info@rendetalje.dk',
        subject: 'Svar på din rengøringsforespørgsel - Rendetalje',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #10B981; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0;">Rendetalje</h1>
              <p style="margin: 5px 0 0 0;">Professionel rengøring i Aarhus</p>
            </div>
            <div style="padding: 20px;">
              ${emailResponse.replace(/\n/g, '<br>')}
            </div>
            <div style="background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
              <p>Rendetalje ApS | CVR: 45564096</p>
              <p>Gammel Viborgvej 40, 8381 Tilst | Telefon: 22 65 02 26</p>
            </div>
          </div>
        `,
        text: emailResponse
      })

      // Generate SMS message
      const smsPrompt = `
Generer en kort SMS besked til ${lead.customerName} med 3 ledige tidspunkter for ${lead.serviceType}.

Format:
Hej ${lead.customerName}! Tak for din henvendelse. Vi kan tilbyde:
1) I morgen kl. 10:00
2) Overmorgen kl. 14:00
3) Næste uge kl. 09:00

Svar med 1, 2 eller 3. Pris: ${lead.estimatedPrice} kr.
Mvh Rendetalje - 22 65 02 26
`

      const { text: smsMessage } = await blink.ai.generateText({
        prompt: smsPrompt
      })

      // Store SMS for later sending (when Twilio is configured)
      await blink.db.smsMessages.create({
        leadId: lead.id,
        phoneNumber: lead.customerPhone,
        messageContent: smsMessage,
        messageType: 'booking_offer',
        status: 'pending',
        userId: lead.userId
      })

      // Update lead as contacted
      await blink.db.leads.update(lead.id, { 
        status: 'contacted',
        responseSent: true
      })

      // Log activity
      await blink.db.activities.create({
        userId: lead.userId,
        leadId: lead.id,
        type: 'email_sent',
        title: 'Automatisk svar sendt',
        description: `Email og SMS svar sendt til ${lead.customerName}`,
        status: 'success',
        customer: lead.customerName
      })

    } catch (error) {
      console.error('Error sending automatic response:', error)
    }
  }

  async handleSMSResponse(from: string, body: string): Promise<void> {
    try {
      // Find lead by phone number
      const leads = await blink.db.leads.list({
        where: {
          AND: [
            { customerPhone: from },
            { status: 'contacted' }
          ]
        },
        limit: 1
      })
      
      if (leads.length === 0) {
        console.log('No lead found for phone number:', from)
        return
      }

      const lead = leads[0]
      const choice = parseInt(body.trim())
      
      if (choice >= 1 && choice <= 3) {
        // Update lead status
        await blink.db.leads.update(lead.id, { 
          status: 'booked',
          bookingTimeSlot: choice.toString()
        })

        // Log activity
        await blink.db.activities.create({
          userId: lead.userId,
          leadId: lead.id,
          type: 'booking',
          title: 'Booking bekræftet via SMS',
          description: `Kunde valgte tidspunkt ${choice}`,
          status: 'success',
          customer: lead.customerName
        })
      }
    } catch (error) {
      console.error('Error handling SMS response:', error)
    }
  }

  private async logEmail(email: ProcessedEmail, leadId?: string): Promise<void> {
    try {
      const user = await blink.auth.me()

      await blink.db.emailLogs.create({
        userId: user.id,
        gmailMessageId: email.messageId,
        subject: email.subject,
        sender: email.sender,
        recipient: email.recipient,
        body: email.body,
        source: email.source,
        processed: !!leadId,
        leadId: leadId
      })
    } catch (error) {
      console.error('Error logging email:', error)
    }
  }

  async getEmailLogs(): Promise<any[]> {
    try {
      const user = await blink.auth.me()

      const logs = await blink.db.emailLogs.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        limit: 50
      })

      return logs
    } catch (error) {
      console.error('Error fetching email logs:', error)
      return []
    }
  }

  async startEmailMonitoring(): Promise<void> {
    try {
      const user = await blink.auth.me()
      const tokens = await this.getGmailTokens(user.id)
      
      if (!tokens) {
        throw new Error('Gmail not connected')
      }

      console.log('Email monitoring started for user:', user.id)
    } catch (error) {
      console.error('Error starting email monitoring:', error)
    }
  }

  async stopEmailMonitoring(): Promise<void> {
    try {
      const user = await blink.auth.me()
      console.log('Email monitoring stopped for user:', user.id)
    } catch (error) {
      console.error('Error stopping email monitoring:', error)
    }
  }

  // Test function to manually process emails
  async testEmailProcessing(): Promise<void> {
    try {
      console.log('Starting email processing test...')
      
      const emails = await this.processNewEmails()
      console.log(`Found ${emails.length} new emails`)

      for (const email of emails) {
        console.log(`Processing email: ${email.subject}`)
        const result = await this.processEmailWithAI(email)
        
        if (result.success) {
          console.log(`✅ Successfully processed email, created lead: ${result.leadId}`)
        } else {
          console.log(`❌ Failed to process email: ${result.error}`)
        }
      }
    } catch (error) {
      console.error('Error in test email processing:', error)
    }
  }
}

export const gmailService = new GmailService()