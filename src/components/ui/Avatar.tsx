import { cn } from '@/utils/cn'
import { ShieldCheck } from 'lucide-react'

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  isVerified?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Avatar({ 
  src, 
  alt, 
  name, 
  isVerified = false, 
  size = 'md',
  className 
}: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-20 h-20 text-2xl',
  }

  const getInitials = (name?: string) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold overflow-hidden',
          sizes[size],
          className
        )}
      >
        {src ? (
          <img src={src} alt={alt || name} className="w-full h-full object-cover" />
        ) : (
          getInitials(name)
        )}
      </div>
      {isVerified && (
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" title="Identité vérifiée">
          <ShieldCheck className="w-4 h-4 text-primary fill-primary" />
        </div>
      )}
    </div>
  )
}
