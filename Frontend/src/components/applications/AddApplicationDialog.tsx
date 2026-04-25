import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useCreateApplication } from '@/hooks/useApplications'
import { Button } from '@/components/ui/button'
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
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} className="mr-2" />
        Add application
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add application</DialogTitle>
            <DialogDescription>
              Paste the full job description. AI will extract the company, title, tech stack, and more.
            </DialogDescription>
          </DialogHeader>

          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            rows={14}
            placeholder="Paste the job description here…"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
          />

          {error && (
            <p className="text-destructive text-sm">{error.message}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending || !jd.trim()}>
              {isPending ? 'Parsing…' : 'Parse & save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
