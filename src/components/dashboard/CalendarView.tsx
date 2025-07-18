import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  Mail,
  Plus,
  Filter
} from 'lucide-react'
import { useLeads } from '@/hooks/useLeads'
import { Lead } from '@/types'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  time: string
  duration: number
  customer: string
  phone: string
  email: string
  address: string
  serviceType: string
  status: 'scheduled' | 'in_progress' | 'completed'
  lead: Lead
}

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00'
]

const weekDays = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']

export function CalendarView() {
  const { leads } = useLeads()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week')

  // Convert booked leads to calendar events
  const events = useMemo(() => {
    return leads
      .filter(lead => lead.status === 'booked' && lead.bookingDate)
      .map(lead => ({
        id: lead.id,
        title: lead.serviceType,
        date: new Date(lead.bookingDate!),
        time: new Date(lead.bookingDate!).toLocaleTimeString('da-DK', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        duration: lead.estimatedHours,
        customer: lead.customerName,
        phone: lead.customerPhone,
        email: lead.customerEmail,
        address: `${lead.address}, ${lead.city}`,
        serviceType: lead.serviceType,
        status: 'scheduled' as const,
        lead
      }))
  }, [leads])

  // Get current week dates
  const getWeekDates = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const weekDates = getWeekDates(currentDate)

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    )
  }

  // Get events for a specific time slot
  const getEventsForTimeSlot = (date: Date, timeSlot: string) => {
    return getEventsForDate(date).filter(event => 
      event.time === timeSlot
    )
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentDate(newDate)
  }

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const formatDateRange = () => {
    if (viewMode === 'day') {
      return currentDate.toLocaleDateString('da-DK', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    } else {
      const start = weekDates[0]
      const end = weekDates[6]
      return `${start.getDate()}. - ${end.getDate()}. ${end.toLocaleDateString('da-DK', { month: 'long', year: 'numeric' })}`
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>Kalender</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="text-xs"
              >
                Uge
              </Button>
              <Button
                variant={viewMode === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('day')}
                className="text-xs"
              >
                Dag
              </Button>
            </div>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => viewMode === 'week' ? navigateWeek('prev') : navigateDay('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h3 className="text-lg font-semibold text-foreground min-w-[200px] text-center">
              {formatDateRange()}
            </h3>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => viewMode === 'week' ? navigateWeek('next') : navigateDay('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              I dag
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ny booking
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {viewMode === 'week' ? (
          <WeekView 
            weekDates={weekDates} 
            timeSlots={timeSlots}
            getEventsForTimeSlot={getEventsForTimeSlot}
          />
        ) : (
          <DayView 
            date={currentDate}
            timeSlots={timeSlots}
            events={getEventsForDate(currentDate)}
          />
        )}
      </CardContent>
    </Card>
  )
}

function WeekView({ 
  weekDates, 
  timeSlots, 
  getEventsForTimeSlot 
}: { 
  weekDates: Date[]
  timeSlots: string[]
  getEventsForTimeSlot: (date: Date, timeSlot: string) => CalendarEvent[]
}) {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header with days */}
        <div className="grid grid-cols-8 border-b border-border">
          <div className="p-3 text-sm font-medium text-muted-foreground">
            Tid
          </div>
          {weekDates.map((date, index) => (
            <div key={date.toISOString()} className="p-3 text-center border-l border-border">
              <div className="text-sm font-medium text-foreground">
                {weekDays[index]}
              </div>
              <div className={`text-lg font-bold mt-1 ${
                date.toDateString() === new Date().toDateString() 
                  ? 'text-primary' 
                  : 'text-foreground'
              }`}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        {/* Time slots */}
        <div className="max-h-[500px] overflow-y-auto">
          {timeSlots.map(timeSlot => (
            <div key={timeSlot} className="grid grid-cols-8 border-b border-border min-h-[60px]">
              <div className="p-3 text-sm text-muted-foreground font-medium">
                {timeSlot}
              </div>
              {weekDates.map(date => {
                const events = getEventsForTimeSlot(date, timeSlot)
                return (
                  <div key={`${date.toISOString()}-${timeSlot}`} className="border-l border-border p-1">
                    {events.map(event => (
                      <EventCard key={event.id} event={event} compact />
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DayView({ 
  date, 
  timeSlots, 
  events 
}: { 
  date: Date
  timeSlots: string[]
  events: CalendarEvent[]
}) {
  return (
    <div className="max-h-[600px] overflow-y-auto">
      {timeSlots.map(timeSlot => {
        const slotEvents = events.filter(event => event.time === timeSlot)
        return (
          <div key={timeSlot} className="flex border-b border-border min-h-[80px]">
            <div className="w-20 p-3 text-sm text-muted-foreground font-medium border-r border-border">
              {timeSlot}
            </div>
            <div className="flex-1 p-2">
              {slotEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function EventCard({ event, compact = false }: { event: CalendarEvent; compact?: boolean }) {
  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
    completed: 'bg-green-100 text-green-800 border-green-200'
  }

  if (compact) {
    return (
      <div className={`p-2 rounded border-l-4 mb-1 text-xs ${statusColors[event.status]}`}>
        <div className="font-medium truncate">{event.customer}</div>
        <div className="text-xs opacity-75 truncate">{event.serviceType}</div>
      </div>
    )
  }

  return (
    <div className={`p-3 rounded-lg border mb-2 ${statusColors[event.status]}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {event.customer.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{event.customer}</div>
            <div className="text-sm opacity-75">{event.serviceType}</div>
          </div>
        </div>
        
        <Badge variant="secondary" className="text-xs">
          {event.status === 'scheduled' ? 'Planlagt' :
           event.status === 'in_progress' ? 'I gang' : 'Afsluttet'}
        </Badge>
      </div>
      
      <div className="space-y-1 text-sm">
        <div className="flex items-center space-x-2">
          <Clock className="h-3 w-3" />
          <span>{event.time} ({event.duration} timer)</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{event.address}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Phone className="h-3 w-3" />
          <span>{event.phone}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Mail className="h-3 w-3" />
          <span className="truncate">{event.email}</span>
        </div>
      </div>
      
      <div className="flex space-x-2 mt-3">
        <Button size="sm" variant="outline" className="text-xs">
          Rediger
        </Button>
        <Button size="sm" variant="outline" className="text-xs">
          Kontakt
        </Button>
        {event.status === 'scheduled' && (
          <Button size="sm" className="text-xs">
            Start job
          </Button>
        )}
      </div>
    </div>
  )
}