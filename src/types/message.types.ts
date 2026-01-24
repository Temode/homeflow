import { Profile } from './user.types'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

export interface Conversation {
  id: string
  property_id: string | null
  participant_1: string
  participant_2: string
  created_at: string
  profiles?: Profile[]
  messages?: Message[]
  lastMessage?: Message
  unreadCount?: number
}
