import { blink } from '@/blink/client'

interface LeadData {
  customerName: string
  customerEmail: string
  customerPhone: string
  address: string
  city: string
  postalCode: string
  serviceType: string
  estimatedHours: number
  priority: 'low' | 'medium' | 'high'
  notes: string
}

interface AIResponse {
  leadData: LeadData
  emailResponse: string
  smsMessage: string
  analysis: string
}

interface TimeSlot {
  formatted: string
  start: Date
}

class AIService {
  async processLeadEmail(emailContent: string, source: string): Promise<AIResponse | null> {
    try {
      // Use Blink AI to process the email content
      const { text } = await blink.ai.generateText({
        prompt: `Analyze this lead email and extract customer information. Email content: "${emailContent}" from source: "${source}". 
        
        Extract and format as JSON:
        - customerName
        - customerEmail  
        - customerPhone
        - address
        - city
        - postalCode
        - serviceType (cleaning type requested)
        - estimatedHours (estimate based on service)
        - priority (low/medium/high based on urgency)
        - notes (any special requirements)
        
        Also provide:
        - analysis (brief assessment of the lead quality)
        - emailResponse (professional Danish response)
        - smsMessage (short Danish SMS with booking options)`,
        model: 'gpt-4o-mini'
      })

      // Parse the AI response (in a real app, you'd use structured output)
      try {
        const parsed = JSON.parse(text)
        return parsed as AIResponse
      } catch {
        // Fallback if JSON parsing fails
        return this.getFallbackAIResponse(emailContent)
      }
    } catch (error) {
      console.error('Error processing lead email with AI:', error)
      return null
    }
  }

  async generateEmailResponse(
    customerName: string,
    serviceType: string,
    timeSlots: TimeSlot[]
  ): Promise<string> {
    try {
      const slotsText = timeSlots.map((slot, index) => 
        `${index + 1}. ${slot.formatted}`
      ).join(', ')

      const { text } = await blink.ai.generateText({
        prompt: `Generate a professional Danish email response for Rendetalje cleaning company.
        
        Customer: ${customerName}
        Service: ${serviceType}
        Available time slots: ${slotsText}
        
        Include:
        - Professional greeting
        - Thank them for their inquiry
        - List the 3 time slots clearly
        - Mention they'll receive SMS with same options
        - Ask them to reply with 1, 2, or 3
        - Include hourly rate (349 DKK/hour)
        - Professional closing with company contact info
        
        Write in Danish, professional but friendly tone.`,
        model: 'gpt-4o-mini'
      })

      return text || this.getFallbackEmailResponse(customerName, serviceType, timeSlots)
    } catch (error) {
      console.error('Error generating email response:', error)
      return this.getFallbackEmailResponse(customerName, serviceType, timeSlots)
    }
  }

  async generateSMSMessage(
    customerName: string,
    timeSlots: TimeSlot[]
  ): Promise<string> {
    try {
      const slotsText = timeSlots.map((slot, index) => 
        `${index + 1}: ${slot.formatted}`
      ).join(', ')

      const { text } = await blink.ai.generateText({
        prompt: `Generate a short Danish SMS message for Rendetalje cleaning company.
        
        Customer: ${customerName}
        Time slots: ${slotsText}
        
        Requirements:
        - Keep it under 160 characters
        - Professional but friendly
        - Ask them to reply with 1, 2, or 3
        - Include company name
        
        Write in Danish.`,
        model: 'gpt-4o-mini'
      })

      return text || this.getFallbackSMSMessage(customerName, timeSlots)
    } catch (error) {
      console.error('Error generating SMS message:', error)
      return this.getFallbackSMSMessage(customerName, timeSlots)
    }
  }

  async analyzeLeadQuality(leadData: LeadData): Promise<{
    score: number
    factors: string[]
    recommendations: string[]
  }> {
    try {
      const { text } = await blink.ai.generateText({
        prompt: `Analyze this lead quality for a Danish cleaning company:
        
        Customer: ${leadData.customerName}
        Email: ${leadData.customerEmail}
        Phone: ${leadData.customerPhone}
        Service: ${leadData.serviceType}
        Location: ${leadData.city}
        Notes: ${leadData.notes}
        
        Provide analysis as JSON:
        {
          "score": number (0-100),
          "factors": ["positive factor 1", "positive factor 2"],
          "recommendations": ["action 1", "action 2"]
        }
        
        Consider: completeness of info, service type profitability, location accessibility, urgency indicators.`,
        model: 'gpt-4o-mini'
      })

      try {
        return JSON.parse(text)
      } catch {
        return this.getFallbackLeadAnalysis()
      }
    } catch (error) {
      console.error('Error analyzing lead quality:', error)
      return this.getFallbackLeadAnalysis()
    }
  }

