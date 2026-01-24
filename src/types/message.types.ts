import { Database } from './database.types'

export type Message = Database['public']['Tables']['messages']['Row'] & {
  sender?: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

export type Conversation = Database['public']['Tables']['conversations']['Row'] & {
  property?: {
    id: string
    title: string
    images: string[]
    price: number
  }
  participant_1_profile?: {
    id: string
    full_name: string | null
    avatar_url: string | null
    is_verified: boolean
  }
  participant_2_profile?: {
    id: string
    full_name: string | null
    avatar_url: string | null
    is_verified: boolean
  }
  last_message?: Message
  unread_count?: number
}

export type ConversationWithMessages = Conversation & {
  messages: Message[]
}
