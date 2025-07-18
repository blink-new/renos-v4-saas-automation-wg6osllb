import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { gmailService } from '@/services/gmailService'

export function GmailCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')

      if (error) {
        setStatus('error')
        setError(`OAuth error: ${error}`)
        return
      }

      if (!code) {
        setStatus('error')
        setError('No authorization code received')
        return
      }

      // Exchange code for tokens
      const success = await gmailService.handleGmailCallback(code)
      
      if (success) {
        setStatus('success')
        // Close popup after success
        setTimeout(() => {
          window.close()
        }, 2000)
      } else {
        setStatus('error')
        setError('Failed to complete Gmail authorization')
      }
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    }
  }

  const handleRetry = () => {
    setStatus('loading')
    setError(null)
    handleCallback()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Forbinder Gmail</h2>
                <p className="text-muted-foreground mt-2">
                  Behandler autorisation...
                </p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Gmail Forbundet!</h2>
                <p className="text-muted-foreground mt-2">
                  Din Gmail konto er nu forbundet til RenOS.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Dette vindue lukker automatisk...
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Forbindelse Fejlede</h2>
                <p className="text-muted-foreground mt-2">
                  Der opstod en fejl under Gmail forbindelse.
                </p>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Button onClick={handleRetry} className="w-full">
                  Prøv igen
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.close()}
                  className="w-full"
                >
                  Luk vindue
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}