  async generateBookingConfirmation(
    customerName: string,
    serviceType: string,
    bookingDate: string,
    bookingTime: string,
    address: string
  ): Promise<string> {
    try {
      const { text } = await blink.ai.generateText({
        prompt: `Generate a booking confirmation message in Danish for Rendetalje cleaning company.
        
        Customer: ${customerName}
        Service: ${serviceType}
        Date: ${bookingDate}
        Time: ${bookingTime}
        Address: ${address}
        
        Include:
        - Professional greeting
        - Confirmation of booking details
        - What to expect
        - Contact information
        - Professional closing
        
        Write in Danish, professional and reassuring tone.`,
        model: 'gpt-4o-mini'
      })

      return text || this.getFallbackBookingConfirmation(customerName, serviceType, bookingDate, bookingTime, address)
    } catch (error) {
      console.error('Error generating booking confirmation:', error)
      return this.getFallbackBookingConfirmation(customerName, serviceType, bookingDate, bookingTime, address)
    }
  }

  async generateInvoiceDescription(
    serviceType: string,
    hoursWorked: number,
    address: string,
    notes?: string
  ): Promise<string> {
    try {
      const { text } = await blink.ai.generateText({
        prompt: `Generate a professional Danish invoice description for cleaning services.
        
        Service: ${serviceType}
        Hours worked: ${hoursWorked}
        Address: ${address}
        Notes: ${notes || 'None'}
        
        Create a clear, professional description suitable for an invoice.
        Include service type, location, and duration.
        Write in Danish.`,
        model: 'gpt-4o-mini'
      })

      return text || `${serviceType} udført på ${address}. Arbejdstid: ${hoursWorked} timer.`
    } catch (error) {
      console.error('Error generating invoice description:', error)
      return `${serviceType} udført på ${address}. Arbejdstid: ${hoursWorked} timer.`
    }
  }

  // Fallback methods for when AI service is unavailable
  private getFallbackAIResponse(emailContent: string): AIResponse {
    return {
      leadData: {
        customerName: 'Kunde',
        customerEmail: '',
        customerPhone: '',
        address: '',
        city: '',
        postalCode: '',
        serviceType: 'Rengøring',
        estimatedHours: 3,
        priority: 'medium',
        notes: emailContent.substring(0, 100)
      },
      emailResponse: 'Tak for din henvendelse. Vi vender tilbage hurtigst muligt.',
      smsMessage: 'Tak for din henvendelse til Rendetalje. Vi kontakter dig snart.',
      analysis: 'Lead kræver manuel gennemgang.'
    }
  }

  private getFallbackEmailResponse(customerName: string, serviceType: string, timeSlots: TimeSlot[]): string {
    const slotsText = timeSlots.map((slot, index) => 
      `${index + 1}. ${slot.formatted} (${slot.start.toLocaleDateString('da-DK', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
      })})`
    ).join('\\n')

    return `Kære ${customerName},

Tak for din henvendelse til Rendetalje.

Vi har følgende ledige tidspunkter til ${serviceType}:

${slotsText}

Du vil modtage en SMS med samme tidspunkter. Svar venligst med 1, 2 eller 3 for at booke dit ønskede tidspunkt.

Vores timepris er 349 DKK/time.

Med venlig hilsen,
Rendetalje
info@rendetalje.dk
+45 22 65 02 26`
  }

  private getFallbackSMSMessage(customerName: string, timeSlots: TimeSlot[]): string {
    const slotsText = timeSlots.map((slot, index) => 
      `${index + 1}: ${slot.formatted}`
    ).join(', ')

    return `Hej ${customerName}, tak for din henvendelse til Rendetalje. Ledige tider: ${slotsText}. Svar med 1, 2 eller 3 for at booke. Mvh Rendetalje`
  }

  private getFallbackLeadAnalysis(): {
    score: number
    factors: string[]
    recommendations: string[]
  } {
    return {
      score: 75,
      factors: ['Komplet kontaktinfo', 'Klar service-type'],
      recommendations: ['Send tilbud hurtigt', 'Følg op inden for 24 timer']
    }
  }

  private getFallbackBookingConfirmation(
    customerName: string,
    serviceType: string,
    bookingDate: string,
    bookingTime: string,
    address: string
  ): string {
    return `Kære ${customerName},

Din booking er bekræftet!

Service: ${serviceType}
Dato: ${new Date(bookingDate).toLocaleDateString('da-DK', { 
  weekday: 'long', 
  day: 'numeric', 
  month: 'long',
  year: 'numeric'
})}
Tidspunkt: ${bookingTime}
Adresse: ${address}

Vi glæder os til at hjælpe dig.

Med venlig hilsen,
Rendetalje
info@rendetalje.dk
+45 22 65 02 26`
  }

  // Test function to verify AI service connectivity
  async testAIConnection(): Promise<boolean> {
    try {
      const { text } = await blink.ai.generateText({
        prompt: 'Test connection. Respond with "AI service is working"',
        model: 'gpt-4o-mini'
      })

      console.log('AI service test successful:', text)
      return text.includes('working') || text.includes('AI')
    } catch (error) {
      console.error('AI service test error:', error)
      return false
    }
  }
}

export const aiService = new AIService()