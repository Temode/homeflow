import { cn } from '@/utils/cn'

interface LoadingSkeletonProps {
  className?: string
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-slate-200 rounded', className)} />
  )
}

export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-card border border-slate-200 overflow-hidden">
      <LoadingSkeleton className="w-full h-48" />
      <div className="p-4 space-y-3">
        <LoadingSkeleton className="h-4 w-24" />
        <LoadingSkeleton className="h-6 w-full" />
        <LoadingSkeleton className="h-4 w-32" />
        <div className="flex gap-4 pt-2">
          <LoadingSkeleton className="h-4 w-16" />
          <LoadingSkeleton className="h-4 w-16" />
          <LoadingSkeleton className="h-4 w-16" />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <LoadingSkeleton className="h-10 w-10 rounded-full" />
          <LoadingSkeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}
