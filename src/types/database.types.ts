export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: 'locataire' | 'demarcheur' | 'proprietaire' | null
          is_verified: boolean
          bio: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'locataire' | 'demarcheur' | 'proprietaire' | null
          is_verified?: boolean
          bio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'locataire' | 'demarcheur' | 'proprietaire' | null
          is_verified?: boolean
          bio?: string | null
          created_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          type: 'location' | 'achat' | 'terrain'
          price: number
          quartier: string
          ville: string
          pieces: number | null
          surface: number | null
          parking: boolean
          meuble: boolean
          images: string[]
          is_featured: boolean
          status: 'active' | 'loue' | 'vendu' | 'inactif'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          type: 'location' | 'achat' | 'terrain'
          price: number
          quartier: string
          ville?: string
          pieces?: number | null
          surface?: number | null
          parking?: boolean
          meuble?: boolean
          images?: string[]
          is_featured?: boolean
          status?: 'active' | 'loue' | 'vendu' | 'inactif'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          type?: 'location' | 'achat' | 'terrain'
          price?: number
          quartier?: string
          ville?: string
          pieces?: number | null
          surface?: number | null
          parking?: boolean
          meuble?: boolean
          images?: string[]
          is_featured?: boolean
          status?: 'active' | 'loue' | 'vendu' | 'inactif'
          created_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          property_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          property_id: string | null
          participant_1: string
          participant_2: string
          created_at: string
        }
        Insert: {
          id?: string
          property_id?: string | null
          participant_1: string
          participant_2: string
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string | null
          participant_1?: string
          participant_2?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      verifications: {
        Row: {
          id: string
          user_id: string
          cni_number: string | null
          cni_front_url: string | null
          cni_back_url: string | null
          selfie_url: string | null
          status: 'pending' | 'verified' | 'rejected'
          submitted_at: string
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          cni_number?: string | null
          cni_front_url?: string | null
          cni_back_url?: string | null
          selfie_url?: string | null
          status?: 'pending' | 'verified' | 'rejected'
          submitted_at?: string
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          cni_number?: string | null
          cni_front_url?: string | null
          cni_back_url?: string | null
          selfie_url?: string | null
          status?: 'pending' | 'verified' | 'rejected'
          submitted_at?: string
          reviewed_at?: string | null
        }
      }
      reviews: {
        Row: {
          id: string
          demarcheur_id: string
          author_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          demarcheur_id: string
          author_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          demarcheur_id?: string
          author_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
      }
    }
  }
}
