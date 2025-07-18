# RenOS v4 Backend Implementation Guide

## 📋 Overview

This document outlines the complete backend implementation strategy for RenOS v4, detailing the architecture, APIs, integrations, and deployment requirements for the Danish lead management system.

## 🏗️ Backend Architecture

### Technology Stack
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: NestJS (recommended) or Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with refresh tokens
- **Queue System**: Bull Queue with Redis
- **Email Service**: Gmail API + Nodemailer
- **SMS Service**: Twilio
- **Calendar**: Google Calendar API
- **Invoicing**: Billy API
- **AI Processing**: Google Gemini API
- **File Storage**: Google Cloud Storage
- **Monitoring**: Winston logging + Sentry

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Microservices │
│   (React)       │◄──►│   (NestJS)      │◄──►│   Architecture  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Database      │    │   Queue System  │    │   External APIs │
│   (PostgreSQL)  │    │   (Redis/Bull)  │    │   (Gmail/Billy) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🗃️ Database Schema

### Core Tables

#### 1. Leads Table
```sql
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL CHECK (source IN ('leadpoint', 'leadmail', 'booking_form')),
    service_type VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10),
    estimated_hours DECIMAL(5,2) NOT NULL,
    estimated_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'booked', 'completed', 'invoiced')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    notes TEXT,
    booking_date TIMESTAMP WITH TIME ZONE,
    booking_time_slot INTEGER,
    ai_analysis TEXT,
    email_content TEXT,
    response_sent BOOLEAN DEFAULT FALSE,
    sms_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_created_at ON leads(created_at);
CREATE INDEX idx_leads_customer_email ON leads(customer_email);
```

#### 2. Bookings Table
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    service_type VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    booking_date TIMESTAMP WITH TIME ZONE NOT NULL,
    booking_time VARCHAR(10) NOT NULL,
    duration_hours DECIMAL(5,2) NOT NULL,
    hourly_rate DECIMAL(8,2) NOT NULL DEFAULT 349.00,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    google_calendar_event_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_lead_id ON bookings(lead_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
```

#### 3. Invoices Table
```sql
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id),
    booking_id UUID REFERENCES bookings(id),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_address TEXT NOT NULL,
    service_description TEXT NOT NULL,
    hours_worked DECIMAL(5,2) NOT NULL,
    hourly_rate DECIMAL(8,2) NOT NULL DEFAULT 349.00,
    subtotal DECIMAL(10,2) NOT NULL,
    vat_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
    billy_invoice_id VARCHAR(255),
    due_date DATE,
    sent_date TIMESTAMP WITH TIME ZONE,
    paid_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_billy_id ON invoices(billy_invoice_id);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
