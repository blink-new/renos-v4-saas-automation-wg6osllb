import { blink } from '../blink/client'
import type { Lead, Activity, Booking, Invoice } from '../types'

// Sample data for demo
const sampleLeads: Lead[] = [
  {
    id: 'lead_1',
    customerName: 'Lars Nielsen',
    customerEmail: 'lars@example.dk',
    customerPhone: '+45 12 34 56 78',
    source: 'leadpoint',
    serviceType: 'Vinduesrengøring',
    address: 'Nørrebrogade 123',
    city: 'København',
    postalCode: '2200',
    estimatedHours: 3,
    estimatedPrice: 1047,
    status: 'new',
    priority: 'high',
    notes: 'Stor villa med mange vinduer',
    responseSent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lead_2',
    customerName: 'Maria Andersen',
    customerEmail: 'maria@example.dk',
    customerPhone: '+45 87 65 43 21',
    source: 'booking_form',
    serviceType: 'Kontorrengøring',
    address: 'Vesterbrogade 45',
    city: 'København',
    postalCode: '1620',
    estimatedHours: 2,
    estimatedPrice: 698,
    status: 'contacted',
    priority: 'medium',
    notes: 'Ugentlig rengøring ønskes',
    responseSent: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'lead_3',
    customerName: 'Peter Jensen',
    customerEmail: 'peter@example.dk',
    customerPhone: '+45 23 45 67 89',
    source: 'leadmail',
    serviceType: 'Dybderengøring',
    address: 'Amagerbrogade 78',
    city: 'København',
    postalCode: '2300',
    estimatedHours: 5,
    estimatedPrice: 1745,
    status: 'booked',
    priority: 'high',
    notes: 'Flytterengøring - skal være færdig til d. 25.',
    bookingDate: new Date(Date.now() + 172800000).toISOString(),
    responseSent: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  }
]

