# GUIDE D'IMPLÉMENTATION HOMEFLOW - TÂCHES SÉQUENTIELLES

> **Document destiné à une IA de développement**
> Suivez ces tâches dans l'ordre exact. Chaque tâche dépend de la précédente.
> Ne passez à la tâche suivante qu'après avoir terminé et testé la tâche actuelle.

---

## PHASE 1 : SYSTÈME DE MESSAGERIE AVANCÉ (Style WhatsApp)

### Objectif
Transformer le chat basique existant en un système de messagerie complet, professionnel et adapté au contexte immobilier HomeFlow.

---

### TÂCHE 1.1 : Amélioration du schéma de base de données Messages

**Contexte** : Le schéma actuel est basique. Il faut l'enrichir pour supporter les nouvelles fonctionnalités.

**Actions à effectuer dans Supabase (SQL Editor)** :

```sql
-- 1. Ajouter des colonnes à la table messages
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'property_card', 'system')),
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_size INTEGER,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reply_to_id UUID REFERENCES public.messages(id),
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES public.properties(id);

-- 2. Ajouter des colonnes à la table conversations
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS last_message_preview TEXT,
ADD COLUMN IF NOT EXISTS is_archived_1 BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_archived_2 BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_blocked_by UUID,
ADD COLUMN IF NOT EXISTS unread_count_1 INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unread_count_2 INTEGER DEFAULT 0;

-- 3. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
ON public.messages(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_participants
ON public.conversations(participant_1, participant_2);

-- 4. Créer une table pour le statut de frappe (typing)
CREATE TABLE IF NOT EXISTS public.typing_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- 5. Activer RLS sur typing_status
ALTER TABLE public.typing_status ENABLE ROW LEVEL SECURITY;

-- 6. Policies pour typing_status
CREATE POLICY "Users can view typing status in their conversations" ON public.typing_status
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = typing_status.conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
  )
);

CREATE POLICY "Users can update their own typing status" ON public.typing_status
FOR ALL USING (user_id = auth.uid());

-- 7. Fonction pour mettre à jour last_message_at automatiquement
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100)
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger pour last_message
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON public.messages;
CREATE TRIGGER trigger_update_conversation_last_message
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();
```

**Validation** : Vérifiez que toutes les colonnes existent avec `SELECT * FROM information_schema.columns WHERE table_name = 'messages';`

---

### TÂCHE 1.2 : Mise à jour des types TypeScript

**Fichier** : `src/types/message.types.ts`

**Remplacer le contenu par** :

```typescript
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
```

---

### TÂCHE 1.3 : Mise à jour du service de messagerie

**Fichier** : `src/services/messages.service.ts`

**Ajouter les nouvelles méthodes** (garder les existantes et ajouter) :

```typescript
import { supabase } from './supabase'
import { Message, Conversation, SendMessageData, TypingStatus } from '../types/message.types'

export const messagesService = {
  // ... garder les méthodes existantes ...

  // Envoyer un message avec support des pièces jointes
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

  // Uploader une pièce jointe
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

  // Supprimer un message (soft delete)
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

  // Modifier un message
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

  // Gérer le statut de frappe
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

  // S'abonner au statut de frappe
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

  // Archiver une conversation
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

  // Bloquer un utilisateur
  async blockUser(conversationId: string): Promise<void> {
    const userId = (await supabase.auth.getUser()).data.user?.id

    await supabase
      .from('conversations')
      .update({ is_blocked_by: userId })
      .eq('id', conversationId)
  },

  // Débloquer un utilisateur
  async unblockUser(conversationId: string): Promise<void> {
    await supabase
      .from('conversations')
      .update({ is_blocked_by: null })
      .eq('id', conversationId)
  },

  // Rechercher dans les messages
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

  // Envoyer une carte propriété
  async sendPropertyCard(conversationId: string, propertyId: string): Promise<Message> {
    return this.sendMessage({
      conversation_id: conversationId,
      content: 'Propriété partagée',
      message_type: 'property_card',
      property_id: propertyId
    })
  }
}
```

---

### TÂCHE 1.4 : Créer le composant MessageBubble amélioré

**Fichier** : `src/components/messaging/MessageBubble.tsx`

**Remplacer entièrement par** :

