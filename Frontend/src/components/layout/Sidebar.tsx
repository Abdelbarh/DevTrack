import { useState } from 'react'
import { NavLink } from 'react-router'
import { LayoutDashboard, Briefcase, User, Settings, LogOut, Copy, Check } from 'lucide-react'
import { useUser, useClerk, useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/applications', label: 'Applications', icon: Briefcase },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  async function copyToken() {
    const token = await getToken()
    if (!token) return
    await navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((n) => n![0])
    .join('')
    .toUpperCase()

  return (
    <aside className="w-60 shrink-0 border-r h-screen sticky top-0 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="font-semibold text-lg tracking-tight">DevTrack</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {import.meta.env.DEV && (
        <div className="px-3 pb-2">
          <button
            onClick={copyToken}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title="Copy Clerk JWT for Scalar"
          >
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            {copied ? 'Token copied!' : 'Copy API token'}
          </button>
        </div>
      )}

      <div className="p-3">
        <Separator className="mb-3" />
        <div className="flex items-center gap-3 px-2 py-1">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback className="text-xs">{initials || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <button
            onClick={() => signOut(() => navigate('/sign-in'))}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
