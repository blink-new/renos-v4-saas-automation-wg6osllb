import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react'
import { dashboardService } from '../../services/supabaseService'

interface DashboardStats {
  totalLeads: number
  newLeads: number
  activeBookings: number
  totalRevenue: number
}

export function StatsCards() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    newLeads: 0,
    activeBookings: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        const data = await dashboardService.getStats()
        setStats(data)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK'
    }).format(amount)
  }

  const cards = [
    {
      title: 'Total Leads',
      value: loading ? '...' : stats.totalLeads.toString(),
      icon: Users,
      color: 'bg-nordic-accent',
      badge: stats.newLeads > 0 ? `${stats.newLeads} nye` : null
    },
    {
      title: 'Aktive Bookinger',
      value: loading ? '...' : stats.activeBookings.toString(),
      icon: Calendar,
      color: 'bg-blue-500',
      badge: null
    },
    {
      title: 'Total Omsætning',
      value: loading ? '...' : formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-purple-500',
      badge: null
    },
    {
      title: 'Konverteringsrate',
      value: loading ? '...' : `${stats.totalLeads > 0 ? Math.round((stats.activeBookings / stats.totalLeads) * 100) : 0}%`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      badge: null
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-nordic-surface p-6 rounded-xl shadow-sm animate-fade-in hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-nordic-muted">{card.title}</p>
              <p className="text-2xl font-semibold text-nordic-text mt-1">
                {card.value}
              </p>
              {card.badge && (
                <span className="inline-block mt-2 text-xs font-medium text-nordic-accent">
                  {card.badge}
                </span>
              )}
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
              <card.icon className="w-6 h-6 text-white" />
            </div>
          </div>
          {loading && (
            <div className="mt-3">
              <div className="h-1 bg-nordic-border rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}