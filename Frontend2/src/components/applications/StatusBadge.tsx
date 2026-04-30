import type { ApplicationStatus } from '@/types/application'

const statusMap: Record<ApplicationStatus, { color: string; label: string }> = {
  Saved:     { color: 'var(--status-saved)',     label: 'saved' },
  Applied:   { color: 'var(--status-applied)',   label: 'applied' },
  Screening: { color: 'var(--status-screening)', label: 'screening' },
  Interview: { color: 'var(--status-interview)', label: 'interview' },
  Offer:     { color: 'var(--status-offer)',     label: 'offer' },
  Rejected:  { color: 'var(--status-rejected)',  label: 'rejected' },
  Withdrawn: { color: 'var(--status-withdrawn)', label: 'withdrawn' },
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const s = statusMap[status] ?? statusMap.Saved
  return (
    <span className="status" style={{ color: s.color, borderColor: 'oklch(1 0 0 / 0.10)' }}>
      <span
        className="pill-dot"
        style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }}
      />
      {s.label}
    </span>
  )
}
