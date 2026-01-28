import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useMessages } from '../hooks/useMessages'
import { ConversationList } from '../components/messaging/ConversationList'
import { ChatView } from '../components/messaging/ChatView'
import { EmptyState } from '../components/common/EmptyState'
import { Conversation } from '../types/message.types'

export function Messages() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)

  const {
    conversations,
    messages,
    isLoading,
    sendMessage,
  } = useMessages(selectedConversation?.id)

  useEffect(() => {
    if (!user) {
      navigate('/connexion')
      return
    }
  }, [user, navigate])

  useEffect(() => {
    const conversationId = searchParams.get('conversation')
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find((c) => c.id === conversationId)
      if (conv) {
        setSelectedConversation(conv)
      }
    }
  }, [searchParams, conversations])

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation)
  }

  const handleSendMessage = async (content: string) => {
    if (selectedConversation) {
      await sendMessage(selectedConversation.id, content)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <EmptyState
          icon={MessageSquare}
          title="Aucune conversation"
          description="Vous n'avez pas encore de conversations. Commencez par contacter un démarcheur depuis une annonce."
          actionLabel="Voir les annonces"
          onAction={() => navigate('/recherche')}
        />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-96 lg:w-[400px] bg-white border-r border-slate-200`}>
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversation?.id}
            currentUserId={user!.id}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-1`}>
          {selectedConversation ? (
            <ChatView
              conversation={selectedConversation}
              messages={messages}
              currentUserId={user!.id}
              onSendMessage={handleSendMessage}
              onBack={() => setSelectedConversation(null)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <p>Sélectionnez une conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
