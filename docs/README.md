# RenOS v4 - Complete SaaS Lead-to-Invoice Automation

🇩🇰 **Advanced Danish Lead Management System for Rendetalje.dk**

## 📋 Project Overview

**RenOS v4** is a comprehensive SaaS platform that automates the complete lead-to-invoice workflow for Rendetalje, a Danish eco-cleaning company. The system intelligently processes incoming leads from multiple sources, generates AI-powered responses, manages bookings, and creates invoices automatically.

### 🏢 Company Information
- **Company**: Rendetalje ApS
- **Website**: rendetalje.dk
- **Email**: info@rendetalje.dk
- **Phone**: 22 65 02 26
- **Address**: Gammel Viborgvej 40, 8381 Tilst
- **CVR**: 45564096
- **Service**: Eco-friendly cleaning services in Denmark

## 🎯 System Features

### ✅ Implemented Features

#### 🤖 AI-Powered Email Processing
- **Gemini AI Integration**: Processes incoming emails with Danish language understanding
- **Multi-source Support**: Handles emails from:
  - Egen booking form → info@rendetalje.dk
  - Leadpoint.dk → system@leadpoint.dk  
  - Leadmail.no → kontakt@leadmail.no
- **Automatic Parsing**: Extracts customer information, service requirements, and pricing
- **Tone of Voice**: Maintains Rendetalje's professional Danish business communication style

#### 📧 Gmail Integration
- **OAuth2 Authentication**: Secure Gmail API access
- **Intelligent Spam Filtering**: Filters out irrelevant emails
- **Real-time Processing**: Monitors inbox for new leads continuously

#### 📅 Google Calendar Booking
- **3-Slot Time Offers**: Automatically generates 3 available time slots
- **Calendar Integration**: Syncs with Google Calendar for availability
- **Automatic Booking**: Creates calendar events when customer responds

#### 💰 Billy Invoicing Integration
- **Automatic Price Calculation**: 349 DKK/hour standard rate
- **Draft Invoice Creation**: Generates invoices in Billy system
- **Post-job Completion**: Finalizes invoices after job completion

#### 🗃️ Database Management
- **PostgreSQL with Drizzle ORM**: Type-safe database operations
- **Complete Schema**: All entities properly modeled
- **Real-time Updates**: Live data synchronization

#### ⚙️ Configuration Management
- **Centralized Config**: Type-safe environment validation
- **Multi-environment Support**: Development, staging, production
- **Secret Management**: Secure API key handling

### 📱 Frontend Dashboard Features

#### 🏠 Dashboard Overview
- **Real-time Statistics**: Live overview of leads and performance
- **Activity Feed**: Recent system activities and updates
- **Pipeline Visualization**: Visual representation of lead progression
- **Quick Actions**: Fast access to common tasks

#### 📧 Gmail Integration
- **AI Email Processing**: Automatisk behandling af info@rendetalje.dk emails
- **Lead Detection**: Intelligent identificering af potentielle leads
- **Auto Response**: Automatiske svar med Rendetalje tone of voice
- **Real-time Monitoring**: Live email feed og processing status
- **Template Management**: Administrer email response skabeloner
- **Analytics Dashboard**: Email performance metrics og trends
- **Confidence Scoring**: AI sikkerhedsscore for hver email
- **Multi-source Support**: Håndterer emails fra alle lead kilder

#### 👥 Lead Management
- **Kanban Board**: Drag-and-drop interface for lead status management
- **Lead Statuses**: New → Contacted → Booked → Completed → Invoiced
- **Search & Filter**: Advanced filtering by status, source, priority
- **Bulk Operations**: Handle multiple leads simultaneously

#### 📊 Analytics & Reporting
- **Conversion Tracking**: Monitor lead-to-customer conversion rates
- **Revenue Analytics**: Track monthly and yearly revenue
- **Performance Metrics**: Key performance indicators
- **Export Capabilities**: Data export for external analysis

#### 📅 Calendar Integration
- **Booking Overview**: Visual calendar of all bookings
- **Availability Management**: Manage available time slots
- **Conflict Detection**: Prevent double bookings
- **Mobile Responsive**: Works on all devices

#### 💼 Invoice Management
- **Invoice Tracking**: Monitor invoice status and payments
- **Automatic Generation**: Create invoices from completed jobs
- **Payment Tracking**: Track paid/unpaid invoices
- **Billy Integration**: Sync with Billy accounting system

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS + ShadCN UI components
- **State Management**: React hooks with custom data services
- **Authentication**: Blink SDK authentication system
- **Database**: Blink SDK database operations

### Key Dependencies
```json
{
  "@blinkdotnew/sdk": "^0.17.2",
  "react": "^18.2.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.3.0",
  "@dnd-kit/core": "^6.0.0",
  "lucide-react": "^0.263.1"
}
```

### Project Structure
```
src/
├── components/
│   ├── dashboard/          # Dashboard-specific components
│   ├── layout/            # Layout components
│   └── ui/                # Reusable UI components (ShadCN)
├── pages/                 # Page components
├── hooks/                 # Custom React hooks
├── services/              # Data services and API calls
├── types/                 # TypeScript type definitions
├── data/                  # Mock data and constants
└── blink/                 # Blink SDK configuration
```

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Blink account with project setup

