import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Check, CheckCheck, MoreVertical, Reply, Trash2, Edit2, Download, FileText, MapPin } from 'lucide-react'
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
    if (message.is_deleted) {
      return (
        <p className="italic text-slate-400 text-sm">
          Ce message a été supprimé
        </p>
      )
    }

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
      {showAvatar && !isOwn && (
        <Avatar
          name={message.sender?.full_name || 'U'}
          imageUrl={message.sender?.avatar_url}
          size="sm"
          isVerified={message.sender?.is_verified}
        />
      )}
      {showAvatar && isOwn && <div className="w-8" />}

      <div className={cn(
        "relative max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm",
        isOwn
          ? "bg-primary text-white rounded-br-md"
          : "bg-white text-slate-900 rounded-bl-md border border-slate-100"
      )}>
        {renderContent()}

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
