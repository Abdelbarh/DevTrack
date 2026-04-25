import { useState } from 'react'
import { Briefcase, Building2, Star } from 'lucide-react'
import { useApplications } from '@/hooks/useApplications'
import { AddApplicationDialog } from '@/components/applications/AddApplicationDialog'
import { StatusBadge } from '@/components/applications/StatusBadge'
import { Badge } from '@/components/ui/badge'
import type { ApplicationStatus } from '@/types/application'

const STATUS_FILTERS: { label: string; value: ApplicationStatus | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Saved', value: 'Saved' },
  { label: 'Applied', value: 'Applied' },
  { label: 'Screening', value: 'Screening' },
  { label: 'Interview', value: 'Interview' },
  { label: 'Offer', value: 'Offer' },
  { label: 'Rejected', value: 'Rejected' },
]

export function ApplicationsPage() {
  const { data: applications = [], isLoading } = useApplications()
  const [filter, setFilter] = useState<ApplicationStatus | 'All'>('All')

  const filtered = filter === 'All'
    ? applications
    : applications.filter((a) => a.status === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Applications</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {applications.length} total application{applications.length !== 1 ? 's' : ''}
          </p>
        </div>
        <AddApplicationDialog />
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {STATUS_FILTERS.map(({ label, value }) => {
          const count = value === 'All'
            ? applications.length
            : applications.filter((a) => a.status === value).length
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {label}
              {count > 0 && (
                <span className="ml-1.5 opacity-70">{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState hasApplications={applications.length > 0} />
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 size={14} className="text-muted-foreground shrink-0" />
                    <span className="font-medium truncate">
                      {app.companyName ?? 'Unknown company'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {app.jobTitle ?? 'Unknown position'}
                  </p>
                  {app.parsedStack.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {app.parsedStack.slice(0, 5).map((tech) => (
                        <span
                          key={tech}
                          className="text-xs px-2 py-0.5 bg-secondary rounded-md text-secondary-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                      {app.parsedStack.length > 5 && (
                        <span className="text-xs text-muted-foreground">
                          +{app.parsedStack.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <StatusBadge status={app.status} />
                  {app.matchScore !== null && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star size={13} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{app.matchScore}%</span>
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {(app.seniorityLevel || app.isRemote !== null) && (
                <div className="flex gap-2 mt-3">
                  {app.seniorityLevel && (
                    <Badge variant="outline" className="text-xs">{app.seniorityLevel}</Badge>
                  )}
                  {app.isRemote === true && (
                    <Badge variant="outline" className="text-xs">Remote</Badge>
                  )}
                  {app.isRemote === false && (
                    <Badge variant="outline" className="text-xs">On-site</Badge>
                  )}
                  {app.salaryMin && app.salaryMax && (
                    <Badge variant="outline" className="text-xs">
                      €{app.salaryMin.toLocaleString()}–€{app.salaryMax.toLocaleString()}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState({ hasApplications }: { hasApplications: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Briefcase size={40} className="text-muted-foreground/40 mb-4" />
      <p className="font-medium">
        {hasApplications ? 'No applications match this filter' : 'No applications yet'}
      </p>
      <p className="text-muted-foreground text-sm mt-1">
        {hasApplications
          ? 'Try selecting a different status.'
          : 'Click "Add application" and paste a job description to get started.'}
      </p>
    </div>
  )
}
