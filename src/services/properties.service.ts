import { supabase } from './supabase'
import { Property, PropertyFilters } from '../types/property.types'

export const propertiesService = {
  async getProperties(filters?: PropertyFilters): Promise<Property[]> {
    let query = supabase
      .from('properties')
      .select('*, profiles(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.quartier) {
      query = query.eq('quartier', filters.quartier)
    }

    if (filters?.priceMin) {
      query = query.gte('price', filters.priceMin)
    }

    if (filters?.priceMax) {
      query = query.lte('price', filters.priceMax)
    }

    if (filters?.pieces) {
      query = query.eq('pieces', filters.pieces)
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  },

  async getPropertyById(id: string): Promise<Property | null> {
    const { data, error } = await supabase
      .from('properties')
      .select('*, profiles(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async createProperty(property: Omit<Property, 'id' | 'created_at'>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .insert(property)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteProperty(id: string): Promise<void> {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  async getUserProperties(userId: string): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*, profiles(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },
}
