import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Send,
  Eye,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign
} from 'lucide-react'
import { useLeads } from '@/hooks/useLeads'

interface Invoice {
  id: string
  invoiceNumber: string
  customerName: string
  customerEmail: string
  serviceDescription: string
  hoursWorked: number
  hourlyRate: number
  subtotal: number
  vatAmount: number
  totalAmount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  dueDate: string
  sentDate?: string
  paidDate?: string
  leadId?: string
  createdAt: string
}

// Mock invoice data - in real app this would come from database
const mockInvoices: Invoice[] = [
  {
    id: 'inv_1',
    invoiceNumber: 'REN-2024-001',
    customerName: 'Lars Nielsen',
    customerEmail: 'lars@example.com',
    serviceDescription: 'Kontorrengøring - Vesterbrogade 123',
    hoursWorked: 6,
    hourlyRate: 349,
    subtotal: 2094,
    vatAmount: 523.5,
    totalAmount: 2617.5,
    status: 'sent',
    dueDate: '2024-02-15',
    sentDate: '2024-01-16',
    leadId: 'lead_1',
    createdAt: '2024-01-16T10:00:00Z'
  },
  {
    id: 'inv_2',
    invoiceNumber: 'REN-2024-002',
    customerName: 'Maria Hansen',
    customerEmail: 'maria@example.com',
    serviceDescription: 'Hjemmerengøring - Nørrebrogade 45',
    hoursWorked: 3,
    hourlyRate: 349,
    subtotal: 1047,
    vatAmount: 261.75,
    totalAmount: 1308.75,
    status: 'paid',
    dueDate: '2024-02-14',
    sentDate: '2024-01-15',
    paidDate: '2024-01-20',
    leadId: 'lead_2',
    createdAt: '2024-01-15T14:00:00Z'
  },
  {
    id: 'inv_3',
    invoiceNumber: 'REN-2024-003',
    customerName: 'Peter Andersen',
    customerEmail: 'peter@example.com',
    serviceDescription: 'Vinduespolering - Amagerbrogade 67',
    hoursWorked: 2,
    hourlyRate: 349,
    subtotal: 698,
    vatAmount: 174.5,
    totalAmount: 872.5,
    status: 'draft',
    dueDate: '2024-02-16',
    leadId: 'lead_3',
    createdAt: '2024-01-16T16:00:00Z'
  },
  {
    id: 'inv_4',
    invoiceNumber: 'REN-2024-004',
    customerName: 'Søren Larsen',
    customerEmail: 'soren@example.com',
    serviceDescription: 'Kontorrengøring - Strøget 89',
    hoursWorked: 8,
    hourlyRate: 349,
    subtotal: 2792,
    vatAmount: 698,
    totalAmount: 3490,
    status: 'overdue',
    dueDate: '2024-01-20',
    sentDate: '2024-01-12',
    leadId: 'lead_4',
    createdAt: '2024-01-12T18:00:00Z'
  }
]

const statusConfig = {
  draft: { 
    label: 'Kladde', 
    color: 'bg-gray-100 text-gray-800', 
    icon: FileText 
  },
  sent: { 
    label: 'Sendt', 
    color: 'bg-blue-100 text-blue-800', 
    icon: Send 
  },
  paid: { 
    label: 'Betalt', 
    color: 'bg-green-100 text-green-800', 
    icon: CheckCircle 
  },
  overdue: { 
    label: 'Forfalden', 
    color: 'bg-red-100 text-red-800', 
    icon: AlertCircle 
  }
}

export function InvoiceManager() {
  const { leads } = useLeads()
  const [invoices] = useState<Invoice[]>(mockInvoices)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<Invoice['status'] | 'all'>('all')

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = 
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.serviceDescription.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [invoices, searchTerm, statusFilter])

  // Calculate summary stats
  const stats = useMemo(() => {
    const total = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
    const paid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0)
    const pending = invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.totalAmount, 0)
    const overdue = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.totalAmount, 0)
    
    return { total, paid, pending, overdue }
  }, [invoices])

  const handleStatusChange = (invoiceId: string, newStatus: Invoice['status']) => {
    // In real app, this would update the database
    console.log(`Updating invoice ${invoiceId} to status ${newStatus}`)
  }

  const handleSendInvoice = (invoiceId: string) => {
    // In real app, this would send the invoice via email
    console.log(`Sending invoice ${invoiceId}`)
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    // In real app, this would generate and download PDF
    console.log(`Downloading invoice ${invoiceId}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK')
  }

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = today.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Omsætning</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats.total)}
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
                  {formatCurrency(stats.paid)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Afventer</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats.pending)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Forfalden</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats.overdue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Fakturaer</span>
            </CardTitle>
            
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ny Faktura
            </Button>
          </div>
          
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
                  Status: {statusFilter === 'all' ? 'Alle' : statusConfig[statusFilter]?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                  Alle
                </DropdownMenuItem>
                {Object.entries(statusConfig).map(([status, config]) => (
                  <DropdownMenuItem 
                    key={status} 
                    onClick={() => setStatusFilter(status as Invoice['status'])}
                  >
                    {config.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Faktura Nr.</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Beskrivelse</TableHead>
                <TableHead>Beløb</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Forfaldsdato</TableHead>
                <TableHead className="w-[100px]">Handlinger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => {
                const StatusIcon = statusConfig[invoice.status].icon
                const daysOverdue = invoice.status === 'overdue' ? getDaysOverdue(invoice.dueDate) : 0
                
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.customerEmail}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="max-w-[200px] truncate">
                        {invoice.serviceDescription}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.hoursWorked} timer × {formatCurrency(invoice.hourlyRate)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-medium">
                        {formatCurrency(invoice.totalAmount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Ekskl. moms: {formatCurrency(invoice.subtotal)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge className={statusConfig[invoice.status].color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[invoice.status].label}
                        {daysOverdue > 0 && (
                          <span className="ml-1">({daysOverdue} dage)</span>
                        )}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className={`text-sm ${
                        invoice.status === 'overdue' ? 'text-red-600 font-medium' : 'text-foreground'
                      }`}>
                        {formatDate(invoice.dueDate)}
                      </div>
                      {invoice.sentDate && (
                        <div className="text-xs text-muted-foreground">
                          Sendt: {formatDate(invoice.sentDate)}
                        </div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Se faktura
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice.id)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          
                          {invoice.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleSendInvoice(invoice.id)}>
                              <Send className="h-4 w-4 mr-2" />
                              Send faktura
                            </DropdownMenuItem>
                          )}
                          
                          {invoice.status === 'sent' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'paid')}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Marker som betalt
                            </DropdownMenuItem>
                          )}
                          
                          {invoice.status === 'overdue' && (
                            <>
                              <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'paid')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marker som betalt
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="h-4 w-4 mr-2" />
                                Send påmindelse
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          
          {filteredInvoices.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Ingen fakturaer matcher dine filtre' 
                  : 'Ingen fakturaer endnu'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}