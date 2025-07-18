import { useState, useEffect } from 'react'
import { leadService } from '../services/supabaseService'
import type { Lead } from '../types'

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial data
  useEffect(() => {
    async function fetchLeads() {
      try {
        setLoading(true)
        const data = await leadService.getAll()
        setLeads(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching leads:', err)
        setError('Failed to fetch leads')
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [])

  // Set up real-time subscription
  useEffect(() => {
    const subscription = leadService.subscribeToChanges((payload) => {
      console.log('Real-time lead update:', payload)
      
      if (payload.eventType === 'INSERT') {
        setLeads(prev => [payload.new, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        setLeads(prev => prev.map(lead => 
          lead.id === payload.new.id ? payload.new : lead
        ))
      } else if (payload.eventType === 'DELETE') {
        setLeads(prev => prev.filter(lead => lead.id !== payload.old.id))
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const createLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newLead = await leadService.create(leadData)
      // Real-time subscription will handle the UI update
      return newLead
    } catch (err) {
      console.error('Error creating lead:', err)
      throw err
    }
  }

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const updatedLead = await leadService.update(id, updates)
      // Real-time subscription will handle the UI update
      return updatedLead
    } catch (err) {
      console.error('Error updating lead:', err)
      throw err
    }
  }

  const deleteLead = async (id: string) => {
    try {
      await leadService.delete(id)
      // Real-time subscription will handle the UI update
    } catch (err) {
      console.error('Error deleting lead:', err)
      throw err
    }
  }

  return {
    leads,
    loading,
    error,
    createLead,
    updateLead,
    deleteLead,
    refetch: () => {
      setLoading(true)
      leadService.getAll().then(setLeads).finally(() => setLoading(false))
    }
  }
}