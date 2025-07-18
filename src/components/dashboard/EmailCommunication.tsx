import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { blink } from '@/blink/client'
import { 
  Mail, 
  Send, 
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Calendar,
  User
} from 'lucide-react'
import { useLeads } from '@/hooks/useLeads'
import { Lead } from '@/types'

interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  type: 'booking_options' | 'confirmation' | 'reminder'
}

interface EmailMessage {
  id: string
  leadId?: string
  email: string
  subject: string
  content: string
  messageType: 'booking_options' | 'confirmation' | 'reminder'
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  sentAt?: string
  deliveredAt?: string
  createdAt: string
}

const emailTemplates: EmailTemplate[] = [
  {
    id: 'booking_options',
    name: 'Booking Muligheder',
    subject: 'Tak for din henvendelse - {{serviceType}}',
    content: `Hej {{customerName}}!

Tak for din henvendelse om {{serviceType}}. Vi har 3 ledige tidspunkter:

🗓️ Mulighed 1: {{slot1}}
🗓️ Mulighed 2: {{slot2}}  
🗓️ Mulighed 3: {{slot3}}

Svar venligst på denne email med dit ønskede tidspunkt (1, 2 eller 3).

💰 Estimeret pris: {{estimatedPrice}} kr for {{estimatedHours}} timer
📍 Adresse: {{address}}

Vi glæder os til at høre fra dig!

Med venlig hilsen
Rendetalje Team
📧 info@rendetalje.dk | 📱 71 99 88 77`,
    type: 'booking_options'
  },
  {
    id: 'confirmation',
    name: 'Booking Bekræftelse',
    subject: 'Booking bekræftet - {{serviceType}}',
    content: `Hej {{customerName}}!

Din booking er nu bekræftet:

📅 Dato: {{bookingDate}}
🕐 Tidspunkt: {{bookingTime}}
📍 Adresse: {{address}}
🧹 Service: {{serviceType}}
💰 Pris: {{totalAmount}} kr

Vi glæder os til at se dig!

Har du spørgsmål, så ring på 71 99 88 77.

Med venlig hilsen
Rendetalje Team`,
    type: 'confirmation'
  },
  {
    id: 'reminder',
    name: 'Påmindelse',
    subject: 'Påmindelse: Vi kommer i morgen - {{serviceType}}',
    content: `Hej {{customerName}}!

Dette er en påmindelse om at vi kommer i morgen:

🕐 Tidspunkt: {{bookingTime}}
📍 Adresse: {{address}}
🧹 Service: {{serviceType}}

Sørg venligst for at være hjemme og at området er tilgængeligt.

Ring på 71 99 88 77 hvis du har spørgsmål.

Med venlig hilsen
Rendetalje Team`,
    type: 'reminder'
  }
]

