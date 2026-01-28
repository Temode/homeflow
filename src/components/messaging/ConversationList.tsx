import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Conversation } from '../../types/message.types'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversationId?: string
  currentUserId: string
  onSelectConversation: (conversation: Conversation) => void
}

export function ConversationList({
  conversations,
  selectedConversationId,
  currentUserId,
  onSelectConversation,
}: ConversationListProps) {
  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.other_participant
  }

  return (
    <div className="h-full overflow-y-auto border-r border-slate-200">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-xl font-display font-bold text-slate-900">Messages</h2>
      </div>

      <div className="divide-y divide-slate-100">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>Aucune conversation</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation)
            const isSelected = conversation.id === selectedConversationId

            return (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={cn(
                  'w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left',
                  isSelected && 'bg-slate-100'
                )}
              >
                <Avatar
                  name={otherParticipant?.full_name || 'Utilisateur'}
                  imageUrl={otherParticipant?.avatar_url}
                  isVerified={otherParticipant?.is_verified}
                  size="md"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-slate-900 truncate">
                      {otherParticipant?.full_name || 'Utilisateur'}
                    </p>
                    {conversation.last_message && (
                      <span className="text-xs text-slate-500 ml-2 shrink-0">
                        {formatDistanceToNow(new Date(conversation.last_message.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    )}
                  </div>

                  {conversation.property && (
                    <p className="text-xs text-slate-600 mb-1 truncate">
                      {conversation.property.title}
                    </p>
                  )}

                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-slate-600 truncate">
                      {conversation.last_message?.content || 'Nouvelle conversation'}
                    </p>
                    {((conversation.participant_1 === currentUserId ? conversation.unread_count_1 : conversation.unread_count_2) > 0) && (
                      <Badge variant="success" className="shrink-0">
                        {conversation.participant_1 === currentUserId ? conversation.unread_count_1 : conversation.unread_count_2}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
