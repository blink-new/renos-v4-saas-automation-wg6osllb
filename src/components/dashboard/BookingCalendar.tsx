import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react'
import { mockBookings } from '@/data/mockData'
import { Booking } from '@/types'

interface CalendarBooking extends Booking {
  date: Date
}

export function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [bookings] = useState<CalendarBooking[]>(
    mockBookings.map(booking => ({
      ...booking,
      date: new Date(booking.bookingDate)
    }))
  )

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => 
      booking.date.toDateString() === date.toDateString()
    )
  }

  const getTodayBookings = () => {
    const today = new Date()
    return getBookingsForDate(today)
  }

  const getUpcomingBookings = () => {
    const today = new Date()
    return bookings.filter(booking => booking.date > today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 5)
  }

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-primary/10 text-primary'
      case 'in_progress':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-accent/10 text-accent'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatTime = (time: string) => {
    return time.substring(0, 5) // Extract HH:MM from HH:MM:SS
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('da-DK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const selectedDateBookings = getBookingsForDate(selectedDate)
  const todayBookings = getTodayBookings()
  const upcomingBookings = getUpcomingBookings()

  return (
    <div className="space-y-6">
      {/* Today's Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">I dag</p>
                <p className="text-2xl font-bold text-foreground">{todayBookings.length}</p>
                <p className="text-xs text-muted-foreground">Bookinger</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Timer i dag</p>
                <p className="text-2xl font-bold text-foreground">
                  {todayBookings.reduce((sum, booking) => sum + booking.durationHours, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Estimeret</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kommende</p>
                <p className="text-2xl font-bold text-foreground">{upcomingBookings.length}</p>
                <p className="text-xs text-muted-foreground">Næste 7 dage</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calendar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Booking Kalender</CardTitle>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ny Booking
            </Button>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{
                booked: bookings.map(b => b.date)
              }}
              modifiersStyles={{
                booked: { 
                  backgroundColor: 'hsl(var(--primary))', 
                  color: 'hsl(var(--primary-foreground))',
                  fontWeight: 'bold'
                }
              }}
            />
            
            {/* Selected Date Info */}
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <h4 className="font-medium text-foreground mb-2">
                {formatDate(selectedDate)}
              </h4>
              {selectedDateBookings.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateBookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>{formatTime(booking.bookingTime)}</span>
                        <span>-</span>
                        <span>{booking.customerName}</span>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Ingen bookinger denne dag</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>I dag's Bookinger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayBookings.length > 0 ? (
              todayBookings.map(booking => (
                <div key={booking.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{booking.customerName}</h4>
                        <p className="text-sm text-muted-foreground">{booking.serviceType}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(booking.bookingTime)} ({booking.durationHours} timer)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{booking.address}, {booking.city}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{booking.customerPhone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{booking.customerEmail}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <div className="text-sm font-medium text-foreground">
                      {booking.totalAmount.toLocaleString()} kr
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Rediger
                      </Button>
                      <Button size="sm">
                        Start Job
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ingen bookinger i dag</p>
                <p className="text-sm">Nyd din fridag! 🌿</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Kommende Bookinger</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-3">
              {upcomingBookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-foreground">{booking.customerName}</span>
                        <Badge variant="secondary" className="text-xs">
                          {booking.serviceType}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(booking.bookingTime)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{booking.city}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-foreground">
                      {booking.totalAmount.toLocaleString()} kr
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {booking.durationHours} timer
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ingen kommende bookinger</p>
              <p className="text-sm">Tid til at generere flere leads! 📈</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}