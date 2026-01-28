export type MessageType = 'text' | 'image' | 'file' | 'property_card' | 'system'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  message_type: MessageType
  attachment_url?: string
  attachment_name?: string
  attachment_size?: number
  is_read: boolean
  is_deleted: boolean
  deleted_at?: string
  edited_at?: string
  reply_to_id?: string
  reply_to?: Message
  property_id?: string
  property?: {
    id: string
    title: string
    price: number
    images: string[]
    ville: string
    quartier: string
  }
  created_at: string
  sender?: {
    id: string
    full_name: string
    avatar_url?: string
    is_verified?: boolean
  }
}

export interface Conversation {
  id: string
  property_id?: string
  participant_1: string
  participant_2: string
  created_at: string
  last_message_at: string
  last_message_preview?: string
  is_archived_1: boolean
  is_archived_2: boolean
  is_blocked_by?: string
  unread_count_1: number
  unread_count_2: number
  property?: {
    id: string
    title: string
    images: string[]
  }
  other_participant?: {
    id: string
    full_name: string
    avatar_url?: string
    is_verified?: boolean
  }
  last_message?: Message
  messages?: Message[]
}

export interface TypingStatus {
  conversation_id: string
  user_id: string
  is_typing: boolean
  updated_at: string
  user?: {
    full_name: string
  }
}

export interface SendMessageData {
  conversation_id: string
  content: string
  message_type?: MessageType
  attachment_url?: string
  attachment_name?: string
  attachment_size?: number
  reply_to_id?: string
  property_id?: string
}
