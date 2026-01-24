import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
}

export default function Card({ children, hover = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-card border border-slate-200 overflow-hidden',
        hover && 'transition-all duration-300 hover:shadow-xl hover:-translate-y-2 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
