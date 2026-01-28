import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Phone, MessageCircle, Shield, Star, Clock, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { MiniChat } from '../messaging/MiniChat'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../utils/cn'
import toast from 'react-hot-toast'

interface Agent {
  id: string
  full_name: string
  avatar_url?: string
  is_verified?: boolean
  bio?: string
  phone?: string
  created_at?: string
}

interface Property {
  id: string
  title: string
}

interface AgentContactCardProps {
  agent: Agent
  property: Property
  className?: string
}

export function AgentContactCard({ agent, property, className }: AgentContactCardProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showChat, setShowChat] = useState(false)
  const [showPhone, setShowPhone] = useState(false)

  const handleCall = () => {
    if (!user) {
      toast.error('Connectez-vous pour voir le numéro')
      navigate('/connexion')
      return
    }

    if (agent.phone) {
      setShowPhone(!showPhone)
    } else {
      toast.error('Numéro non disponible')
    }
  }

  const handleMessage = () => {
    if (!user) {
      toast.error('Connectez-vous pour envoyer un message')
      navigate('/connexion')
      return
    }

    if (user.id === agent.id) {
      toast.error('Vous ne pouvez pas vous contacter vous-même')
      return
    }

    setShowChat(!showChat)
  }

  const getMemberSince = () => {
    if (!agent.created_at) return null
    const date = new Date(agent.created_at)
    const now = new Date()
    const months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth())

    if (months < 1) return 'Nouveau membre'
    if (months < 12) return `Membre depuis ${months} mois`
    const years = Math.floor(months / 12)
    return `Membre depuis ${years} an${years > 1 ? 's' : ''}`
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 pt-6 pb-4">
          <div className="flex items-start gap-4">
            <Link to={`/demarcheur/${agent.id}`} className="flex-shrink-0">
              <Avatar
                name={agent.full_name}
                imageUrl={agent.avatar_url}
                size="xl"
                isVerified={agent.is_verified}
                className="ring-4 ring-white shadow-lg"
              />
            </Link>

            <div className="flex-1 min-w-0">
              <Link
                to={`/demarcheur/${agent.id}`}
                className="group"
              >
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors flex items-center gap-2">
                  {agent.full_name}
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
              </Link>

              <p className="text-sm text-slate-500 mt-0.5">
                Démarcheur immobilier
              </p>

              <div className="flex flex-wrap gap-2 mt-3">
                {agent.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    <Shield className="w-3 h-3" />
                    Vérifié
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  <Star className="w-3 h-3 fill-current" />
                  4.8
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px bg-slate-100">
          <div className="bg-white px-4 py-3 text-center">
            <p className="text-lg font-bold text-slate-900">24h</p>
            <p className="text-xs text-slate-500">Temps de réponse</p>
          </div>
          <div className="bg-white px-4 py-3 text-center">
            <p className="text-lg font-bold text-slate-900">98%</p>
            <p className="text-xs text-slate-500">Taux de réponse</p>
          </div>
        </div>

        {agent.bio && (
          <div className="px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-600 line-clamp-3">{agent.bio}</p>
          </div>
        )}

        {getMemberSince() && (
          <div className="px-6 py-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            {getMemberSince()}
          </div>
        )}

        <div className="p-4 border-t border-slate-100 space-y-3">
          <Button
            onClick={handleCall}
            variant="outline"
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {showPhone && agent.phone ? agent.phone : 'Appeler'}
            </span>
            {showPhone ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          <Button
            onClick={handleMessage}
            className="w-full"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {showChat ? 'Masquer le chat' : 'Envoyer un message'}
          </Button>
        </div>
      </div>

      {showChat && (
        <MiniChat
          agentId={agent.id}
          agentName={agent.full_name}
          agentAvatar={agent.avatar_url}
          agentVerified={agent.is_verified}
          propertyId={property.id}
          propertyTitle={property.title}
          onClose={() => setShowChat(false)}
        />
      )}

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <h4 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Conseils de sécurité
        </h4>
        <ul className="text-xs text-amber-800 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            Ne payez jamais avant de visiter le bien
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            Vérifiez les documents de propriété
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            Privilégiez les démarcheurs vérifiés
          </li>
        </ul>
      </div>
    </div>
  )
}
