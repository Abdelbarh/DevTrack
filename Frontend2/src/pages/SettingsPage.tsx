import { useNavigate } from 'react-router'
import { useUser, useClerk } from '@clerk/clerk-react'
import { Icon } from '@/components/ui/Icon'
import { getTheme, applyTheme, type Theme } from '@/lib/theme'
import { useState } from 'react'

export function SettingsPage() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const navigate = useNavigate()
  const [theme, setThemeState] = useState<Theme>(getTheme)

  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    applyTheme(next)
    setThemeState(next)
  }

  return (
    <>
      <div className="topbar">
        <div className="crumb">
          <span className="now">Settings</span>
        </div>
      </div>

      <div style={{ padding: '40px 32px 64px', maxWidth: 560 }}>
        {/* Account */}
        <section style={{ marginBottom: 40 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Account</div>
          <div className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt=""
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, oklch(0.7 0.12 280), oklch(0.7 0.12 200))',
                  display: 'grid', placeItems: 'center',
                  fontSize: 14, fontWeight: 600, color: 'var(--bg-0)',
                }}>
                  {[user?.firstName, user?.lastName]
                    .filter(Boolean).map((n) => n![0]).join('').toUpperCase() || '?'}
                </div>
              )}
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  {user?.firstName} {user?.lastName}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--fg-2)', marginTop: 2 }}>
                  {user?.primaryEmailAddress?.emailAddress}
                </div>
              </div>
            </div>

            <hr className="hr" />

            <button
              className="btn btn-danger"
              style={{ alignSelf: 'flex-start', fontSize: 13 }}
              onClick={() => signOut(() => navigate('/sign-in'))}
            >
              <Icon name="logOut" size={14} />
              Sign out
            </button>
          </div>
        </section>

        {/* Appearance */}
        <section>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Appearance</div>
          <div className="card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>Theme</div>
              <div style={{ fontSize: 12, color: 'var(--fg-2)', marginTop: 2 }}>
                {theme === 'dark' ? 'Dark mode' : 'Light mode'} is active
              </div>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={toggleTheme}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={13} />
              Switch to {theme === 'dark' ? 'light' : 'dark'}
            </button>
          </div>
        </section>
      </div>
    </>
  )
}