### Installation
```bash
# Clone repository
git clone [repository-url]
cd renos-v4-saas-automation

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration
The system uses Blink SDK which handles environment variables automatically. No manual .env setup required.

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## 📊 Data Models

### Lead Entity
```typescript
interface Lead {
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
  smsSent: boolean
  createdAt: string
  updatedAt: string
}
```

### Booking Entity
```typescript
interface Booking {
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
```

### Invoice Entity
```typescript
interface Invoice {
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
```

## 🔄 Automated Workflow

### 1. Lead Reception
- **Email Monitoring**: Continuous monitoring of configured email addresses
- **AI Processing**: Gemini AI extracts customer information and requirements
- **Lead Creation**: Automatic lead creation in database
- **Priority Assignment**: AI determines lead priority based on content

### 2. Automatic Response
- **Email Generation**: AI generates personalized response email
- **3-Slot Booking**: Offers 3 available time slots from Google Calendar
- **SMS Dispatch**: Sends SMS with booking options (1, 2, 3)
- **Response Tracking**: Monitors customer responses

### 3. Booking Confirmation
- **SMS Response Processing**: Handles customer SMS replies (1, 2, or 3)
- **Calendar Booking**: Creates Google Calendar event
- **Confirmation Messages**: Sends booking confirmation via email and SMS
- **Status Update**: Updates lead status to 'booked'

### 4. Job Completion & Invoicing
- **Job Tracking**: Monitors job completion status
- **Time Tracking**: Records actual hours worked
- **Invoice Generation**: Creates draft invoice in Billy
- **Payment Tracking**: Monitors invoice payment status

## 🎨 UI/UX Design

### Design System
- **Primary Color**: #2563EB (Blue)
- **Accent Color**: #10B981 (Green)
- **Background**: #FAFAFA (Light Gray)
- **Typography**: Inter font family
- **Components**: ShadCN UI component library

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Responsive layout for tablets
- **Desktop**: Full-featured desktop experience
- **Touch Friendly**: Large touch targets for mobile

### Accessibility
- **WCAG Compliance**: Follows accessibility guidelines
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Compatible with screen readers
- **Color Contrast**: High contrast ratios

## 🔐 Security & Privacy

### Data Protection
- **GDPR Compliance**: Follows European data protection regulations
- **Data Encryption**: All sensitive data encrypted at rest and in transit
- **Access Control**: Role-based access control system
- **Audit Logging**: Complete audit trail of all actions

### API Security
- **Authentication**: JWT-based authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation
- **SQL Injection Protection**: Parameterized queries

## 📈 Performance Optimization

### Frontend Performance
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Optimized images and lazy loading
- **Caching**: Intelligent caching strategies
- **Bundle Size**: Minimized bundle size

### Database Performance
- **Indexing**: Proper database indexing
- **Query Optimization**: Optimized database queries
- **Connection Pooling**: Efficient database connections
- **Caching Layer**: Redis caching for frequently accessed data

## 🧪 Testing Strategy

### Frontend Testing
- **Unit Tests**: Component unit testing with Jest
- **Integration Tests**: API integration testing
- **E2E Tests**: End-to-end testing with Playwright
- **Visual Testing**: Visual regression testing

### Backend Testing
- **API Tests**: Comprehensive API testing
- **Database Tests**: Database operation testing
- **Integration Tests**: Service integration testing
- **Load Testing**: Performance and load testing

## 🚀 Deployment & DevOps

### Deployment Strategy
- **Staging Environment**: Full staging environment for testing
- **Production Deployment**: Automated production deployment
- **Rollback Strategy**: Quick rollback capabilities
- **Health Monitoring**: Comprehensive health monitoring

### Monitoring & Logging
- **Application Monitoring**: Real-time application monitoring
- **Error Tracking**: Comprehensive error tracking
- **Performance Monitoring**: Performance metrics and alerts
- **Log Aggregation**: Centralized log management

## 📚 API Documentation

### Lead Management API
```typescript
// Get all leads
GET /api/leads
Response: Lead[]

// Create new lead
POST /api/leads
Body: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>
Response: Lead

// Update lead
PUT /api/leads/:id
Body: Partial<Lead>
Response: Lead

// Delete lead
DELETE /api/leads/:id
Response: { success: boolean }
```

### Booking Management API
```typescript
// Get all bookings
GET /api/bookings
Response: Booking[]

// Create booking
POST /api/bookings
Body: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>
Response: Booking

// Update booking
PUT /api/bookings/:id
Body: Partial<Booking>
Response: Booking
```

### Invoice Management API
```typescript
// Get all invoices
GET /api/invoices
Response: Invoice[]

// Create invoice
POST /api/invoices
Body: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>
Response: Invoice

// Update invoice status
PUT /api/invoices/:id/status
Body: { status: Invoice['status'] }
Response: Invoice
```

## 🔮 Future Enhancements

### Planned Features
- **Mobile App**: Native mobile application
- **Advanced Analytics**: More detailed analytics and reporting
- **Multi-language Support**: Support for additional languages
- **API Integrations**: More third-party integrations
- **Workflow Automation**: Advanced workflow automation

### Technical Improvements
- **Microservices**: Migration to microservices architecture
- **Real-time Updates**: WebSocket-based real-time updates
- **Advanced Caching**: More sophisticated caching strategies
- **Machine Learning**: ML-based lead scoring and optimization

## 📞 Support & Maintenance

### Support Channels
- **Email**: support@rendetalje.dk
- **Phone**: 22 65 02 26
- **Documentation**: Comprehensive documentation
- **Training**: User training and onboarding

### Maintenance Schedule
- **Regular Updates**: Monthly feature updates
- **Security Patches**: Immediate security updates
- **Performance Optimization**: Quarterly performance reviews
- **Backup Strategy**: Daily automated backups

---

**RenOS v4** - Empowering Rendetalje with intelligent automation and seamless lead management.