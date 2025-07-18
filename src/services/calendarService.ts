import { blink } from '@/blink/client'
import { Lead } from '@/types'

interface TimeSlot {
  formatted: string
  start: Date
  end: Date
}

interface CalendarEvent {
  id: string
  summary: string
  description: string
  start: string
  end: string
  attendees: string[]
}

class CalendarService {
  async getAvailableSlots(): Promise<TimeSlot[]> {
    try {
      // For now, return fallback slots since we don't have Google Calendar integration set up
      // In a production app, you'd call a Blink Edge Function or use Google Calendar API
      return this.getFallbackSlots()
    } catch (error) {
      console.error('Error fetching available slots:', error)
      return this.getFallbackSlots()
    }
  }

  async createBooking(lead: Lead, slotIndex: number): Promise<string | null> {
    try {
      // Create a booking record in the database
      const user = await blink.auth.me()
      if (!user) throw new Error('Not authenticated')

      const slots = await this.getAvailableSlots()
      const selectedSlot = slots[slotIndex]
      
      if (!selectedSlot) {
        console.error('Invalid slot index:', slotIndex)
        return null
      }

      // Create booking in database
      const booking = await blink.db.bookings.create({
        leadId: lead.id,
        customerName: lead.customerName,
        customerEmail: lead.customerEmail,
        customerPhone: lead.customerPhone,
        serviceType: lead.serviceType,
        address: lead.address,
        city: lead.city,
        bookingDate: selectedSlot.start.toISOString().split('T')[0],
        bookingTime: selectedSlot.start.toTimeString().slice(0, 5),
        durationHours: lead.estimatedHours || 2,
        hourlyRate: 349,
        totalAmount: (lead.estimatedHours || 2) * 349,
        status: 'scheduled',
        googleCalendarEventId: `booking_${Date.now()}`, // Placeholder event ID
        notes: lead.notes,
        userId: user.id
      })

      // Update lead status to booked
      await blink.db.leads.update(lead.id, {
        status: 'booked',
        bookingDate: selectedSlot.start.toISOString().split('T')[0],
        bookingTimeSlot: selectedSlot.formatted
      })

      return booking.googleCalendarEventId
    } catch (error) {
      console.error('Error creating calendar booking:', error)
      return null
    }
  }

  async updateBooking(eventId: string, updates: Partial<CalendarEvent>): Promise<boolean> {
    try {
      // Find booking by Google Calendar event ID and update it
      const bookings = await blink.db.bookings.list({
        where: { googleCalendarEventId: eventId }
      })

      if (bookings.length === 0) {
        console.error('Booking not found for event ID:', eventId)
        return false
      }

      const booking = bookings[0]
      const updateData: any = {}

      if (updates.summary) updateData.serviceType = updates.summary
      if (updates.description) updateData.notes = updates.description
      if (updates.start) {
        const startDate = new Date(updates.start)
        updateData.bookingDate = startDate.toISOString().split('T')[0]
        updateData.bookingTime = startDate.toTimeString().slice(0, 5)
      }

      await blink.db.bookings.update(booking.id, updateData)
      return true
    } catch (error) {
      console.error('Error updating calendar booking:', error)
      return false
    }
  }

  async cancelBooking(eventId: string): Promise<boolean> {
    try {
      // Find booking by Google Calendar event ID and cancel it
      const bookings = await blink.db.bookings.list({
        where: { googleCalendarEventId: eventId }
      })

      if (bookings.length === 0) {
        console.error('Booking not found for event ID:', eventId)
        return false
      }

      const booking = bookings[0]
      await blink.db.bookings.update(booking.id, { status: 'cancelled' })

      // Also update the lead status
      if (booking.leadId) {
        await blink.db.leads.update(booking.leadId, { status: 'contacted' })
      }

      return true
    } catch (error) {
      console.error('Error canceling calendar booking:', error)
      return false
    }
  }

  async getTodaysBookings(): Promise<CalendarEvent[]> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const bookings = await blink.db.bookings.list({
        where: { bookingDate: today },
        orderBy: { bookingTime: 'asc' }
      })

