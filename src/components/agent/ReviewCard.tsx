import { Star } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Avatar } from '../ui/Avatar'

interface ReviewCardProps {
  rating: number
  comment: string | null
  authorName: string
  authorAvatar?: string | null
  createdAt: string
}

export function ReviewCard({
  rating,
  comment,
  authorName,
  authorAvatar,
  createdAt,
}: ReviewCardProps) {
  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-warning text-warning' : 'text-slate-300'
        }`}
      />
    ))
  }

  return (
    <div className="bg-white rounded-card border border-slate-200 p-6">
      <div className="flex items-start gap-4">
        <Avatar name={authorName} imageUrl={authorAvatar} size="md" />
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-slate-900">{authorName}</h4>
            <span className="text-xs text-slate-500">
              {formatDistanceToNow(new Date(createdAt), {
                addSuffix: true,
                locale: fr,
              })}
            </span>
          </div>
          
          <div className="flex items-center gap-1 mb-3">{renderStars()}</div>
          
          {comment && <p className="text-slate-700 text-sm leading-relaxed">{comment}</p>}
        </div>
      </div>
    </div>
  )
}
