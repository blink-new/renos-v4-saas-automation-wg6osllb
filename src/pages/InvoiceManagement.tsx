import { useState, useMemo } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { InvoiceManager } from '@/components/dashboard/InvoiceManager'
import { NewInvoiceModal } from '@/components/modals/NewInvoiceModal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Send,
  Eye,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useLeads } from '@/hooks/useLeads'
import { Lead } from '@/types'

// Mock invoice data based on leads
interface Invoice {
  id: string
  invoiceNumber: string
  leadId: string
  customerName: string
  customerEmail: string
  serviceType: string
  amount: number
  vatAmount: number
  totalAmount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  dueDate: string
  createdAt: string
  sentAt?: string
  paidAt?: string
}

const statusConfig = {
  draft: { label: 'Kladde', color: 'bg-gray-100 text-gray-800', icon: FileText },
  sent: { label: 'Sendt', color: 'bg-blue-100 text-blue-800', icon: Send },
  paid: { label: 'Betalt', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  overdue: { label: 'Forfalden', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
}

export function InvoiceManagement({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { leads } = useLeads()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<Invoice['status'] | 'all'>('all')
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false)

  // Generate mock invoices from completed leads
  const invoices: Invoice[] = useMemo(() => {
    return leads
      .filter(lead => lead.status === 'completed' || lead.status === 'invoiced')
      .map((lead, index) => {
        const baseAmount = lead.estimatedPrice
        const vatAmount = baseAmount * 0.25
        const totalAmount = baseAmount + vatAmount
        
        const statuses: Invoice['status'][] = ['draft', 'sent', 'paid', 'overdue']
        const status = lead.status === 'invoiced' ? 'paid' : statuses[index % statuses.length]
        
        const createdDate = new Date(lead.updatedAt)
        const dueDate = new Date(createdDate)
        dueDate.setDate(dueDate.getDate() + 30)
        
        return {
          id: `inv-${lead.id}`,
          invoiceNumber: `REN-2024-${String(index + 1).padStart(4, '0')}`,
          leadId: lead.id,
          customerName: lead.customerName,
          customerEmail: lead.customerEmail,
          serviceType: lead.serviceType,
          amount: baseAmount,
          vatAmount,
          totalAmount,
          status,
          dueDate: dueDate.toISOString(),
          createdAt: lead.updatedAt,
          sentAt: status !== 'draft' ? lead.updatedAt : undefined,
          paidAt: status === 'paid' ? lead.updatedAt : undefined
        }
      })
  }, [leads])

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const stats = useMemo(() => {
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
    const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0)
    const pendingAmount = invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.totalAmount, 0)
    const overdueAmount = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.totalAmount, 0)
    
    return {
      total: totalAmount,
      paid: paidAmount,
      pending: pendingAmount,
      overdue: overdueAmount,
      count: {
        draft: invoices.filter(inv => inv.status === 'draft').length,
        sent: invoices.filter(inv => inv.status === 'sent').length,
        paid: invoices.filter(inv => inv.status === 'paid').length,
        overdue: invoices.filter(inv => inv.status === 'overdue').length
      }
    }
  }, [invoices])

  const handleCreateInvoice = async (invoiceData: any) => {
    // Mock invoice creation
    console.log('Creating invoice:', invoiceData)
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  const handleExportInvoices = () => {
    // Mock export functionality
    const csvContent = [
      ['Faktura Nr.', 'Kunde', 'Email', 'Service', 'Beløb', 'Status', 'Forfaldsdato'],
      ...filteredInvoices.map(invoice => [
        invoice.invoiceNumber,
        invoice.customerName,
        invoice.customerEmail,
        invoice.serviceType,
        invoice.totalAmount,
        statusConfig[invoice.status].label,
        new Date(invoice.dueDate).toLocaleDateString('da-DK')
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fakturaer-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout currentPage="Fakturaer" onNavigate={onNavigate}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fakturaer</h1>
            <p className="text-muted-foreground">
              Administrer fakturaer og betalinger
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Eksporter
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ny Faktura
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Omsætning</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(stats.total / 1000).toFixed(0)}k kr
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Betalt</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(stats.paid / 1000).toFixed(0)}k kr
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
                  <p className="text-sm text-muted-foreground">Afventer</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(stats.pending / 1000).toFixed(0)}k kr
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Forfalden</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(stats.overdue / 1000).toFixed(0)}k kr
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Oversigt</TabsTrigger>
            <TabsTrigger value="manager">Faktura Manager</TabsTrigger>
            <TabsTrigger value="templates">Skabeloner</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center space-x-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Søg fakturaer..."
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
                      Alle ({invoices.length})
                    </DropdownMenuItem>
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <DropdownMenuItem key={status} onClick={() => setSelectedStatus(status as Invoice['status'])}>
                        {config.label} ({stats.count[status as keyof typeof stats.count]})
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Invoice Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Fakturaer</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Faktura Nr.</TableHead>
                        <TableHead>Kunde</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Beløb</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Forfaldsdato</TableHead>
                        <TableHead className="text-right">Handlinger</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            Ingen fakturaer fundet
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredInvoices.map((invoice) => {
                          const config = statusConfig[invoice.status]
                          const StatusIcon = config.icon
                          
                          return (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium">
                                {invoice.invoiceNumber}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{invoice.customerName}</p>
                                  <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
                                </div>
                              </TableCell>
                              <TableCell>{invoice.serviceType}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{invoice.totalAmount.toLocaleString()} kr</p>
                                  <p className="text-sm text-muted-foreground">
                                    Ekskl. moms: {invoice.amount.toLocaleString()} kr
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={config.color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {config.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p>{new Date(invoice.dueDate).toLocaleDateString('da-DK')}</p>
                                  {invoice.status === 'overdue' && (
                                    <p className="text-sm text-red-600">Forfalden</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Se Faktura
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Download className="h-4 w-4 mr-2" />
                                      Download PDF
                                    </DropdownMenuItem>
                                    {invoice.status === 'draft' && (
                                      <DropdownMenuItem>
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Faktura
                                      </DropdownMenuItem>
                                    )}
                                    {invoice.status === 'sent' && (
                                      <DropdownMenuItem>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Marker som Betalt
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Invoice Manager */}
          <TabsContent value="manager">
            <InvoiceManager />
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>Faktura Skabeloner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>Faktura skabeloner kommer snart</p>
                  <p className="text-sm">Konfigurer dine egne faktura layouts</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}