# RenOS v4 Frontend Development Guide

## 📋 Overview

This guide provides comprehensive information about the RenOS v4 frontend implementation, built with React, TypeScript, and Tailwind CSS.

## 🏗️ Architecture

### Technology Stack
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety throughout the application
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **ShadCN UI**: High-quality component library
- **Blink SDK**: Authentication, database, and backend services

### Project Structure
```
src/
├── components/
│   ├── dashboard/          # Dashboard-specific components
│   │   ├── AIEmailProcessor.tsx
│   │   ├── BookingCalendar.tsx
│   │   ├── CalendarView.tsx
│   │   ├── EmailProcessor.tsx
│   │   ├── GoogleCalendarSync.tsx
│   │   ├── InvoiceManager.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── LeadPipeline.tsx
│   │   ├── RecentActivity.tsx
│   │   ├── SMSManager.tsx
│   │   └── StatsCards.tsx
│   ├── layout/             # Layout components
│   │   └── DashboardLayout.tsx
│   └── ui/                 # Reusable UI components (ShadCN)
├── pages/                  # Page components
│   ├── Analytics.tsx
│   ├── CalendarView.tsx
│   ├── Dashboard.tsx
│   ├── InvoiceManagement.tsx
│   ├── LeadManagement.tsx
│   ├── Login.tsx
│   ├── Onboarding.tsx
│   └── Settings.tsx
├── hooks/                  # Custom React hooks
│   ├── use-mobile.tsx
│   ├── use-toast.ts
│   └── useLeads.ts
├── services/               # Data services and API calls
│   └── dataService.ts
├── types/                  # TypeScript type definitions
│   └── index.ts
├── data/                   # Mock data and constants
│   └── mockData.ts
├── lib/                    # Utility functions
│   └── utils.ts
└── blink/                  # Blink SDK configuration
    └── client.ts
```

## 🎨 Design System

### Color Palette
```css
:root {
  --primary: 221 83% 53%;        /* #2563EB - Blue */
  --accent: 160 84% 39%;         /* #10B981 - Green */
  --background: 0 0% 98%;        /* #FAFAFA - Light Gray */
  --foreground: 222 84% 5%;      /* #0F172A - Dark */
  --muted: 210 40% 96%;          /* #F1F5F9 - Muted */
  --border: 214 32% 91%;         /* #E2E8F0 - Border */
}
```

### Typography
- **Primary Font**: Inter
- **Font Weights**: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- **Font Sizes**: Tailwind's default scale (text-xs to text-6xl)

### Component Styling
- **Consistent Spacing**: Using Tailwind's spacing scale
- **Rounded Corners**: Consistent border-radius (rounded-lg, rounded-xl)
- **Shadows**: Subtle shadows for depth (shadow-sm, shadow-md)
- **Transitions**: Smooth transitions for interactions

## 🧩 Component Architecture

### Core Components

#### 1. DashboardLayout
**Location**: `src/components/layout/DashboardLayout.tsx`

