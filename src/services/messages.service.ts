import { supabase } from './supabase'
import { Message, Conversation, SendMessageData, TypingStatus } from '../types/message.types'

export const messagesService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        property:properties(id, title, images),
        participant_1_profile:profiles!conversations_participant_1_fkey(id, full_name, avatar_url, is_verified),
        participant_2_profile:profiles!conversations_participant_2_fkey(id, full_name, avatar_url, is_verified)
      `)
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_message_at', { ascending: false })

    if (error) throw error

    return data.map(conv => ({
      ...conv,
      other_participant: conv.participant_1 === userId 
        ? conv.participant_2_profile 
        : conv.participant_1_profile
    }))
  },

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        property:properties(id, title, images),
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
        sender:profiles!sender_id(id, full_name, avatar_url, is_verified),
        reply_to:messages!reply_to_id(id, content, sender:profiles!sender_id(full_name)),
        property:properties!property_id(id, title, price, images, ville, quartier)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  async sendMessage(data: SendMessageData): Promise<Message> {
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: data.conversation_id,
        sender_id: (await supabase.auth.getUser()).data.user?.id,
        content: data.content,
        message_type: data.message_type || 'text',
        attachment_url: data.attachment_url,
        attachment_name: data.attachment_name,
        attachment_size: data.attachment_size,
        reply_to_id: data.reply_to_id,
        property_id: data.property_id
      })
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, avatar_url, is_verified),
        reply_to:messages!reply_to_id(id, content, sender:profiles!sender_id(full_name)),
        property:properties!property_id(id, title, price, images, ville, quartier)
      `)
      .single()

    if (error) throw error
    return message
  },

  async uploadAttachment(file: File, conversationId: string): Promise<{ url: string; name: string; size: number }> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${conversationId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('chat-attachments')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(fileName)

    return {
      url: publicUrl,
      name: file.name,
      size: file.size
    }
  },

  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        content: 'Ce message a été supprimé'
      })
      .eq('id', messageId)
      .eq('sender_id', (await supabase.auth.getUser()).data.user?.id)

    if (error) throw error
  },

  async editMessage(messageId: string, newContent: string): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .update({
        content: newContent,
        edited_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('sender_id', (await supabase.auth.getUser()).data.user?.id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async setTypingStatus(conversationId: string, isTyping: boolean): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) return

    const { error } = await supabase
      .from('typing_status')
      .upsert({
        conversation_id: conversationId,
        user_id: userId,
        is_typing: isTyping,
        updated_at: new Date().toISOString()
      })

    if (error) console.error('Typing status error:', error)
  },

  subscribeToTypingStatus(conversationId: string, callback: (status: TypingStatus) => void) {
    return supabase
      .channel(`typing:${conversationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'typing_status',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        callback(payload.new as TypingStatus)
      })
      .subscribe()
  },

  async archiveConversation(conversationId: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id

    const { data: conv } = await supabase
      .from('conversations')
      .select('participant_1, participant_2')
      .eq('id', conversationId)
      .single()

    if (!conv) return

    const updateField = conv.participant_1 === userId ? 'is_archived_1' : 'is_archived_2'

    await supabase
      .from('conversations')
      .update({ [updateField]: true })
      .eq('id', conversationId)
  },

  async blockUser(conversationId: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id

    await supabase
      .from('conversations')
      .update({ is_blocked_by: userId })
      .eq('id', conversationId)
  },

  async unblockUser(conversationId: string): Promise<void> {
    await supabase
      .from('conversations')
      .update({ is_blocked_by: null })
      .eq('id', conversationId)
  },

  async searchMessages(query: string, userId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!sender_id(id, full_name, avatar_url),
        conversation:conversations!conversation_id(
          id,
          property:properties(title)
        )
      `)
      .textSearch('content', query)
      .or(`conversation_id.in.(
        SELECT id FROM conversations
        WHERE participant_1 = '${userId}' OR participant_2 = '${userId}'
      )`)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return data || []
  },

  async sendPropertyCard(conversationId: string, propertyId: string): Promise<Message> {
    return this.sendMessage({
      conversation_id: conversationId,
      content: 'Propriété partagée',
      message_type: 'property_card',
      property_id: propertyId
    })
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

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant_1: participant1,
        participant_2: participant2,
        property_id: propertyId || null,
      })
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
