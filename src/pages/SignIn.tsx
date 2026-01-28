import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { signInSchema, SignInFormData } from '../utils/validators'
import { useAuth } from '../hooks/useAuth'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export default function SignIn() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true)
    try {
      const user = await signIn(data)
      
      // Redirect based on user role
      if (user?.profile?.role === 'demarcheur') {
        navigate('/dashboard/demarcheur')
      } else {
        navigate('/dashboard')
      }
    } catch (error) {
      console.error(error)
      const message = error instanceof Error ? error.message : 'Erreur de connexion. Vérifiez vos identifiants.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-display font-bold text-slate-900">
              Connexion à HomeFlow
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              Ou{' '}
              <Link to="/inscription" className="font-medium text-primary hover:text-primary/80">
                créez un nouveau compte
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                placeholder="votre@email.com"
              />
              <Input
                label="Mot de passe"
                type="password"
                {...register('password')}
                error={errors.password?.message}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary/80">
                  Mot de passe oublié?
                </a>
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Se connecter
            </Button>
          </form>
        </div>
      </div>

      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <div className="text-center text-white p-12">
            <h3 className="text-4xl font-display font-bold mb-4">
              Bienvenue sur HomeFlow
            </h3>
            <p className="text-xl opacity-90">
              Trouvez votre logement idéal en toute confiance
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
