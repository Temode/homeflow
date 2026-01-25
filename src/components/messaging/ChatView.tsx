import { useEffect, useRef } from 'react'
import { Info, ArrowLeft } from 'lucide-react'
import { Conversation, Message } from '../../types/message.types'
import { Avatar } from '../ui/Avatar'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'

interface ChatViewProps {
  conversation: Conversation | null
  messages: Message[]
  currentUserId: string
  onSendMessage: (content: string) => void
  onBack?: () => void
}

export function ChatView({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  onBack,
}: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="text-center text-slate-500">
          <p className="text-lg">Sélectionnez une conversation</p>
          <p className="text-sm mt-2">Choisissez une conversation pour commencer à échanger</p>
        </div>
      </div>
    )
  }

  const otherParticipant =
    conversation.participant_1 === currentUserId
      ? conversation.participant_2_profile
      : conversation.participant_1_profile

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 text-slate-600 hover:text-primary transition-colors -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Avatar
            name={otherParticipant?.full_name || 'Utilisateur'}
            imageUrl={otherParticipant?.avatar_url}
            isVerified={otherParticipant?.is_verified}
            size="md"
          />
          <div>
            <p className="font-medium text-slate-900">
              {otherParticipant?.full_name || 'Utilisateur'}
            </p>
            {conversation.property && (
              <p className="text-sm text-slate-600">{conversation.property.title}</p>
            )}
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Info className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500">
            <p>Aucun message. Envoyez le premier message!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={message.sender_id === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatInput onSend={onSendMessage} />
    </div>
  )
}
