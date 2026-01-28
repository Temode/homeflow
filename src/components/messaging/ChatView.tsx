import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, MoreVertical, Phone, Archive, Ban } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Conversation, Message, TypingStatus } from '../../types/message.types'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { Avatar } from '../ui/Avatar'
import { messagesService } from '../../services/messages.service'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import { format, isToday, isYesterday } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ChatViewProps {
  conversation: Conversation
  onBack?: () => void
}

export function ChatView({ conversation, onBack }: ChatViewProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const otherParticipant = conversation.other_participant

  useEffect(() => {
    loadMessages()

    const typingSubscription = messagesService.subscribeToTypingStatus(
      conversation.id,
      (status: TypingStatus) => {
        if (status.user_id !== user?.id) {
          setIsOtherTyping(status.is_typing)
        }
      }
    )

    return () => {
      typingSubscription.unsubscribe()
    }
  }, [conversation.id, user?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOtherTyping])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const data = await messagesService.getMessages(conversation.id)
      setMessages(data)

      if (user?.id) {
        await messagesService.markAsRead(conversation.id, user.id)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      toast.error('Erreur lors du chargement des messages')
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (content: string, attachments?: { file: File; type: 'image' | 'file' }[]) => {
    try {
      for (const attachment of attachments || []) {
        const uploaded = await messagesService.uploadAttachment(attachment.file, conversation.id)
        const newMessage = await messagesService.sendMessage({
          conversation_id: conversation.id,
          content: attachment.type === 'image' ? 'Image partagée' : attachment.file.name,
          message_type: attachment.type,
          attachment_url: uploaded.url,
          attachment_name: uploaded.name,
          attachment_size: uploaded.size,
          reply_to_id: replyTo?.id
        })
        setMessages(prev => [...prev, newMessage])
      }

      if (content) {
        const newMessage = await messagesService.sendMessage({
          conversation_id: conversation.id,
          content,
          message_type: 'text',
          reply_to_id: replyTo?.id
        })
        setMessages(prev => [...prev, newMessage])
      }

      setReplyTo(null)
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Erreur lors de l\'envoi du message')
    }
  }

  const handleTyping = (isTyping: boolean) => {
    messagesService.setTypingStatus(conversation.id, isTyping)
  }

  const handleDelete = async (messageId: string) => {
    try {
      await messagesService.deleteMessage(messageId)
      setMessages(prev => prev.map(m =>
        m.id === messageId
          ? { ...m, is_deleted: true, content: 'Ce message a été supprimé' }
          : m
      ))
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleArchive = async () => {
    try {
      await messagesService.archiveConversation(conversation.id)
      toast.success('Conversation archivée')
      onBack?.()
    } catch (error) {
      toast.error('Erreur lors de l\'archivage')
    }
  }

  const handleBlock = async () => {
    try {
      if (conversation.is_blocked_by) {
        await messagesService.unblockUser(conversation.id)
        toast.success('Utilisateur débloqué')
      } else {
        await messagesService.blockUser(conversation.id)
        toast.success('Utilisateur bloqué')
      }
    } catch (error) {
      toast.error('Erreur')
    }
  }

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = []

    messages.forEach(message => {
      const messageDate = new Date(message.created_at)
      let dateLabel: string

      if (isToday(messageDate)) {
        dateLabel = "Aujourd'hui"
      } else if (isYesterday(messageDate)) {
        dateLabel = "Hier"
      } else {
        dateLabel = format(messageDate, 'EEEE d MMMM yyyy', { locale: fr })
      }

      const lastGroup = groups[groups.length - 1]
      if (lastGroup && lastGroup.date === dateLabel) {
        lastGroup.messages.push(message)
      } else {
        groups.push({ date: dateLabel, messages: [message] })
      }
    })

    return groups
  }

  const isBlocked = conversation.is_blocked_by === user?.id

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="flex items-center gap-4 px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
        {onBack && (
          <button
            onClick={onBack}
            className="lg:hidden p-2 -ml-2 hover:bg-slate-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
        )}

        <Link
          to={`/demarcheur/${otherParticipant?.id}`}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className="relative">
            <Avatar
              name={otherParticipant?.full_name || 'U'}
              imageUrl={otherParticipant?.avatar_url}
              size="md"
              isVerified={otherParticipant?.is_verified}
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-900 truncate">
              {otherParticipant?.full_name || 'Utilisateur'}
            </h2>
            {conversation.property && (
              <p className="text-xs text-slate-500 truncate">
                {conversation.property.title}
              </p>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
            <Phone className="w-5 h-5" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-600"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-100 py-1 w-48 z-10">
                <button
                  onClick={() => { handleArchive(); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                >
                  <Archive className="w-4 h-4" />
                  Archiver
                </button>
                <button
                  onClick={() => { handleBlock(); setShowMenu(false) }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                >
                  <Ban className="w-4 h-4" />
                  {isBlocked ? 'Débloquer' : 'Bloquer'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Avatar
                name={otherParticipant?.full_name || 'U'}
                imageUrl={otherParticipant?.avatar_url}
                size="lg"
              />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">
              Démarrez la conversation
            </h3>
            <p className="text-sm text-slate-500 max-w-xs">
              Envoyez un message à {otherParticipant?.full_name || 'cet utilisateur'}
              pour commencer à discuter
            </p>
          </div>
        ) : (
          <>
            {groupMessagesByDate(messages).map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-3">
                <div className="flex items-center justify-center">
                  <span className="px-3 py-1 bg-white text-xs text-slate-500 rounded-full shadow-sm">
                    {group.date}
                  </span>
                </div>

                {group.messages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.sender_id === user?.id}
                    showAvatar={
                      index === 0 ||
                      group.messages[index - 1]?.sender_id !== message.sender_id
                    }
                    onReply={setReplyTo}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ))}

            {isOtherTyping && (
              <TypingIndicator name={otherParticipant?.full_name} />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {conversation.is_blocked_by ? (
        <div className="p-4 bg-slate-100 text-center text-sm text-slate-500">
          {isBlocked
            ? "Vous avez bloqué cet utilisateur"
            : "Vous avez été bloqué par cet utilisateur"
          }
        </div>
      ) : (
        <ChatInput
          onSend={handleSend}
          onTyping={handleTyping}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      )}
    </div>
  )
}
