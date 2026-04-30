import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useApplications } from '@/hooks/useApplications'
import { StatusBadge } from '@/components/applications/StatusBadge'
import { Icon } from '@/components/ui/Icon'
import type { Application, ApplicationStatus } from '@/types/application'

const STATUS_FILTERS: { id: string; label: string; value: ApplicationStatus | 'All' }[] = [
  { id: 'all',       label: 'All',       value: 'All' },
  { id: 'saved',     label: 'Saved',     value: 'Saved' },
  { id: 'applied',   label: 'Applied',   value: 'Applied' },
  { id: 'screening', label: 'Screening', value: 'Screening' },
  { id: 'interview', label: 'Interview', value: 'Interview' },
  { id: 'offer',     label: 'Offer',     value: 'Offer' },
  { id: 'rejected',  label: 'Rejected',  value: 'Rejected' },
]

function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(ms / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 7) return `${Math.floor(days / 7)}w`
  if (days > 0) return `${days}d`
  if (hours > 0) return `${hours}h`
  return `${mins}m`
}

function coInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

export function ApplicationsPage() {
  const navigate = useNavigate()
  const { data: applications = [], isLoading } = useApplications()
  const [filter, setFilter] = useState<ApplicationStatus | 'All'>('All')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<'recent' | 'score'>('recent')

  const filtersWithCounts = STATUS_FILTERS.map((f) => ({
    ...f,
    n: f.value === 'All'
      ? applications.length
      : applications.filter((a) => a.status === f.value).length,
  }))

  let rows = applications.filter((a) => {
    const matchFilter = filter === 'All' || a.status === filter
    const matchQ =
      q === '' ||
      (a.companyName ?? '').toLowerCase().includes(q.toLowerCase()) ||
      (a.jobTitle ?? '').toLowerCase().includes(q.toLowerCase())
    return matchFilter && matchQ
  })

  if (sort === 'score') {
    rows = [...rows].sort((x, y) => (y.matchScore ?? -1) - (x.matchScore ?? -1))
  }

  return (
    <>
      <div className="topbar">
        <div className="crumb">
          <span className="now">Applications</span>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/applications/new')}>
            <Icon name="plus" size={13} />
            New application
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Status filter sidebar */}
        <aside style={{ borderRight: '1px solid var(--line)', padding: '20px 14px', overflowY: 'auto' }}>
          <div className="eyebrow" style={{ padding: '0 8px 8px' }}>Status</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {filtersWithCounts.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.value)}
                className={`nav-item${filter === f.value ? ' active' : ''}`}
              >
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                  background: f.id === 'all' ? 'var(--fg-3)' : `var(--status-${f.id})`,
                }} />
                {f.label}
                <span className="nav-count">{f.n}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main table area */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {/* Search/sort bar */}
          <div style={{
            position: 'sticky', top: 0, zIndex: 3,
            background: 'var(--bg-0)',
            borderBottom: '1px solid var(--line)',
            padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px',
              background: 'var(--bg-2)', border: '1px solid var(--line)',
              borderRadius: 6, flex: 1, maxWidth: 320,
            }}>
              <Icon name="search" size={13} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search company or role…"
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  outline: 'none', color: 'var(--fg-0)', fontSize: 13,
                }}
              />
              {q && (
                <button
                  onClick={() => setQ('')}
                  style={{ background: 'none', border: 'none', padding: 0, color: 'var(--fg-3)', lineHeight: 1 }}
                >
                  <Icon name="x" size={12} />
                </button>
              )}
            </div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', marginLeft: 'auto' }}>
              {rows.length}{applications.length > 0 ? ` of ${applications.length}` : ''}
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as 'recent' | 'score')}
              style={{
                padding: '6px 10px', borderRadius: 6,
                background: 'var(--bg-2)', border: '1px solid var(--line)',
                color: 'var(--fg-0)', fontSize: 12, fontFamily: 'var(--sans)',
                outline: 'none',
              }}
            >
              <option value="recent">Sort: Recent</option>
              <option value="score">Sort: Match score</option>
            </select>
          </div>

          {isLoading ? (
            <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="shimmer-line" style={{ height: 52, borderRadius: 6 }} />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <AppsEmpty hasData={applications.length > 0} isFiltered={filter !== 'All' || q !== ''} />
          ) : (
            <>
              {/* Column headers */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(160px, 1fr) 110px 80px 104px 40px',
                gap: 8,
                padding: '10px 14px',
                borderBottom: '1px solid var(--line)',
                fontFamily: 'var(--mono)', fontSize: 10.5,
                color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                <span>Role · Company</span>
                <span>Location</span>
                <span>Match</span>
                <span>Status</span>
                <span style={{ textAlign: 'right' }}>Age</span>
              </div>

              {rows.map((app) => (
                <AppRow key={app.id} app={app} />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  )
}

function AppRow({ app }: { app: Application }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => navigate(`/applications/${app.id}`)}
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(160px, 1fr) 110px 80px 104px 40px',
        gap: 8,
        padding: '12px 14px',
        alignItems: 'center',
        borderBottom: '1px solid var(--line)',
        cursor: 'pointer',
        background: hovered ? 'var(--bg-1)' : 'transparent',
        transition: 'background 0.1s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6, flexShrink: 0,
          background: 'var(--bg-2)', border: '1px solid var(--line)',
          display: 'grid', placeItems: 'center',
          fontSize: 11, fontWeight: 600, color: 'var(--fg-1)',
          fontFamily: 'var(--mono)',
        }}>
          {coInitials(app.companyName)}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: 13.5, fontWeight: 500, color: 'var(--fg-0)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {app.jobTitle ?? 'Unknown position'}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden',
          }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-2)' }}>
              {app.companyName ?? 'Unknown company'}
            </span>
            {app.parsedData?.stack?.slice(0, 3).map((tech) => (
              <span key={tech} style={{
                fontFamily: 'var(--mono)', fontSize: 10,
                padding: '1px 5px', borderRadius: 3,
                background: 'var(--bg-2)', border: '1px solid var(--line)',
                color: 'var(--fg-2)',
              }}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {app.parsedData?.location ?? <span style={{ color: 'var(--fg-3)' }}>—</span>}
      </span>

      <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-1)' }}>
        {app.matchScore != null ? (
          <ScoreBadge value={app.matchScore} />
        ) : (
          <span style={{ color: 'var(--fg-3)' }}>—</span>
        )}
      </span>

      <StatusBadge status={app.status} />

      <span style={{
        fontFamily: 'var(--mono)', fontSize: 11,
        color: 'var(--fg-3)', textAlign: 'right',
      }}>
        {timeAgo(app.createdAt)}
      </span>
    </div>
  )
}

