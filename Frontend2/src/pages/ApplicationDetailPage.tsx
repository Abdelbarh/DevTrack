import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import {
  useApplication,
  useDeleteApplication,
  useParseApplication,
  useScoreApplication,
  useUpdateApplicationStatus,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
} from '@/hooks/useApplications'
import { StatusBadge } from '@/components/applications/StatusBadge'
import { Icon } from '@/components/ui/Icon'
import type { ApplicationStatus, DocumentDto } from '@/types/application'

const PIPELINE: ApplicationStatus[] = ['Saved', 'Applied', 'Screening', 'Interview', 'Offer']
const TERMINAL: ApplicationStatus[] = ['Rejected', 'Withdrawn']

function timeAgo(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(ms / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 7) return `${Math.floor(days / 7)}w ago`
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return `${mins}m ago`
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function fmtSalary(min: number | null, max: number | null, currency: string | null) {
  const c = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : (currency ?? '')
  const fmt = (n: number) => n >= 1000 ? `${c}${(n / 1000).toFixed(0)}k` : `${c}${n}`
  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `${fmt(min)}+`
  if (max) return `up to ${fmt(max)}`
  return null
}

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

function CircularScore({ score }: { score: number }) {
  const r = 34
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const color = score >= 85 ? 'var(--accent)' : score >= 70 ? 'oklch(0.82 0.12 90)' : 'var(--fg-2)'
  return (
    <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
      <svg width={80} height={80} viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={40} cy={40} r={r} fill="none" stroke="var(--bg-3)" strokeWidth={5} />
        <circle
          cx={40} cy={40} r={r} fill="none"
          stroke={color} strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--mono)', color, lineHeight: 1 }}>
          {score}
        </span>
      </div>
    </div>
  )
}

