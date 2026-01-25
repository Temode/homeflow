import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Message } from '../../types/message.types'
import { cn } from '../../utils/cn'

interface MessageBubbleProps {
  message: Message
  isOwnMessage: boolean
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <div className={cn('flex mb-4', isOwnMessage ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-3',
          isOwnMessage
            ? 'bg-gradient-to-r from-primary to-accent text-white'
            : 'bg-slate-100 text-slate-900'
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={cn(
            'text-xs mt-1',
            isOwnMessage ? 'text-white/70' : 'text-slate-500'
          )}
        >
          {formatDistanceToNow(new Date(message.created_at), {
            addSuffix: true,
            locale: fr,
          })}
        </p>
      </div>
    </div>
  )
}
