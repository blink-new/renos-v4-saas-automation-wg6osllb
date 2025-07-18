import { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { KanbanBoard } from '@/components/dashboard/KanbanBoard'
import { 
  Mail, 
  Clock, 
  DollarSign,
  Plus,
  Filter,
  Search,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useLeads } from '@/hooks/useLeads'
import { Lead } from '@/types'



const statusConfig = {
  new: { label: 'Nye', color: 'bg-blue-100 text-blue-800', count: 0 },
  contacted: { label: 'Kontaktet', color: 'bg-orange-100 text-orange-800', count: 0 },
  booked: { label: 'Booket', color: 'bg-primary/10 text-primary', count: 0 },
  completed: { label: 'Afsluttet', color: 'bg-accent/10 text-accent', count: 0 },
  invoiced: { label: 'Faktureret', color: 'bg-green-100 text-green-800', count: 0 }
}

const sourceConfig = {
  leadpoint: { label: 'Leadpoint.dk', color: 'bg-purple-100 text-purple-800' },
  leadmail: { label: 'Leadmail.no', color: 'bg-indigo-100 text-indigo-800' },
  booking_form: { label: 'Booking Form', color: 'bg-cyan-100 text-cyan-800' }
}

const priorityConfig = {
  low: { label: 'Lav', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  high: { label: 'Høj', color: 'bg-red-100 text-red-800' }
}



export function LeadManagement({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { leads, loading, error, updateLeadStatus, fetchLeads } = useLeads()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<Lead['status'] | 'all'>('all')
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null)

  // Calculate status counts
  const statusCounts = useMemo(() => {
    return leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1
      return acc
    }, {} as Record<Lead['status'], number>)
  }, [leads])

  // Update status config with counts
  Object.keys(statusConfig).forEach(status => {
    statusConfig[status as keyof typeof statusConfig].count = statusCounts[status as Lead['status']] || 0
  })

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    try {
      setUpdatingLeadId(leadId)
      await updateLeadStatus(leadId, newStatus)
    } catch (err) {
      console.error('Failed to update lead status:', err)
    } finally {
      setUpdatingLeadId(null)
    }
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <DashboardLayout currentPage="Lead Management" onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Lead Management</h1>
            <p className="text-muted-foreground">
              Administrer leads fra alle kilder og automatiser workflow
            </p>
            {error && (
              <p className="text-sm text-red-600 mt-1">
                Fejl: {error}
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={fetchLeads}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Opdater
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nyt Lead
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Søg leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Status: {selectedStatus === 'all' ? 'Alle' : statusConfig[selectedStatus as keyof typeof statusConfig]?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedStatus('all')}>
                Alle
              </DropdownMenuItem>
              {Object.entries(statusConfig).map(([status, config]) => (
                <DropdownMenuItem key={status} onClick={() => setSelectedStatus(status as Lead['status'])}>
                  {config.label} ({config.count})
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Loading State */}
        {loading && leads.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Indlæser leads...</span>
            </div>
          </div>
        )}

        {/* Kanban Board */}
        {!loading || leads.length > 0 ? (
          <KanbanBoard 
            leads={filteredLeads}
            onStatusChange={handleStatusChange}
            updatingLeadId={updatingLeadId}
          />
        ) : null}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-border">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                  <p className="text-2xl font-bold text-foreground">{leads.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Potentiel Værdi</p>
                  <p className="text-2xl font-bold text-foreground">
                    {leads.reduce((sum, lead) => sum + lead.estimatedPrice, 0).toLocaleString()} kr
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimerede Timer</p>
                  <p className="text-2xl font-bold text-foreground">
                    {leads.reduce((sum, lead) => sum + lead.estimatedHours, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}