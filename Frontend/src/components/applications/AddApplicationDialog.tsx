import { useState } from 'react'
import { useCreateApplication } from '@/hooks/useApplications'
import { Icon } from '@/components/ui/Icon'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export function AddApplicationDialog() {
  const [open, setOpen] = useState(false)
  const [jd, setJd] = useState('')
  const { mutate, isPending, error } = useCreateApplication()

  function handleSubmit() {
    if (!jd.trim()) return
    mutate(
      { jobDescriptionRaw: jd },
      {
        onSuccess: () => {
          setJd('')
          setOpen(false)
        },
      }
    )
  }

  return (
    <>
      <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
        <Icon name="plus" size={13} />
        New application
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl" style={{ background: 'var(--bg-1)', border: '1px solid var(--line-strong)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--fg-0)' }}>New application</DialogTitle>
            <DialogDescription style={{ color: 'var(--fg-2)' }}>
              Paste the full job description — DevTrack will extract the company, title, stack, and more.
            </DialogDescription>
          </DialogHeader>

          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={14}
            placeholder="Paste the job description here…"
            style={{
              width: '100%',
              background: 'var(--bg-3)',
              border: '1px solid var(--line)',
              borderRadius: 6,
              padding: '10px 12px',
              fontSize: 13,
              color: 'var(--fg-0)',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'var(--sans)',
              lineHeight: 1.6,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-line)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--line)')}
          />

          {error && (
            <p style={{ color: 'var(--status-rejected)', fontSize: 12, fontFamily: 'var(--mono)' }}>
              {error.message}
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSubmit}
              disabled={isPending || !jd.trim()}
              style={{ opacity: isPending || !jd.trim() ? 0.5 : 1 }}
            >
              {isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
