import { useEffect, useState } from 'react'
import { useForm, Controller, type Resolver, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, ExternalLink } from 'lucide-react'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TagsInput } from '@/components/ui/tags-input'

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
  const [editing, setEditing] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({ resolver: zodResolver(schema) as Resolver<ProfileForm> })

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
      {
        stack: data.stack,
        yearsOfExperience: data.yearsOfExperience,
        gitHubUrl: data.gitHubUrl || null,
        resumeText: data.resumeText || null,
      },
      { onSuccess: () => setEditing(false) }
    )
  }

  function handleCancel() {
    if (profile) {
      reset({
        stack: profile.stack ?? [],
        yearsOfExperience: profile.yearsOfExperience ?? 0,
        gitHubUrl: profile.gitHubUrl ?? '',
        resumeText: profile.resumeText ?? '',
      } satisfies ProfileForm)
    }
    setEditing(false)
  }

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading profile...</p>
  if (isError) return <p className="text-destructive text-sm">Failed to load profile. Please refresh.</p>

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your stack and experience are used to score job matches and tailor your resume.
          </p>
        </div>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil size={14} className="mr-1.5" />
            Modify
          </Button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1">
            <Label>Tech stack</Label>
            <Controller
              name="stack"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <TagsInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="React, TypeScript, Node.js… press Enter to add"
                />
              )}
            />
            {errors.stack && <p className="text-destructive text-xs">{errors.stack.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="yearsOfExperience">Years of experience</Label>
            <Input
              id="yearsOfExperience"
              type="number"
              min={0}
              max={50}
              className="w-32"
              {...register('yearsOfExperience')}
            />
            {errors.yearsOfExperience && (
              <p className="text-destructive text-xs">{errors.yearsOfExperience.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="gitHubUrl">GitHub URL</Label>
            <Input
              id="gitHubUrl"
              type="url"
              placeholder="https://github.com/yourusername"
              {...register('gitHubUrl')}
            />
            {errors.gitHubUrl && <p className="text-destructive text-xs">{errors.gitHubUrl.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="resumeText">Resume (paste plain text)</Label>
            <textarea
              id="resumeText"
              rows={12}
              placeholder="Paste your resume here. The AI will use this as a base when generating tailored versions."
              className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              {...register('resumeText')}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <Field label="Tech stack">
            {profile?.stack?.length ? (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile.stack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-2 py-1 bg-secondary rounded-md text-secondary-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            ) : (
              <Empty />
            )}
          </Field>

          <Field label="Years of experience">
            {profile?.yearsOfExperience != null && profile.yearsOfExperience > 0 ? (
              <span>{profile.yearsOfExperience} year{profile.yearsOfExperience !== 1 ? 's' : ''}</span>
            ) : (
              <Empty />
            )}
          </Field>

          <Field label="GitHub URL">
            {profile?.gitHubUrl ? (
              <a
                href={profile.gitHubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                {profile.gitHubUrl}
                <ExternalLink size={12} />
              </a>
            ) : (
              <Empty />
            )}
          </Field>

          <Field label="Resume">
            {profile?.resumeText ? (
              <pre className="text-sm whitespace-pre-wrap font-sans text-muted-foreground bg-secondary/40 rounded-md p-3 mt-1 max-h-64 overflow-y-auto">
                {profile.resumeText}
              </pre>
            ) : (
              <Empty />
            )}
          </Field>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium mb-1">{label}</p>
      {children}
    </div>
  )
}

function Empty() {
  return <span className="text-sm text-muted-foreground">Not set</span>
}
