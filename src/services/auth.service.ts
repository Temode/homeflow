import { supabase } from './supabase'
import { AuthUser, UserRole } from '../types/user.types'

export interface SignUpData {
  email: string
  password: string
  fullName: string
  phone: string
  role: UserRole
}

export interface SignInData {
  email: string
  password: string
}

export const authService = {
  async signUp(data: SignUpData): Promise<AuthUser> {
    const { email, password, fullName, phone, role } = data

    // Sign up user with metadata - profile will be created automatically by trigger
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
          role,
        },
      },
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    // Le trigger handle_new_user crée automatiquement le profil
    // On attend un peu puis on récupère le profil créé
    await new Promise(resolve => setTimeout(resolve, 500))

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    // Si le profil n'existe pas encore, on met à jour avec les infos complètes
    if (profileError || !profile) {
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: fullName,
          phone,
          role,
        })
        .select()
        .single()

      return {
        id: authData.user.id,
        email: authData.user.email!,
        profile: updatedProfile,
      }
    }

    // Mettre à jour le profil avec les infos complètes (phone n'est pas dans le trigger)
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        role,
      })
      .eq('id', authData.user.id)
      .select()
      .single()

    return {
      id: authData.user.id,
      email: authData.user.email!,
      profile: updatedProfile || profile,
    }
  },

  async signIn(data: SignInData): Promise<AuthUser> {
    const { email, password } = data

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to sign in')

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) throw profileError

    return {
      id: authData.user.id,
      email: authData.user.email!,
      profile,
    }
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) return null

    return {
      id: user.id,
      email: user.email!,
      profile,
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        callback({
          id: session.user.id,
          email: session.user.email!,
          profile: profile || null,
        })
      } else {
        callback(null)
      }
    })
  },
}
