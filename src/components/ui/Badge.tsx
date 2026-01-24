import { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface BadgeProps {
  children: ReactNode
  variant?: 'success' | 'warning' | 'info' | 'premium' | 'danger'
  className?: string
}

export default function Badge({ children, variant = 'info', className }: BadgeProps) {
  const variants = {
    success: 'bg-primary/10 text-primary',
    warning: 'bg-warning/10 text-warning',
    info: 'bg-blue-50 text-blue-600',
    premium: 'gradient-primary text-white',
    danger: 'bg-danger/10 text-danger',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
