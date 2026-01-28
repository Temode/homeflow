import { useState, useEffect, useRef } from 'react'
import { Send, X, Maximize2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useMessages } from '../../hooks/useMessages'
import { Message } from '../../types/message.types'
import { Avatar } from '../ui/Avatar'
import toast from 'react-hot-toast'
import { cn } from '../../utils/cn'

interface MiniChatProps {
  agentId: string
  agentName: string
  agentAvatar?: string
  agentVerified?: boolean
  propertyId: string
  propertyTitle: string
  onClose?: () => void
  className?: string
}

export function MiniChat({
  agentId,
  agentName,
  agentAvatar,
  agentVerified,
  propertyId,
  propertyTitle,
  onClose,
  className
}: MiniChatProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { conversations, sendMessage, createConversation } = useMessages()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return

    const existingConversation = conversations.find(c =>
      (c.participant_1 === agentId || c.participant_2 === agentId) &&
      c.property_id === propertyId
    )

    if (existingConversation) {
      setConversationId(existingConversation.id)
      setMessages(existingConversation.messages || [])
    }
  }, [conversations, agentId, propertyId, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!message.trim() || loading) return

    if (!user) {
      toast.error('Connectez-vous pour envoyer un message')
      navigate('/connexion')
      return
    }

    if (user.id === agentId) {
      toast.error('Vous ne pouvez pas vous envoyer un message')
      return
    }

    setLoading(true)
    try {
      let convId = conversationId

      if (!convId) {
        const conv = await createConversation(agentId, propertyId)
        if (conv) {
          convId = conv.id
          setConversationId(conv.id)
        }
      }

      if (convId) {
        const sentMessage = await sendMessage(convId, message.trim())
        if (sentMessage) {
          setMessages(prev => [...prev, sentMessage])
        }
        setMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!user) {
    return (
      <div className={cn("bg-white rounded-xl border border-slate-200 p-4", className)}>
        <div className="text-center py-6">
          <p className="text-slate-600 text-sm mb-4">
            Connectez-vous pour envoyer un message
          </p>
          <Link
            to="/connexion"
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col",
      className
    )}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div className="flex items-center gap-2">
          <Avatar
            name={agentName}
            imageUrl={agentAvatar}
            size="sm"
            isVerified={agentVerified}
          />
          <div>
            <h4 className="text-sm font-bold text-slate-900">Chat rapide</h4>
            <p className="text-xs text-slate-500 truncate max-w-[150px]">
              {propertyTitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {conversationId && (
            <Link
              to={`/messages?conversation=${conversationId}`}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-primary transition-colors"
              title="Ouvrir dans Messages"
            >
              <Maximize2 className="w-4 h-4" />
            </Link>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-3 space-y-2 max-h-[200px] overflow-y-auto bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-slate-400">
              Commencez la conversation
            </p>
          </div>
        ) : (
          messages.slice(-3).map(msg => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[85%] px-3 py-2 rounded-2xl text-sm",
                msg.sender_id === user?.id
                  ? "ml-auto bg-primary text-white rounded-br-md"
                  : "mr-auto bg-white text-slate-900 border border-slate-100 rounded-bl-md"
              )}
            >
              <p className="line-clamp-2">{msg.content}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center gap-2 p-3 border-t border-slate-100">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Votre message..."
          className="flex-1 px-3 py-2 text-sm bg-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || loading}
          className={cn(
            "p-2 rounded-full transition-all",
            message.trim()
              ? "bg-primary text-white hover:bg-primary/90"
              : "bg-slate-100 text-slate-400"
          )}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
