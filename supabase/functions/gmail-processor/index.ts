import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

interface GmailMessage {
  id: string
  threadId: string
  snippet: string
  payload: {
    headers: Array<{ name: string; value: string }>
    body?: { data?: string }
    parts?: Array<{
      mimeType: string
      body?: { data?: string }
      parts?: Array<{ mimeType: string; body?: { data?: string } }>
    }>
  }
}

interface ProcessedEmail {
  messageId: string
  subject: string
  sender: string
  recipient: string
  body: string
  source: 'booking_form' | 'leadpoint' | 'leadmail'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, access_token } = await req.json()

    if (!access_token) {
      throw new Error('Access token required')
    }

    if (action === 'fetch_new_emails') {
      // Fetch new emails from Gmail API
      const emails = await fetchNewEmails(access_token)
      
      return new Response(
        JSON.stringify({
          success: true,
          emails,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    throw new Error('Invalid action')

  } catch (error) {
    console.error('Gmail processor error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

async function fetchNewEmails(accessToken: string): Promise<ProcessedEmail[]> {
  try {
    // Define email sources to monitor
    const emailSources = [
      { email: 'info@rendetalje.dk', source: 'booking_form' as const },
      { email: 'system@leadpoint.dk', source: 'leadpoint' as const },
      { email: 'kontakt@leadmail.no', source: 'leadmail' as const }
    ]

    const processedEmails: ProcessedEmail[] = []

    for (const emailSource of emailSources) {
      // Search for emails from this source in the last 24 hours
      const query = `from:${emailSource.email} newer_than:1d`
      
      const searchResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      )

      if (!searchResponse.ok) {
        console.error(`Failed to search emails from ${emailSource.email}:`, await searchResponse.text())
        continue
      }

      const searchData = await searchResponse.json()
      
      if (!searchData.messages) {
        continue
      }

      // Fetch details for each message
      for (const message of searchData.messages.slice(0, 10)) { // Limit to 10 most recent
        try {
          const messageResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          )

          if (!messageResponse.ok) {
            console.error(`Failed to fetch message ${message.id}:`, await messageResponse.text())
            continue
          }

          const messageData: GmailMessage = await messageResponse.json()
          const processedEmail = parseGmailMessage(messageData, emailSource.source)
          
          if (processedEmail) {
            processedEmails.push(processedEmail)
          }
        } catch (error) {
          console.error(`Error processing message ${message.id}:`, error)
        }
      }
    }

    return processedEmails
  } catch (error) {
    console.error('Error fetching new emails:', error)
    return []
  }
}

function parseGmailMessage(message: GmailMessage, source: ProcessedEmail['source']): ProcessedEmail | null {
  try {
    const headers = message.payload.headers
    
    const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || ''
    const from = headers.find(h => h.name.toLowerCase() === 'from')?.value || ''
    const to = headers.find(h => h.name.toLowerCase() === 'to')?.value || ''
    
    // Extract email body
    let body = ''
    
    if (message.payload.body?.data) {
      body = decodeBase64Url(message.payload.body.data)
    } else if (message.payload.parts) {
      // Look for text/plain or text/html parts
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body = decodeBase64Url(part.body.data)
          break
        } else if (part.mimeType === 'text/html' && part.body?.data && !body) {
          body = decodeBase64Url(part.body.data)
        } else if (part.parts) {
          // Check nested parts
          for (const nestedPart of part.parts) {
            if (nestedPart.mimeType === 'text/plain' && nestedPart.body?.data) {
              body = decodeBase64Url(nestedPart.body.data)
              break
            }
          }
          if (body) break
        }
      }
    }

    if (!body) {
      body = message.snippet || ''
    }

    // Clean up HTML if present
    body = body.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()

    return {
      messageId: message.id,
      subject,
      sender: from,
      recipient: to,
      body,
      source
    }
  } catch (error) {
    console.error('Error parsing Gmail message:', error)
    return null
  }
}

function decodeBase64Url(data: string): string {
  try {
    // Convert base64url to base64
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/')
    
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4)
    
    // Decode base64
    const decoded = atob(padded)
    
    // Convert to UTF-8
    return new TextDecoder('utf-8').decode(
      new Uint8Array([...decoded].map(char => char.charCodeAt(0)))
    )
  } catch (error) {
    console.error('Error decoding base64url:', error)
    return data
  }
}