```

#### 4. Activities Table
```sql
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id),
    booking_id UUID REFERENCES bookings(id),
    invoice_id UUID REFERENCES invoices(id),
    type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'booking', 'invoice', 'sms', 'completed', 'pending')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('info', 'success', 'warning', 'error')),
    customer VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activities_lead_id ON activities(lead_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_created_at ON activities(created_at);
```

#### 5. Email Templates Table
```sql
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('lead_response', 'booking_confirmation', 'invoice_reminder')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 6. SMS Messages Table
```sql
CREATE TABLE sms_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id),
    phone_number VARCHAR(50) NOT NULL,
    message_content TEXT NOT NULL,
    message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('booking_options', 'confirmation', 'reminder')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    twilio_message_id VARCHAR(255),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sms_lead_id ON sms_messages(lead_id);
CREATE INDEX idx_sms_status ON sms_messages(status);
```

## 🔧 API Implementation

### 1. Lead Management API

#### Lead Controller
```typescript
@Controller('api/leads')
@UseGuards(JwtAuthGuard)
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Get()
  async getAllLeads(@Query() query: GetLeadsDto): Promise<Lead[]> {
    return this.leadService.findAll(query);
  }

  @Post()
  async createLead(@Body() createLeadDto: CreateLeadDto): Promise<Lead> {
    return this.leadService.create(createLeadDto);
  }

  @Put(':id')
  async updateLead(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto
  ): Promise<Lead> {
    return this.leadService.update(id, updateLeadDto);
  }

  @Delete(':id')
  async deleteLead(@Param('id') id: string): Promise<void> {
    return this.leadService.delete(id);
  }

  @Post(':id/status')
  async updateLeadStatus(
    @Param('id') id: string,
    @Body() statusDto: UpdateStatusDto
  ): Promise<Lead> {
    return this.leadService.updateStatus(id, statusDto.status);
  }
}
```

#### Lead Service
```typescript
@Injectable()
export class LeadService {
  constructor(
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    private activityService: ActivityService,
    private emailService: EmailService,
    private smsService: SmsService
  ) {}

  async findAll(query: GetLeadsDto): Promise<Lead[]> {
    const queryBuilder = this.leadRepository.createQueryBuilder('lead');
    
    if (query.status) {
      queryBuilder.andWhere('lead.status = :status', { status: query.status });
    }
    
    if (query.source) {
      queryBuilder.andWhere('lead.source = :source', { source: query.source });
    }
    
    if (query.search) {
      queryBuilder.andWhere(
        '(lead.customer_name ILIKE :search OR lead.customer_email ILIKE :search)',
        { search: `%${query.search}%` }
      );
    }
    
    return queryBuilder
      .orderBy('lead.created_at', 'DESC')
      .getMany();
  }

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    const lead = this.leadRepository.create({
      ...createLeadDto,
      estimatedPrice: createLeadDto.estimatedHours * 349, // 349 DKK/hour
    });
    
    const savedLead = await this.leadRepository.save(lead);
    
    // Log activity
    await this.activityService.create({
      leadId: savedLead.id,
      type: 'email',
      title: 'Nyt lead oprettet',
      description: `${savedLead.serviceType} - ${savedLead.city}`,
      status: 'info',
      customer: savedLead.customerName
    });
    
    return savedLead;
  }

  async updateStatus(id: string, status: LeadStatus): Promise<Lead> {
    const lead = await this.leadRepository.findOne({ where: { id } });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }
    
    lead.status = status;
    lead.updatedAt = new Date();
    
    const updatedLead = await this.leadRepository.save(lead);
    
    // Log activity
    await this.activityService.create({
      leadId: id,
      type: status === 'booked' ? 'booking' : 'pending',
      title: `Status opdateret til ${this.getStatusLabel(status)}`,
      description: `${lead.customerName} - ${lead.serviceType}`,
      status: 'info',
      customer: lead.customerName
    });
    
    return updatedLead;
  }
}
```

### 2. AI Email Processing API

#### AI Service
```typescript
@Injectable()
export class AIService {
  constructor(
    private configService: ConfigService,
    private leadService: LeadService
  ) {}

  async processEmail(emailContent: string, source: LeadSource): Promise<Lead> {
    try {
      // Initialize Gemini AI
      const genAI = new GoogleGenerativeAI(
        this.configService.get('GEMINI_API_KEY')
      );
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      // AI prompt for Danish lead extraction
      const prompt = `
        Analyser følgende email og udtræk lead information på dansk:
        
        Email: ${emailContent}
        
        Udtræk følgende information i JSON format:
        {
          "customerName": "kundens fulde navn",
          "customerEmail": "email adresse",
          "customerPhone": "telefonnummer",
          "serviceType": "type af rengøringsservice",
          "address": "adresse",
          "city": "by",
          "postalCode": "postnummer",
          "estimatedHours": antal_timer_estimat,
          "priority": "low|medium|high",
          "notes": "yderligere noter"
        }
        
        Brug 349 DKK per time til prisberegning.
        Hvis information mangler, brug fornuftige danske standardværdier.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse AI response
      const aiData = JSON.parse(text);
      
      // Create lead with AI-extracted data
      const leadData = {
        ...aiData,
        source,
        status: 'new' as LeadStatus,
        estimatedPrice: aiData.estimatedHours * 349,
        emailContent,
        aiAnalysis: 'AI processed email content and extracted lead information',
        responseSent: false,
        smsSent: false
      };
      
      return await this.leadService.create(leadData);
      
    } catch (error) {
      throw new BadRequestException('Failed to process email with AI');
    }
  }
}
```

### 3. Email Integration Service

#### Gmail Service
```typescript
@Injectable()
export class GmailService {
  private gmail: gmail_v1.Gmail;
  
