import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Bed, Square, Car, Star, MessageSquare, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/utils/formatters'

const MOCK_PROPERTY = {
  id: '1',
  title: 'Villa moderne 4 pièces avec jardin',
  description: 'Magnifique villa moderne située dans le quartier prisé de Kipé. La propriété dispose de 4 chambres spacieuses, un grand salon, une cuisine équipée, et un beau jardin. Parfaite pour une famille. Proche des commodités (écoles, supermarchés, transport).',
  quartier: 'Kipé',
  ville: 'Conakry',
  type: 'location',
  price: 5500000,
  pieces: 4,
  surface: 320,
  parking: true,
  meuble: true,
  images: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200'
  ],
  agent: {
    id: '1',
    name: 'Mamadou Diallo',
    isVerified: true,
    rating: 4.8,
    reviews: 24,
    avatar: null
  }
}

export default function PropertyDetail() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const property = MOCK_PROPERTY

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
              <Card className="overflow-hidden">
                <div className="relative h-96 bg-slate-900">
                  <img
                    src={property.images[currentImageIndex]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant={property.type === 'location' ? 'info' : 'premium'}>
                      {property.type === 'location' ? 'Location' : 'Achat'}
                    </Badge>
                  </div>
                  {property.meuble && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="success">Meublé</Badge>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 p-4 overflow-x-auto">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                        currentImageIndex === index ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h1 className="text-3xl font-display font-bold mb-4">{property.title}</h1>
                
                <div className="flex items-center text-slate-600 mb-6">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{property.quartier}, {property.ville}</span>
                </div>

                <div className="text-4xl font-display font-bold text-primary mb-6">
                  {formatPrice(property.price)}
                  {property.type === 'location' && <span className="text-lg font-normal text-slate-600">/mois</span>}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg">
                    <Bed className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-bold">{property.pieces}</div>
                      <div className="text-sm text-slate-600">Pièces</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg">
                    <Square className="w-5 h-5 text-primary" />
                    <div>
                      <div className="font-bold">{property.surface}m²</div>
                      <div className="text-sm text-slate-600">Surface</div>
                    </div>
                  </div>
                  {property.parking && (
                    <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg">
                      <Car className="w-5 h-5 text-primary" />
                      <div>
                        <div className="font-bold">Oui</div>
                        <div className="text-sm text-slate-600">Parking</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h2 className="text-xl font-display font-bold mb-4">Description</h2>
                  <p className="text-slate-700 leading-relaxed">{property.description}</p>
                </div>
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
              <Card className="p-6 sticky top-8">
                <h3 className="text-xl font-display font-bold mb-4">Démarcheur</h3>
                
                <div className="flex items-start mb-4">
                  <Avatar
                    name={property.agent.name}
                    isVerified={property.agent.isVerified}
                    size="lg"
                  />
                  <div className="ml-4">
                    <div className="font-bold text-lg">{property.agent.name}</div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Star className="w-4 h-4 text-warning fill-warning mr-1" />
                      <span>{property.agent.rating} ({property.agent.reviews} avis)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contacter
                  </Button>
                  <Button variant="outline" className="w-full">
                    Demander une visite
                  </Button>
                  <Link to={`/demarcheur/${property.agent.id}`}>
                    <Button variant="ghost" className="w-full">
                      Voir le profil
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
