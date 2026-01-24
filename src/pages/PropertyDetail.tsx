import { Link, useParams } from 'react-router-dom'
import { MapPin, Home, Maximize2, Car, ArrowLeft } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { PropertyGallery } from '../components/property/PropertyGallery'
import { AgentCard } from '../components/agent/AgentCard'
import { formatPrice } from '../utils/formatters'
import { useProperty } from '../hooks/useProperties'

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>()
  const { property, loading, error } = useProperty(id!)

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-slate-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Propriété introuvable</h2>
            <p className="text-slate-600 mb-4">Cette propriété n'existe pas ou a été supprimée.</p>
            <Link to="/recherche">
              <Button>Retour à la recherche</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const agent = property.profiles

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/recherche" className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux résultats
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <PropertyGallery images={property.images} title={property.title} />

              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-3xl font-display font-bold">{property.title}</h1>
                  <Badge variant={property.type === 'location' ? 'info' : 'success'}>
                    {property.type === 'location' ? 'Location' : 'Achat'}
                  </Badge>
                </div>
                
                <div className="flex items-center text-slate-600 mb-6">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{property.quartier}, {property.ville}</span>
                </div>

                <div className="text-4xl font-display font-bold text-primary mb-6">
                  {formatPrice(property.price)}
                  {property.type === 'location' && <span className="text-lg font-normal text-slate-600">/mois</span>}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {property.pieces && (
                    <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg">
                      <Home className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-bold">{property.pieces}</div>
                        <div className="text-sm text-slate-600">Pièces</div>
                      </div>
                    </div>
                  )}
                  {property.surface && (
                    <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg">
                      <Maximize2 className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-bold">{property.surface}m²</div>
                        <div className="text-sm text-slate-600">Surface</div>
                      </div>
                    </div>
                  )}
                  {property.parking && (
                    <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg">
                      <Car className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-bold">Oui</div>
                        <div className="text-sm text-slate-600">Parking</div>
                      </div>
                    </div>
                  )}
                  {property.meuble && (
                    <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-bold">Meublé</div>
                        <div className="text-sm text-slate-600">Oui</div>
                      </div>
                    </div>
                  )}
                </div>

                {property.description && (
                  <div className="border-t border-slate-200 pt-6">
                    <h2 className="text-xl font-display font-bold mb-4">Description</h2>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{property.description}</p>
                  </div>
                )}
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-display font-bold mb-4">Localisation</h2>
                <div className="bg-slate-200 h-64 rounded-lg flex items-center justify-center text-slate-600">
                  <MapPin className="w-8 h-8 mr-2" />
                  Carte interactive (Google Maps)
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              {agent && (
                <div className="sticky top-8">
                  <AgentCard agent={agent} onContact={() => console.log('Contact agent')} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