Main layout component that provides:
- Responsive sidebar navigation
- Mobile-friendly hamburger menu
- Consistent header with page title
- User information display

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode
  currentPage?: string
  onNavigate?: (page: string) => void
}
```

#### 2. KanbanBoard
**Location**: `src/components/dashboard/KanbanBoard.tsx`

Drag-and-drop Kanban board for lead management:
- Uses @dnd-kit for drag and drop functionality
- Five columns: New, Contacted, Booked, Completed, Invoiced
- Real-time status updates
- Optimistic UI updates

```typescript
interface KanbanBoardProps {
  leads: Lead[]
  onStatusChange: (leadId: string, newStatus: Lead['status']) => void
  updatingLeadId: string | null
}
```

#### 3. AIEmailProcessor
**Location**: `src/components/dashboard/AIEmailProcessor.tsx`

AI-powered email processing component:
- Multi-step workflow (Parse → Send → Complete)
- Source selection (Leadpoint, Leadmail, Booking Form)
- Real-time processing feedback
- Extracted lead information display

```typescript
// Key features:
- Email content parsing with AI
- Automatic lead creation
- Response generation and sending
- Step-by-step progress indication
```

#### 4. StatsCards
**Location**: `src/components/dashboard/StatsCards.tsx`

Dashboard statistics display:
- Real-time metrics calculation
- Animated loading states
- Responsive grid layout
- Color-coded status indicators

```typescript
interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  description?: string
}
```

### Page Components

#### 1. Dashboard
**Location**: `src/pages/Dashboard.tsx`

Main dashboard page featuring:
- Welcome section with company branding
- Statistics cards overview
- Lead pipeline visualization
- Recent activity feed
- AI email processor

#### 2. LeadManagement
**Location**: `src/pages/LeadManagement.tsx`

Comprehensive lead management interface:
- Kanban board for visual lead tracking
- Search and filter functionality
- Bulk operations support
- Summary statistics

#### 3. CalendarView
**Location**: `src/pages/CalendarView.tsx`

Calendar interface for booking management:
- Monthly/weekly/daily views
- Booking creation and editing
- Availability management
- Google Calendar integration

## 🔧 Custom Hooks

### useLeads Hook
**Location**: `src/hooks/useLeads.ts`

Central hook for lead management:

```typescript
export function useLeads() {
  return {
    leads: Lead[],              // All leads
    activities: ActivityItem[], // Recent activities
    loading: boolean,           // Loading state
    error: string | null,       // Error state
    
    // CRUD operations
    updateLeadStatus: (leadId: string, newStatus: Lead['status']) => Promise<Lead>,
    updateLead: (leadId: string, updates: Partial<Lead>) => Promise<Lead>,
    addLead: (newLead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Lead>,
    deleteLead: (leadId: string) => Promise<void>,
    
    // AI operations
    processEmailLead: (emailContent: string, source: Lead['source']) => Promise<Lead>,
    sendResponse: (leadId: string) => Promise<void>,
    handleSMSResponse: (leadId: string, timeSlot: number) => Promise<void>,
    
    // Utility
    refreshData: () => void
  }
}
```

### Key Features:
- **Optimistic Updates**: UI updates immediately, syncs with backend
- **Error Handling**: Comprehensive error handling and user feedback
- **Real-time Data**: Automatic data refresh and synchronization
- **Activity Logging**: Automatic activity logging for all operations

## 📊 Data Management

### Data Service Layer
**Location**: `src/services/dataService.ts`

Abstraction layer for data operations:

```typescript
// Lead Service
export const leadService = {
  async getAll(): Promise<Lead[]>
  async create(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead>
  async update(id: string, updates: Partial<Lead>): Promise<Lead>
  async delete(id: string): Promise<void>
  transformFromDB(data: any): Lead
}

// Activity Service
export const activityService = {
  async getAll(): Promise<ActivityItem[]>
  async create(activity: Omit<ActivityItem, 'id' | 'createdAt'>): Promise<ActivityItem>
  transformFromDB(data: any): ActivityItem
}
```

### Type Definitions
**Location**: `src/types/index.ts`

Comprehensive TypeScript types:

```typescript
// Core entities
export interface Lead { /* ... */ }
export interface Booking { /* ... */ }
export interface Invoice { /* ... */ }
export interface ActivityItem { /* ... */ }

// UI-specific types
export interface DashboardStats { /* ... */ }
export interface EmailTemplate { /* ... */ }
export interface SMSMessage { /* ... */ }
```

## 🎯 State Management

### Local State Strategy
- **Component State**: useState for local component state
- **Shared State**: Custom hooks for shared state (useLeads)
- **Global State**: Blink SDK for authentication and global data
- **Optimistic Updates**: Immediate UI updates with backend sync

### Data Flow
```
User Action → Component → Custom Hook → Data Service → Backend
                ↓
            Optimistic Update → UI Update → Backend Confirmation
```

## 🔄 Real-time Features

### Live Updates
- **Polling Strategy**: Regular data refresh for demo purposes
- **Optimistic Updates**: Immediate UI feedback
- **Error Recovery**: Automatic retry on failures
- **Loading States**: Comprehensive loading indicators

### Activity Tracking
- **Automatic Logging**: All user actions logged automatically
- **Real-time Feed**: Live activity feed on dashboard
- **User Context**: Activities linked to specific users and leads

## 📱 Responsive Design

### Breakpoint Strategy
```css
/* Mobile First Approach */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

### Mobile Optimizations
- **Touch Targets**: Minimum 44px touch targets
- **Swipe Gestures**: Swipe support for mobile interactions
- **Responsive Navigation**: Collapsible sidebar on mobile
- **Optimized Forms**: Mobile-friendly form inputs

### Component Responsiveness
```typescript
// Example responsive component
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Responsive grid */}
</div>

<div className="hidden lg:block">
  {/* Desktop only content */}
</div>

<div className="lg:hidden">
  {/* Mobile only content */}
</div>
```

## 🧪 Testing Strategy

### Component Testing
```typescript
// Example test structure
describe('KanbanBoard', () => {
  it('renders all lead columns', () => {
    // Test implementation
  })
  
  it('handles drag and drop operations', () => {
    // Test implementation
  })
  
  it('updates lead status optimistically', () => {
    // Test implementation
  })
})
```

### Testing Tools
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing utilities
- **MSW**: API mocking for tests
- **Playwright**: End-to-end testing

## 🚀 Performance Optimization

### Code Splitting
```typescript
// Lazy loading pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const LeadManagement = lazy(() => import('./pages/LeadManagement'))

// Suspense wrapper
<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>
```

### Optimization Techniques
- **Memoization**: React.memo for expensive components
- **Callback Optimization**: useCallback for event handlers
- **Effect Optimization**: useEffect dependency optimization
- **Bundle Splitting**: Vite's automatic code splitting

### Performance Monitoring
```typescript
// Performance tracking
const performanceObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log('Performance:', entry.name, entry.duration)
  })
})
```

## 🔐 Security Considerations

### Frontend Security
- **Input Validation**: Client-side validation for UX
- **XSS Prevention**: Proper data sanitization
- **CSRF Protection**: Token-based protection
- **Secure Storage**: Secure token storage

### Authentication Flow
```typescript
// Blink SDK authentication
useEffect(() => {
  const unsubscribe = blink.auth.onAuthStateChanged((state) => {
    setUser(state.user)
    setLoading(state.isLoading)
  })
  return unsubscribe
}, [])
```

## 🛠️ Development Workflow

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Code Quality
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking
- **Stylelint**: CSS linting

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
git commit -m "feat: add new feature"
git push origin feature/new-feature

# Create pull request
# Code review
# Merge to main
```

## 📚 Component Library (ShadCN UI)

### Core Components Used
- **Button**: Primary action buttons
- **Card**: Content containers
- **Badge**: Status indicators
- **Input**: Form inputs
- **Textarea**: Multi-line text input
- **Select**: Dropdown selections
- **Dialog**: Modal dialogs
- **Toast**: Notification system

### Custom Component Extensions
```typescript
// Extended Button component
interface ExtendedButtonProps extends ButtonProps {
  loading?: boolean
  icon?: React.ReactNode
}

export function ExtendedButton({ loading, icon, children, ...props }: ExtendedButtonProps) {
  return (
    <Button {...props} disabled={loading || props.disabled}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : icon}
      {children}
    </Button>
  )
}
```

## 🔮 Future Enhancements

### Planned Frontend Improvements
- **PWA Support**: Progressive Web App capabilities
- **Offline Mode**: Offline functionality with sync
- **Advanced Animations**: More sophisticated animations
- **Accessibility**: Enhanced accessibility features
- **Internationalization**: Multi-language support

### Technical Debt
- **Component Refactoring**: Break down large components
- **Performance Optimization**: Further performance improvements
- **Test Coverage**: Increase test coverage
- **Documentation**: Enhanced component documentation

---

This frontend guide provides a comprehensive overview of the RenOS v4 frontend implementation. For specific implementation details, refer to the individual component files and their inline documentation.