import { blink } from '@/blink/client'
import { Lead, Booking, Invoice, ActivityItem, EmailTemplate } from '@/types'

// Lead Management using Blink SDK
export const leadService = {
  async getAll(): Promise<Lead[]> {
    try {
      const leads = await blink.db.leads.list({
        orderBy: { createdAt: 'desc' }
      })

      return leads.map(this.transformFromDB)
    } catch (error) {
      console.error('Error fetching leads:', error)
      return []
    }
  },

  async create(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    try {
      const user = await blink.auth.me()
      if (!user) throw new Error('Not authenticated')

      const leadData = {
        customerName: lead.customerName,
        customerEmail: lead.customerEmail,
        customerPhone: lead.customerPhone,
        source: lead.source,
        serviceType: lead.serviceType,
        address: lead.address,
        city: lead.city,
        postalCode: lead.postalCode,
        estimatedHours: lead.estimatedHours,
        estimatedPrice: lead.estimatedPrice,
        status: lead.status,
        priority: lead.priority,
        notes: lead.notes,
        bookingDate: lead.bookingDate,
        bookingTimeSlot: lead.bookingTimeSlot,
        aiAnalysis: lead.aiAnalysis,
        emailContent: lead.emailContent,
        responseSent: lead.responseSent,
        userId: user.id
      }

      const newLead = await blink.db.leads.create(leadData)

      // Create activity log
      await activityService.create({
        leadId: newLead.id,
        type: 'email',
        title: 'Nyt lead oprettet',
        description: `${newLead.serviceType} - ${newLead.city}`,
        status: 'info',
        customer: newLead.customerName
      })

      return this.transformFromDB(newLead)
    } catch (error) {
      console.error('Error creating lead:', error)
      throw error
    }
  },

  async update(id: string, updates: Partial<Lead>): Promise<Lead> {
    try {
      const updatedLead = await blink.db.leads.update(id, updates)

      // Log activity if status changed
      if (updates.status) {
        await activityService.create({
          leadId: id,
          type: updates.status === 'booked' ? 'booking' : 'pending',
          title: `Status opdateret til ${this.getStatusLabel(updates.status)}`,
          description: `${updatedLead.customerName} - ${updatedLead.serviceType}`,
          status: 'info',
          customer: updatedLead.customerName
        })
      }

      return this.transformFromDB(updatedLead)
    } catch (error) {
      console.error('Error updating lead:', error)
      throw error
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await blink.db.leads.delete(id)
    } catch (error) {
      console.error('Error deleting lead:', error)
      throw error
    }
  },

  transformFromDB(data: any): Lead {
    return {
      id: data.id,
      customerName: data.customerName || data.customer_name,
      customerEmail: data.customerEmail || data.customer_email,
      customerPhone: data.customerPhone || data.customer_phone,
      source: data.source,
      serviceType: data.serviceType || data.service_type,
      address: data.address,
      city: data.city,
      postalCode: data.postalCode || data.postal_code,
      estimatedHours: data.estimatedHours || data.estimated_hours,
      estimatedPrice: data.estimatedPrice || data.estimated_price,
      status: data.status,
      priority: data.priority,
      notes: data.notes,
      bookingDate: data.bookingDate || data.booking_date,
      bookingTimeSlot: data.bookingTimeSlot || data.booking_time_slot,
      aiAnalysis: data.aiAnalysis || data.ai_analysis,
      emailContent: data.emailContent || data.email_content,
      responseSent: data.responseSent || data.response_sent,
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at
    }
  },

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'new': 'Nyt',
      'contacted': 'Kontaktet',
      'booked': 'Booket',
      'completed': 'Afsluttet',
      'invoiced': 'Faktureret'
    }
    return labels[status] || status
  }
}

