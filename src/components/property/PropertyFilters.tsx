import { useState } from 'react'
import { PropertyFilters as Filters } from '../../types/property.types'
import { Select } from '../ui/Select'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { QUARTIERS_CONAKRY } from '../../utils/constants'

interface PropertyFiltersProps {
  onFiltersChange: (filters: Filters) => void
  initialFilters?: Filters
}

export function PropertyFilters({ onFiltersChange, initialFilters }: PropertyFiltersProps) {
  const [filters, setFilters] = useState<Filters>(initialFilters || {})

  const handleFilterChange = (key: keyof Filters, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value || undefined }
    setFilters(newFilters)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onFiltersChange(filters)
  }

  const handleReset = () => {
    setFilters({})
    onFiltersChange({})
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-card p-6 border border-slate-200 space-y-4">
      <h3 className="font-display font-bold text-lg mb-4">Filtres</h3>
      
      <Select
        label="Type"
        value={filters.type || ''}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('type', e.target.value as Filters['type'])}
      >
        <option value="">Tous</option>
        <option value="location">Location</option>
        <option value="achat">Achat</option>
        <option value="terrain">Terrain</option>
      </Select>

      <Select
        label="Quartier"
        value={filters.quartier || ''}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('quartier', e.target.value)}
      >
        <option value="">Tous les quartiers</option>
        {QUARTIERS_CONAKRY.map((quartier) => (
          <option key={quartier} value={quartier}>
            {quartier}
          </option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Prix min (GNF)"
          type="number"
          value={filters.priceMin || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('priceMin', e.target.value ? Number(e.target.value) : undefined)}
          placeholder="0"
        />
        <Input
          label="Prix max (GNF)"
          type="number"
          value={filters.priceMax || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('priceMax', e.target.value ? Number(e.target.value) : undefined)}
          placeholder="10000000"
        />
      </div>

      <Select
        label="Nombre de pièces"
        value={filters.pieces || ''}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('pieces', e.target.value ? Number(e.target.value) : undefined)}
      >
        <option value="">Tous</option>
        <option value="1">1 pièce</option>
        <option value="2">2 pièces</option>
        <option value="3">3 pièces</option>
        <option value="4">4 pièces</option>
        <option value="5">5+ pièces</option>
      </Select>

      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">
          Appliquer
        </Button>
        <Button type="button" variant="outline" onClick={handleReset}>
          Réinitialiser
        </Button>
      </div>
    </form>
  )
}
