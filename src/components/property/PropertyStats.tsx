import { LucideIcon } from 'lucide-react'
import { Card } from '../ui/Card'

interface PropertyStatsProps {
  icon: LucideIcon
  label: string
  value: string | number
  color?: string
}

export function PropertyStats({ icon: Icon, label, value, color = 'primary' }: PropertyStatsProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    warning: 'bg-warning/10 text-warning',
    success: 'bg-success/10 text-success',
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className="text-2xl font-display font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </Card>
  )
}
