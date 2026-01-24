import { useState, useEffect, useCallback } from 'react'
import { favoritesService } from '../services/favorites.service'
import { useAuth } from './useAuth'
import { toast } from 'react-hot-toast'

export function useFavorites() {
  const { user } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadFavorites()
    } else {
      setFavoriteIds(new Set())
      setIsLoading(false)
    }
  }, [user])

  const loadFavorites = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const favorites = await favoritesService.getFavorites(user.id)
      const ids = new Set(favorites.map((f: any) => f.property_id))
      setFavoriteIds(ids)
    } catch (error) {
      console.error('Error loading favorites:', error)
      toast.error('Erreur lors du chargement des favoris')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = useCallback(
    async (propertyId: string) => {
      if (!user) {
        toast.error('Vous devez être connecté pour ajouter aux favoris')
        return false
      }

      const isFavorited = favoriteIds.has(propertyId)

      setFavoriteIds((prev) => {
        const next = new Set(prev)
        if (isFavorited) {
          next.delete(propertyId)
        } else {
          next.add(propertyId)
        }
        return next
      })

      try {
        if (isFavorited) {
          await favoritesService.removeFavorite(user.id, propertyId)
          toast.success('Retiré des favoris')
        } else {
          await favoritesService.addFavorite(user.id, propertyId)
          toast.success('Ajouté aux favoris')
        }
        return true
      } catch (error) {
        setFavoriteIds((prev) => {
          const next = new Set(prev)
          if (isFavorited) {
            next.add(propertyId)
          } else {
            next.delete(propertyId)
          }
          return next
        })
        console.error('Error toggling favorite:', error)
        toast.error('Erreur lors de la mise à jour des favoris')
        return false
      }
    },
    [user, favoriteIds]
  )

  const isFavorite = useCallback(
    (propertyId: string) => {
      return favoriteIds.has(propertyId)
    },
    [favoriteIds]
  )

  return {
    favoriteIds,
    isFavorite,
    toggleFavorite,
    isLoading,
    refetch: loadFavorites,
  }
}
