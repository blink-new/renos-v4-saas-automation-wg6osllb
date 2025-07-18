import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { gmailService } from '@/services/gmailService'
import { 
  Mail, 
  Sparkles, 
  Send, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Brain,
  Zap
} from 'lucide-react'
import { Lead } from '@/types'

const emailSources = [
  { value: 'leadpoint', label: 'Leadpoint.dk', color: 'bg-purple-100 text-purple-800' },
  { value: 'leadmail', label: 'Leadmail.no', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'booking_form', label: 'Booking Form', color: 'bg-cyan-100 text-cyan-800' }
]

export function AIEmailProcessor() {
  const [emailContent, setEmailContent] = useState('')
  const [selectedSource, setSelectedSource] = useState<Lead['source']>('leadpoint')
  const [processing, setProcessing] = useState(false)
  const [processedLead, setProcessedLead] = useState<Lead | null>(null)
  const [step, setStep] = useState<'input' | 'processed' | 'sent'>('input')
  const [error, setError] = useState<string | null>(null)

  const handleProcessEmail = async () => {
    if (!emailContent.trim()) return

    try {
      setProcessing(true)
      setError(null)
      setStep('input')
      
      // Create mock email object for processing
      const mockEmail = {
        messageId: `mock-${Date.now()}`,
        subject: 'Test email processing',
        sender: 'test@example.com',
        recipient: 'info@rendetalje.dk',
        body: emailContent,
        source: selectedSource
      }

      const result = await gmailService.processEmailWithAI(mockEmail)
      
      if (result.success && result.leadId) {
        // For demo purposes, create a mock lead object
        const mockLead: Lead = {
          id: result.leadId,
          customerName: 'Test Kunde',
          customerEmail: 'kunde@example.com',
          customerPhone: '+45 12 34 56 78',
          source: selectedSource,
          serviceType: 'Kontorrengøring',
          address: 'Test Adresse 123',
          city: 'København',
          postalCode: '2100',
          estimatedHours: 3,
          estimatedPrice: 1047,
          status: 'new',
          priority: 'medium',
          notes: 'Automatisk oprettet via AI email processor',
          responseSent: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        setProcessedLead(mockLead)
        setStep('processed')
      } else {
        setError(result.error || 'Failed to process email')
      }
    } catch (error) {
      console.error('Error processing email:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setProcessing(false)
    }
  }

  const handleSendResponse = async () => {
    if (!processedLead) return

    try {
      setProcessing(true)
      setError(null)
      
      // Simulate sending response
      const success = await gmailService.sendEmailResponse(
        processedLead.customerEmail,
        'Test response email content'
      )
      
      if (success) {
        setStep('sent')
      } else {
        setError('Failed to send email response')
      }
    } catch (error) {
      console.error('Error sending response:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setProcessing(false)
    }
  }

  const resetProcessor = () => {
    setEmailContent('')
    setProcessedLead(null)
    setStep('input')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span>AI Email Processor</span>
            <p className="text-sm font-normal text-muted-foreground mt-1">
              Automatisk parsing og respons på indkommende leads
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${
            step === 'input' ? 'text-primary' : step === 'processed' || step === 'sent' ? 'text-green-600' : 'text-muted-foreground'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'input' ? 'bg-primary text-primary-foreground' : 
              step === 'processed' || step === 'sent' ? 'bg-green-100 text-green-600' : 
              'bg-muted text-muted-foreground'
            }`}>
              {step === 'processed' || step === 'sent' ? <CheckCircle className="h-4 w-4" /> : '1'}
            </div>
            <span className="text-sm font-medium">Parse Email</span>
          </div>
          
          <div className="flex-1 h-px bg-border"></div>
          
          <div className={`flex items-center space-x-2 ${
            step === 'processed' ? 'text-primary' : step === 'sent' ? 'text-green-600' : 'text-muted-foreground'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'processed' ? 'bg-primary text-primary-foreground' : 
              step === 'sent' ? 'bg-green-100 text-green-600' : 
              'bg-muted text-muted-foreground'
            }`}>
              {step === 'sent' ? <CheckCircle className="h-4 w-4" /> : '2'}
            </div>
            <span className="text-sm font-medium">Send Response</span>
          </div>
          
          <div className="flex-1 h-px bg-border"></div>
          
          <div className={`flex items-center space-x-2 ${
            step === 'sent' ? 'text-green-600' : 'text-muted-foreground'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === 'sent' ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'
            }`}>
              {step === 'sent' ? <CheckCircle className="h-4 w-4" /> : '3'}
            </div>
            <span className="text-sm font-medium">Complete</span>
          </div>
        </div>

        {step === 'input' && (
          <div className="space-y-4">
            {/* Source Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Kilde</label>
              <div className="flex space-x-2">
                {emailSources.map((source) => (
                  <Button
                    key={source.value}
                    variant={selectedSource === source.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedSource(source.value as Lead['source'])}
                  >
                    {source.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Indhold</label>
              <Textarea
                placeholder="Indsæt email indhold her for AI parsing..."
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Process Button */}
            <Button 
              onClick={handleProcessEmail}
              disabled={!emailContent.trim() || processing}
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  AI Processor...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Process med AI
                </>
              )}
            </Button>
          </div>
        )}

        {step === 'processed' && processedLead && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Email succesfuldt parset!</span>
            </div>

            {/* Processed Lead Info */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-foreground">Ekstraheret Lead Information</h4>
                <Badge className={emailSources.find(s => s.value === processedLead.source)?.color}>
                  {emailSources.find(s => s.value === processedLead.source)?.label}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Kunde:</span>
                  <p className="font-medium">{processedLead.customerName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{processedLead.customerEmail}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Telefon:</span>
                  <p className="font-medium">{processedLead.customerPhone}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Service:</span>
                  <p className="font-medium">{processedLead.serviceType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Adresse:</span>
                  <p className="font-medium">{processedLead.address}, {processedLead.city}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Estimat:</span>
                  <p className="font-medium">{processedLead.estimatedHours}t / {processedLead.estimatedPrice.toLocaleString()} kr</p>
                </div>
              </div>

              {processedLead.notes && (
                <div>
                  <span className="text-muted-foreground text-sm">Noter:</span>
                  <p className="text-sm mt-1">{processedLead.notes}</p>
                </div>
              )}
            </div>

            {/* Send Response Button */}
            <Button 
              onClick={handleSendResponse}
              disabled={processing}
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sender automatisk svar...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Automatisk Email
                </>
              )}
            </Button>
          </div>
        )}

        {step === 'sent' && (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="h-8 w-8" />
              <span className="text-lg font-medium">Workflow Fuldført!</span>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <Mail className="h-4 w-4" />
                <span className="text-sm font-medium">Email med 3 tidspunkter sendt</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-medium">Automatisk booking system aktiveret</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Kunden kan nu svare på email (1, 2, eller 3) for at booke et tidspunkt
            </p>

            <Button onClick={resetProcessor} variant="outline" className="w-full">
              Process Ny Email
            </Button>
          </div>
        )}

        {/* AI Features Info */}
        <div className="pt-4 border-t border-border">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">AI Funktioner</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Automatisk kunde parsing</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Service type genkendelse</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Pris estimering (349 kr/t)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Automatisk respons generering</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}