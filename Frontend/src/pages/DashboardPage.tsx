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

      <div style={{ padding: '48px 36px 72px', maxWidth: 960, width: '100%', margin: '0 auto' }}>
        <header style={{ marginBottom: 36 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em' }}>
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
          </h1>
          <p style={{ color: 'var(--fg-2)', margin: '8px 0 0', fontSize: 15 }}>
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
            <div className="card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Pipeline</h3>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--fg-3)' }}>
                  {applications.length} total
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
                {counts.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      padding: '14px',
                      borderRadius: 10,
                      background: 'var(--bg-2)',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <span style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: `var(--status-${p.id})`,
                        boxShadow: `0 0 7px var(--status-${p.id})`,
                        flexShrink: 0,
                      }} />
                      <span style={{
                        fontFamily: 'var(--mono)', fontSize: 10.5,
                        color: 'var(--fg-2)', textTransform: 'uppercase', letterSpacing: '0.07em',
                      }}>
                        {p.label}
                      </span>
                    </div>
                    <div style={{
                      fontSize: 26, fontWeight: 500,
                      color: p.n === 0 ? 'var(--fg-3)' : 'var(--fg-0)',
                      letterSpacing: '-0.03em', lineHeight: 1,
                    }}>
                      {p.n}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent applications */}
            <div className="card" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Recent applications</h3>
                <button
                  onClick={() => navigate('/applications')}
                  className="btn btn-ghost btn-sm"
                  style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 11.5 }}
                >
                  View all →
                </button>
              </div>

              {recent.map((app, i) => (
                <div
                  key={app.id}
                  onClick={() => navigate(`/applications/${app.id}`)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '36px minmax(0, 1fr) 112px 72px',
                    gap: 14,
                    padding: '13px 6px',
                    alignItems: 'center',
                    borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                    cursor: 'pointer',
                    borderRadius: 8,
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 7,
                    background: 'var(--bg-2)', border: '1px solid var(--line)',
                    display: 'grid', placeItems: 'center',
                    fontSize: 11.5, fontWeight: 600, color: 'var(--fg-1)',
                    fontFamily: 'var(--mono)',
                  }}>
                    {coInitials(app.companyName)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 14, fontWeight: 500, color: 'var(--fg-0)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {app.jobTitle ?? 'Unknown position'}
                    </div>
                    <div style={{
                      fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--fg-2)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {app.companyName ?? 'Unknown company'}
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                  <span style={{
                    fontFamily: 'var(--mono)', fontSize: 11.5,
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
