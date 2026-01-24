import { ShieldCheck } from 'lucide-react'
import { cn } from '../../utils/cn'

interface VerificationBadgeProps {
  className?: string
}

export function VerificationBadge({ className }: VerificationBadgeProps) {
  return (
    <div 
      className={cn('inline-flex items-center gap-1 text-primary', className)}
      title="Identité vérifiée"
    >
      <ShieldCheck className="w-4 h-4 fill-current" />
    </div>
  )
}
