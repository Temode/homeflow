import { supabase } from './supabase'
import { Database } from '../types/database.types'
import { Conversation, Message } from '../types/message.types'

type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
type MessageInsert = Database['public']['Tables']['messages']['Insert']

export const messagesService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        property:properties(id, title, images, price),
        participant_1_profile:profiles!conversations_participant_1_fkey(id, full_name, avatar_url, is_verified),
        participant_2_profile:profiles!conversations_participant_2_fkey(id, full_name, avatar_url, is_verified)
      `)
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('created_at', { ascending: false })

    if (error) throw error

    const conversationsWithLastMessage = await Promise.all(
      data.map(async (conv) => {
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', userId)

        return {
          ...conv,
          last_message: lastMessage,
          unread_count: count || 0,
        }
      })
    )

    return conversationsWithLastMessage
  },

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        property:properties(id, title, images, price),
        participant_1_profile:profiles!conversations_participant_1_fkey(id, full_name, avatar_url, is_verified),
        participant_2_profile:profiles!conversations_participant_2_fkey(id, full_name, avatar_url, is_verified)
      `)
      .eq('id', conversationId)
      .single()

    if (error) throw error
    return data
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(id, full_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    const message: MessageInsert = {
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    }

    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async createConversation(
    participant1: string,
    participant2: string,
    propertyId?: string
  ): Promise<Conversation> {
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(
        `and(participant_1.eq.${participant1},participant_2.eq.${participant2}),and(participant_1.eq.${participant2},participant_2.eq.${participant1})`
      )
      .eq('property_id', propertyId || null)
      .maybeSingle()

    if (existing) {
      return this.getConversation(existing.id) as Promise<Conversation>
    }

    const conversation: ConversationInsert = {
      participant_1: participant1,
      participant_2: participant2,
      property_id: propertyId || null,
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert(conversation)
      .select()
      .single()

    if (error) throw error
    return this.getConversation(data.id) as Promise<Conversation>
  },

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false)

    if (error) throw error
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)

    if (!conversations) return 0

    const conversationIds = conversations.map((c) => c.id)

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .neq('sender_id', userId)
      .eq('is_read', false)

    if (error) throw error
    return count || 0
  },
}
