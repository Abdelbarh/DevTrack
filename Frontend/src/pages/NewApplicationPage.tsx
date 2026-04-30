import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useCreateApplication } from '@/hooks/useApplications'
import { Icon } from '@/components/ui/Icon'
import type { Application } from '@/types/application'

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export function NewApplicationPage() {
  const navigate = useNavigate()
  const { mutate, isPending } = useCreateApplication()
  const [text, setText] = useState('')

  function handleSave() {
    if (!text.trim()) return
    mutate(
      { jobDescriptionRaw: text.trim() },
      { onSuccess: (app: Application) => navigate(`/applications/${app.id}`) }
    )
  }

  const chars = text.length
  const words = wordCount(text)

  return (
    <>
      <div className="topbar">
        <div className="crumb">
          <Link to="/applications" style={{ color: 'var(--fg-2)', textDecoration: 'none' }}>
            Applications
          </Link>
          <span className="sep">/</span>
          <span className="now">New</span>
        </div>
      </div>

      <div style={{ padding: '40px 32px 64px', maxWidth: 760 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>JD-PARSE · NEW</div>
        <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.025em', margin: '0 0 8px' }}>
          Paste a job description
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--fg-2)', margin: '0 0 28px', lineHeight: 1.5 }}>
          We'll pull the structured stuff out so you can stop reading bullet points like a product manager.
        </p>

        {/* Textarea with file-like header */}
        <div style={{
          border: '1px solid var(--line-strong)',
          borderRadius: 10,
          overflow: 'hidden',
          background: 'var(--bg-1)',
        }}>
          {/* Header bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 14px',
            borderBottom: '1px solid var(--line)',
            background: 'var(--bg-2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="file" size={13} style={{ color: 'var(--fg-3)' } as React.CSSProperties} />
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--fg-3)' }}>
                source.txt
              </span>
            </div>
            {text && (
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)' }}>
                {chars.toLocaleString()} chars · ~{words.toLocaleString()} words
              </span>
            )}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
            placeholder="Senior Backend Engineer at Acme Corp — Remote US. We're looking for…"
            rows={20}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              padding: '16px',
              fontSize: 13,
              color: 'var(--fg-0)',
              outline: 'none',
              resize: 'none',
              lineHeight: 1.75,
              fontFamily: 'var(--mono)',
              display: 'block',
            }}
          />
        </div>

        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--fg-3)' }}>
            Or import from URL
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setText('')}
              disabled={!text || isPending}
            >
              Clear
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              disabled={isPending || !text.trim()}
            >
              {isPending ? (
                <><Icon name="loader" size={12} /> Saving…</>
              ) : (
                <><Icon name="zap" size={12} /> Parse with AI</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