// Booking Management
export const bookingService = {
  async getAll(): Promise<Booking[]> {
    try {
      const bookings = await blink.db.bookings.list({
        orderBy: { bookingDate: 'asc' }
      })

      return bookings.map(this.transformFromDB)
    } catch (error) {
      console.error('Error fetching bookings:', error)
      return []
    }
  },

  async create(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    try {
      const user = await blink.auth.me()
      if (!user) throw new Error('Not authenticated')

      const bookingData = {
        leadId: booking.leadId,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        serviceType: booking.serviceType,
        address: booking.address,
        city: booking.city,
        bookingDate: booking.bookingDate,
        bookingTime: booking.bookingTime,
        durationHours: booking.durationHours,
        hourlyRate: booking.hourlyRate,
        totalAmount: booking.totalAmount,
        status: booking.status,
        googleCalendarEventId: booking.googleCalendarEventId,
        notes: booking.notes,
        userId: user.id
      }

      const newBooking = await blink.db.bookings.create(bookingData)

      // Create activity log
      await activityService.create({
        leadId: booking.leadId,
        bookingId: newBooking.id,
        type: 'booking',
        title: 'Booking oprettet',
        description: `${booking.serviceType} - ${booking.bookingDate}`,
        status: 'success',
        customer: booking.customerName
      })

      return this.transformFromDB(newBooking)
    } catch (error) {
      console.error('Error creating booking:', error)
      throw error
    }
  },

  async update(id: string, updates: Partial<Booking>): Promise<Booking> {
    try {
      const updatedBooking = await blink.db.bookings.update(id, updates)
      return this.transformFromDB(updatedBooking)
    } catch (error) {
      console.error('Error updating booking:', error)
      throw error
    }
  },

  transformFromDB(data: any): Booking {
    return {
      id: data.id,
      leadId: data.leadId || data.lead_id,
      customerName: data.customerName || data.customer_name,
      customerEmail: data.customerEmail || data.customer_email,
      customerPhone: data.customerPhone || data.customer_phone,
      serviceType: data.serviceType || data.service_type,
      address: data.address,
      city: data.city,
      bookingDate: data.bookingDate || data.booking_date,
      bookingTime: data.bookingTime || data.booking_time,
      durationHours: data.durationHours || data.duration_hours,
      hourlyRate: data.hourlyRate || data.hourly_rate,
      totalAmount: data.totalAmount || data.total_amount,
      status: data.status,
      googleCalendarEventId: data.googleCalendarEventId || data.google_calendar_event_id,
      notes: data.notes,
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at
    }
  }
}

// Activity Management
export const activityService = {
  async getAll(): Promise<ActivityItem[]> {
    try {
      const activities = await blink.db.activities.list({
        orderBy: { createdAt: 'desc' },
        limit: 50
      })

      return activities.map(this.transformFromDB)
    } catch (error) {
      console.error('Error fetching activities:', error)
      return []
    }
  },

  async create(activity: Omit<ActivityItem, 'id' | 'createdAt'>): Promise<ActivityItem> {
    try {
      const user = await blink.auth.me()
      if (!user) throw new Error('Not authenticated')

      const activityData = {
        leadId: activity.leadId,
        bookingId: activity.bookingId,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        status: activity.status,
        customer: activity.customer,
        metadata: activity.metadata,
        userId: user.id
      }

      const newActivity = await blink.db.activities.create(activityData)
      return this.transformFromDB(newActivity)
    } catch (error) {
      console.error('Error creating activity:', error)
      throw error
    }
  },

  transformFromDB(data: any): ActivityItem {
    return {
      id: data.id,
      leadId: data.leadId || data.lead_id,
      bookingId: data.bookingId || data.booking_id,
      type: data.type,
      title: data.title,
      description: data.description,
      status: data.status,
      customer: data.customer,
      metadata: data.metadata,
      createdAt: data.createdAt || data.created_at
    }
  }
}

