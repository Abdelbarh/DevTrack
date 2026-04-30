import { useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router'
import { useApplications } from '@/hooks/useApplications'
import { AddApplicationDialog } from '@/components/applications/AddApplicationDialog'
import { StatusBadge } from '@/components/applications/StatusBadge'
import { Icon } from '@/components/ui/Icon'
import type { ApplicationStatus } from '@/types/application'

const PIPELINE: { id: string; label: string; status: ApplicationStatus }[] = [
  { id: 'saved',     label: 'Saved',     status: 'Saved' },
  { id: 'applied',   label: 'Applied',   status: 'Applied' },
  { id: 'screening', label: 'Screening', status: 'Screening' },
  { id: 'interview', label: 'Interview', status: 'Interview' },
  { id: 'offer',     label: 'Offer',     status: 'Offer' },
  { id: 'rejected',  label: 'Rejected',  status: 'Rejected' },
]

function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(ms / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0) return `${mins}m ago`
  return 'just now'
}

function coInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

export function DashboardPage() {
  const { user } = useUser()
  const navigate = useNavigate()
  const { data: applications = [], isLoading } = useApplications()

  const counts = PIPELINE.map((stage) => ({
    ...stage,
    n: applications.filter((a) => a.status === stage.status).length,
  }))

  const recent = [...applications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <>
      <div className="topbar">
        <div className="crumb">
          <span className="now">Dashboard</span>
        </div>
        <div className="topbar-actions">
          <AddApplicationDialog />
        </div>
      </div>

      <div style={{ padding: '40px 32px 64px', maxWidth: 940, width: '100%', margin: '0 auto' }}>
        <header style={{ marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}>
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p style={{ color: 'var(--fg-2)', margin: '6px 0 0', fontSize: 14 }}>
            {applications.length === 0
              ? "Let's get your first application in."
              : "Here's where things stand."}
          </p>
        </header>

        {isLoading ? (
          <LoadingShimmer />
        ) : applications.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Pipeline counts */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Pipeline</h3>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)' }}>
                  {applications.length} total
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                {counts.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      padding: '12px',
                      borderRadius: 8,
                      background: 'var(--bg-2)',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: `var(--status-${p.id})`,
                        boxShadow: `0 0 6px var(--status-${p.id})`,
                        flexShrink: 0,
                      }} />
                      <span style={{
                        fontFamily: 'var(--mono)', fontSize: 10,
                        color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.08em',
                      }}>
                        {p.label}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 22, fontWeight: 500,
                      color: p.n === 0 ? 'var(--fg-3)' : 'var(--fg-0)',
                      letterSpacing: '-0.02em',
                    }}>
                      {p.n}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent applications */}
            <div className="card" style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Recent applications</h3>
                <button
                  onClick={() => navigate('/applications')}
                  className="btn btn-ghost btn-sm"
                  style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 11 }}
                >
                  View all →
                </button>
              </div>

              {recent.map((app, i) => (
                <div
                  key={app.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '32px minmax(0, 1fr) 104px 72px',
                    gap: 12,
                    padding: '12px 4px',
                    alignItems: 'center',
                    borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: 'var(--bg-2)', border: '1px solid var(--line)',
                    display: 'grid', placeItems: 'center',
                    fontSize: 11, fontWeight: 600, color: 'var(--fg-1)',
                    fontFamily: 'var(--mono)',
                  }}>
                    {coInitials(app.companyName)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 500, color: 'var(--fg-0)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {app.jobTitle ?? 'Unknown position'}
                    </div>
                    <div style={{
                      fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-2)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {app.companyName ?? 'Unknown company'}
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 11,
                    color: 'var(--fg-3)', textAlign: 'right',
                  }}>
                    {timeAgo(app.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function EmptyState() {
  return (
    <div style={{
      border: '1px dashed var(--line-strong)',
      borderRadius: 16, padding: '64px 32px',
      textAlign: 'center', background: 'var(--bg-1)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(oklch(0.5 0.05 250 / 0.06) 1px, transparent 1px)',
        backgroundSize: '14px 14px', pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 12,
          background: 'var(--bg-2)', border: '1px solid var(--line-strong)',
          display: 'grid', placeItems: 'center', color: 'var(--fg-1)',
        }}>
          <Icon name="inbox" size={22} />
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 500 }}>No applications yet</div>
          <div style={{ fontSize: 13.5, color: 'var(--fg-2)', marginTop: 6, maxWidth: 360 }}>
            Paste a job description to get started — DevTrack will pull out the structured details.
          </div>
        </div>
        <AddApplicationDialog />
      </div>
    </div>
  )
}

function LoadingShimmer() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[80, 60, 90].map((w, i) => (
        <div
          key={i}
          className="shimmer-line"
          style={{ height: 44, borderRadius: 8, width: `${w}%` }}
        />
      ))}
    </div>
  )
}
