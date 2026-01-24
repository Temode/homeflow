import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

export const signUpSchema = z.object({
  fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(9, 'Numéro de téléphone invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  role: z.enum(['locataire', 'demarcheur', 'proprietaire']),
})

export const listingSchema = z.object({
  title: z.string().min(10, 'Le titre doit contenir au moins 10 caractères'),
  description: z.string().min(50, 'La description doit contenir au moins 50 caractères'),
  type: z.enum(['location', 'achat', 'terrain']),
  price: z.number().positive('Le prix doit être supérieur à 0'),
  quartier: z.string().min(1, 'Le quartier est requis'),
  ville: z.string().default('Conakry'),
  pieces: z.number().positive().optional(),
  surface: z.number().positive().optional(),
  parking: z.boolean().default(false),
  meuble: z.boolean().default(false),
  images: z.array(z.string()).min(1, 'Au moins une image est requise'),
})

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type ListingFormData = z.infer<typeof listingSchema>