  constructor(private configService: ConfigService) {
    const auth = new google.auth.OAuth2(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      this.configService.get('GOOGLE_REDIRECT_URI')
    );
    
    auth.setCredentials({
      refresh_token: this.configService.get('GOOGLE_REFRESH_TOKEN')
    });
    
    this.gmail = google.gmail({ version: 'v1', auth });
  }

  async watchInbox(): Promise<void> {
    try {
      await this.gmail.users.watch({
        userId: 'me',
        requestBody: {
          topicName: this.configService.get('PUBSUB_TOPIC'),
          labelIds: ['INBOX']
        }
      });
    } catch (error) {
      console.error('Failed to watch Gmail inbox:', error);
    }
  }

  async getNewEmails(): Promise<any[]> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread from:(system@leadpoint.dk OR kontakt@leadmail.no OR info@rendetalje.dk)',
        maxResults: 10
      });

      const messages = response.data.messages || [];
      const emails = [];

      for (const message of messages) {
        const email = await this.gmail.users.messages.get({
          userId: 'me',
          id: message.id!
        });
        emails.push(email.data);
      }

      return emails;
    } catch (error) {
      console.error('Failed to get new emails:', error);
      return [];
    }
  }

  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    const message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      content
    ].join('\n');

    const encodedMessage = Buffer.from(message).toString('base64');

    await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });
  }
}
```

### 4. SMS Service (Twilio)

```typescript
@Injectable()
export class SmsService {
  private client: Twilio;
  
  constructor(private configService: ConfigService) {
    this.client = new Twilio(
      this.configService.get('TWILIO_ACCOUNT_SID'),
      this.configService.get('TWILIO_AUTH_TOKEN')
    );
  }

  async sendBookingOptions(lead: Lead): Promise<void> {
    const message = `
Hej ${lead.customerName}!

Tak for din forespørgsel om ${lead.serviceType}.

Vælg dit foretrukne tidspunkt:
1️⃣ I morgen kl. 10:00
2️⃣ I morgen kl. 14:00  
3️⃣ I overmorgen kl. 09:00

Svar med 1, 2 eller 3 for at booke.

Mvh Rendetalje
22 65 02 26
    `.trim();

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.configService.get('TWILIO_PHONE_NUMBER'),
        to: lead.customerPhone
      });

      // Save SMS record
      await this.saveSmsMessage({
        leadId: lead.id,
        phoneNumber: lead.customerPhone,
        messageContent: message,
        messageType: 'booking_options',
        status: 'sent',
        twilioMessageId: result.sid
      });

    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw new BadRequestException('Failed to send SMS');
    }
  }

  async handleIncomingSms(from: string, body: string): Promise<void> {
    // Find lead by phone number
    const lead = await this.leadService.findByPhone(from);
    if (!lead) return;

    const choice = parseInt(body.trim());
    if (choice >= 1 && choice <= 3) {
      await this.leadService.handleSmsBooking(lead.id, choice);
    }
  }
}
```

### 5. Google Calendar Integration

```typescript
@Injectable()
export class CalendarService {
  private calendar: calendar_v3.Calendar;
  
