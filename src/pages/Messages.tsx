import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useMessages } from '../hooks/useMessages'
import { ConversationList } from '../components/messaging/ConversationList'
import { ChatView } from '../components/messaging/ChatView'
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

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        <div className="w-full md:w-96 lg:w-[400px] bg-white">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversation?.id}
            currentUserId={user!.id}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        <div className="hidden md:flex flex-1">
          <ChatView
            conversation={selectedConversation}
            messages={messages}
            currentUserId={user!.id}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  )
}