function PipelineBar({ current, isTerminal, onSelect, disabled }: {
  current: ApplicationStatus
  isTerminal: boolean
  onSelect: (s: ApplicationStatus) => void
  disabled: boolean
}) {
  const idx = isTerminal ? -1 : PIPELINE.indexOf(current)
  return (
    <div style={{ position: 'relative', padding: '8px 0 12px' }}>
      {/* Track */}
      <div style={{
        position: 'absolute', top: 14, left: 6, right: 6, height: 2,
        background: 'var(--bg-3)', borderRadius: 2,
      }} />
      {/* Fill */}
      {idx >= 0 && (
        <div style={{
          position: 'absolute', top: 14, left: 6,
          width: `calc(${(idx / (PIPELINE.length - 1)) * 100}% - 12px * ${idx / (PIPELINE.length - 1)})`,
          height: 2, background: `var(--status-${current.toLowerCase()})`,
          borderRadius: 2, transition: 'width 0.4s ease',
        }} />
      )}
      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
        {PIPELINE.map((stage, i) => {
          const isActive = !isTerminal && stage === current
          const isPast = !isTerminal && i <= idx
          const color = isActive ? `var(--status-${stage.toLowerCase()})` : 'var(--bg-3)'
          return (
            <button
              key={stage}
              onClick={() => onSelect(stage)}
              disabled={disabled}
              title={stage}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer',
                padding: 0,
              }}
            >
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: isPast || isActive ? (isActive ? color : 'var(--fg-3)') : 'var(--bg-3)',
                border: isActive ? `2px solid ${color}` : isPast ? '2px solid var(--fg-3)' : '2px solid var(--bg-3)',
                boxShadow: isActive ? `0 0 8px ${color}` : 'none',
                transition: 'all 0.2s',
              }} />
              <span style={{
                fontFamily: 'var(--mono)', fontSize: 9.5,
                color: isActive ? color : isPast ? 'var(--fg-2)' : 'var(--fg-3)',
                textTransform: 'lowercase', whiteSpace: 'nowrap',
              }}>
                {stage.toLowerCase()}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: app, isLoading, isError } = useApplication(id!)
  const { mutate: deleteApp, isPending: deleting } = useDeleteApplication()
  const { mutate: parseApp, isPending: parsing } = useParseApplication()
  const { mutate: scoreApp, isPending: scoring } = useScoreApplication()
  const { mutate: updateStatus, isPending: updatingStatus } = useUpdateApplicationStatus()
  const { mutate: createDoc, isPending: generatingDoc } = useCreateDocument()

  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [docContent, setDocContent] = useState('')
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [jdExpanded, setJdExpanded] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { mutate: updateDoc } = useUpdateDocument()
  const { mutate: deleteDoc } = useDeleteDocument()

  const sortedDocs = [...(app?.documents ?? [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  useEffect(() => {
    if (!sortedDocs.length) return
    if (!selectedDocId || !app?.documents.find((d) => d.id === selectedDocId)) {
      setSelectedDocId(sortedDocs[0].id)
      setDocContent(sortedDocs[0].content)
    }
  }, [app?.documents])

  const handleDocChange = useCallback((value: string) => {
    setDocContent(value)
    setSaveState('saving')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (!id || !selectedDocId) return
      updateDoc({ appId: id, docId: selectedDocId, content: value }, {
        onSuccess: () => { setSaveState('saved'); setTimeout(() => setSaveState('idle'), 2000) },
      })
    }, 900)
  }, [id, selectedDocId, updateDoc])

  function handleGenerate() {
    if (!id) return
    createDoc(id, {
      onSuccess: (doc) => { setSelectedDocId(doc.id); setDocContent(doc.content) },
    })
  }

  function handleDelete() {
    if (!id || !confirm('Delete this application?')) return
    deleteApp(id, { onSuccess: () => navigate('/applications') })
  }

  const isTerminal = TERMINAL.includes(app?.status as ApplicationStatus)
  const currentStage = app?.status as ApplicationStatus

  if (isLoading) {
    return (
      <>
        <div className="topbar">
          <div className="crumb">
            <Link to="/applications" style={{ color: 'var(--fg-2)', textDecoration: 'none' }}>Applications</Link>
            <span className="sep">/</span>
            <span className="shimmer-line" style={{ width: 200, height: 12, display: 'inline-block' }} />
          </div>
        </div>
        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => <div key={i} className="shimmer-line" style={{ height: 72, borderRadius: 8 }} />)}
        </div>
      </>
    )
  }

  if (isError || !app) {
    return (
      <>
        <div className="topbar">
          <div className="crumb">
            <Link to="/applications" style={{ color: 'var(--fg-2)', textDecoration: 'none' }}>Applications</Link>
          </div>
        </div>
        <div style={{ padding: '64px 32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--status-rejected)', fontFamily: 'var(--mono)', fontSize: 13 }}>Application not found.</p>
          <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={() => navigate('/applications')}>
            Back to applications
          </button>
        </div>
      </>
    )
  }

  const selectedDoc = sortedDocs.find((d) => d.id === selectedDocId)

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="crumb">
          <Link to="/applications" style={{ color: 'var(--fg-2)', textDecoration: 'none' }}>Applications</Link>
          {app.companyName && <><span className="sep">/</span><span style={{ color: 'var(--fg-2)' }}>{app.companyName}</span></>}
          {app.jobTitle && <><span className="sep">/</span><span className="now">{app.jobTitle}</span></>}
        </div>
        <div className="topbar-actions">
          <button className="btn btn-sm" onClick={() => parseApp(id!)} disabled={parsing}>
            {parsing ? <><Icon name="loader" size={12} /> Parsing…</> : <><Icon name="zap" size={12} /> Parse</>}
          </button>
          <button className="btn btn-sm" onClick={() => scoreApp(id!)} disabled={scoring}>
            {scoring ? <><Icon name="loader" size={12} /> Scoring…</> : <><Icon name="star" size={12} /> Score</>}
          </button>
          <button className="btn btn-sm btn-danger" onClick={handleDelete} disabled={deleting}>
            <Icon name="trash" size={12} /> Delete
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* LEFT SIDEBAR */}
        <aside style={{
          borderRight: '1px solid var(--line)',
          overflowY: 'auto',
          padding: '24px 20px 48px',
        }}>
          {/* Header */}
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            {[app.companyName, app.createdAt ? fmtDate(app.createdAt) : null].filter(Boolean).join(' · ')}
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
            {app.jobTitle ?? 'Untitled position'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            <StatusBadge status={currentStage} />
          </div>

          {/* Pipeline */}
          <div style={{ marginBottom: 16 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Pipeline</div>
            <PipelineBar
              current={currentStage}
              isTerminal={isTerminal}
              onSelect={(s) => updateStatus({ id: id!, newStatus: s })}
              disabled={updatingStatus}
            />
            {/* Quick actions */}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {currentStage === 'Saved' && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => updateStatus({ id: id!, newStatus: 'Applied' })}
                  disabled={updatingStatus}
                  style={{ fontSize: 11.5 }}
                >
                  <Icon name="check" size={11} /> Mark applied
                </button>
              )}
              {isTerminal ? (
                <button className="btn btn-secondary btn-sm" onClick={() => updateStatus({ id: id!, newStatus: 'Saved' })} disabled={updatingStatus} style={{ fontSize: 11.5 }}>
                  Reopen
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 4 }}>
                  {TERMINAL.map((s) => (
                    <button key={s} className="btn btn-sm" onClick={() => updateStatus({ id: id!, newStatus: s })} disabled={updatingStatus}
                      style={{ fontSize: 11, color: s === 'Rejected' ? 'var(--status-rejected)' : 'var(--fg-2)', padding: '3px 8px' }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="hr" style={{ margin: '16px 0' }} />

          {/* Match score */}
          {app.matchScore != null && (
            <div style={{ marginBottom: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Match score</div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <CircularScore score={app.matchScore} />
                <div style={{ flex: 1 }}>
                  {app.matchExplanation && (
                    <p style={{ fontSize: 12, color: 'var(--fg-1)', lineHeight: 1.6, margin: 0 }}>
                      {app.matchExplanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Parsed data */}
          {app.parsedData && (
            <div style={{ marginBottom: 20 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>Parsed</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {app.parsedData.seniorityLevel && <ParsedRow label="seniority" value={app.parsedData.seniorityLevel} />}
                {app.parsedData.remotePolicy && (
                  <ParsedRow label="mode" value={
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, display: 'inline-block' }} />
                      {app.parsedData.remotePolicy}
                    </span>
                  } />
                )}
                {app.parsedData.location && <ParsedRow label="location" value={app.parsedData.location} />}
                {fmtSalary(app.parsedData.salaryMin, app.parsedData.salaryMax, app.parsedData.salaryCurrency) && (
                  <ParsedRow label="comp" value={fmtSalary(app.parsedData.salaryMin, app.parsedData.salaryMax, app.parsedData.salaryCurrency)!} />
                )}
                {app.parsedData.postedAt && (
                  <ParsedRow label="posted" value={timeAgo(app.parsedData.postedAt)} />
                )}
              </div>
              {app.parsedData.stack?.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
                  {app.parsedData.stack.map((t) => <span key={t} className="pill">{t}</span>)}
                </div>
              ) : null}
            </div>
          )}

          {/* Job description toggle */}
          <div style={{ marginBottom: 16 }}>
            <button
              onClick={() => setJdExpanded((v) => !v)}
              className="eyebrow"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--fg-3)', marginBottom: jdExpanded ? 8 : 0 }}
            >
              Job description
              <Icon name={jdExpanded ? 'chevronUp' : 'chevronDown'} size={11} />
            </button>
            {jdExpanded && (
              <pre style={{
                fontSize: 11.5, whiteSpace: 'pre-wrap', fontFamily: 'var(--mono)',
                color: 'var(--fg-2)', margin: 0, lineHeight: 1.7,
                maxHeight: 240, overflowY: 'auto',
                background: 'var(--bg-2)', borderRadius: 6, padding: '10px 12px',
                border: '1px solid var(--line)',
              }}>
                {app.jobDescriptionRaw}
              </pre>
            )}
          </div>

          <div className="hr" style={{ margin: '16px 0' }} />

          {/* Activity */}
          {(app.statusHistory ?? []).length > 0 && (
            <div>
              <div className="eyebrow" style={{ marginBottom: 12 }}>Activity</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[...(app.statusHistory ?? [])].sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()).map((event, i, arr) => (
                  <div key={event.id} style={{ display: 'flex', gap: 10 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{
                        width: 7, height: 7, borderRadius: '50%', marginTop: 3, flexShrink: 0,
                        background: i === 0 ? 'var(--accent)' : 'var(--bg-3)',
                        border: `1px solid ${i === 0 ? 'var(--accent)' : 'var(--line-strong)'}`,
                        boxShadow: i === 0 ? '0 0 6px var(--accent)' : 'none',
                      }} />
                      {i < arr.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--line)', minHeight: 16 }} />}
                    </div>
                    <div style={{ paddingBottom: 12 }}>
                      <div style={{ fontSize: 12, color: 'var(--fg-0)', fontWeight: 500 }}>
                        {event.fromStatus ? `${event.fromStatus} → ${event.toStatus}` : event.toStatus}
                      </div>
                      {event.note && <div style={{ fontSize: 11, color: 'var(--fg-2)', marginTop: 1 }}>{event.note}</div>}
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-3)', marginTop: 2 }}>
                        {fmtDate(event.changedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* RIGHT — Cover letters */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Tab bar */}
          <div style={{
            display: 'flex', alignItems: 'center',
            borderBottom: '1px solid var(--line)',
            padding: '0 4px',
            flexShrink: 0, overflowX: 'auto',
            background: 'var(--bg-0)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 0 }}>
              {sortedDocs.map((doc, i) => {
                const wc = wordCount(doc.content)
                const isActive = doc.id === selectedDocId
                return (
                  <button
                    key={doc.id}
                    onClick={() => { setSelectedDocId(doc.id); setDocContent(doc.content); setSaveState('idle') }}
                    style={{
                      padding: '13px 14px 11px',
                      border: 'none', background: 'none', cursor: 'pointer',
                      borderBottom: isActive ? '2px solid var(--fg-0)' : '2px solid transparent',
                      color: isActive ? 'var(--fg-0)' : 'var(--fg-2)',
                      fontSize: 12.5, fontWeight: isActive ? 500 : 400,
                      display: 'flex', alignItems: 'center', gap: 6,
                      whiteSpace: 'nowrap', transition: 'color 0.1s',
                      fontFamily: 'var(--sans)',
                    }}
                  >
                    Cover letter {i + 1}
                    {wc > 0 && <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>{wc}w</span>}
                  </button>
                )
              })}
              <button
                onClick={handleGenerate}
                disabled={generatingDoc}
                style={{
                  padding: '13px 14px 11px',
                  border: 'none', background: 'none', cursor: 'pointer',
                  color: 'var(--accent)', fontSize: 12.5,
                  display: 'flex', alignItems: 'center', gap: 5,
                  whiteSpace: 'nowrap', fontFamily: 'var(--sans)',
                  borderBottom: '2px solid transparent',
                }}
              >
                {generatingDoc ? <><Icon name="loader" size={11} /> Generating…</> : <><Icon name="plus" size={11} /> New</>}
              </button>
            </div>
            {selectedDoc && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px', flexShrink: 0 }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>
                  {saveState === 'saving' ? 'saving…' : saveState === 'saved' ? '✓ saved' : `edited ${timeAgo(selectedDoc.updatedAt)}`}
                </span>
                <button
                  className="btn btn-icon btn-ghost btn-sm"
                  onClick={() => navigator.clipboard.writeText(docContent)}
                  title="Copy"
                >
                  <Icon name="copy" size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Cover letter body */}
          {sortedDocs.length === 0 ? (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center', padding: 48,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'var(--bg-2)', border: '1px solid var(--line)',
                display: 'grid', placeItems: 'center', color: 'var(--fg-3)',
              }}>
                <Icon name="file" size={20} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 500 }}>No cover letters yet</div>
                <div style={{ fontSize: 13, color: 'var(--fg-2)', marginTop: 4 }}>Generate a tailored cover letter.</div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleGenerate} disabled={generatingDoc}>
                <Icon name="zap" size={12} /> Generate cover letter
              </button>
            </div>
          ) : selectedDoc ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Letter header */}
              <div style={{ padding: '28px 40px 20px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>
                  COVER-LETTER · CL_{String(sortedDocs.findIndex((d) => d.id === selectedDocId) + 1).padStart(2, '0')}
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 8px', letterSpacing: '-0.02em', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>
                  {app.companyName ?? 'Cover letter'}
                </h2>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)' }}>
                  {wordCount(docContent)} words · ~{Math.max(1, Math.round(wordCount(docContent) / 200))} min read
                </div>
              </div>

              {/* Editable content */}
              <textarea
                value={docContent}
                onChange={(e) => handleDocChange(e.target.value)}
                style={{
                  flex: 1, resize: 'none', border: 'none', outline: 'none',
                  background: 'transparent', color: 'var(--fg-0)',
                  fontFamily: 'var(--serif)', fontSize: 15, lineHeight: 1.8,
                  padding: '28px 40px', overflowY: 'auto',
                  letterSpacing: '-0.01em',
                }}
              />

              {/* Bottom action bar */}
              <div style={{
                borderTop: '1px solid var(--line)',
                padding: '10px 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0, background: 'var(--bg-0)',
              }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-sm" style={{ fontSize: 12 }}>
                    <Icon name="refresh" size={11} /> Regenerate
                  </button>
                  <button className="btn btn-sm" style={{ fontSize: 12 }}>
                    <Icon name="edit" size={11} /> Tone…
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button
                    className="btn btn-sm btn-danger"
                    style={{ fontSize: 12 }}
                    onClick={() => {
                      if (!id) return
                      deleteDoc({ appId: id, docId: selectedDoc.id }, {
                        onSuccess: () => { setSelectedDocId(null); setDocContent('') },
                      })
                    }}
                  >
                    <Icon name="trash" size={11} /> Delete letter
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}

function ParsedRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--fg-3)', width: 58, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 12.5, color: 'var(--fg-0)' }}>{value}</span>
    </div>
  )
}
