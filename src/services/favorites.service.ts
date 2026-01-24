import { supabase } from './supabase'
import { Database } from '../types/database.types'

type Favorite = Database['public']['Tables']['favorites']['Row']
type FavoriteInsert = Database['public']['Tables']['favorites']['Insert']

export const favoritesService = {
  async getFavorites(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        properties (
          *,
          profiles (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async addFavorite(userId: string, propertyId: string) {
    const favorite: FavoriteInsert = {
      user_id: userId,
      property_id: propertyId,
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert(favorite)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async removeFavorite(userId: string, propertyId: string) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId)

    if (error) throw error
  },

  async isFavorite(userId: string, propertyId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .maybeSingle()

    if (error) throw error
    return !!data
  },

  async getFavoritesCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) throw error
    return count || 0
  },
}