// Email Template Management
export const emailTemplateService = {
  async getAll(): Promise<EmailTemplate[]> {
    try {
      const templates = await blink.db.emailTemplates.list({
        orderBy: { createdAt: 'desc' }
      })

      return templates.map(this.transformFromDB)
    } catch (error) {
      console.error('Error fetching email templates:', error)
      return []
    }
  },

  async create(template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    try {
      const user = await blink.auth.me()
      if (!user) throw new Error('Not authenticated')

      const templateData = {
        name: template.name,
        subject: template.subject,
        content: template.content,
        templateType: template.templateType,
        isActive: template.isActive,
        userId: user.id
      }

      const newTemplate = await blink.db.emailTemplates.create(templateData)
      return this.transformFromDB(newTemplate)
    } catch (error) {
      console.error('Error creating email template:', error)
      throw error
    }
  },

  transformFromDB(data: any): EmailTemplate {
    return {
      id: data.id,
      name: data.name,
      subject: data.subject,
      content: data.content,
      templateType: data.templateType || data.template_type,
      isActive: data.isActive || data.is_active,
      createdAt: data.createdAt || data.created_at,
      updatedAt: data.updatedAt || data.updated_at
    }
  }
}

// Real-time subscriptions using Blink SDK
export const subscriptions = {
  subscribeToLeads(callback: (payload: any) => void) {
    // For now, we'll use polling since Blink SDK doesn't have built-in real-time subscriptions
    // In a production app, you'd implement WebSocket connections or use Blink's realtime features
    const interval = setInterval(async () => {
      try {
        const leads = await leadService.getAll()
        callback({ new: leads })
      } catch (error) {
        console.error('Error in leads subscription:', error)
      }
    }, 5000) // Poll every 5 seconds

    return {
      unsubscribe: () => {
        clearInterval(interval)
      }
    }
  },

  subscribeToActivities(callback: (payload: any) => void) {
    const interval = setInterval(async () => {
      try {
        const activities = await activityService.getAll()
        callback({ new: activities })
      } catch (error) {
        console.error('Error in activities subscription:', error)
      }
    }, 5000)

    return {
      unsubscribe: () => {
        clearInterval(interval)
      }
    }
  },

  subscribeToBookings(callback: (payload: any) => void) {
    const interval = setInterval(async () => {
      try {
        const bookings = await bookingService.getAll()
        callback({ new: bookings })
      } catch (error) {
        console.error('Error in bookings subscription:', error)
      }
    }, 5000)

    return {
      unsubscribe: () => {
        clearInterval(interval)
      }
    }
  }
}

// Dashboard stats calculation
export const statsService = {
  async getDashboardStats() {
    try {
      // Get leads stats
      const leads = await blink.db.leads.list()
      
      // Get bookings stats
      const bookings = await blink.db.bookings.list()

      const today = new Date().toISOString().split('T')[0]
      const thisMonth = new Date().toISOString().slice(0, 7)

      const newLeads = leads.filter(l => l.status === 'new').length
      const todayBookings = bookings.filter(b => b.bookingDate?.startsWith(today)).length
      const activeBookings = bookings.filter(b => b.status === 'scheduled').length
      const completedJobs = bookings.filter(b => b.status === 'completed').length
      
      const monthlyRevenue = bookings
        .filter(b => b.bookingDate?.startsWith(thisMonth) && b.status === 'completed')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0)

      const totalLeadValue = leads.reduce((sum, l) => sum + (l.estimatedPrice || 0), 0)
      const conversionRate = leads.length ? Math.round((bookings.length || 0) / leads.length * 100) : 0

      return {
        newLeads,
        todayBookings,
        pendingInvoices: 0, // Will be implemented with invoice system
        monthlyRevenue,
        completedJobs,
        activeBookings,
        requiresAction: newLeads,
        conversionRate,
        totalLeadValue
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        newLeads: 0,
        todayBookings: 0,
        pendingInvoices: 0,
        monthlyRevenue: 0,
        completedJobs: 0,
        activeBookings: 0,
        requiresAction: 0,
        conversionRate: 0,
        totalLeadValue: 0
      }
    }
  }
}