import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { GoogleGenerativeAI } from "npm:@google/generative-ai"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { emailContent, source, subject, sender } = await req.json()

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    // AI prompt for Danish lead extraction
    const prompt = `
Du er en AI-assistent for Rendetalje, et dansk rengøringsfirma. Analyser følgende email og udtræk lead-information.

EMAIL INDHOLD:
${emailContent}

KILDE: ${source}
EMNE: ${subject || 'Ingen emne'}
AFSENDER: ${sender || 'Ukendt afsender'}

Returner et JSON-objekt med følgende struktur:
{
  "leadData": {
    "customerName": "kundens navn",
    "customerEmail": "kundens email",
    "customerPhone": "kundens telefon (dansk format +45 XX XX XX XX)",
    "address": "kundens adresse",
    "city": "by",
    "postalCode": "postnummer",
    "serviceType": "type af rengøring (kontorrengøring, hjemmerengøring, vinduespolering, dybderengøring, etc.)",
    "estimatedHours": antal_timer_estimat,
    "priority": "low/medium/high baseret på urgency",
    "notes": "ekstra noter og detaljer"
  },
  "emailResponse": "professionel dansk email-svar til kunden med tilbud om 3 tidspunkter i morgen",
  "smsMessage": "kort dansk SMS til kunden: 'Hej [navn], tak for din henvendelse til Rendetalje. Vi sender dig 3 ledige tidspunkter på email. Svar med 1, 2 eller 3 for at booke. Mvh Rendetalje'",
  "analysis": "kort analyse af lead-kvalitet og anbefalinger"
}

VIGTIGE RETNINGSLINJER:
- Brug professionel men venlig dansk tone
- Timeprisen er 349 DKK/time
- Tilbyd altid 3 konkrete tidspunkter i morgen mellem 8-17
- SMS skal være kort og klar med instruktioner
- Estimer timer realistisk baseret på opgavens størrelse
- Prioritet: high hvis akut, medium hvis normal, low hvis fleksibel timing
- Hvis information mangler, brug fornuftige danske standardværdier
- Kontorrengøring: 2-6 timer, Hjemmerengøring: 2-4 timer, Vinduespolering: 1-3 timer, Dybderengøring: 4-8 timer

Returner kun JSON - ingen anden tekst.
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response')
    }

    const aiResponse: AIResponse = JSON.parse(jsonMatch[0])

    // Generate time slots for email response
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const timeSlots = [
      { time: '10:00', formatted: 'i morgen kl. 10:00' },
      { time: '14:00', formatted: 'i morgen kl. 14:00' },
      { time: '16:00', formatted: 'i morgen kl. 16:00' }
    ]

    // Enhance email response with specific time slots
    const enhancedEmailResponse = `Kære ${aiResponse.leadData.customerName},

Tak for din henvendelse til Rendetalje vedrørende ${aiResponse.leadData.serviceType}.

Vi har følgende ledige tidspunkter:

1. ${timeSlots[0].formatted} (${tomorrow.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })})
2. ${timeSlots[1].formatted} (${tomorrow.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })})
3. ${timeSlots[2].formatted} (${tomorrow.toLocaleDateString('da-DK', { weekday: 'long', day: 'numeric', month: 'long' })})

Du vil modtage en SMS med samme tidspunkter. Svar venligst med 1, 2 eller 3 for at booke dit ønskede tidspunkt.

Estimeret tid: ${aiResponse.leadData.estimatedHours} timer
Timepris: 349 DKK/time
Samlet pris: ${aiResponse.leadData.estimatedHours * 349} DKK

Med venlig hilsen,
Rendetalje
info@rendetalje.dk
+45 22 65 02 26

---
Rendetalje ApS
Gammel Viborgvej 40, 8381 Tilst
CVR: 45564096`

    // Enhance SMS message
    const enhancedSmsMessage = `Hej ${aiResponse.leadData.customerName}, tak for din henvendelse til Rendetalje. Ledige tider: 1: ${timeSlots[0].time}, 2: ${timeSlots[1].time}, 3: ${timeSlots[2].time}. Svar med 1, 2 eller 3 for at booke. Mvh Rendetalje`

    const finalResponse = {
      ...aiResponse,
      emailResponse: enhancedEmailResponse,
      smsMessage: enhancedSmsMessage
    }

    return new Response(JSON.stringify(finalResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error processing email with AI:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process email with AI',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})