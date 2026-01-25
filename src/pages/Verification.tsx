import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Shield, Upload, CheckCircle, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useAuth } from '../hooks/useAuth'
import { storageService } from '../services/storage.service'
import { supabase } from '../services/supabase'

const verificationSchema = z.object({
  cniNumber: z.string().min(5, 'Numéro CNI invalide'),
  cniFront: z.any(),
  cniBack: z.any(),
  selfie: z.any(),
})

type VerificationFormData = z.infer<typeof verificationSchema>

type VerificationStatus = 'none' | 'pending' | 'verified' | 'rejected'

interface Verification {
  id: string
  status: VerificationStatus
  cni_number?: string
  cni_front_url?: string
  cni_back_url?: string
  selfie_url?: string
  submitted_at?: string
  reviewed_at?: string
}

export function Verification() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [verification, setVerification] = useState<Verification | null>(null)
  const [cniFrontPreview, setCniFrontPreview] = useState<string | null>(null)
  const [cniBackPreview, setCniBackPreview] = useState<string | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
  })

  useEffect(() => {
    if (!user) {
      navigate('/connexion')
      return
    }

    if (user.profile?.role !== 'demarcheur') {
      toast.error('La vérification est réservée aux démarcheurs')
      navigate('/dashboard')
      return
    }

    loadVerification()
  }, [user, navigate])

  const loadVerification = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('verifications')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setVerification(data)
      }
    } catch (error) {
      console.error('Error loading verification:', error)
    }
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'front' | 'back' | 'selfie'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier ne doit pas dépasser 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      if (type === 'front') setCniFrontPreview(result)
      else if (type === 'back') setCniBackPreview(result)
      else setSelfiePreview(result)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: VerificationFormData) => {
    if (!user) return

    if (!data.cniFront?.[0] || !data.cniBack?.[0] || !data.selfie?.[0]) {
      toast.error('Veuillez télécharger tous les documents requis')
      return
    }

    setIsLoading(true)

    try {
      const cniFrontFile = data.cniFront[0] as File
      const cniBackFile = data.cniBack[0] as File
      const selfieFile = data.selfie[0] as File

      const cniFrontUrl = await storageService.uploadVerificationDoc(cniFrontFile, user.id, 'cni_front')
      const cniBackUrl = await storageService.uploadVerificationDoc(cniBackFile, user.id, 'cni_back')
      const selfieUrl = await storageService.uploadVerificationDoc(selfieFile, user.id, 'selfie')

      const { error } = await supabase.from('verifications').insert({
        user_id: user.id,
        cni_number: data.cniNumber,
        cni_front_url: cniFrontUrl,
        cni_back_url: cniBackUrl,
        selfie_url: selfieUrl,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })

      if (error) throw error

      toast.success('Documents soumis avec succès! Vérification en cours.')
      await loadVerification()
    } catch (error) {
      console.error('Error submitting verification:', error)
      const message = error instanceof Error ? error.message : 'Erreur lors de la soumission'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user || user.profile?.role !== 'demarcheur') {
    return null
  }

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="success" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Vérifié
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="warning" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            En attente
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="danger" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Rejeté
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900">
                Vérification KYC
              </h1>
              <p className="text-slate-600">Confirmez votre identité pour gagner la confiance des clients</p>
            </div>
          </div>

          {verification && (
            <div className="flex items-center gap-3">
              <span className="text-slate-600">Statut actuel:</span>
              {getStatusBadge(verification.status)}
            </div>
          )}
        </div>

        {verification?.status === 'verified' ? (
          <Card className="p-8 text-center">
            <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-3">
              Votre compte est vérifié!
            </h2>
            <p className="text-slate-600 mb-6">
              Vous avez maintenant accès à toutes les fonctionnalités de la plateforme.
            </p>
            <Badge variant="success" className="inline-flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Démarcheur vérifié
            </Badge>
          </Card>
        ) : verification?.status === 'pending' ? (
          <Card className="p-8 text-center">
            <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-warning" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-3">
              Vérification en cours
            </h2>
            <p className="text-slate-600 mb-6">
              Vos documents sont en cours de vérification. Vous recevrez une notification une fois le processus terminé (généralement sous 24-48h).
            </p>
            <div className="text-sm text-slate-500">
              <p>Soumis le {verification.submitted_at ? new Date(verification.submitted_at).toLocaleDateString('fr-FR') : 'N/A'}</p>
            </div>
          </Card>
        ) : (
          <Card className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-display font-bold mb-4">Informations CNI</h3>
                <Input
                  label="Numéro de CNI"
                  placeholder="Ex: 123456789"
                  {...register('cniNumber')}
                  error={errors.cniNumber?.message}
                />
              </div>

              <div>
                <h3 className="text-lg font-display font-bold mb-4">Documents à fournir</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      CNI Recto
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-card cursor-pointer hover:border-primary transition-colors">
                        {cniFrontPreview ? (
                          <img src={cniFrontPreview} alt="CNI Recto" className="h-full object-contain" />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-600">Cliquez pour télécharger</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          {...register('cniFront')}
                          onChange={(e) => handleFileChange(e, 'front')}
                        />
                      </label>
                    </div>
                    {errors.cniFront && (
                      <p className="mt-1 text-sm text-danger">CNI recto requis</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      CNI Verso
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-card cursor-pointer hover:border-primary transition-colors">
                        {cniBackPreview ? (
                          <img src={cniBackPreview} alt="CNI Verso" className="h-full object-contain" />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-600">Cliquez pour télécharger</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          {...register('cniBack')}
                          onChange={(e) => handleFileChange(e, 'back')}
                        />
                      </label>
                    </div>
                    {errors.cniBack && (
                      <p className="mt-1 text-sm text-danger">CNI verso requis</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Selfie avec CNI
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="flex-1 flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-card cursor-pointer hover:border-primary transition-colors">
                        {selfiePreview ? (
                          <img src={selfiePreview} alt="Selfie" className="h-full object-contain" />
                        ) : (
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-600">Cliquez pour télécharger</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          {...register('selfie')}
                          onChange={(e) => handleFileChange(e, 'selfie')}
                        />
                      </label>
                    </div>
                    {errors.selfie && (
                      <p className="mt-1 text-sm text-danger">Selfie requis</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Conseils pour vos photos :</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Assurez-vous que tous les textes sont lisibles</li>
                  <li>• Évitez les reflets et les ombres</li>
                  <li>• Pour le selfie, tenez votre CNI à côté de votre visage</li>
                  <li>• Taille maximale: 5MB par fichier</li>
                </ul>
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Soumettre ma vérification
              </Button>
            </form>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
