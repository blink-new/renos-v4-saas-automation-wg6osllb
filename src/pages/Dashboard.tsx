import { useState, useEffect } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { StatsCards } from '../components/dashboard/StatsCards'
import { RecentActivity } from '../components/dashboard/RecentActivity'
import { KanbanBoard } from '../components/dashboard/KanbanBoard'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { useLeads } from '../hooks/useLeads'
import { 
  Plus, 
  RefreshCw, 
  Bell, 
  Settings,
  TrendingUp,
  Users,
  Calendar,
  Mail
} from 'lucide-react'

interface DashboardProps {
  onNavigate?: (page: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { leads, loading, error, refetch, updateLead } = useLeads()
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
    }
  }

  // Quick stats from leads - handle undefined leads
  const quickStats = {
    newLeads: leads?.filter(l => l.status === 'new').length || 0,
    inProgress: leads?.filter(l => l.status === 'in_progress').length || 0,
    completed: leads?.filter(l => l.status === 'completed').length || 0,
    totalValue: leads?.reduce((sum, lead) => sum + (lead.estimatedPrice || 0), 0) || 0
  }

  return (
    <DashboardLayout currentPage="Dashboard" onNavigate={onNavigate}>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-nordic-text">Dashboard</h1>
            <p className="text-nordic-muted text-sm md:text-base mt-1">
              Velkommen til RenOS v4 - Dit lead-to-invoice automatiseringssystem
            </p>
          </div>
        
        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 border-nordic-border hover:bg-nordic-hover"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Opdater</span>
          </Button>
          
          <Button size="sm" className="flex items-center gap-2 bg-nordic-accent hover:bg-nordic-accent/90">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nyt Lead</span>
          </Button>
          
          <Button variant="outline" size="sm" className="border-nordic-border hover:bg-nordic-hover">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Real-time Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-nordic-accent/5 border border-nordic-accent/20 rounded-xl p-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-nordic-accent rounded-full animate-pulse"></div>
          <div>
            <p className="text-sm font-medium text-nordic-text">
              Real-time forbindelse aktiv
            </p>
            <p className="text-xs text-nordic-muted">
              Systemet opdaterer automatisk når der sker ændringer
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-nordic-muted">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{leads?.length || 0} leads</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>Live data</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Quick Overview Cards - Hidden on mobile */}
      <div className="hidden md:grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nye Leads</p>
                <p className="text-2xl font-bold text-blue-600">{quickStats.newLeads}</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                <Mail className="h-3 w-3 mr-1" />
                Aktive
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">I Gang</p>
                <p className="text-2xl font-bold text-orange-600">{quickStats.inProgress}</p>
              </div>
              <Badge className="bg-orange-100 text-orange-800">
                <Calendar className="h-3 w-3 mr-1" />
                Behandles
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fuldført</p>
                <p className="text-2xl font-bold text-green-600">{quickStats.completed}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                <TrendingUp className="h-3 w-3 mr-1" />
                Succes
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estimeret Værdi</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Intl.NumberFormat('da-DK', {
                    style: 'currency',
                    currency: 'DKK'
                  }).format(quickStats.totalValue)}
                </p>
              </div>
              <Badge className="bg-purple-100 text-purple-800">
                DKK
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {/* Kanban Board - Full width on mobile */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Lead Pipeline
                {loading && (
                  <div className="ml-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="text-center py-8 text-red-600">
                  <p>Fejl ved indlæsning af leads: {error}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    className="mt-2"
                  >
                    Prøv igen
                  </Button>
                </div>
              ) : (
                <KanbanBoard 
                  leads={leads || []} 
                  onStatusChange={async (leadId: string, newStatus: any) => {
                    try {
                      await updateLead(leadId, { status: newStatus })
                    } catch (error) {
                      console.error('Failed to update lead status:', error)
                    }
                  }}
                  updatingLeadId={null}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity - Hidden on mobile */}
        <div className="hidden lg:block">
          <RecentActivity />
        </div>
      </div>

      {/* System Status - Hidden on mobile */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-green-800">Email Processing</p>
                <p className="text-xs text-green-600">Aktiv og klar</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-green-800">SMS Service</p>
                <p className="text-xs text-green-600">Forbundet</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-green-800">Calendar Sync</p>
                <p className="text-xs text-green-600">Synkroniseret</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}