```tsx
import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Check, CheckCheck, MoreVertical, Reply, Trash2, Edit2, Download, Image as ImageIcon, FileText, MapPin } from 'lucide-react'
import { Message } from '../../types/message.types'
import { Avatar } from '../ui/Avatar'
import { cn } from '../../utils/cn'
import { formatPrice } from '../../utils/formatters'
import { Link } from 'react-router-dom'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  showAvatar?: boolean
  onReply?: (message: Message) => void
  onEdit?: (message: Message) => void
  onDelete?: (messageId: string) => void
}

export function MessageBubble({
  message,
  isOwn,
  showAvatar = true,
  onReply,
  onEdit,
  onDelete
}: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false)

  const formatTime = (date: string) => {
    return format(new Date(date), 'HH:mm', { locale: fr })
  }

  const renderContent = () => {
    // Message supprimé
    if (message.is_deleted) {
      return (
        <p className="italic text-slate-400 text-sm">
          Ce message a été supprimé
        </p>
      )
    }

    // Réponse à un autre message
    const replyBlock = message.reply_to && (
      <div className="mb-2 pl-3 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg py-1.5 px-2">
        <p className="text-xs font-medium text-primary">
          {message.reply_to.sender?.full_name}
        </p>
        <p className="text-xs text-slate-600 line-clamp-1">
          {message.reply_to.content}
        </p>
      </div>
    )

    switch (message.message_type) {
      case 'image':
        return (
          <>
            {replyBlock}
            <div className="relative group">
              <img
                src={message.attachment_url}
                alt="Image partagée"
                className="max-w-[280px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(message.attachment_url, '_blank')}
              />
              <button
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => window.open(message.attachment_url, '_blank')}
              >
                <Download className="w-4 h-4 text-white" />
              </button>
            </div>
            {message.content && message.content !== 'Image partagée' && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </>
        )

      case 'file':
        return (
          <>
            {replyBlock}
            <a
              href={message.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <div className="p-2 bg-white rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 truncate">
                  {message.attachment_name}
                </p>
                <p className="text-xs text-slate-500">
                  {message.attachment_size
                    ? `${(message.attachment_size / 1024).toFixed(1)} KB`
                    : 'Télécharger'}
                </p>
              </div>
              <Download className="w-4 h-4 text-slate-400" />
            </a>
          </>
        )

      case 'property_card':
        if (!message.property) return <p>{message.content}</p>
        return (
          <>
            {replyBlock}
            <Link
              to={`/propriete/${message.property.id}`}
              className="block bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-primary/30 hover:shadow-md transition-all max-w-[300px]"
            >
              <div className="relative h-32">
                <img
                  src={message.property.images?.[0] || '/placeholder.jpg'}
                  alt={message.property.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-primary text-white text-xs font-bold rounded">
                  {formatPrice(message.property.price)}
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-bold text-slate-900 line-clamp-1">
                  {message.property.title}
                </h4>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{message.property.quartier}, {message.property.ville}</span>
                </div>
              </div>
            </Link>
          </>
        )

      case 'system':
        return (
          <p className="text-xs text-slate-500 text-center italic">
            {message.content}
          </p>
        )

      default:
        return (
          <>
            {replyBlock}
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </>
        )
    }
  }

  // Message système centré
  if (message.message_type === 'system') {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 bg-slate-100 rounded-full">
          {renderContent()}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex gap-2 group",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar
          name={message.sender?.full_name || 'U'}
          imageUrl={message.sender?.avatar_url}
          size="sm"
          isVerified={message.sender?.is_verified}
        />
      )}
      {showAvatar && isOwn && <div className="w-8" />}

      {/* Bubble */}
      <div className={cn(
        "relative max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm",
        isOwn
          ? "bg-primary text-white rounded-br-md"
          : "bg-white text-slate-900 rounded-bl-md border border-slate-100"
      )}>
        {renderContent()}

        {/* Footer avec heure et statut */}
        <div className={cn(
          "flex items-center gap-1.5 mt-1.5",
          isOwn ? "justify-end" : "justify-start"
        )}>
          {message.edited_at && (
            <span className={cn(
              "text-[10px]",
              isOwn ? "text-white/60" : "text-slate-400"
            )}>
              modifié
            </span>
          )}
          <span className={cn(
            "text-[10px]",
            isOwn ? "text-white/70" : "text-slate-400"
          )}>
            {formatTime(message.created_at)}
          </span>
          {isOwn && (
            <span className="text-white/70">
              {message.is_read ? (
                <CheckCheck className="w-3.5 h-3.5" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
            </span>
          )}
        </div>

        {/* Menu contextuel */}
        {!message.is_deleted && (
          <div className={cn(
            "absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity",
            isOwn ? "-left-8" : "-right-8"
          )}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className={cn(
                "absolute top-8 bg-white rounded-lg shadow-lg border border-slate-100 py-1 min-w-[140px] z-10",
                isOwn ? "left-0" : "right-0"
              )}>
                <button
                  onClick={() => { onReply?.(message); setShowMenu(false) }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Reply className="w-4 h-4" />
                  Répondre
                </button>
                {isOwn && message.message_type === 'text' && (
                  <button
                    onClick={() => { onEdit?.(message); setShowMenu(false) }}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </button>
                )}
                {isOwn && (
                  <button
                    onClick={() => { onDelete?.(message.id); setShowMenu(false) }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

### TÂCHE 1.5 : Créer le composant ChatInput amélioré

**Fichier** : `src/components/messaging/ChatInput.tsx`

**Remplacer entièrement par** :

```tsx
import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Image, X, Smile } from 'lucide-react'
import { Message } from '../../types/message.types'
import { cn } from '../../utils/cn'

