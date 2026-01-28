import { useState, useEffect } from 'react'
import { Property, PropertyFilters } from '../types/property.types'
import { propertiesService } from '../services/properties.service'

export function useProperties(filters?: PropertyFilters) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let isCancelled = false

    const fetchProperties = async () => {
      try {
        setLoading(true)
        console.log('[useProperties] Fetching with filters:', filters)
        const data = await propertiesService.getProperties(filters)

        // Ne pas mettre à jour l'état si le composant a été démonté ou l'effet annulé
        if (isCancelled) return

        console.log('[useProperties] Received data:', data)
        setProperties(data)
        setError(null)
      } catch (err: unknown) {
        // Ne pas mettre à jour l'état si le composant a été démonté ou l'effet annulé
        if (isCancelled) return

        // Ignorer les erreurs d'annulation (AbortError)
        const errorObj = err as { message?: string }
        if (errorObj?.message?.includes('AbortError') || errorObj?.message?.includes('aborted')) {
          console.log('[useProperties] Request was aborted, ignoring')
          return
        }

        console.error('[useProperties] Error:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch properties'))
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    fetchProperties()

    // Cleanup function pour annuler la requête si l'effet est ré-exécuté
    return () => {
      isCancelled = true
    }
  }, [filters?.type, filters?.quartier, filters?.priceMin, filters?.priceMax, filters?.pieces, filters?.search, filters?.status, filters?.limit, filters?.is_featured])

  return { properties, loading, error }
}

export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true)
        const data = await propertiesService.getPropertyById(id)
        setProperty(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch property'))
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProperty()
    }
  }, [id])

  return { property, loading, error }
}