  constructor(private configService: ConfigService) {
    const auth = new google.auth.OAuth2(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      this.configService.get('GOOGLE_REDIRECT_URI')
    );
    
    auth.setCredentials({
      refresh_token: this.configService.get('GOOGLE_REFRESH_TOKEN')
    });
    
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  async getAvailableSlots(): Promise<Date[]> {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfter = new Date(now);
    dayAfter.setDate(dayAfter.getDate() + 2);

    return [
      new Date(tomorrow.setHours(10, 0, 0, 0)),
      new Date(tomorrow.setHours(14, 0, 0, 0)),
      new Date(dayAfter.setHours(9, 0, 0, 0))
    ];
  }

  async createBooking(lead: Lead, slotIndex: number): Promise<string> {
    const slots = await this.getAvailableSlots();
    const bookingTime = slots[slotIndex - 1];
    
    const endTime = new Date(bookingTime);
    endTime.setHours(endTime.getHours() + lead.estimatedHours);

    const event = {
      summary: `${lead.serviceType} - ${lead.customerName}`,
      description: `
        Kunde: ${lead.customerName}
        Email: ${lead.customerEmail}
        Telefon: ${lead.customerPhone}
        Adresse: ${lead.address}, ${lead.city}
        Service: ${lead.serviceType}
        Estimeret tid: ${lead.estimatedHours} timer
        Pris: ${lead.estimatedPrice} DKK
      `,
      start: {
        dateTime: bookingTime.toISOString(),
        timeZone: 'Europe/Copenhagen'
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Europe/Copenhagen'
      },
      attendees: [
        { email: lead.customerEmail }
      ]
    };

    const response = await this.calendar.events.insert({
      calendarId: 'primary',
      requestBody: event
    });

    return response.data.id!;
  }
}
```

### 6. Billy Invoice Integration

```typescript
@Injectable()
export class BillyService {
  private readonly baseUrl = 'https://api.billysbilling.com/v2';
  
  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {}

  async createInvoice(booking: Booking): Promise<string> {
    const invoiceData = {
      type: 'invoice',
      state: 'draft',
      contactId: await this.getOrCreateContact(booking),
      lines: [{
        productId: await this.getCleaningProductId(),
        description: booking.serviceType,
        quantity: booking.durationHours,
        unitPrice: booking.hourlyRate,
        vatRate: 25 // 25% Danish VAT
      }],
      paymentTermsDays: 14
    };

    const response = await this.httpService.post(
      `${this.baseUrl}/invoices`,
      invoiceData,
      {
        headers: {
          'X-Access-Token': this.configService.get('BILLY_API_KEY'),
          'Content-Type': 'application/json'
        }
      }
    ).toPromise();

    return response.data.id;
  }

  private async getOrCreateContact(booking: Booking): Promise<string> {
    // Check if contact exists
    const searchResponse = await this.httpService.get(
      `${this.baseUrl}/contacts?email=${booking.customerEmail}`,
      {
        headers: {
          'X-Access-Token': this.configService.get('BILLY_API_KEY')
        }
      }
    ).toPromise();

    if (searchResponse.data.contacts.length > 0) {
      return searchResponse.data.contacts[0].id;
    }

    // Create new contact
    const contactData = {
      name: booking.customerName,
      email: booking.customerEmail,
      phone: booking.customerPhone,
      street: booking.address,
      city: booking.city,
      countryId: 'DK'
    };

    const createResponse = await this.httpService.post(
      `${this.baseUrl}/contacts`,
      contactData,
      {
        headers: {
          'X-Access-Token': this.configService.get('BILLY_API_KEY'),
          'Content-Type': 'application/json'
        }
      }
    ).toPromise();

    return createResponse.data.id;
  }
}
```

## 🔄 Queue System Implementation

### Email Processing Queue
```typescript
@Processor('email-processing')
export class EmailProcessor {
  constructor(
    private aiService: AIService,
    private emailService: EmailService,
    private smsService: SmsService
  ) {}

  @Process('process-new-email')
  async processNewEmail(job: Job<{ emailContent: string; source: string }>) {
    const { emailContent, source } = job.data;
    
    try {
      // Process email with AI
      const lead = await this.aiService.processEmail(emailContent, source);
      
      // Send automatic response
      await this.emailService.sendLeadResponse(lead);
      
      // Send SMS with booking options
      await this.smsService.sendBookingOptions(lead);
      
      // Update lead status
      await this.leadService.updateStatus(lead.id, 'contacted');
      
    } catch (error) {
      console.error('Failed to process email:', error);
      throw error;
    }
  }
}
```

### Booking Queue
```typescript
@Processor('booking-processing')
export class BookingProcessor {
  constructor(
    private calendarService: CalendarService,
    private emailService: EmailService,
    private leadService: LeadService
  ) {}