export function EmailCommunication() {
  const { leads } = useLeads()
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(emailTemplates[0])
  const [customSubject, setCustomSubject] = useState('')
  const [customContent, setCustomContent] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [emailHistory, setEmailHistory] = useState<EmailMessage[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const loadEmailHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      // In real implementation, this would fetch from database
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockHistory: EmailMessage[] = [
        {
          id: 'email_1',
          leadId: leads[0]?.id || 'lead_1',
          email: 'lars@example.com',
          subject: 'Tak for din henvendelse - Kontorrengøring',
          content: 'Hej Lars! Tak for din henvendelse...',
          messageType: 'booking_options',
          status: 'delivered',
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          deliveredAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString(),
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'email_2',
          leadId: leads[1]?.id || 'lead_2',
          email: 'maria@example.com',
          subject: 'Booking bekræftet - Hjemmerengøring',
          content: 'Hej Maria! Din booking er bekræftet...',
          messageType: 'confirmation',
          status: 'delivered',
          sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          deliveredAt: new Date(Date.now() - 1 * 60 * 60 * 1000 + 15000).toISOString(),
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        }
      ]
      
      setEmailHistory(mockHistory)
    } catch (err) {
      console.error('Error loading email history:', err)
    } finally {
      setLoadingHistory(false)
    }
  }, [leads])

  // Load email history
  useEffect(() => {
    loadEmailHistory()
  }, [loadEmailHistory])

  const generateSubject = (template: EmailTemplate, lead: Lead | null) => {
    const serviceType = lead?.serviceType || '[Service type]'
    
    return template.subject
      .replace(/{{serviceType}}/g, serviceType)
  }

  const generateContent = (template: EmailTemplate, lead: Lead | null) => {
    const timeSlots = [
      'Tirsdag 16/1 kl. 10:00',
      'Tirsdag 16/1 kl. 14:00', 
      'Onsdag 17/1 kl. 09:00'
    ]

    // Default values when no lead is selected
    const customerName = lead?.customerName || '[Kunde navn]'
    const serviceType = lead?.serviceType || '[Service type]'
    const estimatedPrice = lead?.estimatedPrice || 1000
    const estimatedHours = lead?.estimatedHours || 2
    const address = lead?.address || '[Adresse]'
    const city = lead?.city || '[By]'
    const bookingDate = lead?.bookingDate ? new Date(lead.bookingDate).toLocaleDateString('da-DK') : '[Dato]'
    const bookingTime = lead?.bookingDate ? new Date(lead.bookingDate).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' }) : '[Tid]'

    return template.content
      .replace(/{{customerName}}/g, customerName)
      .replace(/{{serviceType}}/g, serviceType)
      .replace(/{{estimatedPrice}}/g, estimatedPrice.toLocaleString())
      .replace(/{{estimatedHours}}/g, estimatedHours.toString())
      .replace(/{{address}}/g, `${address}, ${city}`)
      .replace(/{{slot1}}/g, timeSlots[0])
      .replace(/{{slot2}}/g, timeSlots[1])
      .replace(/{{slot3}}/g, timeSlots[2])
      .replace(/{{bookingDate}}/g, bookingDate)
      .replace(/{{bookingTime}}/g, bookingTime)
      .replace(/{{totalAmount}}/g, estimatedPrice.toLocaleString())
  }

  const sendEmail = async () => {
    if (!emailAddress.trim()) {
      setError('Indtast email adresse')
      return
    }

    const subject = customSubject || generateSubject(selectedTemplate, selectedLead)
    const content = customContent || generateContent(selectedTemplate, selectedLead)
    
    if (!subject.trim() || !content.trim()) {
      setError('Indtast emne og besked')
      return
    }

    setSending(true)
    setError(null)
    setSuccess(null)

    try {
      // Use Blink's email notification service
      const result = await blink.notifications.email({
        to: emailAddress,
        subject: subject,
        html: content.replace(/\n/g, '<br>'),
        text: content
      })

      if (result.success) {
        const newEmail: EmailMessage = {
          id: `email_${Date.now()}`,
          leadId: selectedLead?.id,
          email: emailAddress,
          subject: subject,
          content: content,
          messageType: selectedTemplate.type,
          status: 'sent',
          sentAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }

        // Add to history
        setEmailHistory(prev => [newEmail, ...prev])
        
        // Simulate delivery confirmation after a delay
        setTimeout(() => {
          setEmailHistory(prev => prev.map(email => 
            email.id === newEmail.id 
              ? { ...email, status: 'delivered', deliveredAt: new Date().toISOString() }
              : email
          ))
        }, 3000)

        setSuccess(`Email sendt til ${emailAddress}`)
        setCustomSubject('')
        setCustomContent('')
        setEmailAddress('')
      } else {
        setError('Fejl ved afsendelse af email. Prøv igen.')
      }
      
    } catch (err) {
      setError('Fejl ved afsendelse af email. Prøv igen.')
      console.error('Email sending error:', err)
    } finally {
      setSending(false)
    }
  }

  const getStatusIcon = (status: EmailMessage['status']) => {
    switch (status) {
      case 'sent':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: EmailMessage['status']) => {
    switch (status) {
      case 'sent':
        return 'bg-orange-100 text-orange-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Email Sender */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-primary" />
            <span>Send Email</span>
            <Badge variant="secondary" className="ml-auto">
              Blink Email
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Lead Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Vælg Lead (valgfrit)</label>
            <select
              value={selectedLead?.id || ''}
              onChange={(e) => {
                const lead = leads.find(l => l.id === e.target.value)
                setSelectedLead(lead || null)
                if (lead) {
                  setEmailAddress(lead.customerEmail)
                }
              }}
              className="w-full p-2 border border-border rounded-md bg-background"
            >
              <option value="">Vælg lead...</option>
              {leads.filter(lead => lead.status === 'new' || lead.status === 'contacted').map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.customerName} - {lead.serviceType}
                </option>
              ))}
            </select>
          </div>

          {/* Email Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email Adresse</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="kunde@example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="pl-10"
                type="email"
              />
            </div>
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email Skabelon</label>
            <div className="grid grid-cols-1 gap-2">
              {emailTemplates.map(template => (
                <Button
                  key={template.id}
                  variant={selectedTemplate.id === template.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTemplate(template)}
                  className="justify-start"
                >
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Subject Line */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Emne {selectedLead && '(Auto-genereret)'}
            </label>
            <Input
              placeholder="Email emne..."
              value={customSubject || generateSubject(selectedTemplate, selectedLead)}
              onChange={(e) => setCustomSubject(e.target.value)}
            />
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Besked {selectedLead && '(Auto-genereret)'}
            </label>
            <Textarea
              placeholder="Indtast din besked..."
              value={customContent || generateContent(selectedTemplate, selectedLead)}
              onChange={(e) => setCustomContent(e.target.value)}
              rows={12}
              className="resize-none text-sm"
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* Send Button */}
          <Button 
            onClick={sendEmail}
            disabled={sending || !emailAddress.trim()}
            className="w-full"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sender Email...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Email History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Email Historik</span>
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadEmailHistory}
            disabled={loadingHistory}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingHistory ? 'animate-spin' : ''}`} />
            Opdater
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Indlæser email historik...</span>
                </div>
              </div>
            ) : emailHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <Mail className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Ingen emails sendt endnu</p>
              </div>
            ) : (
              <div className="space-y-4">
                {emailHistory.map((email) => {
                  const lead = leads.find(l => l.id === email.leadId)
                  return (
                    <div key={email.id} className="p-4 border border-border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">
                            {lead?.customerName || 'Ukendt kunde'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {email.email}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(email.status)}
                          <Badge className={getStatusColor(email.status)}>
                            {email.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="font-medium text-sm text-foreground">
                          {email.subject}
                        </div>
                        <div className="p-3 bg-muted rounded text-sm text-foreground max-h-32 overflow-y-auto">
                          {email.content}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(email.createdAt).toLocaleDateString('da-DK')} {new Date(email.createdAt).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {email.deliveredAt && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3" />
                              <span>Leveret {new Date(email.deliveredAt).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {email.messageType}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}