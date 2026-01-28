import { Link, useParams, useNavigate } from 'react-router-dom'
import { MapPin, Home, Maximize2, Car, ArrowLeft, Share2, Heart, ChevronRight, Sofa, Check, Phone, Shield, Clock } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { PropertyGallery } from '../components/property/PropertyGallery'
import { formatPrice } from '../utils/formatters'
import { useProperty } from '../hooks/useProperties'
import { useAuth } from '../hooks/useAuth'
import { useMessages } from '../hooks/useMessages'
import { useFavorites } from '../hooks/useFavorites'
import { toast } from 'react-hot-toast'
import { cn } from '../utils/cn'

function FeatureCard({ icon: Icon, value, label }: { icon: React.ElementType; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100 hover:border-primary/20 hover:shadow-sm transition-all duration-200">
      <div className="p-2.5 rounded-lg bg-primary/10">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <div className="font-bold text-slate-900">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-48 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-96 bg-slate-200 rounded-2xl" />
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="h-8 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2" />
                  <div className="h-10 bg-slate-200 rounded w-1/3" />
                  <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="h-20 bg-slate-100 rounded-xl" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 h-64" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { property, loading, error } = useProperty(id!)
  const { createConversation } = useMessages()
  const { isFavorite, toggleFavorite } = useFavorites()

  const handleContact = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour contacter le démarcheur')
      navigate('/connexion')
      return
    }

    if (!property || !agent) {
      toast.error('Informations du démarcheur introuvables')
      return
    }

    if (user.id === agent.id) {
      toast.error('Vous ne pouvez pas vous contacter vous-même')
      return
    }

    try {
      const conversation = await createConversation(agent.id, property.id)
      if (conversation) {
        navigate(`/messages?conversation=${conversation.id}`)
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: `Découvrez cette propriété : ${property?.title}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Lien copié dans le presse-papier')
    }
  }

  const handleFavorite = () => {
    if (!user) {
      toast.error('Connectez-vous pour sauvegarder cette annonce')
      navigate('/connexion')
      return
    }
    if (property) {
      toggleFavorite(property.id)
    }
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-slate-50 flex items-center justify-center">
          <Card className="p-12 text-center max-w-md mx-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 flex items-center justify-center">
              <Home className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Propriété introuvable</h2>
            <p className="text-slate-600 mb-6">Cette propriété n'existe pas ou a été supprimée.</p>
            <Link to="/recherche">
              <Button>Retour à la recherche</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  const agent = property.profiles
  const favorited = isFavorite(property.id)

  const amenities = [
    { label: 'Climatisation', available: true },
    { label: 'Eau courante', available: true },
    { label: 'Électricité', available: true },
    { label: 'Sécurité 24/7', available: property.parking },
    { label: 'Internet', available: property.meuble },
    { label: 'Balcon/Terrasse', available: false },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/recherche" className="hover:text-primary transition-colors">Recherche</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium truncate max-w-[200px]">{property.title}</span>
          </nav>

          {/* Mobile Action Bar */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <Link to="/recherche" className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                title="Partager cette annonce"
                aria-label="Partager cette annonce"
                className="p-2.5 rounded-full bg-white border border-slate-200 hover:border-primary/20 hover:bg-primary/5 transition-all"
              >
                <Share2 className="w-5 h-5 text-slate-600" />
              </button>
              <button
                type="button"
                onClick={handleFavorite}
                title={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
                aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
                className={cn(
                  "p-2.5 rounded-full border transition-all",
                  favorited
                    ? "bg-rose-50 border-rose-200 text-rose-500"
                    : "bg-white border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-500"
                )}
              >
                <Heart className={cn("w-5 h-5", favorited && "fill-current")} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gallery */}
              <PropertyGallery images={property.images} title={property.title} />

              {/* Property Info Card */}
              <Card className="p-6 lg:p-8">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant={property.type === 'location' ? 'info' : 'success'} className="text-sm">
                        {property.type === 'location' ? 'Location' : property.type === 'achat' ? 'Achat' : 'Terrain'}
                      </Badge>
                      {property.is_featured && (
                        <Badge variant="premium" className="text-sm">Vedette</Badge>
                      )}
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-900 mb-2">
                      {property.title}
                    </h1>
                    <div className="flex items-center text-slate-600">
                      <MapPin className="w-5 h-5 mr-2 text-primary" />
                      <span className="font-medium">{property.quartier}, {property.ville}</span>
                    </div>
                  </div>

                  {/* Desktop Actions */}
                  <div className="hidden lg:flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                      title="Partager cette annonce"
                      aria-label="Partager cette annonce"
                    >
                      <Share2 className="w-5 h-5 text-slate-600" />
                    </button>
                    <button
                      type="button"
                      onClick={handleFavorite}
                      className={cn(
                        "p-2.5 rounded-xl transition-colors",
                        favorited
                          ? "bg-rose-100 text-rose-500"
                          : "bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-500"
                      )}
                      title={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
                      aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                      <Heart className={cn("w-5 h-5", favorited && "fill-current")} />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-8 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                  <div className="text-sm text-slate-600 mb-1">Prix</div>
                  <div className="text-3xl lg:text-4xl font-display font-bold text-primary">
                    {formatPrice(property.price)}
                    {property.type === 'location' && (
                      <span className="text-lg font-normal text-slate-500"> /mois</span>
                    )}
                  </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                  {property.pieces && (
                    <FeatureCard icon={Home} value={`${property.pieces}`} label="Pièces" />
                  )}
                  {property.surface && (
                    <FeatureCard icon={Maximize2} value={`${property.surface}m²`} label="Surface" />
                  )}
                  <FeatureCard
                    icon={Car}
                    value={property.parking ? 'Oui' : 'Non'}
                    label="Parking"
                  />
                  <FeatureCard
                    icon={Sofa}
                    value={property.meuble ? 'Oui' : 'Non'}
                    label="Meublé"
                  />
                </div>

                {/* Description */}
                {property.description && (
                  <div className="border-t border-slate-100 pt-6 mb-6">
                    <h2 className="text-xl font-display font-bold text-slate-900 mb-4">Description</h2>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                      {property.description}
                    </p>
                  </div>
                )}

                {/* Amenities */}
                <div className="border-t border-slate-100 pt-6">
                  <h2 className="text-xl font-display font-bold text-slate-900 mb-4">Équipements</h2>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg transition-colors",
                          amenity.available
                            ? "bg-primary/5 text-slate-900"
                            : "bg-slate-50 text-slate-400 line-through"
                        )}
                      >
                        <Check className={cn(
                          "w-4 h-4",
                          amenity.available ? "text-primary" : "text-slate-300"
                        )} />
                        <span className="text-sm font-medium">{amenity.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Location Card */}
              <Card className="p-6 lg:p-8">
                <h2 className="text-xl font-display font-bold text-slate-900 mb-4">Localisation</h2>
                <div className="bg-gradient-to-br from-slate-100 to-slate-50 h-64 rounded-xl flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-200">
                  <MapPin className="w-12 h-12 mb-3 text-slate-400" />
                  <p className="font-medium">{property.quartier}, {property.ville}</p>
                  <p className="text-sm text-slate-400 mt-1">Carte interactive bientôt disponible</p>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Agent Card - Sticky */}
              <div className="lg:sticky lg:top-6">
                {agent && (
                  <Card className="p-6 overflow-hidden">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>Annonce vérifiée</span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-slate-900 mb-4">Contacter le démarcheur</h3>

                    <div className="flex items-start gap-4 mb-6">
                      <Avatar
                        name={agent.full_name || 'Agent'}
                        imageUrl={agent.avatar_url}
                        isVerified={agent.is_verified}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">{agent.full_name || 'Agent'}</h4>
                        <p className="text-sm text-slate-500">Démarcheur immobilier</p>
                        {agent.is_verified && (
                          <div className="flex items-center gap-1 mt-1 text-sm text-primary">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Profil vérifié</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {agent.bio && (
                      <p className="text-sm text-slate-600 mb-6 line-clamp-3">{agent.bio}</p>
                    )}

                    <div className="space-y-3">
                      <Button onClick={handleContact} className="w-full">
                        <Phone className="w-4 h-4 mr-2" />
                        Contacter
                      </Button>
                    </div>

                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Répond généralement sous 24h</span>
                    </div>
                  </Card>
                )}

                {/* Safety Tips */}
                <Card className="p-5 mt-4 bg-amber-50 border-amber-100">
                  <h4 className="font-bold text-amber-900 mb-2 text-sm">Conseils de sécurité</h4>
                  <ul className="text-xs text-amber-800 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 mt-0.5 text-amber-600 flex-shrink-0" />
                      <span>Ne payez jamais avant de visiter le bien</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 mt-0.5 text-amber-600 flex-shrink-0" />
                      <span>Vérifiez les documents de propriété</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 mt-0.5 text-amber-600 flex-shrink-0" />
                      <span>Privilégiez les démarcheurs vérifiés</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
