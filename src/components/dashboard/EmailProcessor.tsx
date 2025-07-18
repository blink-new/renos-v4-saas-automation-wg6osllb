import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { blink } from '@/blink/client'
import { 
  Mail, 
  Bot, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  MessageSquare,
  Phone,
  Calendar,
  MapPin,
  DollarSign,
  Clock
} from 'lucide-react'
import { useLeads } from '@/hooks/useLeads'
import { Lead } from '@/types'

interface ProcessedLead {
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceType: string
  address: string
  city: string
  estimatedHours: number
  estimatedPrice: number
  priority: 'low' | 'medium' | 'high'
  notes: string
  confidence: number
}

export function EmailProcessor() {
  const { processEmailLead, sendResponse, loading } = useLeads()
  const [emailContent, setEmailContent] = useState('')
  const [selectedSource, setSelectedSource] = useState<Lead['source']>('booking_form')
  const [processing, setProcessing] = useState(false)
  const [processedLead, setProcessedLead] = useState<ProcessedLead | null>(null)
  const [processingStep, setProcessingStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const sources = [
    { value: 'booking_form', label: 'Booking Form', color: 'bg-cyan-100 text-cyan-800' },
    { value: 'leadpoint', label: 'Leadpoint.dk', color: 'bg-purple-100 text-purple-800' },
    { value: 'leadmail', label: 'Leadmail.no', color: 'bg-indigo-100 text-indigo-800' }
  ]

  const processingSteps = [
    'Analyserer email indhold...',
    'Ekstraherer kunde information...',
    'Beregner pris og tid...',
    'Genererer AI svar...',
    'Forbereder SMS besked...'
  ]

  const handleProcessEmail = async () => {
    if (!emailContent.trim()) {
      setError('Indtast email indhold for at fortsætte')
      return
    }

    setProcessing(true)
    setError(null)
    setProcessingStep(0)

    try {
      // Step 1: Analyzing email content
      setProcessingStep(0)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 2: Extract customer information using AI
      setProcessingStep(1)
      const aiPrompt = `
Analyser følgende email og udtræk kunde information til et dansk rengørings firma (Rendetalje):

EMAIL INDHOLD:
${emailContent}

Udtræk følgende information og returner som JSON:
{
  "customerName": "kundens fulde navn",
  "customerEmail": "email adresse",
  "customerPhone": "telefonnummer (dansk format +45 XX XX XX XX)",
  "serviceType": "type af rengøring (Kontorrengøring, Hjemmerengøring, Vinduespolering, etc.)",
  "address": "adresse",
  "city": "by",
  "estimatedHours": antal_timer_som_tal,
  "priority": "low/medium/high baseret på urgency",
  "notes": "relevante noter fra emailen",
  "confidence": tal_mellem_70_og_100
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
            estimatedHours: { type: 'number' },
            priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            notes: { type: 'string' },
            confidence: { type: 'number' }
          },
          required: ['customerName', 'customerEmail', 'customerPhone', 'serviceType', 'address', 'city', 'estimatedHours', 'priority', 'notes', 'confidence']
        }
      })

      // Step 3: Calculate pricing
      setProcessingStep(2)
      await new Promise(resolve => setTimeout(resolve, 300))

      const hourlyRate = 349 // DKK per hour
      const estimatedPrice = aiResult.estimatedHours * hourlyRate

      // Step 4: Generate AI response
      setProcessingStep(3)
      await new Promise(resolve => setTimeout(resolve, 400))

      // Step 5: Prepare SMS message
      setProcessingStep(4)
      await new Promise(resolve => setTimeout(resolve, 300))

      const processedLead: ProcessedLead = {
        customerName: aiResult.customerName,
        customerEmail: aiResult.customerEmail,
        customerPhone: aiResult.customerPhone,
        serviceType: aiResult.serviceType,
        address: aiResult.address,
        city: aiResult.city,
        estimatedHours: aiResult.estimatedHours,
        estimatedPrice,
        priority: aiResult.priority as 'low' | 'medium' | 'high',
        notes: `${aiResult.notes} - AI analyseret fra ${sources.find(s => s.value === selectedSource)?.label}`,
        confidence: Math.max(70, Math.min(100, aiResult.confidence))
      }

      setProcessedLead(processedLead)
    } catch (err) {
      setError('Fejl under AI analyse. Prøv igen.')
      console.error('AI processing error:', err)
    } finally {
      setProcessing(false)
    }
  }

  const handleCreateLead = async () => {
    if (!processedLead) return

    try {
      const newLead = await processEmailLead(emailContent, selectedSource)
      
      // Auto-send response
      await sendResponse(newLead.id)
      
      // Reset form
      setEmailContent('')
      setProcessedLead(null)
      setError(null)
      
    } catch (err) {
      setError('Fejl ved oprettelse af lead')
      console.error('Lead creation error:', err)
    }
  }

  const handleReject = () => {
    setProcessedLead(null)
    setError(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <span>AI Email Processor</span>
          <Badge variant="secondary" className="ml-auto">
            Gemini AI
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Source Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email Kilde</label>
          <div className="flex space-x-2">
            {sources.map(source => (
              <Button
                key={source.value}
                variant={selectedSource === source.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSource(source.value as Lead['source'])}
                className="text-xs"
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
            placeholder="Indsæt email indhold her for AI analyse..."
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        {/* Processing Status */}
        {processing && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">
                {processingSteps[processingStep]}
              </span>
            </div>
            <Progress value={(processingStep + 1) / processingSteps.length * 100} className="h-2" />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Processed Lead Preview */}
        {processedLead && (
          <div className="space-y-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">AI Analyse Resultat</h3>
              <Badge 
                variant={processedLead.confidence > 90 ? 'default' : 'secondary'}
                className="text-xs"
              >
                {processedLead.confidence}% sikkerhed
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{processedLead.customerName}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{processedLead.customerEmail}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{processedLead.customerPhone}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{processedLead.address}, {processedLead.city}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{processedLead.serviceType}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{processedLead.estimatedHours} timer</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm font-medium text-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>{processedLead.estimatedPrice.toLocaleString()} kr</span>
                </div>
                
                <Badge className={
                  processedLead.priority === 'high' ? 'bg-red-100 text-red-800' :
                  processedLead.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {processedLead.priority === 'high' ? 'Høj' : 
                   processedLead.priority === 'medium' ? 'Medium' : 'Lav'} prioritet
                </Badge>
              </div>
            </div>

            {processedLead.notes && (
              <div className="p-2 bg-background rounded text-sm text-muted-foreground">
                {processedLead.notes}
              </div>
            )}

            <div className="flex space-x-2 pt-2">
              <Button 
                onClick={handleCreateLead}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Opretter lead...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Opret Lead & Send Svar
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleReject}
                disabled={loading}
              >
                Afvis
              </Button>
            </div>
          </div>
        )}

        {/* Action Button */}
        {!processedLead && (
          <Button 
            onClick={handleProcessEmail}
            disabled={processing || !emailContent.trim()}
            className="w-full"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyserer...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                Analyser Email med AI
              </>
            )}
          </Button>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">24</p>
            <p className="text-xs text-muted-foreground">Emails i dag</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">18</p>
            <p className="text-xs text-muted-foreground">Auto-processed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">94%</p>
            <p className="text-xs text-muted-foreground">Nøjagtighed</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper functions for AI analysis simulation
function extractCustomerName(content: string): string | null {
  const namePatterns = [
    /mit navn er ([a-zA-ZæøåÆØÅ\s]+)/i,
    /jeg hedder ([a-zA-ZæøåÆØÅ\s]+)/i,
    /fra ([a-zA-ZæøåÆØÅ\s]+)/i
  ]
  
  for (const pattern of namePatterns) {
    const match = content.match(pattern)
    if (match) return match[1].trim()
  }
  return null
}

function extractEmail(content: string): string | null {
  const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
  const match = content.match(emailPattern)
  return match ? match[1] : null
}

function extractPhone(content: string): string | null {
  const phonePatterns = [
    /(\+45\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2})/,
    /(\d{8})/,
    /(\d{2}\s?\d{2}\s?\d{2}\s?\d{2})/
  ]
  
  for (const pattern of phonePatterns) {
    const match = content.match(pattern)
    if (match) return match[1]
  }
  return null
}

function extractAddress(content: string): string | null {
  const addressPatterns = [
    /adresse[:\s]+([^,\n]+)/i,
    /bor på ([^,\n]+)/i,
    /([a-zA-ZæøåÆØÅ\s]+\d+[a-zA-Z]?)/
  ]
  
  for (const pattern of addressPatterns) {
    const match = content.match(pattern)
    if (match) return match[1].trim()
  }
  return null
}

function extractCity(content: string): string | null {
  const cities = ['København', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg', 'Randers', 'Kolding', 'Horsens', 'Vejle', 'Roskilde']
  
  for (const city of cities) {
    if (content.toLowerCase().includes(city.toLowerCase())) {
      return city
    }
  }
  return null
}

function detectServiceType(content: string): string {
  const serviceKeywords = {
    'Kontorrengøring': ['kontor', 'office', 'arbejdsplads', 'firma'],
    'Hjemmerengøring': ['hjem', 'lejlighed', 'hus', 'bolig', 'privat'],
    'Vinduespolering': ['vinduer', 'ruder', 'vinduespolering'],
    'Dybderengøring': ['dybde', 'grundig', 'flytterengøring', 'totalrengøring'],
    'Erhvervsrengøring': ['erhverv', 'butik', 'restaurant', 'hotel']
  }
  
  const lowerContent = content.toLowerCase()
  
  for (const [service, keywords] of Object.entries(serviceKeywords)) {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      return service
    }
  }
  
  return 'Generel rengøring'
}

function calculateHours(content: string): number {
  const lowerContent = content.toLowerCase()
  
  // Look for specific hour mentions
  const hourMatch = content.match(/(\d+)\s*timer?/i)
  if (hourMatch) return parseInt(hourMatch[1])
  
  // Look for area size
  const areaMatch = content.match(/(\d+)\s*m2|kvm/i)
  if (areaMatch) {
    const area = parseInt(areaMatch[1])
    return Math.ceil(area / 25) // Roughly 25 m2 per hour
  }
  
  // Default estimates based on service type
  if (lowerContent.includes('kontor')) return 6
  if (lowerContent.includes('hjem') || lowerContent.includes('lejlighed')) return 3
  if (lowerContent.includes('vinduer')) return 2
  if (lowerContent.includes('dybde')) return 8
  
  return 4 // Default
}

function determinePriority(content: string): 'low' | 'medium' | 'high' {
  const lowerContent = content.toLowerCase()
  
  const highPriorityKeywords = ['akut', 'hurtigt', 'i dag', 'asap', 'vigtigt', 'deadline']
  const lowPriorityKeywords = ['når det passer', 'ikke travlt', 'fleksibel']
  
  if (highPriorityKeywords.some(keyword => lowerContent.includes(keyword))) {
    return 'high'
  }
  
  if (lowPriorityKeywords.some(keyword => lowerContent.includes(keyword))) {
    return 'low'
  }
  
  return 'medium'
}