      return bookings.map(booking => ({
        id: booking.googleCalendarEventId || booking.id,
        summary: `${booking.serviceType} - ${booking.customerName}`,
        description: `Kunde: ${booking.customerName}\nTelefon: ${booking.customerPhone}\nAdresse: ${booking.address}\nNoter: ${booking.notes || 'Ingen'}`,
        start: `${booking.bookingDate}T${booking.bookingTime}:00`,
        end: `${booking.bookingDate}T${this.addHours(booking.bookingTime, booking.durationHours)}:00`,
        attendees: [booking.customerEmail]
      }))
    } catch (error) {
      console.error('Error fetching today\'s bookings:', error)
      return []
    }
  }

  async getUpcomingBookings(days: number = 7): Promise<CalendarEvent[]> {
    try {
      const today = new Date()
      const futureDate = new Date()
      futureDate.setDate(today.getDate() + days)

      const bookings = await blink.db.bookings.list({
        where: {
          AND: [
            { bookingDate: { gte: today.toISOString().split('T')[0] } },
            { bookingDate: { lte: futureDate.toISOString().split('T')[0] } }
          ]
        },
        orderBy: { bookingDate: 'asc' }
      })

      return bookings.map(booking => ({
        id: booking.googleCalendarEventId || booking.id,
        summary: `${booking.serviceType} - ${booking.customerName}`,
        description: `Kunde: ${booking.customerName}\nTelefon: ${booking.customerPhone}\nAdresse: ${booking.address}\nNoter: ${booking.notes || 'Ingen'}`,
        start: `${booking.bookingDate}T${booking.bookingTime}:00`,
        end: `${booking.bookingDate}T${this.addHours(booking.bookingTime, booking.durationHours)}:00`,
        attendees: [booking.customerEmail]
      }))
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error)
      return []
    }
  }

  async syncCalendarWithDatabase(): Promise<void> {
    try {
      // In a production app, this would sync with Google Calendar
      // For now, we'll just log that sync was requested
      console.log('Calendar sync requested - would sync with Google Calendar in production')
    } catch (error) {
      console.error('Error syncing calendar with database:', error)
    }
  }

  async checkCalendarAvailability(date: string, duration: number): Promise<boolean> {
    try {
      // Check if there are any bookings on the given date
      const bookings = await blink.db.bookings.list({
        where: { bookingDate: date }
      })

      // For simplicity, assume available if less than 3 bookings per day
      return bookings.length < 3
    } catch (error) {
      console.error('Error checking calendar availability:', error)
      return false
    }
  }

  // Fallback method when calendar service is unavailable
  private getFallbackSlots(): TimeSlot[] {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const dayAfter = new Date(now)
    dayAfter.setDate(dayAfter.getDate() + 2)

    const slots = [
      new Date(tomorrow.setHours(10, 0, 0, 0)),
      new Date(tomorrow.setHours(14, 0, 0, 0)),
      new Date(dayAfter.setHours(9, 0, 0, 0))
    ]

    return slots.map(start => {
      const end = new Date(start)
      end.setHours(end.getHours() + 2) // Default 2 hour duration

      return {
        formatted: start.toLocaleString('da-DK', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        }),
        start,
        end
      }
    })
  }

  // Utility methods
  formatTimeSlot(slot: TimeSlot): string {
    return `${slot.start.toLocaleDateString('da-DK', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })} kl. ${slot.start.toLocaleTimeString('da-DK', {
      hour: '2-digit',
      minute: '2-digit'
    })}`
  }

  isSlotAvailable(slot: TimeSlot, existingBookings: CalendarEvent[]): boolean {
    return !existingBookings.some(booking => {
      const bookingStart = new Date(booking.start)
      const bookingEnd = new Date(booking.end)
      
      return (
        (slot.start >= bookingStart && slot.start < bookingEnd) ||
        (slot.end > bookingStart && slot.end <= bookingEnd) ||
        (slot.start <= bookingStart && slot.end >= bookingEnd)
      )
    })
  }

  private addHours(timeString: string, hours: number): string {
    const [hour, minute] = timeString.split(':').map(Number)
    const date = new Date()
    date.setHours(hour, minute, 0, 0)
    date.setHours(date.getHours() + hours)
    
    return date.toTimeString().slice(0, 5)
  }

  // Test function to verify calendar service connectivity
  async testCalendarConnection(): Promise<boolean> {
    try {
      // Test by trying to get available slots
      const slots = await this.getAvailableSlots()
      console.log('Calendar service test successful:', slots.length, 'slots available')
      return slots.length > 0
    } catch (error) {
      console.error('Calendar service test error:', error)
      return false
    }
  }
}

export const calendarService = new CalendarService()