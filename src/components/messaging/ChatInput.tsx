import { useState, FormEvent, KeyboardEvent } from 'react'
import { Send, Paperclip } from 'lucide-react'
import { Button } from '../ui/Button'

interface ChatInputProps {
  onSend: (content: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 p-4 bg-white">
      <div className="flex items-end gap-3">
        <button
          type="button"
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          disabled={disabled}
        >
          <Paperclip className="w-5 h-5" />
        </button>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tapez votre message..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!message.trim() || disabled}
          className="shrink-0"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </form>
  )
}
