import { Profile } from './user.types'

export type PropertyType = 'location' | 'achat' | 'terrain'
export type PropertyStatus = 'active' | 'loue' | 'vendu' | 'inactif'

export interface Property {
  id: string
  user_id: string
  title: string
  description: string | null
  type: PropertyType
  price: number
  quartier: string
  ville: string
  pieces: number | null
  surface: number | null
  parking: boolean
  meuble: boolean
  images: string[]
  is_featured: boolean
  status: PropertyStatus
  created_at: string
  profiles?: Profile
}

export interface PropertyFilters {
  type?: PropertyType
  quartier?: string
  priceMin?: number
  priceMax?: number
  pieces?: number
  search?: string
  status?: PropertyStatus
  limit?: number
  is_featured?: boolean
}
