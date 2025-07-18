import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { CalendarView as CalendarComponent } from '@/components/dashboard/CalendarView'
import { GoogleCalendarSync } from '@/components/dashboard/GoogleCalendarSync'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Appointment {
  id: string
  title: string
  customerName: string
  customerEmail: string
  customerPhone: string
  service: string
  date: string
  time: string
  duration: number
  address: string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  estimatedPrice: number
  notes?: string
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    title: 'Vinduespolering - Lars Nielsen',
    customerName: 'Lars Nielsen',
    customerEmail: 'lars@example.com',
    customerPhone: '+45 20 30 40 50',
    service: 'Vinduespolering',
    date: '2024-01-20',
    time: '09:00',
    duration: 3,
    address: 'Nørrebrogade 123, 2200 København N',
    status: 'confirmed',
    estimatedPrice: 1500,
    notes: 'Husk stige til 2. sal vinduer'
  },
  {
    id: '2',
    title: 'Rengøring - Maria Andersen',
    customerName: 'Maria Andersen',
    customerEmail: 'maria@example.com',
    customerPhone: '+45 30 40 50 60',
    service: 'Rengøring',
    date: '2024-01-20',
    time: '13:00',
    duration: 4,
    address: 'Vesterbrogade 456, 1620 København V',
    status: 'confirmed',
    estimatedPrice: 2500
  },
  {
    id: '3',
    title: 'Facaderens - Peter Hansen',
    customerName: 'Peter Hansen',
    customerEmail: 'peter@example.com',
    customerPhone: '+45 40 50 60 70',
    service: 'Facaderens',
    date: '2024-01-21',
    time: '10:00',
    duration: 6,
    address: 'Østerbrogade 789, 2100 København Ø',
    status: 'pending',
    estimatedPrice: 3500,
    notes: 'Kræver specialudstyr'
  },
  {
    id: '4',
    title: 'Vinduespolering - Anna Larsen',
    customerName: 'Anna Larsen',
    customerEmail: 'anna@example.com',
    customerPhone: '+45 50 60 70 80',
    service: 'Vinduespolering',
    date: '2024-01-22',
    time: '14:00',
    duration: 2,
    address: 'Amagerbrogade 321, 2300 København S',
    status: 'completed',
    estimatedPrice: 1200
  }
]

