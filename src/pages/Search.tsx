import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Avatar from '@/components/ui/Avatar'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { QUARTIERS_CONAKRY, PROPERTY_TYPES } from '@/utils/constants'
import { formatPrice } from '@/utils/formatters'
import { Link } from 'react-router-dom'
import { MapPin, Bed, Square, Car, Search as SearchIcon } from 'lucide-react'

const MOCK_PROPERTIES = [
  {
    id: '1',
    title: 'Villa moderne 4 pièces avec jardin',
    quartier: 'Kipé',
    type: 'location',
    price: 5500000,
    pieces: 4,
    surface: 320,
    parking: true,
    meuble: true,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    agent: { name: 'Mamadou Diallo', isVerified: true }
  },
  {
    id: '2',
    title: 'Appartement F3 standing',
    quartier: 'Nongo',
    type: 'location',
    price: 2800000,
    pieces: 3,
    surface: 95,
    parking: true,
    meuble: false,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
    agent: { name: 'Aissatou Barry', isVerified: true }
  },
  {
    id: '3',
    title: 'Studio meublé proche centre',
    quartier: 'Kaloum',
    type: 'location',
    price: 1500000,
    pieces: 1,
    surface: 35,
    parking: false,
    meuble: true,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    agent: { name: 'Mamadou Diallo', isVerified: true }
  }
]

export default function Search() {
  const [filters, setFilters] = useState({
    type: '',
    quartier: '',
    priceMin: '',
    priceMax: '',
    pieces: ''
  })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">
            Recherche de propriétés
          </h1>

          <Card className="p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Select
                label="Type"
                options={[{ value: '', label: 'Tous' }, ...PROPERTY_TYPES]}
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              />
              
              <Select
                label="Quartier"
                options={[
                  { value: '', label: 'Tous' },
                  ...QUARTIERS_CONAKRY.map(q => ({ value: q, label: q }))
                ]}
                value={filters.quartier}
                onChange={(e) => setFilters({ ...filters, quartier: e.target.value })}
              />

              <Input
                type="number"
                label="Prix min (GNF)"
                placeholder="1000000"
                value={filters.priceMin}
                onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
              />

              <Input
                type="number"
                label="Prix max (GNF)"
                placeholder="10000000"
                value={filters.priceMax}
                onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
              />

              <div className="flex items-end">
                <Button className="w-full">
                  <SearchIcon className="w-4 h-4 mr-2" />
                  Rechercher
                </Button>
              </div>
            </div>
          </Card>

          <div className="mb-4">
            <p className="text-slate-600">{MOCK_PROPERTIES.length} propriétés trouvées</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PROPERTIES.map((property) => (
              <Link key={property.id} to={`/propriete/${property.id}`}>
                <Card hover className="overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
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

                  <div className="p-4">
                    <h3 className="font-display font-bold text-lg mb-2 line-clamp-2">
                      {property.title}
                    </h3>
                    
                    <div className="flex items-center text-slate-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{property.quartier}, Conakry</span>
                    </div>

                    <div className="text-2xl font-display font-bold text-primary mb-4">
                      {formatPrice(property.price)}
                      {property.type === 'location' && <span className="text-sm font-normal text-slate-600">/mois</span>}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                      <div className="flex items-center">
                        <Bed className="w-4 h-4 mr-1" />
                        {property.pieces}
                      </div>
                      <div className="flex items-center">
                        <Square className="w-4 h-4 mr-1" />
                        {property.surface}m²
                      </div>
                      {property.parking && (
                        <div className="flex items-center">
                          <Car className="w-4 h-4 mr-1" />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center pt-4 border-t border-slate-200">
                      <Avatar
                        name={property.agent.name}
                        isVerified={property.agent.isVerified}
                        size="sm"
                      />
                      <span className="ml-2 text-sm text-slate-600">{property.agent.name}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
