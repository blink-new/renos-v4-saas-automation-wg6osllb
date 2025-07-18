import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  DollarSign,
  Calendar,
  MoreHorizontal,
  Loader2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Lead } from '@/types'

const statusConfig = {
  new: { label: 'Nye', color: 'bg-blue-50 text-blue-600 border border-blue-200' },
  contacted: { label: 'Kontaktet', color: 'bg-orange-50 text-orange-600 border border-orange-200' },
  booked: { label: 'Booket', color: 'bg-nordic-accent/10 text-nordic-accent border border-nordic-accent/20' },
  completed: { label: 'Afsluttet', color: 'bg-green-50 text-green-600 border border-green-200' },
  invoiced: { label: 'Faktureret', color: 'bg-purple-50 text-purple-600 border border-purple-200' }
}

const sourceConfig = {
  leadpoint: { label: 'Leadpoint.dk', color: 'bg-purple-50 text-purple-600 border border-purple-200' },
  leadmail: { label: 'Leadmail.no', color: 'bg-indigo-50 text-indigo-600 border border-indigo-200' },
  booking_form: { label: 'Booking Form', color: 'bg-cyan-50 text-cyan-600 border border-cyan-200' }
}

const priorityConfig = {
  low: { label: 'Lav', color: 'bg-gray-50 text-gray-600 border border-gray-200' },
  medium: { label: 'Medium', color: 'bg-yellow-50 text-yellow-600 border border-yellow-200' },
  high: { label: 'Høj', color: 'bg-red-50 text-red-600 border border-red-200' }
}

interface SortableLeadCardProps {
  lead: Lead
  onStatusChange: (leadId: string, newStatus: Lead['status']) => void
  loading?: boolean
  isDragging?: boolean
}

function SortableLeadCard({ lead, onStatusChange, loading, isDragging }: SortableLeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LeadCard 
        lead={lead} 
        onStatusChange={onStatusChange} 
        loading={loading}
        isDragging={isDragging || isSortableDragging}
      />
    </div>
  )
}

function LeadCard({ lead, onStatusChange, loading, isDragging }: SortableLeadCardProps) {
  return (
    <div className={`bg-nordic-surface p-4 rounded-xl shadow-sm mb-3 animate-slide-up hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing ${
      isDragging ? 'shadow-lg rotate-2 scale-105' : ''
    }`}>
      <div className="space-y-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 bg-nordic-accent/10">
              <AvatarFallback className="bg-nordic-accent/10 text-nordic-accent font-medium">
                {lead.customerName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-nordic-text">{lead.customerName}</h3>
              <p className="text-sm text-nordic-muted">{lead.serviceType}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MoreHorizontal className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onStatusChange(lead.id, 'contacted')}>
                Marker som kontaktet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(lead.id, 'booked')}>
                Marker som booket
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange(lead.id, 'completed')}>
                Marker som afsluttet
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-nordic-muted">
            <MapPin className="h-4 w-4" />
            <span>{lead.address}, {lead.city}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-nordic-muted">
            <Mail className="h-4 w-4" />
            <span className="truncate">{lead.customerEmail}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-nordic-muted">
            <Phone className="h-4 w-4" />
            <span>{lead.customerPhone}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-nordic-muted">
            <Clock className="h-4 w-4 text-nordic-accent" />
            <span>{lead.estimatedHours} timer</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm font-medium text-nordic-text">
            <DollarSign className="h-4 w-4 text-nordic-accent" />
            <span className="font-mono">{lead.estimatedPrice.toLocaleString()} kr</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${sourceConfig[lead.source].color}`}>
              {sourceConfig[lead.source].label}
            </span>
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${priorityConfig[lead.priority].color}`}>
              {priorityConfig[lead.priority].label}
            </span>
          </div>
          
          {lead.bookingDate && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date(lead.bookingDate).toLocaleDateString('da-DK')}</span>
            </div>
          )}
        </div>

        {lead.notes && (
          <div className="mt-3 p-2 bg-nordic-hover rounded-lg text-sm text-nordic-muted">
            {lead.notes}
          </div>
        )}
        
        {/* Mobile-friendly action buttons */}
        <div className="mt-4 flex gap-2 md:hidden">
          <button className="flex-1 py-2 px-3 text-sm rounded-lg border border-nordic-border hover:bg-nordic-hover transition-colors">
            Ring
          </button>
          <button className="flex-1 py-2 px-3 text-sm rounded-lg bg-nordic-accent text-white hover:bg-nordic-accent/90 transition-colors">
            Email
          </button>
        </div>
      </div>
    </div>
  )
}

interface KanbanColumnProps {
  status: Lead['status']
  leads: Lead[]
  onStatusChange: (leadId: string, newStatus: Lead['status']) => void
  updatingLeadId: string | null
}

function KanbanColumn({ status, leads, onStatusChange, updatingLeadId }: KanbanColumnProps) {
  const config = statusConfig[status]
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-nordic-text">{config.label}</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-nordic-accent/10 text-nordic-accent">
          {leads.length}
        </span>
      </div>
      
      <div className="min-h-[200px] space-y-3">
        <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
          {leads.map(lead => (
            <SortableLeadCard 
              key={lead.id} 
              lead={lead} 
              onStatusChange={onStatusChange}
              loading={updatingLeadId === lead.id}
            />
          ))}
        </SortableContext>
        
        {leads.length === 0 && (
          <div className="p-4 border-2 border-dashed border-nordic-border rounded-lg text-center text-nordic-muted">
            Ingen leads
          </div>
        )}
      </div>
    </div>
  )
}

interface KanbanBoardProps {
  leads: Lead[]
  onStatusChange: (leadId: string, newStatus: Lead['status']) => void
  updatingLeadId: string | null
}

export function KanbanBoard({ leads, onStatusChange, updatingLeadId }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Group leads by status
  const groupedLeads = Object.keys(statusConfig).reduce((acc, status) => {
    acc[status as Lead['status']] = leads.filter(lead => lead.status === status)
    return acc
  }, {} as Record<Lead['status'], Lead[]>)

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    
    // Find the dragged lead
    const lead = leads.find(l => l.id === active.id)
    setDraggedLead(lead || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    setActiveId(null)
    setDraggedLead(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Check if we're dropping on a column (status)
    if (Object.keys(statusConfig).includes(overId)) {
      const newStatus = overId as Lead['status']
      const lead = leads.find(l => l.id === activeId)
      
      if (lead && lead.status !== newStatus) {
        onStatusChange(activeId, newStatus)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 md:grid md:grid-cols-5 md:gap-6 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        {Object.entries(statusConfig).map(([status]) => (
          <div key={status} id={status} className="min-w-[280px] md:min-w-0">
            <KanbanColumn
              status={status as Lead['status']}
              leads={groupedLeads[status as Lead['status']]}
              onStatusChange={onStatusChange}
              updatingLeadId={updatingLeadId}
            />
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeId && draggedLead ? (
          <LeadCard 
            lead={draggedLead} 
            onStatusChange={onStatusChange}
            isDragging={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}