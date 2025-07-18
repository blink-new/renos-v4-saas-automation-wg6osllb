import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useLeads } from '@/hooks/useLeads'
import { useMemo } from 'react'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  ArrowRight,
  Target,
  Clock
} from 'lucide-react'

export function LeadPipeline() {
  const { leads, loading } = useLeads()

  const pipelineStats = useMemo(() => {
    if (loading || !leads.length) {
      return {
        new: 0,
        contacted: 0,
        booked: 0,
        completed: 0,
        invoiced: 0,
        conversionRate: 0,
        totalValue: 0,
        avgDealSize: 0
      }
    }

    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalValue = leads.reduce((sum, lead) => sum + lead.estimatedPrice, 0)
    const conversionRate = leads.length > 0 ? ((statusCounts.completed || 0) / leads.length) * 100 : 0
    const avgDealSize = leads.length > 0 ? totalValue / leads.length : 0

    return {
      new: statusCounts.new || 0,
      contacted: statusCounts.contacted || 0,
      booked: statusCounts.booked || 0,
      completed: statusCounts.completed || 0,
      invoiced: statusCounts.invoiced || 0,
      conversionRate,
      totalValue,
      avgDealSize
    }
  }, [leads, loading])

  const pipelineStages = [
    { 
      key: 'new', 
      label: 'Nye Leads', 
      count: pipelineStats.new, 
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    { 
      key: 'contacted', 
      label: 'Kontaktet', 
      count: pipelineStats.contacted, 
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    { 
      key: 'booked', 
      label: 'Booket', 
      count: pipelineStats.booked, 
      color: 'bg-primary',
      textColor: 'text-primary'
    },
    { 
      key: 'completed', 
      label: 'Afsluttet', 
      count: pipelineStats.completed, 
      color: 'bg-accent',
      textColor: 'text-accent'
    },
    { 
      key: 'invoiced', 
      label: 'Faktureret', 
      count: pipelineStats.invoiced, 
      color: 'bg-green-500',
      textColor: 'text-green-600'
    }
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Lead Pipeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </div>
                <div className="h-6 bg-muted rounded w-8"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalLeads = leads.length
  const maxStageCount = Math.max(...pipelineStages.map(stage => stage.count))

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5" />
          <span>Lead Pipeline</span>
        </CardTitle>
        <Badge variant="secondary">{totalLeads} total</Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pipeline Stages */}
        <div className="space-y-4">
          {pipelineStages.map((stage, index) => {
            const percentage = totalLeads > 0 ? (stage.count / totalLeads) * 100 : 0
            const barWidth = maxStageCount > 0 ? (stage.count / maxStageCount) * 100 : 0
            
            return (
              <div key={stage.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                    <span className="text-sm font-medium text-foreground">
                      {stage.label}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={stage.textColor}>
                      {stage.count}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
                
                <div className="relative">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${stage.color} transition-all duration-300`}
                      style={{ width: `${barWidth}%` }}
                    ></div>
                  </div>
                </div>
                
                {index < pipelineStages.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Key Metrics */}
        <div className="pt-4 border-t border-border space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="text-sm text-muted-foreground">Konverteringsrate</span>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {pipelineStats.conversionRate.toFixed(1)}%
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Gns. Deal Størrelse</span>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {pipelineStats.avgDealSize.toLocaleString()} kr
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pipeline Værdi</span>
              <span className="text-sm font-medium text-foreground">
                {pipelineStats.totalValue.toLocaleString()} kr
              </span>
            </div>
            <Progress 
              value={pipelineStats.conversionRate} 
              className="h-2"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-border">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Users className="h-4 w-4 mr-2" />
              Se Alle Leads
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Clock className="h-4 w-4 mr-2" />
              Kræver Handling
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}