interface ChatInputProps {
  onSend: (content: string, attachments?: { file: File; type: 'image' | 'file' }[]) => void
  onTyping?: (isTyping: boolean) => void
  replyTo?: Message | null
  onCancelReply?: () => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
  disabled = false,
  placeholder = "Écrivez votre message..."
}: ChatInputProps) {
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<{ file: File; type: 'image' | 'file'; preview?: string }[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [content])

  // Gestion du statut de frappe
  useEffect(() => {
    if (content && !isTyping) {
      setIsTyping(true)
      onTyping?.(true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false)
        onTyping?.(false)
      }
    }, 2000)

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [content])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if ((!content.trim() && attachments.length === 0) || disabled) return

    onSend(
      content.trim(),
      attachments.map(a => ({ file: a.file, type: a.type }))
    )

    setContent('')
    setAttachments([])
    setIsTyping(false)
    onTyping?.(false)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
    const files = Array.from(e.target.files || [])

    files.forEach(file => {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Le fichier est trop volumineux (max 10MB)')
        return
      }

      const attachment: { file: File; type: 'image' | 'file'; preview?: string } = { file, type }

      if (type === 'image' && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          attachment.preview = e.target?.result as string
          setAttachments(prev => [...prev, attachment])
        }
        reader.readAsDataURL(file)
      } else {
        setAttachments(prev => [...prev, attachment])
      }
    })

    // Reset input
    e.target.value = ''
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white">
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border-b border-slate-100">
          <div className="flex-1 pl-3 border-l-2 border-primary">
            <p className="text-xs font-medium text-primary">
              Réponse à {replyTo.sender?.full_name}
            </p>
            <p className="text-xs text-slate-600 line-clamp-1">
              {replyTo.content}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="p-1 hover:bg-slate-200 rounded-full"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto">
          {attachments.map((attachment, index) => (
            <div key={index} className="relative flex-shrink-0">
              {attachment.type === 'image' && attachment.preview ? (
                <img
                  src={attachment.preview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                  <Paperclip className="w-6 h-6 text-slate-400" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(index)}
                className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 p-3">
        {/* Attachment buttons */}
        <div className="flex gap-1">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'image')}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e, 'file')}
          />

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
            title="Envoyer une image"
          >
            <Image className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
            title="Joindre un fichier"
          >
            <Paperclip className="w-5 h-5" />
          </button>
        </div>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              "w-full px-4 py-2.5 bg-slate-100 rounded-2xl resize-none",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white",
              "placeholder:text-slate-400 text-slate-900",
              "max-h-[120px] transition-colors",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={(!content.trim() && attachments.length === 0) || disabled}
          className={cn(
            "p-3 rounded-full transition-all",
            content.trim() || attachments.length > 0
              ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25"
              : "bg-slate-100 text-slate-400"
          )}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  )
}
```

---

### TÂCHE 1.6 : Créer le composant TypingIndicator

**Fichier** : `src/components/messaging/TypingIndicator.tsx` (NOUVEAU)

```tsx
import { cn } from '../../utils/cn'

interface TypingIndicatorProps {
  name?: string
  className?: string
}

