import { useState, useRef, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Save } from 'lucide-react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { useAuth } from '../hooks/useAuth'
import { profilesService } from '../services/profiles.service'
import { toast } from 'react-hot-toast'

export function Profile() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: user?.profile?.full_name || '',
    phone: user?.profile?.phone || '',
    bio: user?.profile?.bio || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  if (!user) {
    navigate('/connexion')
    return null
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('La taille du fichier ne doit pas dépasser 2 Mo')
      return
    }

    try {
      setIsUploadingAvatar(true)
      await profilesService.uploadAvatar(user.id, file)
      await refreshUser()
      toast.success('Photo de profil mise à jour')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast.error('Erreur lors du téléchargement de la photo')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSaving(true)
      await profilesService.updateProfile(user.id, formData)
      await refreshUser()
      setIsEditing(false)
      toast.success('Profil mis à jour avec succès')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Erreur lors de la mise à jour du profil')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    try {
      setIsSaving(true)
      toast('Fonctionnalité de changement de mot de passe à implémenter')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Erreur lors du changement de mot de passe')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Mon Profil</h1>
          <p className="text-slate-600 mt-2">Gérez vos informations personnelles</p>
        </div>

        <Card className="p-6">
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-200">
            <div className="relative">
              <Avatar
                name={user.profile?.full_name || user.email}
                imageUrl={user.profile?.avatar_url}
                isVerified={user.profile?.is_verified}
                size="lg"
              />
              <button
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {user.profile?.full_name || 'Utilisateur'}
              </h2>
              <p className="text-slate-600">{user.email}</p>
              <p className="text-sm text-slate-500 mt-1 capitalize">
                {user.profile?.role || 'Utilisateur'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="space-y-4 mb-6">
              <Input
                label="Nom complet"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                disabled={!isEditing}
                required
              />
              <Input
                label="Téléphone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
              />
              <Input
                label="Email"
                type="email"
                value={user.email}
                disabled
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-input focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Parlez-nous de vous..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              {!isEditing ? (
                <Button type="button" onClick={() => setIsEditing(true)} variant="primary">
                  Modifier le profil
                </Button>
              ) : (
                <>
                  <Button type="submit" variant="primary" disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        full_name: user.profile?.full_name || '',
                        phone: user.profile?.phone || '',
                        bio: user.profile?.bio || '',
                      })
                    }}
                    disabled={isSaving}
                  >
                    Annuler
                  </Button>
                </>
              )}
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-display font-bold mb-4">Changer le mot de passe</h3>
          <form onSubmit={handleChangePassword}>
            <div className="space-y-4 mb-6">
              <Input
                label="Mot de passe actuel"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                required
              />
              <Input
                label="Nouveau mot de passe"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                required
              />
              <Input
                label="Confirmer le mot de passe"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                required
              />
            </div>
            <Button type="submit" variant="primary" disabled={isSaving}>
              Changer le mot de passe
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
