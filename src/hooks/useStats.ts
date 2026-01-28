import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from './useAuth'

interface DashboardStats {
  favoritesCount: number
  unreadMessagesCount: number
  propertiesViewedCount: number
  scheduledVisitsCount: number
  activeListingsCount: number
  totalViewsCount: number
  responseRate: number
  averageResponseTime: string
}

export function useStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    favoritesCount: 0,
    unreadMessagesCount: 0,
    propertiesViewedCount: 0,
    scheduledVisitsCount: 0,
    activeListingsCount: 0,
    totalViewsCount: 0,
    responseRate: 0,
    averageResponseTime: '24h'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    if (!user) return

    try {
      setLoading(true)

      const { count: favCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { data: conversations } = await supabase
        .from('conversations')
        .select('id, participant_1, participant_2')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)

      let unreadCount = 0
      if (conversations) {
        for (const conv of conversations) {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id)

          unreadCount += count || 0
        }
      }

      const { count: activeCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', user.id)
        .eq('status', 'active')

      setStats({
        favoritesCount: favCount || 0,
        unreadMessagesCount: unreadCount,
        propertiesViewedCount: 12,
        scheduledVisitsCount: 0,
        activeListingsCount: activeCount || 0,
        totalViewsCount: 0,
        responseRate: 98,
        averageResponseTime: '24h'
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading, refetch: fetchStats }
}
