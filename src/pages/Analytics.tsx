import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  DollarSign,
  Calendar,
  Clock,
  Mail,
  Phone,
  Target,
  Award,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Activity
} from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface AnalyticsData {
  totalLeads: number
  conversionRate: number
  averageDeal: number
  totalRevenue: number
  responseTime: number
  bookingRate: number
  trends: {
    leads: number
    conversion: number
    revenue: number
    responseTime: number
  }
}

const mockData: AnalyticsData = {
  totalLeads: 1234,
  conversionRate: 23.5,
  averageDeal: 2450,
  totalRevenue: 145230,
  responseTime: 12,
  bookingRate: 78.5,
  trends: {
    leads: 20.1,
    conversion: 2.1,
    revenue: 12.5,
    responseTime: -15.3
  }
}

const leadSources = [
  { name: 'Leadpoint.dk', value: 45, leads: 556, revenue: 65340 },
  { name: 'Leadmail.no', value: 30, leads: 370, revenue: 43590 },
  { name: 'Booking Form', value: 25, leads: 308, revenue: 36300 }
]

const servicePerformance = [
  { name: 'Vinduespolering', revenue: 52340, leads: 234, avgDeal: 2236 },
  { name: 'Rengøring', revenue: 48920, leads: 198, avgDeal: 2470 },
  { name: 'Facaderens', revenue: 43970, leads: 156, avgDeal: 2819 }
]

const monthlyData = [
  { month: 'Jan', leads: 98, revenue: 12450, conversion: 22.4 },
  { month: 'Feb', leads: 112, revenue: 14230, conversion: 24.1 },
  { month: 'Mar', leads: 134, revenue: 16890, conversion: 25.2 },
  { month: 'Apr', leads: 156, revenue: 19340, conversion: 23.8 },
  { month: 'Maj', leads: 189, revenue: 23450, conversion: 26.1 },
  { month: 'Jun', leads: 203, revenue: 25670, conversion: 24.9 }
]

export function Analytics({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [timeRange, setTimeRange] = useState('30d')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const renderTrendIcon = (trend: number) => {
    if (trend > 0) {
      return <ArrowUpRight className="w-4 h-4 text-green-500" />
    } else if (trend < 0) {
      return <ArrowDownRight className="w-4 h-4 text-red-500" />
    }
    return null
  }

  const renderTrendText = (trend: number) => {
    const color = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-muted-foreground'
    const sign = trend > 0 ? '+' : ''
    return (
      <p className={`text-xs ${color} flex items-center`}>
        {renderTrendIcon(trend)}
        {sign}{trend}% fra sidste måned
      </p>
    )
  }

  return (
    <DashboardLayout currentPage="Analytics" onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">
              Analyser performance og trends for RenOS systemet
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  {timeRange === '7d' ? 'Sidste 7 dage' : 
                   timeRange === '30d' ? 'Sidste 30 dage' : 
                   timeRange === '90d' ? 'Sidste 90 dage' : 'Sidste år'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setTimeRange('7d')}>
                  Sidste 7 dage
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange('30d')}>
                  Sidste 30 dage
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange('90d')}>
                  Sidste 90 dage
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange('1y')}>
                  Sidste år
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Opdater
            </Button>
            
            <Button size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.totalLeads.toLocaleString()}</div>
              {renderTrendText(mockData.trends.leads)}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Konverteringsrate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.conversionRate}%</div>
              {renderTrendText(mockData.trends.conversion)}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gennemsnitlig Deal</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.averageDeal.toLocaleString()} kr</div>
              {renderTrendText(5.2)}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Omsætning</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.totalRevenue.toLocaleString()} kr</div>
              {renderTrendText(mockData.trends.revenue)}
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gennemsnitlig Svartid</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.responseTime} min</div>
              {renderTrendText(mockData.trends.responseTime)}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Booking Rate</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockData.bookingRate}%</div>
              <p className="text-xs text-green-600 flex items-center">
                <ArrowUpRight className="w-4 h-4" />
                +3.2% fra sidste måned
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Automatisering</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">
                Automatisk behandlede leads
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Oversigt</TabsTrigger>
            <TabsTrigger value="sources">Lead Sources</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Månedlig Udvikling</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.slice(-3).map((month, index) => (
                      <div key={month.month} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-medium">{month.month}</span>
                          </div>
                          <div>
                            <p className="font-medium">{month.leads} leads</p>
                            <p className="text-sm text-muted-foreground">{month.conversion}% konvertering</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{month.revenue.toLocaleString()} kr</p>
                          <Badge variant="secondary" className="text-xs">
                            {index === 2 ? 'Nuværende' : 'Tidligere'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Top Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-green-800">Bedste Konvertering</p>
                        <p className="text-sm text-green-600">Vinduespolering</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-800">28.4%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div>
                        <p className="font-medium text-blue-800">Højeste Omsætning</p>
                        <p className="text-sm text-blue-600">Facaderens</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-800">52.3k kr</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div>
                        <p className="font-medium text-purple-800">Hurtigste Respons</p>
                        <p className="text-sm text-purple-600">AI Email Processing</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-800">8 min</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Lead Sources */}
          <TabsContent value="sources" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5" />
                    <span>Lead Fordeling</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leadSources.map((source, index) => (
                      <div key={source.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{source.name}</span>
                          <span className="text-sm text-muted-foreground">{source.value}%</span>
                        </div>
                        <Progress value={source.value} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{source.leads} leads</span>
                          <span>{source.revenue.toLocaleString()} kr</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Source Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leadSources.map((source) => (
                      <div key={source.name} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">{source.name}</p>
                          <p className="text-sm text-muted-foreground">{source.leads} leads</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{source.revenue.toLocaleString()} kr</p>
                          <p className="text-sm text-muted-foreground">
                            {Math.round(source.revenue / source.leads).toLocaleString()} kr/lead
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Services */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {servicePerformance.map((service, index) => (
                    <div key={service.name} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">{service.leads} leads</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold">{service.revenue.toLocaleString()} kr</p>
                        <p className="text-sm text-muted-foreground">
                          Ø {service.avgDeal.toLocaleString()} kr/deal
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="w-5 h-5" />
                    <span>Email Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Åbningsrate</span>
                      <span className="text-sm font-medium">94.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Svarrate</span>
                      <span className="text-sm font-medium">67.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">AI Behandlet</span>
                      <span className="text-sm font-medium">89.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Gennemsnitlig Svartid</span>
                      <span className="text-sm font-medium">12 min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Phone className="w-5 h-5" />
                    <span>SMS Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Leveringsrate</span>
                      <span className="text-sm font-medium">99.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Svarrate</span>
                      <span className="text-sm font-medium">78.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Booking Rate</span>
                      <span className="text-sm font-medium">65.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Gennemsnitlig Responstid</span>
                      <span className="text-sm font-medium">4.2 timer</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}