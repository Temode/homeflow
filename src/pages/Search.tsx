import { useState } from 'react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { PropertyGrid } from '../components/property/PropertyGrid'
import { PropertyFilters } from '../components/property/PropertyFilters'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { useProperties } from '../hooks/useProperties'
import { PropertyFilters as Filters } from '../types/property.types'

export default function Search() {
  const [filters, setFilters] = useState<Filters>({})
  const { properties, loading } = useProperties(filters)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">
            Recherche de propriétés
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <PropertyFilters 
                onFiltersChange={setFilters}
                initialFilters={filters}
              />
            </div>

            <div className="lg:col-span-3">
              <div className="mb-4">
                <p className="text-slate-600">
                  {loading ? 'Chargement...' : `${properties.length} propriété(s) trouvée(s)`}
                </p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <LoadingSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <PropertyGrid properties={properties} />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
