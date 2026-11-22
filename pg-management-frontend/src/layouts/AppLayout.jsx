import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Building2, LayoutDashboard, Users, DoorOpen, ReceiptText, CreditCard, FileBarChart, Zap, Settings, LogOut, Bell, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const navItems = [
  { label: 'Overview', path: '/', icon: LayoutDashboard },
  { label: 'Tenants', path: '/tenants', icon: Users },
  { label: 'Rooms', path: '/rooms', icon: DoorOpen },
  { label: 'Electricity readings', path: '/electricity', icon: Zap },
  { label: 'Monthly billing', path: '/billing', icon: ReceiptText },
  { label: 'Payments', path: '/payments', icon: CreditCard },
  { label: 'Reports', path: '/reports', icon: FileBarChart },
  { label: 'Settings', path: '/settings', icon: Settings },
]

export default function AppLayout() {
  const { username, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [workspace, setWorkspace] = useState(localStorage.getItem('pg_selected_workspace') || 'AKKA-PG')
  const pgName = workspace === 'SUBASH-PG' ? 'SUBASH PG' : 'AKKA PG'
  function switchWorkspace(event) { const next = event.target.value; localStorage.setItem('pg_selected_workspace', next); setWorkspace(next); window.location.reload() }

  function signOut() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-overlay" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand"><span className="brand-icon"><Building2 size={21} /></span><span>{pgName}</span></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          {navItems.map(({ label, path, icon: Icon }) => (
            <NavLink key={path} to={path} end={path === '/'} onClick={() => setMobileOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="local-status"><span className="status-dot" /><div><strong>Local storage</strong><small>Data on this computer</small></div></div>
          <button className="logout-button" onClick={signOut}><LogOut size={17} /> Sign out</button>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <button className="mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={21} /></button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>{pgName} Management</strong></div>
          <div className="topbar-right"><label className="workspace-select-label"><span>PG</span><select aria-label="Select PG workspace" value={workspace} onChange={switchWorkspace}><option value="AKKA-PG">AKKA PG</option><option value="SUBASH-PG">SUBASH PG</option></select></label>
            <span className="local-chip"><span className="status-dot" /> Local mode</span>
            <button className="icon-button" aria-label="Notifications"><Bell size={18} /></button>
            <div className="user-chip"><span className="avatar">{(username || 'A').slice(0, 1).toUpperCase()}</span><div><strong>{username || 'Admin'}</strong><small>Administrator</small></div></div>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
        <footer className="app-footer">{pgName} Manager <span>•</span> Local workspace</footer>
      </div>
    </div>
  )
}
