import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { 
  Mail, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ExternalLink,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Bot,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react'
import { gmailService } from '@/services/gmailService'
import { useLeads } from '@/hooks/useLeads'

interface EmailLog {
  id: string
  subject: string
  sender: string
  source: string
  processed: boolean
  created_at: string
  lead_id?: string
}

export function GmailIntegration({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingEmails, setProcessingEmails] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  
  const { getLeadStats } = useLeads()
  const stats = getLeadStats()

  useEffect(() => {
    checkGmailConnection()
    fetchEmailLogs()
  }, [])

  const checkGmailConnection = async () => {
    try {
      setLoading(true)
      const connected = await gmailService.isGmailConnected()
      setIsConnected(connected)
    } catch (err) {
      setError('Fejl ved tjek af Gmail forbindelse')
      console.error('Error checking Gmail connection:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmailLogs = async () => {
    try {
      const logs = await gmailService.getEmailLogs()
      setEmailLogs(logs)
      
      if (logs.length > 0) {
        setLastSync(new Date(logs[0].created_at))
      }
    } catch (err) {
      console.error('Error fetching email logs:', err)
    }
  }

  const handleConnectGmail = async () => {
    try {
      setIsConnecting(true)
      setError(null)
      
      const authUrl = await gmailService.initiateGmailAuth()
      
      // Open Gmail OAuth in popup
      const popup = window.open(
        authUrl,
        'gmail-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      )

      // Listen for popup completion
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          // Check if connection was successful
          setTimeout(() => {
            checkGmailConnection()
          }, 1000)
        }
      }, 1000)

    } catch (err) {
      setError('Fejl ved Gmail forbindelse')
      console.error('Error connecting Gmail:', err)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleStartMonitoring = async () => {
    try {
      setError(null)
      await gmailService.startEmailMonitoring()
      setIsMonitoring(true)
    } catch (err) {
      setError('Fejl ved start af email overvågning')
      console.error('Error starting monitoring:', err)
    }
  }

  const handleStopMonitoring = async () => {
    try {
      setError(null)
      await gmailService.stopEmailMonitoring()
      setIsMonitoring(false)
    } catch (err) {
      setError('Fejl ved stop af email overvågning')
      console.error('Error stopping monitoring:', err)
    }
  }

  const handleTestProcessing = async () => {
    try {
      setProcessingEmails(true)
      setError(null)
      
      await gmailService.testEmailProcessing()
      await fetchEmailLogs()
      
    } catch (err) {
      setError('Fejl ved test af email processing')
      console.error('Error testing email processing:', err)
    } finally {
      setProcessingEmails(false)
    }
  }

  const handleRefreshEmails = async () => {
    try {
      setError(null)
      await fetchEmailLogs()
      setLastSync(new Date())
    } catch (err) {
      setError('Fejl ved opdatering af emails')
      console.error('Error refreshing emails:', err)
    }
  }

  if (loading) {
    return (
      <DashboardLayout currentPage="Gmail Integration" onNavigate={onNavigate}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Indlæser Gmail integration...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout currentPage="Gmail Integration" onNavigate={onNavigate}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gmail Integration</h1>
            <p className="text-muted-foreground mt-2">
              Automatisk email processing og lead generering
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Forbundet' : 'Ikke forbundet'}
            </Badge>
            {isMonitoring && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Live overvågning
              </Badge>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Gmail Forbindelse</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isConnected ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Mail className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">Forbind Gmail</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Forbind din Gmail konto for at aktivere automatisk email processing
                  </p>
                </div>
                <Button 
                  onClick={handleConnectGmail}
                  disabled={isConnecting}
                  className="w-full max-w-sm"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Forbinder...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Forbind Gmail
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Gmail Forbundet</h3>
                    <p className="text-sm text-muted-foreground">
                      Klar til automatisk email processing
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Monitoring Controls */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">Email Overvågning</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatisk processing af indkommende emails
                      </p>
                    </div>
                    <Switch
                      checked={isMonitoring}
                      onCheckedChange={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      onClick={handleTestProcessing}
                      disabled={processingEmails}
                      className="w-full"
                    >
                      {processingEmails ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Tester...
                        </>
                      ) : (
                        <>
                          <Bot className="h-4 w-4 mr-2" />
                          Test Processing
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleRefreshEmails}
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Opdater Emails
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => onNavigate?.('email')}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Se Email Log
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{emailLogs.length}</p>
                    <p className="text-sm text-muted-foreground">Emails modtaget</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {emailLogs.filter(e => e.processed).length}
                    </p>
                    <p className="text-sm text-muted-foreground">Auto-processed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Leads oprettet</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.conversionRate}%</p>
                    <p className="text-sm text-muted-foreground">Konvertering</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Email Sources */}
        {isConnected && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Email Kilder</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-cyan-500 rounded-full" />
                      <h4 className="font-medium text-foreground">Booking Form</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">info@rendetalje.dk</p>
                    <Badge variant="secondary" className="text-xs">
                      {emailLogs.filter(e => e.source === 'booking_form').length} emails
                    </Badge>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full" />
                      <h4 className="font-medium text-foreground">Leadpoint.dk</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">system@leadpoint.dk</p>
                    <Badge variant="secondary" className="text-xs">
                      {emailLogs.filter(e => e.source === 'leadpoint').length} emails
                    </Badge>
                  </div>

                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                      <h4 className="font-medium text-foreground">Leadmail.no</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">kontakt@leadmail.no</p>
                    <Badge variant="secondary" className="text-xs">
                      {emailLogs.filter(e => e.source === 'leadmail').length} emails
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Email Activity */}
        {isConnected && emailLogs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Seneste Email Aktivitet</span>
                </div>
                {lastSync && (
                  <p className="text-sm text-muted-foreground">
                    Sidst opdateret: {lastSync.toLocaleTimeString('da-DK')}
                  </p>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emailLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        log.processed ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="font-medium text-foreground text-sm">{log.subject}</p>
                        <p className="text-xs text-muted-foreground">{log.sender}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={log.processed ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {log.processed ? 'Processed' : 'Pending'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.created_at).toLocaleTimeString('da-DK')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {emailLogs.length > 5 && (
                <div className="text-center mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => onNavigate?.('email')}
                    className="w-full"
                  >
                    Se alle emails ({emailLogs.length})
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}