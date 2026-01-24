import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { signUpSchema, SignUpFormData } from '../utils/validators'
import { useAuth } from '../hooks/useAuth'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'

export default function SignUp() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: 'locataire',
    },
  })

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    try {
      await signUp(data)
      navigate('/')
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 py-12">
          <div>
            <h2 className="mt-6 text-center text-3xl font-display font-bold text-slate-900">
              Créer un compte
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              Ou{' '}
              <Link to="/connexion" className="font-medium text-primary hover:text-primary/80">
                connectez-vous à votre compte
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <Input
                label="Nom complet"
                type="text"
                {...register('fullName')}
                error={errors.fullName?.message}
                placeholder="Votre nom complet"
              />
              <Input
                label="Email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
                placeholder="votre@email.com"
              />
              <Input
                label="Téléphone"
                type="tel"
                {...register('phone')}
                error={errors.phone?.message}
                placeholder="+224 xxx xxx xxx"
              />
              <Input
                label="Mot de passe"
                type="password"
                {...register('password')}
                error={errors.password?.message}
                placeholder="••••••••"
                helperText="Au moins 6 caractères"
              />
              <Select
                label="Je suis"
                {...register('role')}
                error={errors.role?.message}
              >
                <option value="locataire">Locataire</option>
                <option value="demarcheur">Démarcheur immobilier</option>
                <option value="proprietaire">Propriétaire</option>
              </Select>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-slate-900">
                J'accepte les{' '}
                <a href="#" className="text-primary hover:text-primary/80">
                  conditions d'utilisation
                </a>
              </label>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Créer mon compte
            </Button>
          </form>
        </div>
      </div>

      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <div className="text-center text-white p-12">
            <h3 className="text-4xl font-display font-bold mb-4">
              Rejoignez HomeFlow
            </h3>
            <p className="text-xl opacity-90 mb-8">
              Des milliers d'annonces vous attendent
            </p>
            <div className="space-y-4 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold">Démarcheurs vérifiés</h4>
                  <p className="text-sm opacity-90">Système KYC pour votre sécurité</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold">Paiement sécurisé</h4>
                  <p className="text-sm opacity-90">Transactions protégées</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold">Support dédié</h4>
                  <p className="text-sm opacity-90">Une équipe à votre écoute</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