function ScoreBadge({ value }: { value: number }) {
  const color =
    value >= 85 ? 'var(--accent)' :
    value >= 70 ? 'oklch(0.82 0.12 90)' :
    'var(--fg-2)'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 7px', borderRadius: 4,
      background: 'var(--bg-2)', border: '1px solid var(--line)',
      fontFamily: 'var(--mono)', fontSize: 11,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}` }} />
      <span style={{ color: 'var(--fg-0)', fontWeight: 500 }}>{value}</span>
    </span>
  )
}

function AppsEmpty({ hasData, isFiltered }: { hasData: boolean; isFiltered: boolean }) {
  const navigate = useNavigate()
  return (
    <div style={{
      padding: '64px 32px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      textAlign: 'center',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: 'var(--bg-2)', border: '1px solid var(--line-strong)',
        display: 'grid', placeItems: 'center', color: 'var(--fg-2)',
      }}>
        <Icon name={isFiltered ? 'search' : 'inbox'} size={18} />
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 500 }}>
          {isFiltered ? 'No matches' : 'No applications yet'}
        </div>
        <div style={{ fontSize: 13, color: 'var(--fg-2)', marginTop: 4, maxWidth: 320 }}>
          {isFiltered
            ? 'Try a different filter or search term.'
            : 'Paste a job description to add your first application.'}
        </div>
      </div>
      {!hasData && (
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/applications/new')}>
          <Icon name="plus" size={13} />
          Add first application
        </button>
      )}
    </div>
  )
}
