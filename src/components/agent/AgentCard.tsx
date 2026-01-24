import { MessageCircle, Star } from 'lucide-react'
import { Profile } from '../../types/user.types'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'

interface AgentCardProps {
  agent: Profile
  onContact?: () => void
}

export function AgentCard({ agent, onContact }: AgentCardProps) {
  return (
    <div className="bg-white rounded-card border border-slate-200 p-6">
      <h3 className="font-display font-bold text-lg mb-4">Démarcheur</h3>
      
      <div className="flex items-start gap-4 mb-4">
        <Avatar 
          name={agent.full_name || 'Agent'}
          imageUrl={agent.avatar_url}
          isVerified={agent.is_verified}
          size="lg"
        />
        <div className="flex-1">
          <h4 className="font-bold text-slate-900 mb-1">{agent.full_name || 'Agent'}</h4>
          <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
            <Star className="w-4 h-4 fill-warning text-warning" />
            <span>4.8</span>
            <span className="text-slate-400">•</span>
            <span>12 avis</span>
          </div>
          {agent.bio && (
            <p className="text-sm text-slate-600">{agent.bio}</p>
          )}
        </div>
      </div>

      {onContact && (
        <Button onClick={onContact} className="w-full">
          <MessageCircle className="w-4 h-4 mr-2" />
          Contacter
        </Button>
      )}
    </div>
  )
}