// Lead Management
export const leadService = {
  async getAll(): Promise<Lead[]> {
    try {
      // For demo purposes, return sample data
      // In production, this would use: await blink.db.leads.list()
      return sampleLeads
    } catch (error) {
      console.error('Error fetching leads:', error)
      return sampleLeads
    }
  },

  async getById(id: string): Promise<Lead | null> {
    try {
      // For demo purposes, find in sample data
      return sampleLeads.find(lead => lead.id === id) || null
    } catch (error) {
      console.error('Error fetching lead:', error)
      return null
    }
  },

  async create(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    try {
      // For demo purposes, create a new lead in memory
      const newLead: Lead = {
        ...lead,
        id: `lead_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      sampleLeads.unshift(newLead)
      return newLead
    } catch (error) {
      console.error('Error creating lead:', error)
      throw error
    }
  },

  async update(id: string, updates: Partial<Lead>): Promise<Lead> {
    try {
      // For demo purposes, update in memory
      const leadIndex = sampleLeads.findIndex(lead => lead.id === id)
      if (leadIndex === -1) {
        throw new Error('Lead not found')
      }
      
      const updatedLead = {
        ...sampleLeads[leadIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      
      sampleLeads[leadIndex] = updatedLead
      return updatedLead
    } catch (error) {
      console.error('Error updating lead:', error)
      throw error
    }
  },

  async delete(id: string): Promise<void> {
    try {
      // For demo purposes, remove from memory
      const leadIndex = sampleLeads.findIndex(lead => lead.id === id)
      if (leadIndex !== -1) {
        sampleLeads.splice(leadIndex, 1)
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
      throw error
    }
  },

  // Real-time subscription - simplified for Blink SDK
  subscribeToChanges(callback: (payload: any) => void) {
    // For now, return a dummy subscription
    // Blink SDK handles real-time updates differently
    return {
      unsubscribe: () => {}
    }
  }
}

// Sample activities for demo
const sampleActivities: Activity[] = [
  {
    id: 'activity_1',
    leadId: 'lead_1',
    type: 'email',
    title: 'Email sendt til Lars Nielsen',
    description: 'Automatisk tilbud sendt med 3 tidspunkter',
    status: 'completed',
    customer: 'Lars Nielsen',
    created_at: new Date().toISOString()
  },
  {
    id: 'activity_2',
    leadId: 'lead_2',
    type: 'booking',
    title: 'Booking bekræftet for Maria Andersen',
    description: 'Kontorrengøring booket til d. 20/1',
    status: 'completed',
    customer: 'Maria Andersen',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'activity_3',
    leadId: 'lead_3',
    type: 'invoice',
    title: 'Faktura oprettet for Peter Jensen',
    description: 'Dybderengøring - 1.745 kr',
    status: 'pending',
    customer: 'Peter Jensen',
    created_at: new Date(Date.now() - 7200000).toISOString()
  }
]

// Activity Management
export const activityService = {
  async getAll(): Promise<Activity[]> {
    try {
      // For demo purposes, return sample activities
      return sampleActivities
    } catch (error) {
      console.error('Error fetching activities:', error)
      return []
    }
  },

  async create(activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> {
    try {
      // For demo purposes, create activity in memory
      const newActivity: Activity = {
        ...activity,
        id: `activity_${Date.now()}`,
        created_at: new Date().toISOString()
      }
      
      sampleActivities.unshift(newActivity)
      return newActivity
    } catch (error) {
      console.error('Error creating activity:', error)
      throw error
    }
  },

  // Real-time subscription - simplified for Blink SDK
  subscribeToChanges(callback: (payload: any) => void) {
    return {
      unsubscribe: () => {}
    }
  }
}

// Booking Management
export const bookingService = {
  async getAll(): Promise<Booking[]> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Supabase error:', error)
        return []
      }
      
      return (data || []).map(booking => ({
        id: booking.id,
        leadId: booking.lead_id,
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        customerPhone: booking.customer_phone,
        serviceType: booking.service_type,
        address: booking.address,
        city: booking.city,
        bookingDate: booking.booking_date,
        bookingTime: booking.booking_time,
        durationHours: booking.duration_hours,
        hourlyRate: booking.hourly_rate,
        totalAmount: booking.total_amount,
        status: booking.status,
        googleCalendarEventId: booking.google_calendar_event_id,
        notes: booking.notes,
        createdAt: booking.created_at,
        updatedAt: booking.updated_at
      }))
    } catch (error) {
      console.error('Error fetching bookings:', error)
      return []
    }
  },

  async create(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          user_id: '00000000-0000-0000-0000-000000000000', // Default user ID
          lead_id: booking.leadId,
          customer_name: booking.customerName,
          customer_email: booking.customerEmail,
          customer_phone: booking.customerPhone,
          service_type: booking.serviceType,
          address: booking.address,
          city: booking.city,
          booking_date: booking.bookingDate,
          booking_time: booking.bookingTime,
          duration_hours: booking.durationHours,
          hourly_rate: booking.hourlyRate,
          total_amount: booking.totalAmount,
          status: booking.status,
          google_calendar_event_id: booking.googleCalendarEventId,
          notes: booking.notes
        }])
        .select()
        .single()
      
      if (error) throw error
      
      return {
        id: data.id,
        leadId: data.lead_id,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        customerPhone: data.customer_phone,
        serviceType: data.service_type,
        address: data.address,
        city: data.city,
        bookingDate: data.booking_date,
        bookingTime: data.booking_time,
        durationHours: data.duration_hours,
        hourlyRate: data.hourly_rate,
        totalAmount: data.total_amount,
        status: data.status,
        googleCalendarEventId: data.google_calendar_event_id,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      throw error
    }
  }
}

// Invoice Management
export const invoiceService = {
  async getAll(): Promise<Invoice[]> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Supabase error:', error)
        return []
      }
      
      return (data || []).map(invoice => ({
        id: invoice.id,
        leadId: invoice.lead_id,
        bookingId: invoice.booking_id,
        invoiceNumber: invoice.invoice_number,
        customerName: invoice.customer_name,
        customerEmail: invoice.customer_email,
        customerAddress: invoice.customer_address,
        serviceDescription: invoice.service_description,
        hoursWorked: invoice.hours_worked,
        hourlyRate: invoice.hourly_rate,
        subtotal: invoice.subtotal,
        vatAmount: invoice.vat_amount,
        totalAmount: invoice.total_amount,
        status: invoice.status,
        billyInvoiceId: invoice.billy_invoice_id,
        dueDate: invoice.due_date,
        sentDate: invoice.sent_date,
        paidDate: invoice.paid_date,
        createdAt: invoice.created_at,
        updatedAt: invoice.updated_at
      }))
    } catch (error) {
      console.error('Error fetching invoices:', error)
      return []
    }
  },

  async create(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert([{
          user_id: '00000000-0000-0000-0000-000000000000', // Default user ID
          lead_id: invoice.leadId,
          booking_id: invoice.bookingId,
          invoice_number: invoice.invoiceNumber,
          customer_name: invoice.customerName,
          customer_email: invoice.customerEmail,
          customer_address: invoice.customerAddress,
          service_description: invoice.serviceDescription,
          hours_worked: invoice.hoursWorked,
          hourly_rate: invoice.hourlyRate,
          subtotal: invoice.subtotal,
          vat_amount: invoice.vatAmount,
          total_amount: invoice.totalAmount,
          status: invoice.status,
          billy_invoice_id: invoice.billyInvoiceId,
          due_date: invoice.dueDate,
          sent_date: invoice.sentDate,
          paid_date: invoice.paidDate
        }])
        .select()
        .single()
      
      if (error) throw error
      
      return {
        id: data.id,
        leadId: data.lead_id,
        bookingId: data.booking_id,
        invoiceNumber: data.invoice_number,
        customerName: data.customer_name,
        customerEmail: data.customer_email,
        customerAddress: data.customer_address,
        serviceDescription: data.service_description,
        hoursWorked: data.hours_worked,
        hourlyRate: data.hourly_rate,
        subtotal: data.subtotal,
        vatAmount: data.vat_amount,
        totalAmount: data.total_amount,
        status: data.status,
        billyInvoiceId: data.billy_invoice_id,
        dueDate: data.due_date,
        sentDate: data.sent_date,
        paidDate: data.paid_date,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      throw error
    }
  }
}

// Dashboard Stats
export const dashboardService = {
  async getStats() {
    try {
      // Use sample data for demo
      const leadsData = sampleLeads
      
      // Calculate stats from sample data
      const totalLeads = leadsData?.length || 0
      const newLeads = leadsData?.filter(l => l.status === 'new').length || 0
      const activeBookings = leadsData?.filter(l => l.status === 'booked').length || 0
      const totalRevenue = leadsData?.reduce((sum, lead) => sum + (Number(lead.estimatedPrice) || 0), 0) || 0

      return {
        totalLeads,
        newLeads,
        activeBookings,
        totalRevenue
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        totalLeads: 0,
        newLeads: 0,
        activeBookings: 0,
        totalRevenue: 0
      }
    }
  }
}