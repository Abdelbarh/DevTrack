import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router'
import { useUser, useClerk, useAuth } from '@clerk/clerk-react'
import { useApplications } from '@/hooks/useApplications'
import { Icon } from '@/components/ui/Icon'

export function Sidebar() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const { data: applications = [] } = useApplications()

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
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">D</div>
        <div className="brand-name">DevTrack<span>.app</span></div>
      </div>

      <div className="nav-section">
        <div className="nav-label">Workspace</div>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <Icon name="layout" size={14} />
          Dashboard
        </NavLink>
        <NavLink
          to="/applications"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <Icon name="inbox" size={14} />
          Applications
          {applications.length > 0 && (
            <span className="nav-count">{applications.length}</span>
          )}
        </NavLink>
      </div>

      <div className="nav-section">
        <div className="nav-label">You</div>
        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <Icon name="user" size={14} />
          Profile
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
        >
          <Icon name="settings" size={14} />
          Settings
        </NavLink>
      </div>

      {import.meta.env.DEV && (
        <button onClick={copyToken} className="nav-item" title="Copy Clerk JWT for API testing">
          <Icon name={copied ? 'check' : 'copy'} size={14} />
          {copied ? 'Token copied!' : 'Copy API token'}
        </button>
      )}

      <div className="user-card">
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={initials}
            style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <div className="user-avatar">{initials || '?'}</div>
        )}
        <div className="user-meta">
          <span className="user-name">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="user-email">
            {user?.primaryEmailAddress?.emailAddress}
          </span>
        </div>
        <button
          onClick={() => signOut(() => navigate('/sign-in'))}
          className="btn btn-icon btn-ghost"
          title="Sign out"
          style={{ flexShrink: 0 }}
        >
          <Icon name="logOut" size={14} />
        </button>
      </div>
    </aside>
  )
}