  @Process('create-booking')
  async createBooking(job: Job<{ leadId: string; timeSlot: number }>) {
    const { leadId, timeSlot } = job.data;
    
    try {
      const lead = await this.leadService.findById(leadId);
      
      // Create Google Calendar event
      const eventId = await this.calendarService.createBooking(lead, timeSlot);
      
      // Update lead with booking information
      await this.leadService.update(leadId, {
        status: 'booked',
        bookingTimeSlot: timeSlot,
        googleCalendarEventId: eventId
      });
      
      // Send confirmation email
      await this.emailService.sendBookingConfirmation(lead);
      
    } catch (error) {
      console.error('Failed to create booking:', error);
      throw error;
    }
  }
}
```

## 🔐 Authentication & Security

### JWT Authentication
```typescript
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // Validate against user database
    // For Rendetalje, this would be admin users only
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' })
    };
  }
}
```

### Rate Limiting
```typescript
@Injectable()
export class RateLimitGuard implements CanActivate {
  private requests = new Map<string, number[]>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 100;

    if (!this.requests.has(ip)) {
      this.requests.set(ip, []);
    }

    const requests = this.requests.get(ip)!;
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    validRequests.push(now);
    this.requests.set(ip, validRequests);
    
    return true;
  }
}
```

## 📊 Monitoring & Logging

### Winston Logger Configuration
```typescript
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const loggerConfig = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});
```

### Health Check
```typescript
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.checkHealth('redis'),
      () => this.checkExternalServices()
    ]);
  }

  private async checkExternalServices() {
    // Check Gmail API, Billy API, Twilio, etc.
    return { status: 'up' };
  }
}
```

## 🚀 Deployment Configuration

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: renos
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/renos
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1h

# Google APIs
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REFRESH_TOKEN=your-refresh-token
GEMINI_API_KEY=your-gemini-api-key

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+45xxxxxxxx

# Billy
BILLY_API_KEY=your-billy-api-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

## 📈 Performance Optimization

### Database Optimization
```typescript
// Connection pooling
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Lead, Booking, Invoice, Activity],
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      extra: {
        max: 20, // Maximum connections
        min: 5,  // Minimum connections
        acquire: 30000,
        idle: 10000
      }
    })
  ]
})
export class DatabaseModule {}
```

### Caching Strategy
```typescript
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getLeads(query: string): Promise<Lead[]> {
    const cacheKey = `leads:${query}`;
    let leads = await this.cacheManager.get<Lead[]>(cacheKey);
    
    if (!leads) {
      leads = await this.leadService.findAll(JSON.parse(query));
      await this.cacheManager.set(cacheKey, leads, { ttl: 300 }); // 5 minutes
    }
    
    return leads;
  }
}
```

## 🧪 Testing Strategy

### Unit Tests
```typescript
describe('LeadService', () => {
  let service: LeadService;
  let repository: Repository<Lead>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadService,
        {
          provide: getRepositoryToken(Lead),
          useClass: Repository
        }
      ]
    }).compile();

    service = module.get<LeadService>(LeadService);
    repository = module.get<Repository<Lead>>(getRepositoryToken(Lead));
  });

  it('should create a lead', async () => {
    const leadData = {
      customerName: 'Test Customer',
      customerEmail: 'test@example.com',
      // ... other properties
    };

    jest.spyOn(repository, 'save').mockResolvedValue(leadData as Lead);
    
    const result = await service.create(leadData);
    expect(result).toEqual(leadData);
  });
});
```

### Integration Tests
```typescript
describe('Lead API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/leads (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/leads')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
```

This comprehensive backend implementation guide provides the foundation for building a robust, scalable, and maintainable backend system for RenOS v4. The architecture supports all the required features while maintaining high performance and security standards.