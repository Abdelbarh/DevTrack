import { Outlet } from 'react-router'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Outlet />
      </div>
    </div>
  )
}
