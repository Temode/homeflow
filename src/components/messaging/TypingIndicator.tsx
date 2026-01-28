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
