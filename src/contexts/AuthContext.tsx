import { createContext, useEffect, useState, ReactNode } from 'react'
import { AuthUser } from '../types/user.types'
import { authService, SignInData, SignUpData } from '../services/auth.service'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (data: SignInData) => Promise<void>
  signUp: (data: SignUpData) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authService.getCurrentUser().then((user) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (data: SignInData) => {
    try {
      const user = await authService.signIn(data)
      setUser(user)
      toast.success('Connexion réussie!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Échec de la connexion'
      toast.error(message)
      throw error
    }
  }

  const signUp = async (data: SignUpData) => {
    try {
      const user = await authService.signUp(data)
      setUser(user)
      toast.success('Compte créé avec succès!')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Échec de l\'inscription'
      toast.error(message)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await authService.signOut()
      setUser(null)
      toast.success('Déconnexion réussie')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Échec de la déconnexion'
      toast.error(message)
      throw error
    }
  }

  const refreshUser = async () => {
    try {
      const user = await authService.getCurrentUser()
      setUser(user)
    } catch (error) {
      console.error('Error refreshing user:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
