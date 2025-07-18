export interface Lead {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  source: 'leadpoint' | 'leadmail' | 'booking_form'
  serviceType: string
  address: string
  city: string
  postalCode?: string
  estimatedHours: number
  estimatedPrice: number
  status: 'new' | 'contacted' | 'booked' | 'completed' | 'invoiced'
  priority: 'low' | 'medium' | 'high'
  notes?: string
  bookingDate?: string
  bookingTimeSlot?: number
  aiAnalysis?: string
  emailContent?: string
  responseSent: boolean

  createdAt: string
  updatedAt: string
}

export interface Booking {
  id: string
  leadId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceType: string
  address: string
  city: string
  bookingDate: string
  bookingTime: string
  durationHours: number
  hourlyRate: number
  totalAmount: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  googleCalendarEventId?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Invoice {
  id: string
  leadId?: string
  bookingId?: string
  invoiceNumber: string
  customerName: string
  customerEmail: string
  customerAddress: string
  serviceDescription: string
  hoursWorked: number
  hourlyRate: number
  subtotal: number
  vatAmount: number
  totalAmount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  billyInvoiceId?: string
  dueDate?: string
  sentDate?: string
  paidDate?: string
  createdAt: string
  updatedAt: string
}

export interface Activity {
  id: string
  leadId?: string
  bookingId?: string
  invoiceId?: string
  type: 'email' | 'sms' | 'booking' | 'invoice' | 'lead' | 'completed' | 'pending'
  title: string
  description: string
  status: 'completed' | 'pending' | 'failed' | 'in_progress'
  customer?: string
  metadata?: any
  created_at: string
  user_id?: string
}

export interface ActivityItem {
  id: string
  leadId?: string
  bookingId?: string
  invoiceId?: string
  type: 'email' | 'booking' | 'invoice' | 'completed' | 'pending'
  title: string
  description: string
  status: 'info' | 'success' | 'warning' | 'error'
  customer?: string
  metadata?: any
  createdAt: string
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  templateType: 'lead_response' | 'booking_confirmation' | 'invoice_reminder'
  isActive: boolean
  createdAt: string
  updatedAt: string
}



export interface DashboardStats {
  newLeads: number
  todayBookings: number
  pendingInvoices: number
  monthlyRevenue: number
  completedJobs: number
  activeBookings: number
  requiresAction: number
  conversionRate: number
  totalLeadValue: number
}