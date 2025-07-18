import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CalendarEvent {
  summary: string
  description: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees: Array<{ email: string }>
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, leadId, slotIndex, customerName, customerEmail, serviceType, address, estimatedHours } = await req.json()

    if (action === 'create_booking') {
      const eventId = await createCalendarBooking({
        leadId,
        slotIndex,
        customerName,
        customerEmail,
        serviceType,
        address,
        estimatedHours
      })

      return new Response(JSON.stringify({ eventId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in calendar booking:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process calendar booking',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function getAccessToken(): Promise<string | null> {
  try {
    const refreshToken = Deno.env.get('GOOGLE_CALENDAR_REFRESH_TOKEN')
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')

    if (!refreshToken || !clientId || !clientSecret) {
      console.error('Missing Google Calendar credentials')
      return null
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    const data = await response.json()
    
    if (data.access_token) {
      return data.access_token
    }

    console.error('Failed to get access token:', data)
    return null
  } catch (error) {
    console.error('Google Calendar authentication error:', error)
    return null
  }
}

async function createCalendarBooking(params: {
  leadId: string
  slotIndex: number
  customerName: string
  customerEmail: string
  serviceType: string
  address: string
  estimatedHours: number
}): Promise<string | null> {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) return null

    // Generate time slots (same logic as AI processor)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const timeSlots = [
      new Date(tomorrow.setHours(10, 0, 0, 0)),
      new Date(tomorrow.setHours(14, 0, 0, 0)),
      new Date(tomorrow.setHours(16, 0, 0, 0))
    ]

    const selectedSlot = timeSlots[params.slotIndex - 1] // slotIndex is 1-based
    if (!selectedSlot) {
      throw new Error('Invalid slot index')
    }

    const endTime = new Date(selectedSlot)
    endTime.setHours(endTime.getHours() + params.estimatedHours)

    const event: CalendarEvent = {
      summary: `${params.serviceType} - ${params.customerName}`,
      description: `Kunde: ${params.customerName}
Email: ${params.customerEmail}
Service: ${params.serviceType}
Adresse: ${params.address}
Estimeret tid: ${params.estimatedHours} timer
Pris: ${params.estimatedHours * 349} DKK

Lead ID: ${params.leadId}`,
      start: {
        dateTime: selectedSlot.toISOString(),
        timeZone: 'Europe/Copenhagen'
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Europe/Copenhagen'
      },
      attendees: [
        { email: params.customerEmail }
      ]
    }

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      }
    )

    const result = await response.json()
    
    if (response.ok && result.id) {
      console.log('Calendar event created:', result.id)
      return result.id
    } else {
      console.error('Failed to create calendar event:', result)
      return null
    }
  } catch (error) {
    console.error('Error creating calendar booking:', error)
    return null
  }
}