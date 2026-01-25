import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { favoritesService } from '../services/favorites.service'
import { PropertyGrid } from '../components/property/PropertyGrid'
import { EmptyState } from '../components/common/EmptyState'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { Property } from '../types/property.types'

export function Favorites() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/connexion')
      return
    }
    loadFavorites()
  }, [user, navigate])

  const loadFavorites = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const favorites = await favoritesService.getFavorites(user.id)
      const props = favorites.map((f: { properties: Property }) => f.properties).filter(Boolean)
      setProperties(props)
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-display font-bold text-slate-900 mb-8">Mes Favoris</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-display font-bold text-slate-900 mb-8">Mes Favoris</h1>

        {properties.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Aucun favori"
            description="Vous n'avez pas encore ajouté de propriétés à vos favoris. Explorez les annonces et ajoutez-les à votre liste !"
            actionLabel="Voir les annonces"
            onAction={() => navigate('/recherche')}
          />
        ) : (
          <PropertyGrid properties={properties} />
        )}
      </div>
    </div>
  )
}
