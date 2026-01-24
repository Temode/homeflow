import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, Eye, MessageSquare, Plus } from 'lucide-react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { PropertyStats } from '../components/property/PropertyStats'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useAuth } from '../hooks/useAuth'
import { Property } from '../types/property.types'
import { propertiesService } from '../services/properties.service'
import { formatPrice } from '../utils/formatters'

export default function DashboardAgent() {
  const { user } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProperties()
    }
  }, [user])

  const fetchProperties = async () => {
    try {
      const data = await propertiesService.getUserProperties(user!.id)
      setProperties(data)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const activeProperties = properties.filter(p => p.status === 'active')

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">
              Tableau de bord Démarcheur
            </h1>
            <p className="text-slate-600 mt-2">Gérez vos annonces et suivez vos statistiques</p>
          </div>
          <Link to="/nouvelle-annonce">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle annonce
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PropertyStats
            icon={Home}
            label="Annonces actives"
            value={activeProperties.length}
            color="primary"
          />
          <PropertyStats
            icon={Eye}
            label="Vues totales"
            value={0}
            color="accent"
          />
          <PropertyStats
            icon={MessageSquare}
            label="Messages reçus"
            value={0}
            color="warning"
          />
        </div>

        <div>
          <h2 className="text-2xl font-display font-bold mb-4">Mes annonces</h2>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : properties.length > 0 ? (
            <div className="space-y-4">
              {properties.map((property) => (
                <Card key={property.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={property.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200'}
                      alt={property.title}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-bold text-lg line-clamp-1">{property.title}</h3>
                        <Badge variant={property.status === 'active' ? 'success' : 'warning'}>
                          {property.status}
                        </Badge>
                      </div>
                      <p className="text-slate-600 mb-2">{property.quartier}, {property.ville}</p>
                      <p className="text-2xl font-display font-bold text-primary">
                        {formatPrice(property.price)}
                        {property.type === 'location' && <span className="text-sm text-slate-600">/mois</span>}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/propriete/${property.id}`}>
                        <Button variant="outline" size="sm">Voir</Button>
                      </Link>
                      <Button variant="ghost" size="sm">Modifier</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Home className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">Vous n'avez pas encore d'annonces</p>
              <Link to="/nouvelle-annonce">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer ma première annonce
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
