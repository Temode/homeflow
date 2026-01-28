export type UserRole = 'visiteur' | 'locataire' | 'demarcheur' | 'proprietaire'

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole | null
  is_verified: boolean
  bio: string | null
  created_at: string
}

export interface AuthUser {
  id: string
  email: string
  profile: Profile | null
}
