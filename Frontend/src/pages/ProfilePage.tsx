import { useEffect, useState } from 'react'
import { useForm, Controller, type Resolver, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ExternalLink } from 'lucide-react'
import { useProfile, useUpdateProfile, useParseCv } from '@/hooks/useProfile'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TagsInput } from '@/components/ui/tags-input'
import { Icon } from '@/components/ui/Icon'

const schema = z.object({
  stack: z.array(z.string()).min(1, 'Add at least one technology'),
  yearsOfExperience: z.coerce.number().min(0).max(50),
  gitHubUrl: z.string().url('Enter a valid URL').or(z.literal('')).optional(),
  resumeText: z.string().optional(),
})
type ProfileForm = z.infer<typeof schema>

export function ProfilePage() {
  const { data: profile, isLoading, isError } = useProfile()
  const { mutate: updateProfile, isPending } = useUpdateProfile()
  const { mutate: parseCv, isPending: parsing } = useParseCv()
  const [editing, setEditing] = useState(false)
  const [dragging, setDragging] = useState(false)

  const { register, handleSubmit, control, reset, formState: { errors } } =
    useForm<ProfileForm>({ resolver: zodResolver(schema) as Resolver<ProfileForm> })

  useEffect(() => {
    if (profile) {
      reset({
        stack: profile.stack ?? [],
        yearsOfExperience: profile.yearsOfExperience ?? 0,
        gitHubUrl: profile.gitHubUrl ?? '',
        resumeText: profile.resumeText ?? '',
      } satisfies ProfileForm)
    }
  }, [profile, reset])

  const onSubmit: SubmitHandler<ProfileForm> = (data) => {
    updateProfile(
      { stack: data.stack, yearsOfExperience: data.yearsOfExperience, gitHubUrl: data.gitHubUrl || null, resumeText: data.resumeText || null },
      { onSuccess: () => setEditing(false) }
    )
  }

  function handleCancel() {
    if (profile) reset({ stack: profile.stack ?? [], yearsOfExperience: profile.yearsOfExperience ?? 0, gitHubUrl: profile.gitHubUrl ?? '', resumeText: profile.resumeText ?? '' } satisfies ProfileForm)
    setEditing(false)
  }

  function handleParseCv() {
    parseCv(undefined, {
      onSuccess: (result) => {
        reset({
          stack: result.stack ?? [],
          yearsOfExperience: result.yearsOfExperience ?? 0,
          gitHubUrl: result.gitHubUrl ?? '',
          resumeText: result.resumeText ?? '',
        })
        setEditing(true)
      },
    })
  }

  return (
    <>
      <div className="topbar">
        <div className="crumb"><span className="now">Profile</span></div>
        <div className="topbar-actions">
          {!editing && !isLoading && !isError && (
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
              <Icon name="edit" size={13} /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>

        {/* LEFT — profile form */}
        <div style={{ overflowY: 'auto', padding: '36px 32px 64px', borderRight: '1px solid var(--line)' }}>
          {isLoading && <p style={{ color: 'var(--fg-2)', fontSize: 13, fontFamily: 'var(--mono)' }}>Loading…</p>}
          {isError && <p style={{ color: 'var(--status-rejected)', fontSize: 13, fontFamily: 'var(--mono)' }}>Failed to load. Please refresh.</p>}

          {!isLoading && !isError && (
            editing ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                  <div>
                    <Label>Tech stack</Label>
                    <Controller name="stack" control={control} defaultValue={[]} render={({ field }) => (
                      <TagsInput value={field.value} onChange={field.onChange} placeholder="React, TypeScript… press Enter" />
                    )} />
                    {errors.stack && <p style={{ color: 'var(--status-rejected)', fontSize: 12, fontFamily: 'var(--mono)', marginTop: 4 }}>{errors.stack.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="yoe">Years of experience</Label>
                    <Input id="yoe" type="number" min={0} max={50} className="w-32" {...register('yearsOfExperience')} />
                  </div>

                  <div>
                    <Label htmlFor="gh">GitHub URL</Label>
                    <Input id="gh" type="url" placeholder="https://github.com/you" {...register('gitHubUrl')} />
                    {errors.gitHubUrl && <p style={{ color: 'var(--status-rejected)', fontSize: 12, fontFamily: 'var(--mono)', marginTop: 4 }}>{errors.gitHubUrl.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="rt">Resume text</Label>
                    <textarea id="rt" rows={10} placeholder="Paste your resume here…"
                      style={{ width: '100%', background: 'var(--bg-3)', border: '1px solid var(--line)', borderRadius: 6, padding: '8px 12px', fontSize: 13, color: 'var(--fg-0)', outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
                      {...register('resumeText')}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>{isPending ? 'Saving…' : 'Save'}</button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleCancel} disabled={isPending}>Cancel</button>
                  </div>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <ProfileField label="Tech stack">
                  {profile?.stack?.length ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                      {profile.stack.map((t) => <span key={t} className="pill">{t}</span>)}
                    </div>
                  ) : <Empty />}
                </ProfileField>

                <ProfileField label="Years of experience">
                  {profile?.yearsOfExperience ? (
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>
                      {profile.yearsOfExperience} year{profile.yearsOfExperience !== 1 ? 's' : ''}
                    </span>
                  ) : <Empty />}
                </ProfileField>

                <ProfileField label="GitHub">
                  {profile?.gitHubUrl ? (
                    <a href={profile.gitHubUrl} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--accent)', textDecoration: 'none', fontFamily: 'var(--mono)' }}>
                      {profile.gitHubUrl}<ExternalLink size={12} />
                    </a>
                  ) : <Empty />}
                </ProfileField>

                <ProfileField label="Resume">
                  {profile?.resumeText ? (
                    <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', fontFamily: 'var(--mono)', color: 'var(--fg-2)', background: 'var(--bg-2)', borderRadius: 6, padding: '12px', marginTop: 6, maxHeight: 240, overflowY: 'auto', border: '1px solid var(--line)' }}>
                      {profile.resumeText}
                    </pre>
                  ) : <Empty />}
                </ProfileField>
              </div>
            )
          )}
        </div>

        {/* RIGHT — CV import zone */}
        <div style={{
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '48px 40px',
          background: 'var(--bg-0)',
        }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>PROFILE · CV-IMPORT</div>
          <h2 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.03em', margin: '0 0 10px', textAlign: 'center' }}>
            Let's set up your profile
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--fg-2)', margin: '0 0 32px', textAlign: 'center', maxWidth: 400, lineHeight: 1.65 }}>
            Drop a CV and we'll lift the structured data out — stack, experience, links, prose summary.
            Everything is editable; nothing is saved until you confirm.
          </p>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleParseCv() }}
            onClick={handleParseCv}
            style={{
              width: '100%', maxWidth: 440,
              border: `1.5px dashed ${dragging ? 'var(--accent)' : 'var(--line-strong)'}`,
              borderRadius: 14,
              padding: '52px 32px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
              cursor: 'pointer',
              background: dragging ? 'var(--accent-dim)' : 'var(--bg-1)',
              transition: 'all 0.15s',
            }}
          >
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'var(--bg-2)', border: '1px solid var(--line-strong)',
              display: 'grid', placeItems: 'center', color: 'var(--fg-1)',
            }}>
              <Icon name={parsing ? 'loader' : 'upload'} size={22} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 15.5, fontWeight: 500, marginBottom: 5 }}>
                {parsing ? 'Parsing your CV…' : 'Drop your CV here'}
              </div>
              {!parsing && (
                <div style={{ fontSize: 13, color: 'var(--fg-2)' }}>
                  or <span style={{ color: 'var(--accent)', textDecoration: 'underline' }}>browse files</span>{' '}· PDF, max 8MB
                </div>
              )}
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>
              processed locally · never leaves your account
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0', width: '100%', maxWidth: 440 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            <span className="eyebrow">or fill manually</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          <button
            onClick={() => setEditing(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--fg-1)', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Start with a blank profile <Icon name="arrowRight" size={14} />
          </button>
        </div>
      </div>
    </>
  )
}

function ProfileField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  )
}

function Empty() {
  return <span style={{ fontSize: 13, color: 'var(--fg-3)', fontFamily: 'var(--mono)' }}>Not set</span>
}
