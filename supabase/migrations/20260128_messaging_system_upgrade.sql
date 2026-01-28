-- PHASE 1 TASK 1.1: Amélioration du schéma de base de données Messages
-- Upgrade messaging system to support WhatsApp-style features

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
