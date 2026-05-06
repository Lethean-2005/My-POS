import { useEffect, useState } from 'react'
import AdminSidebar from '../components/AdminSidebar.jsx'
import { Icon } from '../icons.jsx'

const STORAGE_KEY = 'pos_sb_open'

export default function AdminLayout({ title, subtitle, actions, children }) {
  const [sbOpen, setSbOpen] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === null ? true : saved === '1'
  })
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const apply = () => {
      const m = window.innerWidth < 768
      setIsMobile(m)
      if (m) setSbOpen(false)
    }
    apply()
    window.addEventListener('resize', apply)
    return () => window.removeEventListener('resize', apply)
  }, [])

  useEffect(() => {
    if (!isMobile) localStorage.setItem(STORAGE_KEY, sbOpen ? '1' : '0')
  }, [sbOpen, isMobile])

  const close = () => setSbOpen(false)
  const toggle = () => setSbOpen(v => !v)

  return (
    <div className="admin-shell">
      {isMobile && sbOpen && <div className="sb-backdrop" onClick={close} />}
      <AdminSidebar open={sbOpen} onClose={close} />
      <main className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="topbar-toggle"
            onClick={toggle}
            aria-label={sbOpen ? 'Hide sidebar' : 'Show sidebar'}
            aria-pressed={sbOpen}
          >
            <Icon name="menu" size={20} strokeWidth={1.75} />
          </button>
          <div className="topbar-title">{title}</div>
          <div className="topbar-search">
            <Icon name="search" size={16} color="#94a3b8" strokeWidth={1.75} />
            <input placeholder="Search…" />
          </div>
          {actions && <div className="admin-actions">{actions}</div>}
        </header>
        <section className="admin-content">
          {subtitle && <p className="admin-sub-line">{subtitle}</p>}
          {children}
        </section>
      </main>
    </div>
  )
}
