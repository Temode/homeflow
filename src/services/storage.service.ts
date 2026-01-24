import { supabase } from './supabase'

export const storageService = {
  async uploadPropertyImage(file: File, propertyId: string): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${propertyId}-${Date.now()}.${fileExt}`
    const filePath = `properties/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath)

    return publicUrl
  },

  async uploadPropertyImages(files: File[], propertyId: string): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadPropertyImage(file, propertyId))
    return Promise.all(uploadPromises)
  },

  async uploadVerificationDoc(file: File, userId: string, type: 'cni_front' | 'cni_back' | 'selfie'): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${type}.${fileExt}`
    const filePath = `verifications/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('verification-documents')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(filePath)

    return publicUrl
  },

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
  },
}
