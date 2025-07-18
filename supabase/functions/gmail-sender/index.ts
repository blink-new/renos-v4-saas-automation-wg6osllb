import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, content } = await req.json()

    const accessToken = await getAccessToken()
    if (!accessToken) {
      throw new Error('Failed to get Gmail access token')
    }

    const success = await sendEmail(accessToken, to, subject, content)

    return new Response(JSON.stringify({ success }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send email',
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
    const refreshToken = Deno.env.get('GMAIL_REFRESH_TOKEN')
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')

    if (!refreshToken || !clientId || !clientSecret) {
      console.error('Missing Gmail credentials')
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
    console.error('Gmail authentication error:', error)
    return null
  }
}

async function sendEmail(accessToken: string, to: string, subject: string, content: string): Promise<boolean> {
  try {
    // Create email message in RFC 2822 format
    const emailMessage = [
      `To: ${to}`,
      `From: info@rendetalje.dk`,
      `Subject: ${subject}`,
      `Content-Type: text/plain; charset=utf-8`,
      '',
      content
    ].join('\r\n')

    // Encode message in base64url format
    const encodedMessage = btoa(emailMessage)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')

    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedMessage
        })
      }
    )

    const result = await response.json()
    
    if (response.ok && result.id) {
      console.log('Email sent successfully:', result.id)
      return true
    } else {
      console.error('Failed to send email:', result)
      return false
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}