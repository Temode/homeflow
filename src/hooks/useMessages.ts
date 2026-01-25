import { useState, useEffect, useCallback } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'
import { messagesService } from '../services/messages.service'
import { useAuth } from './useAuth'
import { Conversation, Message } from '../types/message.types'
import { toast } from 'react-hot-toast'

export function useMessages(conversationId?: string) {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      loadConversations()
      loadUnreadCount()
    }
  }, [user])

  useEffect(() => {
    if (conversationId && user) {
      loadMessages(conversationId)
      markAsRead(conversationId)
      subscribeToMessages(conversationId)
    }

    return () => {
      if (conversationId) {
        unsubscribeFromMessages()
      }
    }
  }, [conversationId, user])

  const loadConversations = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      const data = await messagesService.getConversations(user.id)
      setConversations(data)
    } catch (error) {
      console.error('Error loading conversations:', error)
      toast.error('Erreur lors du chargement des conversations')
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (convId: string) => {
    try {
      const data = await messagesService.getMessages(convId)
      setMessages(data)
    } catch (error) {
      console.error('Error loading messages:', error)
      toast.error('Erreur lors du chargement des messages')
    }
  }

  const loadUnreadCount = async () => {
    if (!user) return

    try {
      const count = await messagesService.getUnreadCount(user.id)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  const markAsRead = async (convId: string) => {
    if (!user) return

    try {
      await messagesService.markAsRead(convId, user.id)
      loadUnreadCount()
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const sendMessage = useCallback(
    async (convId: string, content: string) => {
      if (!user || !content.trim()) return

      try {
        const message = await messagesService.sendMessage(convId, user.id, content)
        setMessages((prev) => [...prev, message])
        loadConversations()
        return message
      } catch (error) {
        console.error('Error sending message:', error)
        toast.error('Erreur lors de l\'envoi du message')
      }
    },
    [user]
  )

  const createConversation = useCallback(
    async (participant2: string, propertyId?: string) => {
      if (!user) return

      try {
        const conversation = await messagesService.createConversation(
          user.id,
          participant2,
          propertyId
        )
        loadConversations()
        return conversation
      } catch (error) {
        console.error('Error creating conversation:', error)
        toast.error('Erreur lors de la création de la conversation')
      }
    },
    [user]
  )

  let channel: RealtimeChannel | null = null

  const subscribeToMessages = (convId: string) => {
    channel = supabase
      .channel(`messages:${convId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${convId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message

          const { data: sender } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single()

          const messageWithSender: Message = {
            ...newMessage,
            sender: sender || undefined,
          }

          setMessages((prev) => {
            const exists = prev.some((m) => m.id === newMessage.id)
            if (exists) return prev
            return [...prev, messageWithSender]
          })

          if (newMessage.sender_id !== user?.id) {
            markAsRead(newMessage.conversation_id)
          }
        }
      )
      .subscribe()
  }

  const unsubscribeFromMessages = () => {
    if (channel) {
      supabase.removeChannel(channel)
    }
  }

  return {
    conversations,
    messages,
    isLoading,
    unreadCount,
    sendMessage,
    createConversation,
    loadConversations,
    loadMessages,
    loadUnreadCount,
  }
}
