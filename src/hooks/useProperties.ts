import { useState, useEffect } from 'react'
import { Property, PropertyFilters } from '../types/property.types'
import { propertiesService } from '../services/properties.service'

export function useProperties(filters?: PropertyFilters) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true)
        const data = await propertiesService.getProperties(filters)
        setProperties(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch properties'))
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [filters?.type, filters?.quartier, filters?.priceMin, filters?.priceMax, filters?.pieces, filters?.search, filters?.status, filters?.limit])

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
