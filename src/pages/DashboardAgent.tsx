import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Home, Eye, MessageSquare, TrendingUp,
  ChevronRight, MoreVertical, Edit2, Trash2,
  CheckCircle, XCircle, Users
} from 'lucide-react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useAuth } from '../hooks/useAuth'
import { useStats } from '../hooks/useStats'
import { propertiesService } from '../services/properties.service'
import { Property } from '../types/property.types'
import { formatPrice } from '../utils/formatters'
import { cn } from '../utils/cn'

interface QuickStatProps {
  icon: React.ElementType
  label: string
  value: string | number
  trend?: string
  trendUp?: boolean
  color: 'primary' | 'green' | 'blue' | 'amber'
}

function QuickStat({ icon: Icon, label, value, trend, trendUp, color }: QuickStatProps) {
  const colorStyles = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600'
  }

  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={cn("p-2.5 rounded-xl", colorStyles[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trendUp ? "text-green-600" : "text-red-500"
          )}>
            <TrendingUp className={cn("w-3 h-3", !trendUp && "rotate-180")} />
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      </div>
    </Card>
  )
}

function PropertyRow({ property, onEdit, onDelete }: {
  property: Property
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  const statusConfig = {
    active: { label: 'Active', color: 'success' as const, icon: CheckCircle },
    loue: { label: 'Louée', color: 'info' as const, icon: CheckCircle },
    vendu: { label: 'Vendue', color: 'warning' as const, icon: CheckCircle },
    inactif: { label: 'Inactive', color: 'info' as const, icon: XCircle }
  }

  const status = statusConfig[property.status as keyof typeof statusConfig] || statusConfig.active

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-primary/20 hover:shadow-sm transition-all group">
      <Link to={`/propriete/${property.id}`} className="flex-shrink-0">
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100">
          <img
            src={property.images?.[0] || '/placeholder.jpg'}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/propriete/${property.id}`}>
          <h3 className="font-bold text-slate-900 hover:text-primary transition-colors truncate">
            {property.title}
          </h3>
        </Link>
        <p className="text-sm text-slate-500 mt-0.5">
          {property.quartier}, {property.ville}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="font-bold text-primary">
            {formatPrice(property.price)}
            {property.type === 'location' && <span className="text-xs font-normal text-slate-400">/mois</span>}
          </span>
          <Badge variant={status.color} className="text-xs">
            {status.label}
          </Badge>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6 text-center">
        <div>
          <p className="text-lg font-bold text-slate-900">245</p>
          <p className="text-xs text-slate-500">Vues</p>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900">12</p>
          <p className="text-xs text-slate-500">Messages</p>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-100 py-1 w-40 z-10">
            <Link
              to={`/propriete/${property.id}`}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Voir
            </Link>
            <button
              onClick={() => { onEdit?.(property.id); setShowMenu(false) }}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Modifier
            </button>
            <button
              onClick={() => { onDelete?.(property.id); setShowMenu(false) }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardAgent() {
  const { user } = useAuth()
  const { stats } = useStats()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProperties()
    }
  }, [user])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const data = await propertiesService.getUserProperties(user!.id)
      setProperties(data)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id: string) => {
    console.log('Edit property:', id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return

    try {
      await propertiesService.deleteProperty(id)
      setProperties(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting property:', error)
    }
  }

  const firstName = user?.profile?.full_name?.split(' ')[0] || 'Démarcheur'
  const activeCount = properties.filter(p => p.status === 'active').length

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-900">
              Bienvenue, {firstName}
            </h1>
            <p className="text-slate-600 mt-1">
              Gérez vos annonces et suivez vos performances
            </p>
          </div>
          <Link to="/nouvelle-annonce">
            <Button className="shadow-lg shadow-primary/25">
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle annonce
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickStat
            icon={Home}
            label="Annonces actives"
            value={stats.activeListingsCount}
            color="primary"
          />
          <QuickStat
            icon={Eye}
            label="Vues totales"
            value={stats.totalViewsCount}
            trend="+12%"
            trendUp
            color="blue"
          />
          <QuickStat
            icon={MessageSquare}
            label="Messages"
            value={stats.unreadMessagesCount}
            color="green"
          />
          <QuickStat
            icon={Users}
            label="Taux de réponse"
            value={`${stats.responseRate}%`}
            color="amber"
          />
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Performances</h2>
            <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option>7 derniers jours</option>
              <option>30 derniers jours</option>
              <option>3 derniers mois</option>
            </select>
          </div>

          <div className="h-48 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center">
            <p className="text-slate-400 text-sm">Graphique de performances à venir</p>
          </div>
        </Card>

        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Mes annonces</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {activeCount} annonce{activeCount > 1 ? 's' : ''} active{activeCount > 1 ? 's' : ''}
              </p>
            </div>
            <Link
              to="/mes-annonces"
              className="flex items-center gap-1 text-primary hover:text-primary/80 font-medium text-sm"
            >
              Voir tout
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Home className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Aucune annonce
              </h3>
              <p className="text-slate-600 mb-6 max-w-sm mx-auto">
                Créez votre première annonce et commencez à recevoir des demandes
              </p>
              <Link to="/nouvelle-annonce">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une annonce
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {properties.slice(0, 5).map(property => (
                <PropertyRow
                  key={property.id}
                  property={property}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
