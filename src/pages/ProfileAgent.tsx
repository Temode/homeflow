import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Calendar, Star, MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Avatar } from '../components/ui/Avatar'
import { PropertyGrid } from '../components/property/PropertyGrid'
import { ReviewCard } from '../components/agent/ReviewCard'
import { EmptyState } from '../components/common/EmptyState'
import { profilesService } from '../services/profiles.service'
import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { useMessages } from '../hooks/useMessages'
import { Property } from '../types/property.types'
import { Profile } from '../types/user.types'
import { toast } from 'react-hot-toast'

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  author: {
    full_name: string
    avatar_url: string | null
  }
}

export function ProfileAgent() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createConversation } = useMessages()
  
  const [agent, setAgent] = useState<Profile | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadAgentData()
    }
  }, [id])

  const loadAgentData = async () => {
    try {
      setIsLoading(true)
      
      const agentData = await profilesService.getProfile(id!)
      if (!agentData || agentData.role !== 'demarcheur') {
        toast.error('Ce profil n\'existe pas ou n\'est pas un démarcheur')
        navigate('/')
        return
      }
      setAgent(agentData)

      const { data: propertiesData } = await supabase
        .from('properties')
        .select('*, profiles(*)')
        .eq('user_id', id!)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      if (propertiesData) {
        setProperties(propertiesData as Property[])
      }

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`
          *,
          author:profiles!reviews_author_id_fkey(full_name, avatar_url)
        `)
        .eq('demarcheur_id', id!)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (reviewsData) {
        setReviews(reviewsData as Review[])
      }
    } catch (error) {
      console.error('Error loading agent data:', error)
      toast.error('Erreur lors du chargement du profil')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContact = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour contacter ce démarcheur')
      navigate('/connexion')
      return
    }

    if (!agent) return

    if (user.id === agent.id) {
      toast.error('Vous ne pouvez pas vous contacter vous-même')
      return
    }

    try {
      const conversation = await createConversation(agent.id)
      if (conversation) {
        navigate(`/messages?conversation=${conversation.id}`)
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-slate-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-slate-50 flex items-center justify-center">
          <EmptyState
            icon={MapPin}
            title="Profil introuvable"
            description="Ce démarcheur n'existe pas ou n'est plus actif."
            actionLabel="Retour à l'accueil"
            onAction={() => navigate('/')}
          />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <Avatar
                name={agent.full_name || 'Démarcheur'}
                imageUrl={agent.avatar_url}
                isVerified={agent.is_verified}
                size="lg"
                className="mx-auto md:mx-0"
              />

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">
                  {agent.full_name || 'Démarcheur'}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{properties.length} annonces</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>
                      Membre depuis{' '}
                      {formatDistanceToNow(new Date(agent.created_at), { locale: fr })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-warning text-warning" />
                    <span>
                      {calculateAverageRating()} ({reviews.length} avis)
                    </span>
                  </div>
                </div>

                {agent.bio && (
                  <p className="text-slate-700 mb-6 leading-relaxed">{agent.bio}</p>
                )}

                <Button onClick={handleContact} size="md">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contacter
                </Button>
              </div>
            </div>
          </Card>

          <div className="mb-8">
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">
              Annonces de {agent.full_name || 'ce démarcheur'}
            </h2>
            {properties.length === 0 ? (
              <EmptyState
                icon={MapPin}
                title="Aucune annonce"
                description="Ce démarcheur n'a pas encore publié d'annonces."
              />
            ) : (
              <PropertyGrid properties={properties} />
            )}
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">
              Avis des clients
            </h2>
            {reviews.length === 0 ? (
              <EmptyState
                icon={Star}
                title="Aucun avis"
                description="Ce démarcheur n'a pas encore reçu d'avis."
              />
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    rating={review.rating}
                    comment={review.comment}
                    authorName={review.author.full_name}
                    authorAvatar={review.author.avatar_url}
                    createdAt={review.created_at}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
