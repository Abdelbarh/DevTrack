import { Badge } from '@/components/ui/badge'
import type { ApplicationStatus } from '@/types/application'

const config: Record<ApplicationStatus, { label: string; className: string }> = {
  Saved:     { label: 'Saved',      className: 'bg-slate-100 text-slate-700 hover:bg-slate-100' },
  Applied:   { label: 'Applied',    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  Screening: { label: 'Screening',  className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  Interview: { label: 'Interview',  className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  Offer:     { label: 'Offer 🎉',   className: 'bg-green-100 text-green-700 hover:bg-green-100' },
  Rejected:  { label: 'Rejected',   className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  Withdrawn: { label: 'Withdrawn',  className: 'bg-slate-100 text-slate-500 hover:bg-slate-100' },
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, className } = config[status]
  return (
    <Badge variant="secondary" className={className}>
      {label}
    </Badge>
  )
}
