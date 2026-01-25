import { MapPin, Home, Maximize2, Car, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Property } from '../../types/property.types'
import { Badge } from '../ui/Badge'
import { Avatar } from '../ui/Avatar'
import { formatPrice } from '../../utils/formatters'
import { cn } from '../../utils/cn'
import { useFavorites } from '../../hooks/useFavorites'

interface PropertyCardProps {
  property: Property
  className?: string
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const agent = property.profiles
  const mainImage = property.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800'
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorited = isFavorite(property.id)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(property.id)
  }

  return (
    <Link 
      to={`/propriete/${property.id}`}
      className={cn(
        'group bg-white rounded-card border border-slate-200 overflow-hidden transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-2',
        className
      )}
    >
      <div className="relative h-64 overflow-hidden">
        <img 
          src={mainImage} 
          alt={property.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant={property.type === 'location' ? 'info' : 'success'}>
            {property.type === 'location' ? 'Location' : 'Achat'}
          </Badge>
          {property.is_featured && (
            <Badge variant="premium">Featured</Badge>
          )}
        </div>
        <button
          onClick={handleFavoriteClick}
          className={cn(
            'absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all duration-300',
            'hover:scale-110 active:scale-95',
            favorited 
              ? 'bg-white/90 text-danger' 
              : 'bg-white/60 text-white hover:bg-white/90 hover:text-danger'
          )}
        >
          <Heart 
            className={cn(
              'w-5 h-5 transition-all duration-300',
              favorited && 'fill-current'
            )} 
          />
        </button>
      </div>

      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-display font-bold text-slate-900 mb-2 line-clamp-1">
            {property.title}
          </h3>
          <div className="flex items-center text-slate-600 text-sm mb-3">
            <MapPin className="w-4 h-4 mr-1" />
            {property.quartier}, {property.ville}
          </div>
          <p className="text-2xl font-display font-bold text-primary">
            {formatPrice(property.price)}
            {property.type === 'location' && <span className="text-base text-slate-600">/mois</span>}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-600 mb-4 pb-4 border-b border-slate-100">
          {property.pieces && (
            <div className="flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span>{property.pieces} pièces</span>
            </div>
          )}
          {property.surface && (
            <div className="flex items-center gap-1">
              <Maximize2 className="w-4 h-4" />
              <span>{property.surface}m²</span>
            </div>
          )}
          {property.parking && (
            <div className="flex items-center gap-1">
              <Car className="w-4 h-4" />
              <span>Parking</span>
            </div>
          )}
        </div>

        {agent && (
          <div className="flex items-center gap-3">
            <Avatar 
              name={agent.full_name || 'Agent'}
              imageUrl={agent.avatar_url}
              isVerified={agent.is_verified}
              size="sm"
            />
            <div className="text-sm">
              <p className="font-medium text-slate-900">{agent.full_name || 'Agent'}</p>
              <p className="text-slate-600">Démarcheur</p>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