const statusConfig = {
  confirmed: { label: 'Bekræftet', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  pending: { label: 'Afventer', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  completed: { label: 'Færdig', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
  cancelled: { label: 'Annulleret', color: 'bg-red-100 text-red-800', icon: XCircle }
}

export function CalendarView({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredAppointments = mockAppointments.filter(appointment => {
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    return matchesStatus
  })

  const todaysAppointments = mockAppointments.filter(
    appointment => appointment.date === new Date().toISOString().split('T')[0]
  )

  const upcomingAppointments = mockAppointments.filter(
    appointment => new Date(appointment.date) > new Date()
  ).slice(0, 5)

  const getAppointmentStats = () => {
    const today = new Date().toISOString().split('T')[0]
    const thisWeek = mockAppointments.filter(apt => {
      const aptDate = new Date(apt.date)
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)
      return aptDate >= weekStart && aptDate <= weekEnd
    })

    return {
      today: mockAppointments.filter(apt => apt.date === today).length,
      thisWeek: thisWeek.length,
      confirmed: mockAppointments.filter(apt => apt.status === 'confirmed').length,
      pending: mockAppointments.filter(apt => apt.status === 'pending').length,
      totalRevenue: mockAppointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + apt.estimatedPrice, 0)
    }
  }

  const stats = getAppointmentStats()

  const renderListView = () => (
    <div className="space-y-4">
      {filteredAppointments.map((appointment) => {
        const StatusIcon = statusConfig[appointment.status].icon
        
        return (
          <Card key={appointment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-lg font-semibold">{appointment.title}</h3>
                    <Badge className={statusConfig[appointment.status].color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig[appointment.status].label}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(appointment.date).toLocaleDateString('da-DK')} kl. {appointment.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{appointment.duration} timer</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{appointment.address}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{appointment.customerName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{appointment.customerPhone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{appointment.customerEmail}</span>
                      </div>
                    </div>
                  </div>
                  
                  {appointment.notes && (
                    <div className="mt-3 p-2 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>Noter:</strong> {appointment.notes}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <div className="text-right">
                    <p className="text-lg font-bold">{appointment.estimatedPrice.toLocaleString()} kr</p>
                    <p className="text-sm text-muted-foreground">{appointment.service}</p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        Se detaljer
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Rediger
                      </DropdownMenuItem>
                      {appointment.status === 'confirmed' && (
                        <DropdownMenuItem>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Marker som færdig
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Annuller
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  return (
    <DashboardLayout currentPage="Kalender" onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Kalender</h1>
            <p className="text-muted-foreground">
              Se og administrer bookede aftaler og tidspunkter
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Status: {statusFilter === 'all' ? 'Alle' : statusConfig[statusFilter as keyof typeof statusConfig]?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  Alle
                </DropdownMenuItem>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${config.color.includes('green') ? 'bg-green-500' : config.color.includes('yellow') ? 'bg-yellow-500' : config.color.includes('blue') ? 'bg-blue-500' : 'bg-red-500'}`} />
                    {config.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Synkroniser
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Ny Aftale
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-2xl font-bold">{stats.today}</span>
              </div>
              <p className="text-sm text-muted-foreground">I dag</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                <span className="text-2xl font-bold">{stats.thisWeek}</span>
              </div>
              <p className="text-sm text-muted-foreground">Denne uge</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-2xl font-bold">{stats.confirmed}</span>
              </div>
              <p className="text-sm text-muted-foreground">Bekræftet</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-2xl font-bold">{stats.pending}</span>
              </div>
              <p className="text-sm text-muted-foreground">Afventer</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground">kr færdige</p>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Kalender
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            Liste
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList>
            <TabsTrigger value="calendar">Kalender Oversigt</TabsTrigger>
            <TabsTrigger value="today">I dag</TabsTrigger>
            <TabsTrigger value="upcoming">Kommende</TabsTrigger>
            <TabsTrigger value="sync">Google Calendar</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            {viewMode === 'calendar' ? (
              <CalendarComponent />
            ) : (
              renderListView()
            )}
          </TabsContent>

          <TabsContent value="today" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dagens Aftaler</CardTitle>
              </CardHeader>
              <CardContent>
                {todaysAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-4" />
                    <p>Ingen aftaler i dag</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todaysAppointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-lg font-bold">{appointment.time}</p>
                            <p className="text-sm text-muted-foreground">{appointment.duration}t</p>
                          </div>
                          <div>
                            <p className="font-medium">{appointment.customerName}</p>
                            <p className="text-sm text-muted-foreground">{appointment.service}</p>
                            <p className="text-sm text-muted-foreground">{appointment.address}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={statusConfig[appointment.status].color}>
                            {statusConfig[appointment.status].label}
                          </Badge>
                          <p className="text-sm font-medium mt-1">{appointment.estimatedPrice.toLocaleString()} kr</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Kommende Aftaler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="font-medium">{new Date(appointment.date).toLocaleDateString('da-DK', { weekday: 'short' })}</p>
                          <p className="text-sm text-muted-foreground">{new Date(appointment.date).toLocaleDateString('da-DK', { day: '2-digit', month: '2-digit' })}</p>
                        </div>
                        <div>
                          <p className="font-medium">{appointment.customerName}</p>
                          <p className="text-sm text-muted-foreground">{appointment.service} • {appointment.time}</p>
                        </div>
                      </div>
                      <Badge className={statusConfig[appointment.status].color}>
                        {statusConfig[appointment.status].label}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            <GoogleCalendarSync />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}