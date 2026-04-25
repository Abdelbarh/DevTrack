import { Briefcase, Send, MessageSquare, Trophy } from 'lucide-react'
import { useUser } from '@clerk/clerk-react'
import { useApplications } from '@/hooks/useApplications'
import { StatusBadge } from '@/components/applications/StatusBadge'
import { AddApplicationDialog } from '@/components/applications/AddApplicationDialog'
import { Building2, Star } from 'lucide-react'

export function DashboardPage() {
  const { user } = useUser()
  const { data: applications = [], isLoading } = useApplications()

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === 'Applied').length,
    interview: applications.filter((a) => a.status === 'Interview').length,
    offer: applications.filter((a) => a.status === 'Offer').length,
  }

  const avgScore = applications.length
    ? Math.round(
        applications
          .filter((a) => a.matchScore !== null)
          .reduce((sum, a) => sum + (a.matchScore ?? 0), 0) /
          (applications.filter((a) => a.matchScore !== null).length || 1)
      )
    : null

  const recent = [...applications]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's your job search at a glance.
          </p>
        </div>
        <AddApplicationDialog />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Total" value={stats.total} color="text-slate-600" />
        <StatCard icon={Send} label="Applied" value={stats.applied} color="text-blue-600" />
        <StatCard icon={MessageSquare} label="Interviews" value={stats.interview} color="text-purple-600" />
        <StatCard icon={Trophy} label="Offers" value={stats.offer} color="text-green-600" />
      </div>

      {/* Average match score */}
      {avgScore !== null && (
        <div className="border rounded-lg p-4 bg-card flex items-center gap-3">
          <Star size={18} className="text-yellow-500 fill-yellow-500" />
          <span className="text-sm text-muted-foreground">Average match score</span>
          <span className="font-semibold ml-auto">{avgScore}%</span>
        </div>
      )}

      {/* Recent applications */}
      <div>
        <h2 className="text-base font-semibold mb-3">Recent applications</h2>
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : recent.length === 0 ? (
          <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm bg-secondary/30">
            No applications yet. Click <strong>"Add application"</strong> to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((app) => (
              <div
                key={app.id}
                className="border rounded-lg p-3 bg-card flex items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Building2 size={13} className="text-muted-foreground shrink-0" />
                    <span className="font-medium text-sm truncate">
                      {app.companyName ?? 'Unknown company'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {app.jobTitle ?? 'Unknown position'}
                  </p>
                </div>
                <StatusBadge status={app.status} />
                {app.matchScore !== null && (
                  <div className="flex items-center gap-1 text-sm shrink-0">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{app.matchScore}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: string
}) {
  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={color} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  )
}