export function TypingIndicator({ name, className }: TypingIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-2 px-4 py-2", className)}>
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
      </div>
      <span className="text-xs text-slate-500">
        {name ? `${name} écrit...` : 'Écrit...'}
      </span>
    </div>
  )
}
```

---

### TÂCHE 1.7 : Mettre à jour ChatView avec toutes les fonctionnalités

**Fichier** : `src/components/messaging/ChatView.tsx`

**Remplacer entièrement par** :

```tsx
import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, MoreVertical, Phone, Video, Info, Archive, Ban, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Conversation, Message, TypingStatus } from '../../types/message.types'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { TypingIndicator } from './TypingIndicator'
import { Avatar } from '../ui/Avatar'
import { messagesService } from '../../services/messages.service'
import { useAuth } from '../../hooks/useAuth'
import { toast } from 'react-hot-toast'
import { cn } from '../../utils/cn'
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

  // Charger les messages
  useEffect(() => {
    loadMessages()

    // Subscribe to new messages
    const subscription = messagesService.subscribeToMessages(
      conversation.id,
      (newMessage) => {
        setMessages(prev => {
          // Éviter les doublons
          if (prev.some(m => m.id === newMessage.id)) return prev
          return [...prev, newMessage]
        })
        // Marquer comme lu si ce n'est pas notre message
        if (newMessage.sender_id !== user?.id) {
          messagesService.markAsRead(newMessage.id)
        }
      }
    )

    // Subscribe to typing status
    const typingSubscription = messagesService.subscribeToTypingStatus(
      conversation.id,
      (status: TypingStatus) => {
        if (status.user_id !== user?.id) {
          setIsOtherTyping(status.is_typing)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
      typingSubscription.unsubscribe()
    }
  }, [conversation.id, user?.id])

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages, isOtherTyping])

  const loadMessages = async () => {
    try {
      setLoading(true)
      const data = await messagesService.getMessages(conversation.id)
      setMessages(data)

      // Marquer tous comme lus
      data.forEach(msg => {
        if (msg.sender_id !== user?.id && !msg.is_read) {
          messagesService.markAsRead(msg.id)
        }
      })
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
      // Envoyer les pièces jointes d'abord
      for (const attachment of attachments || []) {
        const uploaded = await messagesService.uploadAttachment(attachment.file, conversation.id)
        await messagesService.sendMessage({
          conversation_id: conversation.id,
          content: attachment.type === 'image' ? 'Image partagée' : attachment.file.name,
          message_type: attachment.type,
          attachment_url: uploaded.url,
          attachment_name: uploaded.name,
          attachment_size: uploaded.size,
          reply_to_id: replyTo?.id
        })
      }

      // Envoyer le message texte
      if (content) {
        await messagesService.sendMessage({
          conversation_id: conversation.id,
          content,
          message_type: 'text',
          reply_to_id: replyTo?.id
        })
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

  // Grouper les messages par date
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
      {/* Header */}
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
            {/* Online indicator (à implémenter côté backend) */}
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

        {/* Actions */}
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

      {/* Messages */}
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
                {/* Date separator */}
                <div className="flex items-center justify-center">
                  <span className="px-3 py-1 bg-white text-xs text-slate-500 rounded-full shadow-sm">
                    {group.date}
                  </span>
                </div>

                {/* Messages */}
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

            {/* Typing indicator */}
            {isOtherTyping && (
              <TypingIndicator name={otherParticipant?.full_name} />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
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
```

---

## PHASE 2 : REDESIGN DE LA SECTION CONTACT (PropertyDetail)

### Objectif
Transformer la section de droite de PropertyDetail en une expérience de contact premium avec mini-chat intégré.

---

### TÂCHE 2.1 : Créer le composant MiniChat

**Fichier** : `src/components/messaging/MiniChat.tsx` (NOUVEAU)

```tsx
import { useState, useEffect, useRef } from 'react'
import { Send, X, Maximize2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useMessages } from '../../hooks/useMessages'
import { Message } from '../../types/message.types'
import { MessageBubble } from './MessageBubble'
import { Avatar } from '../ui/Avatar'
import { toast } from 'react-hot-toast'
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

  // Trouver ou créer la conversation
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
    if (!message.trim() || !user) return

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

      // Créer la conversation si elle n'existe pas
      if (!convId) {
        const conv = await createConversation(agentId, propertyId)
        if (conv) {
          convId = conv.id
          setConversationId(conv.id)
        }
      }

      if (convId) {
        await sendMessage(convId, message.trim())
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
      {/* Header */}
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

      {/* Messages (max 3 derniers) */}
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

      {/* Input */}
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
```

---

### TÂCHE 2.2 : Créer le composant AgentContactCard redesigné

**Fichier** : `src/components/property/AgentContactCard.tsx` (NOUVEAU)

```tsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Phone, MessageCircle, Shield, Star, Clock, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { MiniChat } from '../messaging/MiniChat'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../utils/cn'
import { toast } from 'react-hot-toast'

interface Agent {
  id: string
  full_name: string
  avatar_url?: string
  is_verified?: boolean
  bio?: string
  phone?: string
  created_at?: string
}

interface Property {
  id: string
  title: string
}

interface AgentContactCardProps {
  agent: Agent
  property: Property
  className?: string
}

export function AgentContactCard({ agent, property, className }: AgentContactCardProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showChat, setShowChat] = useState(false)
  const [showPhone, setShowPhone] = useState(false)

  const handleCall = () => {
    if (!user) {
      toast.error('Connectez-vous pour voir le numéro')
      navigate('/connexion')
      return
    }

    if (agent.phone) {
      setShowPhone(!showPhone)
    } else {
      toast.error('Numéro non disponible')
    }
  }

  const handleMessage = () => {
    if (!user) {
      toast.error('Connectez-vous pour envoyer un message')
      navigate('/connexion')
      return
    }

    if (user.id === agent.id) {
      toast.error('Vous ne pouvez pas vous contacter vous-même')
      return
    }

    setShowChat(!showChat)
  }

  // Calculer l'ancienneté
  const getMemberSince = () => {
    if (!agent.created_at) return null
    const date = new Date(agent.created_at)
    const now = new Date()
    const months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth())

    if (months < 1) return 'Nouveau membre'
    if (months < 12) return `Membre depuis ${months} mois`
    const years = Math.floor(months / 12)
    return `Membre depuis ${years} an${years > 1 ? 's' : ''}`
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 pt-6 pb-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Link to={`/demarcheur/${agent.id}`} className="flex-shrink-0">
              <Avatar
                name={agent.full_name}
                imageUrl={agent.avatar_url}
                size="xl"
                isVerified={agent.is_verified}
                className="ring-4 ring-white shadow-lg"
              />
            </Link>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Link
                to={`/demarcheur/${agent.id}`}
                className="group"
              >
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors flex items-center gap-2">
                  {agent.full_name}
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
              </Link>

              <p className="text-sm text-slate-500 mt-0.5">
                Démarcheur immobilier
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {agent.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    <Shield className="w-3 h-3" />
                    Vérifié
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  <Star className="w-3 h-3 fill-current" />
                  4.8
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-px bg-slate-100">
          <div className="bg-white px-4 py-3 text-center">
            <p className="text-lg font-bold text-slate-900">24h</p>
            <p className="text-xs text-slate-500">Temps de réponse</p>
          </div>
          <div className="bg-white px-4 py-3 text-center">
            <p className="text-lg font-bold text-slate-900">98%</p>
            <p className="text-xs text-slate-500">Taux de réponse</p>
          </div>
        </div>

        {/* Bio */}
        {agent.bio && (
          <div className="px-6 py-4 border-t border-slate-100">
            <p className="text-sm text-slate-600 line-clamp-3">{agent.bio}</p>
          </div>
        )}

        {/* Member since */}
        {getMemberSince() && (
          <div className="px-6 py-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            {getMemberSince()}
          </div>
        )}

        {/* Actions */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          {/* Bouton Appeler */}
          <Button
            onClick={handleCall}
            variant="outline"
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {showPhone && agent.phone ? agent.phone : 'Appeler'}
            </span>
            {showPhone ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {/* Bouton Message */}
          <Button
            onClick={handleMessage}
            className="w-full"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {showChat ? 'Masquer le chat' : 'Envoyer un message'}
          </Button>
        </div>
      </div>

      {/* Mini Chat */}
      {showChat && (
        <MiniChat
          agentId={agent.id}
          agentName={agent.full_name}
          agentAvatar={agent.avatar_url}
          agentVerified={agent.is_verified}
          propertyId={property.id}
          propertyTitle={property.title}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Safety Tips */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <h4 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Conseils de sécurité
        </h4>
        <ul className="text-xs text-amber-800 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            Ne payez jamais avant de visiter le bien
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            Vérifiez les documents de propriété
          </li>
          <li className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">•</span>
            Privilégiez les démarcheurs vérifiés
          </li>
        </ul>
      </div>
    </div>
  )
}
```

---

### TÂCHE 2.3 : Mettre à jour PropertyDetail pour utiliser le nouveau composant

**Fichier** : `src/pages/PropertyDetail.tsx`

**Modifications à effectuer** :

1. **Ajouter l'import** en haut du fichier :
```tsx
import { AgentContactCard } from '../components/property/AgentContactCard'
```

2. **Remplacer la section Sidebar** (chercher `{/* Sidebar */}`) par :
```tsx
            {/* Sidebar */}
            <div className="space-y-6">
              <div className="lg:sticky lg:top-6">
                {agent && (
                  <AgentContactCard
                    agent={{
                      id: agent.id,
                      full_name: agent.full_name || 'Agent',
                      avatar_url: agent.avatar_url,
                      is_verified: agent.is_verified,
                      bio: agent.bio,
                      phone: agent.phone,
                      created_at: agent.created_at
                    }}
                    property={{
                      id: property.id,
                      title: property.title
                    }}
                  />
                )}
              </div>
            </div>
```

3. **Supprimer** l'ancienne Card agent et Safety Tips car ils sont maintenant dans AgentContactCard.

---

## PHASE 3 : DASHBOARDS PROFESSIONNELS

### Objectif
Créer des dashboards modernes et fonctionnels pour chaque type d'utilisateur.

---

### TÂCHE 3.1 : Créer le hook useStats pour les statistiques

**Fichier** : `src/hooks/useStats.ts` (NOUVEAU)

```typescript
import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from './useAuth'

interface DashboardStats {
  favoritesCount: number
  unreadMessagesCount: number
  propertiesViewedCount: number
  scheduledVisitsCount: number
  // Pour les démarcheurs
  activeListingsCount: number
  totalViewsCount: number
  responseRate: number
  averageResponseTime: string
}

export function useStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    favoritesCount: 0,
    unreadMessagesCount: 0,
    propertiesViewedCount: 0,
    scheduledVisitsCount: 0,
    activeListingsCount: 0,
    totalViewsCount: 0,
    responseRate: 0,
    averageResponseTime: '24h'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Favoris
      const { count: favCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Messages non lus
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id, participant_1, participant_2')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)

      let unreadCount = 0
      if (conversations) {
        for (const conv of conversations) {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id)

          unreadCount += count || 0
        }
      }

      // Pour les démarcheurs : annonces actives
      const { count: activeCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', user.id)
        .eq('status', 'active')

      setStats({
        favoritesCount: favCount || 0,
        unreadMessagesCount: unreadCount,
        propertiesViewedCount: 12, // À implémenter avec tracking
        scheduledVisitsCount: 0, // À implémenter
        activeListingsCount: activeCount || 0,
        totalViewsCount: 0, // À implémenter avec analytics
        responseRate: 98,
        averageResponseTime: '24h'
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading, refetch: fetchStats }
}
```

---

### TÂCHE 3.2 : Mettre à jour le Dashboard Locataire

**Fichier** : `src/pages/Dashboard.tsx`

**Modifier l'import et l'utilisation des stats** :

1. **Ajouter l'import** :
```tsx
import { useStats } from '../hooks/useStats'
```

2. **Dans le composant**, remplacer les stats hardcodées :
```tsx
export default function Dashboard() {
  const { user } = useAuth()
  const { stats, loading: statsLoading } = useStats()
  const [favorites, setFavorites] = useState<Property[]>([])
  // ... reste du code

  // Remplacer les valeurs hardcodées dans StatCard :
  <StatCard
    icon={MessageSquare}
    label="Messages non lus"
    value={stats.unreadMessagesCount}
    color="accent"
    href="/messages"
  />
```

---

### TÂCHE 3.3 : Redesigner le Dashboard Démarcheur

**Fichier** : `src/pages/DashboardAgent.tsx`

**Remplacer entièrement par** :

```tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Home, Eye, MessageSquare, TrendingUp, Clock,
  ChevronRight, MoreVertical, Edit2, Trash2, ArrowUpRight,
  CheckCircle, AlertCircle, XCircle, Users
} from 'lucide-react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useAuth } from '../hooks/useAuth'
import { useStats } from '../hooks/useStats'
import { propertiesService } from '../services/properties.service'
import { Property } from '../types/property.types'
import { formatPrice } from '../utils/formatters'
import { cn } from '../utils/cn'

interface QuickStatProps {
  icon: React.ElementType
  label: string
  value: string | number
  trend?: string
  trendUp?: boolean
  color: 'primary' | 'green' | 'blue' | 'amber'
}

function QuickStat({ icon: Icon, label, value, trend, trendUp, color }: QuickStatProps) {
  const colorStyles = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600'
  }

  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={cn("p-2.5 rounded-xl", colorStyles[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trendUp ? "text-green-600" : "text-red-500"
          )}>
            <TrendingUp className={cn("w-3 h-3", !trendUp && "rotate-180")} />
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      </div>
    </Card>
  )
}

function PropertyRow({ property, onEdit, onDelete }: {
  property: Property
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}) {
  const [showMenu, setShowMenu] = useState(false)

  const statusConfig = {
    active: { label: 'Active', color: 'success' as const, icon: CheckCircle },
    loue: { label: 'Louée', color: 'info' as const, icon: CheckCircle },
    vendu: { label: 'Vendue', color: 'warning' as const, icon: CheckCircle },
    inactif: { label: 'Inactive', color: 'default' as const, icon: XCircle }
  }

  const status = statusConfig[property.status as keyof typeof statusConfig] || statusConfig.active

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:border-primary/20 hover:shadow-sm transition-all group">
      {/* Image */}
      <Link to={`/propriete/${property.id}`} className="flex-shrink-0">
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100">
          <img
            src={property.images?.[0] || '/placeholder.jpg'}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/propriete/${property.id}`}>
          <h3 className="font-bold text-slate-900 hover:text-primary transition-colors truncate">
            {property.title}
          </h3>
        </Link>
        <p className="text-sm text-slate-500 mt-0.5">
          {property.quartier}, {property.ville}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="font-bold text-primary">
            {formatPrice(property.price)}
            {property.type === 'location' && <span className="text-xs font-normal text-slate-400">/mois</span>}
          </span>
          <Badge variant={status.color} className="text-xs">
            {status.label}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden md:flex items-center gap-6 text-center">
        <div>
          <p className="text-lg font-bold text-slate-900">245</p>
          <p className="text-xs text-slate-500">Vues</p>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900">12</p>
          <p className="text-xs text-slate-500">Messages</p>
        </div>
      </div>

      {/* Actions */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
        >
          <MoreVertical className="w-5 h-5" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-100 py-1 w-40 z-10">
            <Link
              to={`/propriete/${property.id}`}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Voir
            </Link>
            <button
              onClick={() => { onEdit?.(property.id); setShowMenu(false) }}
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Modifier
            </button>
            <button
              onClick={() => { onDelete?.(property.id); setShowMenu(false) }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardAgent() {
  const { user } = useAuth()
  const { stats } = useStats()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProperties()
    }
  }, [user])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const data = await propertiesService.getAgentProperties(user!.id)
      setProperties(data)
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id: string) => {
    // TODO: Implémenter l'édition
    console.log('Edit property:', id)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return

    try {
      await propertiesService.deleteProperty(id)
      setProperties(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting property:', error)
    }
  }

  const firstName = user?.profile?.full_name?.split(' ')[0] || 'Démarcheur'
  const activeCount = properties.filter(p => p.status === 'active').length

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-slate-900">
              Bienvenue, {firstName}
            </h1>
            <p className="text-slate-600 mt-1">
              Gérez vos annonces et suivez vos performances
            </p>
          </div>
          <Link to="/nouvelle-annonce">
            <Button className="shadow-lg shadow-primary/25">
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle annonce
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickStat
            icon={Home}
            label="Annonces actives"
            value={stats.activeListingsCount}
            color="primary"
          />
          <QuickStat
            icon={Eye}
            label="Vues totales"
            value={stats.totalViewsCount}
            trend="+12%"
            trendUp
            color="blue"
          />
          <QuickStat
            icon={MessageSquare}
            label="Messages"
            value={stats.unreadMessagesCount}
            color="green"
          />
          <QuickStat
            icon={Users}
            label="Taux de réponse"
            value={`${stats.responseRate}%`}
            color="amber"
          />
        </div>

        {/* Performance Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Performances</h2>
            <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option>7 derniers jours</option>
              <option>30 derniers jours</option>
              <option>3 derniers mois</option>
            </select>
          </div>

          {/* Placeholder pour graphique */}
          <div className="h-48 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center">
            <p className="text-slate-400 text-sm">Graphique de performances à venir</p>
          </div>
        </Card>

        {/* Properties List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Mes annonces</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {activeCount} annonce{activeCount > 1 ? 's' : ''} active{activeCount > 1 ? 's' : ''}
              </p>
            </div>
            <Link
              to="/mes-annonces"
              className="flex items-center gap-1 text-primary hover:text-primary/80 font-medium text-sm"
            >
              Voir tout
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Home className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Aucune annonce
              </h3>
              <p className="text-slate-600 mb-6 max-w-sm mx-auto">
                Créez votre première annonce et commencez à recevoir des demandes
              </p>
              <Link to="/nouvelle-annonce">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une annonce
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {properties.slice(0, 5).map(property => (
                <PropertyRow
                  key={property.id}
                  property={property}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
```

---

## PHASE 4 : CORRECTIONS ET FINITIONS

### TÂCHE 4.1 : Corriger les liens cassés dans la navigation

**Fichier** : `src/components/layout/Navbar.tsx`

**Chercher et supprimer ou modifier les liens** vers `/demarcheurs` et `/comment-ca-marche` qui n'existent pas.

---

### TÂCHE 4.2 : Créer le bucket Supabase pour les pièces jointes du chat

**Dans Supabase Dashboard** :
1. Aller dans Storage
2. Créer un nouveau bucket nommé `chat-attachments`
3. Rendre le bucket public pour les lectures
4. Ajouter une policy pour les uploads :

```sql
CREATE POLICY "Users can upload chat attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-attachments' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Anyone can view chat attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-attachments');
```

---

### TÂCHE 4.3 : Ajouter les exports dans les fichiers index

**Fichier** : `src/components/messaging/index.ts` (créer si n'existe pas)

```typescript
export { MessageBubble } from './MessageBubble'
export { ChatInput } from './ChatInput'
export { ChatView } from './ChatView'
export { ConversationList } from './ConversationList'
export { TypingIndicator } from './TypingIndicator'
export { MiniChat } from './MiniChat'
```

---

### TÂCHE 4.4 : Tester toutes les fonctionnalités

**Checklist de test** :

1. [ ] Créer un nouveau compte utilisateur
2. [ ] Se connecter avec le compte
3. [ ] Naviguer vers une propriété
4. [ ] Cliquer sur "Envoyer un message" dans la section contact
5. [ ] Vérifier que le mini-chat s'ouvre
6. [ ] Envoyer un message
7. [ ] Aller dans /messages et vérifier que la conversation existe
8. [ ] Envoyer une image
9. [ ] Répondre à un message
10. [ ] Supprimer un message
11. [ ] Vérifier l'indicateur de frappe (avec 2 onglets)
12. [ ] Tester le dashboard locataire
13. [ ] Tester le dashboard démarcheur
14. [ ] Vérifier les statistiques

---

## RÉSUMÉ DES FICHIERS À CRÉER/MODIFIER

### Fichiers à CRÉER :
- `src/components/messaging/TypingIndicator.tsx`
- `src/components/messaging/MiniChat.tsx`
- `src/components/property/AgentContactCard.tsx`
- `src/hooks/useStats.ts`
- `src/components/messaging/index.ts`

### Fichiers à MODIFIER :
- `src/types/message.types.ts`
- `src/services/messages.service.ts`
- `src/components/messaging/MessageBubble.tsx`
- `src/components/messaging/ChatInput.tsx`
- `src/components/messaging/ChatView.tsx`
- `src/pages/PropertyDetail.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/DashboardAgent.tsx`
- `src/components/layout/Navbar.tsx`

### Actions Supabase (SQL) :
1. ALTER TABLE messages (ajouter colonnes)
2. ALTER TABLE conversations (ajouter colonnes)
3. CREATE TABLE typing_status
4. CREATE FUNCTION update_conversation_last_message
5. CREATE TRIGGER trigger_update_conversation_last_message
6. CREATE STORAGE BUCKET chat-attachments
7. CREATE STORAGE POLICIES

---

## ORDRE D'EXÉCUTION

1. **Supabase d'abord** : Exécuter toutes les requêtes SQL (TÂCHE 1.1)
2. **Types TypeScript** : Mettre à jour les types (TÂCHE 1.2)
3. **Services** : Mettre à jour messages.service.ts (TÂCHE 1.3)
4. **Composants dans l'ordre** :
   - MessageBubble (TÂCHE 1.4)
   - ChatInput (TÂCHE 1.5)
   - TypingIndicator (TÂCHE 1.6)
   - ChatView (TÂCHE 1.7)
   - MiniChat (TÂCHE 2.1)
   - AgentContactCard (TÂCHE 2.2)
5. **Pages** :
   - PropertyDetail (TÂCHE 2.3)
   - useStats hook (TÂCHE 3.1)
   - Dashboard (TÂCHE 3.2)
   - DashboardAgent (TÂCHE 3.3)
6. **Finitions** (TÂCHE 4.1 à 4.4)

---

> **Note importante** : Chaque tâche doit être terminée et testée avant de passer à la suivante. En cas d'erreur, vérifier les dépendances et l'ordre d'exécution.
