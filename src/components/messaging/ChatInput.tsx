import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Image, X } from 'lucide-react'
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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [content])

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

    e.target.value = ''
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white">
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

      <div className="flex items-end gap-2 p-3">
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
