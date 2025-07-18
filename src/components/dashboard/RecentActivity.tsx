import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { da } from 'date-fns/locale'
import { activityService } from '../../services/supabaseService'
import type { Activity } from '../../types'
import { 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  User, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'email': return Mail
    case 'sms': return Phone
    case 'booking': return Calendar
    case 'invoice': return DollarSign
    case 'lead': return User
    default: return CheckCircle
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'failed': return 'bg-red-100 text-red-800'
    case 'in_progress': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return 'Fuldført'
    case 'pending': return 'Afventer'
    case 'failed': return 'Fejlet'
    case 'in_progress': return 'I gang'
    default: return status
  }
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true)
        const data = await activityService.getAll()
        setActivities(data)
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    const subscription = activityService.subscribeToChanges((payload) => {
      console.log('Real-time activity update:', payload)
      
      if (payload.eventType === 'INSERT') {
        setActivities(prev => [payload.new, ...prev.slice(0, 49)]) // Keep only 50 most recent
      } else if (payload.eventType === 'UPDATE') {
        setActivities(prev => prev.map(activity => 
          activity.id === payload.new.id ? payload.new : activity
        ))
      } else if (payload.eventType === 'DELETE') {
        setActivities(prev => prev.filter(activity => activity.id !== payload.old.id))
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Seneste Aktivitet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Seneste Aktivitet
          {activities.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {activities.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Ingen aktivitet endnu</p>
            <p className="text-sm">Aktiviteter vil vises her når systemet begynder at arbejde</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              const timeAgo = formatDistanceToNow(new Date(activity.created_at || ''), {
                addSuffix: true,
                locale: da
              })

              return (
                <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.title}
                      </p>
                      <Badge className={getStatusColor(activity.status)}>
                        {getStatusText(activity.status)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      {activity.customer && (
                        <span className="text-xs text-gray-500">
                          Kunde: {activity.customer}
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {timeAgo}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}