import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageSquare, Calendar } from 'lucide-react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { PropertyStats } from '../components/property/PropertyStats'
import { PropertyGrid } from '../components/property/PropertyGrid'
import { useAuth } from '../hooks/useAuth'
import { Property } from '../types/property.types'
import { supabase } from '../services/supabase'

export default function Dashboard() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchFavorites()
    }
  }, [user])

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id, properties(*, profiles(*))')
        .eq('user_id', user!.id)
        .limit(3)

      if (error) throw error

      const favoritedProperties = data
        .map((fav: any) => fav.properties)
        .filter(Boolean)

      setFavorites(favoritedProperties)
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">
            Bienvenue, {user?.profile?.full_name || 'Utilisateur'}
          </h1>
          <p className="text-slate-600 mt-2">Voici un aperçu de votre activité</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PropertyStats
            icon={Heart}
            label="Favoris"
            value={favorites.length}
            color="primary"
          />
          <PropertyStats
            icon={MessageSquare}
            label="Messages non lus"
            value={0}
            color="accent"
          />
          <PropertyStats
            icon={Calendar}
            label="Visites planifiées"
            value={0}
            color="warning"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-display font-bold">Mes favoris</h2>
            <Link to="/favoris" className="text-primary hover:text-primary/80 font-medium">
              Voir tout
            </Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : favorites.length > 0 ? (
            <PropertyGrid properties={favorites} />
          ) : (
            <div className="text-center py-12 bg-white rounded-card border border-slate-200">
              <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">Vous n'avez pas encore de favoris</p>
              <Link to="/recherche" className="text-primary hover:text-primary/80 font-medium">
                Explorer les annonces
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
