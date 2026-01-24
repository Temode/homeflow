import { LucideIcon } from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4', className)}>
      <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
        <Icon className="w-12 h-12 text-slate-400" />
      </div>
      <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-center mb-8 max-w-md">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
