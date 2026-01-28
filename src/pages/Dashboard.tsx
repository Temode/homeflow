import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageSquare, Calendar, Search, TrendingUp, ArrowRight, Sparkles, Home, Clock } from 'lucide-react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { PropertyGrid } from '../components/property/PropertyGrid'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { Property } from '../types/property.types'
import { favoritesService } from '../services/favorites.service'
import { propertiesService } from '../services/properties.service'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bonjour'
  if (hour < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: number
  trend?: string
  color: 'primary' | 'accent' | 'warning' | 'rose'
  href?: string
}

function StatCard({ icon: Icon, label, value, trend, color, href }: StatCardProps) {
  const colorStyles = {
    primary: {
      bg: 'bg-gradient-to-br from-primary/10 to-primary/5',
      icon: 'bg-primary/20 text-primary',
      trend: 'text-primary'
    },
    accent: {
      bg: 'bg-gradient-to-br from-accent/10 to-accent/5',
      icon: 'bg-accent/20 text-accent',
      trend: 'text-accent'
    },
    warning: {
      bg: 'bg-gradient-to-br from-amber-500/10 to-amber-500/5',
      icon: 'bg-amber-500/20 text-amber-600',
      trend: 'text-amber-600'
    },
    rose: {
      bg: 'bg-gradient-to-br from-rose-500/10 to-rose-500/5',
      icon: 'bg-rose-500/20 text-rose-600',
      trend: 'text-rose-600'
    }
  }

  const styles = colorStyles[color]

  const content = (
    <Card className={`p-6 ${styles.bg} border-0 hover:shadow-lg transition-all duration-300 group cursor-pointer`}>
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl ${styles.icon} transition-transform duration-300 group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${styles.trend}`}>
            <TrendingUp className="w-4 h-4" />
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-3xl font-display font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-600 mt-1">{label}</p>
      </div>
    </Card>
  )

  return href ? <Link to={href}>{content}</Link> : content
}

export default function Dashboard() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Property[]>([])
  const [recommended, setRecommended] = useState<Property[]>([])
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchFavorites()
      fetchFavoritesCount()
      fetchRecommended()
    }
  }, [user])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const data = await favoritesService.getFavorites(user!.id)
      const favoritedProperties = data
        .map((fav: { properties: Property }) => fav.properties)
        .filter(Boolean)
        .slice(0, 3)

      setFavorites(favoritedProperties)
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFavoritesCount = async () => {
    try {
      const count = await favoritesService.getFavoritesCount(user!.id)
      setFavoritesCount(count)
    } catch (error) {
      console.error('Error fetching favorites count:', error)
    }
  }

  const fetchRecommended = async () => {
    try {
      const data = await propertiesService.getProperties({ status: 'active', is_featured: true, limit: 3 })
      setRecommended(data)
    } catch (error) {
      console.error('Error fetching recommended:', error)
    }
  }

  const firstName = user?.profile?.full_name?.split(' ')[0] || 'Utilisateur'

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent rounded-2xl p-8 text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
              <Clock className="w-4 h-4" />
              {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
              {getGreeting()}, {firstName} 👋
            </h1>
            <p className="text-white/80 text-lg max-w-xl">
              Trouvez le logement idéal parmi nos {recommended.length > 0 ? 'nouvelles annonces' : 'propriétés sélectionnées'}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/recherche">
                <Button className="bg-white text-primary hover:bg-white/90 shadow-lg">
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
              </Link>
              <Link to="/favoris">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Heart className="w-4 h-4 mr-2" />
                  Mes favoris
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Heart}
            label="Propriétés sauvegardées"
            value={favoritesCount}
            color="rose"
            href="/favoris"
          />
          <StatCard
            icon={MessageSquare}
            label="Messages non lus"
            value={0}
            color="accent"
            href="/messages"
          />
          <StatCard
            icon={Calendar}
            label="Visites planifiées"
            value={0}
            color="warning"
          />
          <StatCard
            icon={Home}
            label="Annonces vues"
            value={12}
            trend="+3"
            color="primary"
          />
        </div>

        {/* Favorites Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900">Mes favoris</h2>
              <p className="text-slate-600 text-sm mt-1">Les propriétés que vous avez sauvegardées</p>
            </div>
            {favorites.length > 0 && (
              <Link
                to="/favoris"
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Voir tout
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-slate-200 rounded-t-card" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="h-6 bg-slate-200 rounded w-1/3" />
                  </div>
                </Card>
              ))}
            </div>
          ) : favorites.length > 0 ? (
            <PropertyGrid properties={favorites} />
          ) : (
            <Card className="p-12 text-center border-dashed border-2 border-slate-200 bg-slate-50/50">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center">
                <Heart className="w-10 h-10 text-rose-400" />
              </div>
              <h3 className="text-xl font-display font-bold text-slate-900 mb-2">
                Aucun favori pour le moment
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Explorez nos annonces et cliquez sur le cœur pour sauvegarder les propriétés qui vous intéressent
              </p>
              <Link to="/recherche">
                <Button>
                  <Search className="w-4 h-4 mr-2" />
                  Explorer les annonces
                </Button>
              </Link>
            </Card>
          )}
        </section>

        {/* Recommended Section */}
        {recommended.length > 0 && favorites.length === 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-900">Recommandé pour vous</h2>
                  <p className="text-slate-600 text-sm mt-1">Nos meilleures sélections du moment</p>
                </div>
              </div>
              <Link
                to="/recherche"
                className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Voir plus
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <PropertyGrid properties={recommended} />
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}
