import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card } from '../components/ui/Card'
import { listingSchema, ListingFormData } from '../utils/validators'
import { QUARTIERS_CONAKRY } from '../utils/constants'
import { useAuth } from '../hooks/useAuth'
import { propertiesService } from '../services/properties.service'
import { storageService } from '../services/storage.service'
import toast from 'react-hot-toast'

const STEPS = [
  { id: 1, title: 'Informations de base' },
  { id: 2, title: 'Photos' },
  { id: 3, title: 'Localisation' },
  { id: 4, title: 'Tarification' },
  { id: 5, title: 'Récapitulatif' },
]

export default function NewListing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      ville: 'Conakry',
      parking: false,
      meuble: false,
      images: [],
    },
  })

  const formData = watch()

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length + imageFiles.length > 10) {
      toast.error('Vous ne pouvez ajouter que 10 images maximum')
      return
    }

    setImageFiles([...imageFiles, ...files])

    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews([...imagePreviews, ...newPreviews])
  }

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    setImageFiles(newFiles)
    setImagePreviews(newPreviews)
  }

  const nextStep = () => {
    if (currentStep === 2 && imageFiles.length === 0) {
      toast.error('Veuillez ajouter au moins une image')
      return
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const onSubmit = async (data: ListingFormData) => {
    if (imageFiles.length === 0) {
      toast.error('Veuillez ajouter au moins une image')
      return
    }

    setIsSubmitting(true)

    try {
      const tempPropertyId = crypto.randomUUID()

      const imageUrls = await storageService.uploadPropertyImages(imageFiles, tempPropertyId)

      await propertiesService.createProperty({
        ...data,
        user_id: user!.id,
        images: imageUrls,
        is_featured: false,
        status: 'active',
        pieces: data.pieces || null,
        surface: data.surface || null,
      })

      toast.success('Annonce créée avec succès!')
      navigate('/dashboard/demarcheur')
    } catch (error) {
      console.error('Error creating listing:', error)
      toast.error('Erreur lors de la création de l\'annonce')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
            Créer une nouvelle annonce
          </h1>
          <p className="text-slate-600">Remplissez les informations pour publier votre propriété</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                    currentStep > step.id
                      ? 'bg-primary text-white'
                      : currentStep === step.id
                      ? 'bg-primary text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-12 md:w-24 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-primary' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-sm">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`hidden md:block ${
                  currentStep === step.id ? 'text-primary font-medium' : 'text-slate-600'
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="p-8 mb-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold mb-6">Informations de base</h2>
                <Input
                  label="Titre de l'annonce"
                  {...register('title')}
                  error={errors.title?.message}
                  placeholder="Ex: Villa moderne 4 pièces avec jardin"
                />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={6}
                    className="w-full px-4 py-2 border border-slate-300 rounded-input focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Décrivez votre propriété en détail..."
                  />
                  {errors.description && (
                    <p className="text-sm text-danger mt-1">{errors.description.message}</p>
                  )}
                </div>
                <Select label="Type de bien" {...register('type')} error={errors.type?.message}>
                  <option value="location">Location</option>
                  <option value="achat">Achat</option>
                  <option value="terrain">Terrain</option>
                </Select>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold mb-6">Photos</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ajouter des photos (max 10)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-input file:border-0
                      file:text-sm file:font-medium
                      file:bg-primary file:text-white
                      hover:file:bg-primary/90"
                  />
                </div>
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-danger text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold mb-6">Localisation</h2>
                <Input
                  label="Ville"
                  {...register('ville')}
                  disabled
                  error={errors.ville?.message}
                />
                <Select
                  label="Quartier"
                  {...register('quartier')}
                  error={errors.quartier?.message}
                >
                  <option value="">Sélectionnez un quartier</option>
                  {QUARTIERS_CONAKRY.map((quartier) => (
                    <option key={quartier} value={quartier}>
                      {quartier}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold mb-6">Tarification & Caractéristiques</h2>
                <Input
                  label="Prix (GNF)"
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  error={errors.price?.message}
                  placeholder="5000000"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Nombre de pièces"
                    type="number"
                    {...register('pieces', { valueAsNumber: true })}
                    error={errors.pieces?.message}
                    placeholder="4"
                  />
                  <Input
                    label="Surface (m²)"
                    type="number"
                    {...register('surface', { valueAsNumber: true })}
                    error={errors.surface?.message}
                    placeholder="120"
                  />
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('parking')}
                      className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary"
                    />
                    <span className="text-slate-700">Parking disponible</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('meuble')}
                      className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary"
                    />
                    <span className="text-slate-700">Meublé</span>
                  </label>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-display font-bold mb-6">Récapitulatif</h2>
                <div className="space-y-4 bg-slate-50 p-6 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-600">Titre</p>
                    <p className="font-medium">{formData.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Type</p>
                    <p className="font-medium">{formData.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Localisation</p>
                    <p className="font-medium">{formData.quartier}, {formData.ville}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Prix</p>
                    <p className="font-medium">{formData.price?.toLocaleString()} GNF</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Caractéristiques</p>
                    <p className="font-medium">
                      {formData.pieces} pièces • {formData.surface}m²
                      {formData.parking && ' • Parking'}
                      {formData.meuble && ' • Meublé'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Photos ({imageFiles.length})</p>
                    <div className="grid grid-cols-4 gap-2">
                      {imagePreviews.slice(0, 4).map((preview, index) => (
                        <img
                          key={index}
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <div className="flex justify-between">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
            )}
            <div className="ml-auto flex gap-3">
              {currentStep < STEPS.length ? (
                <Button type="button" onClick={nextStep}>
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" isLoading={isSubmitting}>
                  Publier l'annonce
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
