import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Users,
  MapPin
} from 'lucide-react'
import { blink } from '@/blink/client'

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  location?: string
  description?: string
  attendees?: string[]
  status: 'confirmed' | 'tentative' | 'cancelled'
}

export function GoogleCalendarSync() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [lastSync, setLastSync] = useState<Date>(new Date())
  const [syncStatus, setSyncStatus] = useState<'connected' | 'error' | 'syncing'>('connected')
  const [availableSlots, setAvailableSlots] = useState<string[]>([])

  const syncCalendar = useCallback(async () => {
    setLoading(true)
    setSyncStatus('syncing')
    
    try {
      // Simulate API call to Google Calendar
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock calendar events
      const mockEvents: CalendarEvent[] = [
        {
          id: 'event_1',
          title: 'Rengøring - Johanne Larsen',
          start: '2025-01-23T09:00:00',
          end: '2025-01-23T12:00:00',
          location: 'Viborgvej 15, 8000 Aarhus C',
          description: 'Fast rengøring - 3 rum lejlighed',
          attendees: ['johanne.larsen@gmail.com'],
          status: 'confirmed'
        },
        {
          id: 'event_2',
          title: 'Kontorrengøring - Peter Andersen',
          start: '2025-01-24T10:00:00',
          end: '2025-01-24T14:00:00',
          location: 'Silkeborgvej 290, 8230 Åbyhøj',
          description: 'Ugentlig kontorrengøring - 120 kvm',
          attendees: ['peter.andersen@hotmail.com'],
          status: 'confirmed'
        },
        {
          id: 'event_3',
          title: 'Rengøring - Anne Kristensen',
          start: '2025-01-27T09:00:00',
          end: '2025-01-27T13:00:00',
          location: 'Tilst Hovedgade 42, 8381 Tilst',
          description: 'Hus rengøring - 140 kvm',
          attendees: ['anne.kristensen@gmail.com'],
          status: 'confirmed'
        }
      ]

      // Mock available time slots
      const mockAvailableSlots = [
        'Tirsdag 28/1 kl. 09:00',
        'Tirsdag 28/1 kl. 14:00',
        'Onsdag 29/1 kl. 10:00',
        'Torsdag 30/1 kl. 09:00',
        'Fredag 31/1 kl. 13:00'
      ]
      
      setEvents(mockEvents)
      setAvailableSlots(mockAvailableSlots)
      setLastSync(new Date())
      setSyncStatus('connected')
      
    } catch (error) {
      console.error('Calendar sync error:', error)
      setSyncStatus('error')
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-sync every 5 minutes
  useEffect(() => {
    syncCalendar()
    
    const interval = setInterval(() => {
      syncCalendar()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [syncCalendar])

  const getStatusColor = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'tentative':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('da-DK'),
      time: date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })
    }
  }

  const getTodayEvents = () => {
    const today = new Date().toDateString()
    return events.filter(event => 
      new Date(event.start).toDateString() === today
    )
  }

  const getUpcomingEvents = () => {
    const today = new Date()
    return events.filter(event => 
      new Date(event.start) > today
    ).slice(0, 5)
  }

  return (
    <div className="space-y-6">
      {/* Sync Status */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span>Google Calendar Sync</span>
              <Badge className={
                syncStatus === 'connected' ? 'bg-green-100 text-green-800' :
                syncStatus === 'error' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }>
                {syncStatus === 'connected' ? 'Forbundet' : 
                 syncStatus === 'error' ? 'Fejl' : 'Synkroniserer'}
              </Badge>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={syncCalendar}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Sync Nu
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{events.length}</div>
              <div className="text-sm text-muted-foreground">Bookinger Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{getTodayEvents().length}</div>
              <div className="text-sm text-muted-foreground">I Dag</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{availableSlots.length}</div>
              <div className="text-sm text-muted-foreground">Ledige Slots</div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            Sidste sync: {lastSync.toLocaleTimeString('da-DK')}
          </div>
          
          {syncStatus === 'connected' && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-800">
                Forbundet til Rendetalje Google Calendar - Automatisk booking aktiveret
              </AlertDescription>
            </Alert>
          )}
          
          {syncStatus === 'error' && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Fejl ved forbindelse til Google Calendar. Tjek API nøgler.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Today's Events */}
      {getTodayEvents().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>I Dag ({getTodayEvents().length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTodayEvents().map((event) => {
                const { time } = formatDateTime(event.start)
                const endTime = formatDateTime(event.end).time
                return (
                  <div key={event.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-foreground">{event.title}</h4>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{time} - {endTime}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events & Available Slots */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Kommende Bookinger</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getUpcomingEvents().length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2" />
                  <p>Ingen kommende bookinger</p>
                </div>
              ) : (
                getUpcomingEvents().map((event) => {
                  const { date, time } = formatDateTime(event.start)
                  const endTime = formatDateTime(event.end).time
                  return (
                    <div key={event.id} className="p-3 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">{event.title}</h4>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{date} kl. {time} - {endTime}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{event.attendees[0]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Slots */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-accent" />
              <span>Ledige Tidspunkter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {availableSlots.map((slot, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-accent/10 rounded-lg">
                  <span className="text-sm font-medium text-foreground">{slot}</span>
                  <Badge variant="outline" className="text-xs">
                    Ledig
                  </Badge>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Disse tidspunkter bruges automatisk i AI email svar til nye leads
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Link */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground">Google Calendar</h4>
              <p className="text-sm text-muted-foreground">
                Åbn din Rendetalje kalender i Google Calendar
              </p>
            </div>
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Åbn Kalender
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}