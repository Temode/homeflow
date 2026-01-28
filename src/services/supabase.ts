import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Utiliser un storage key unique pour éviter les conflits
    storageKey: 'homeflow-auth',
    // Désactiver la détection automatique de session dans l'URL
    detectSessionInUrl: false,
    // Utiliser le flow implicite qui est plus simple
    flowType: 'implicit',
  },
  global: {
    headers: {
      'x-application-name': 'homeflow',
    },
  },
})
