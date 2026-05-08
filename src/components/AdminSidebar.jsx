import { NavLink } from 'react-router-dom'
import { Icon } from '../icons.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import logoImg from '../assets/logo.jfif'

const SECTIONS = [
  {
    title: 'Sales',
    items: [
      { to: '/dashboard',          label: 'Dashboard',     icon: 'chart' },
      { to: '/admin/orders',       label: 'Recent Orders', icon: 'orders' },
      { to: '/admin/transactions', label: 'Transactions',  icon: 'transactions', soon: true },
    ]
  },
  {
    title: 'Catalog',
    items: [
      { to: '/admin/menu',         label: 'Accessories',   icon: 'box' },
      { to: '/admin/categories',   label: 'Categories',    icon: 'grid' },
      { to: '/admin/inventory',    label: 'Inventory',     icon: 'kitchen' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { to: '/admin/stock-in',     label: 'Stock In',      icon: 'draft' },
      { to: '/admin/suppliers',    label: 'Suppliers',     icon: 'store' },
      { to: '/admin/reports',      label: 'Reports',       icon: 'report' },
      { to: '/admin/settings',     label: 'Settings',      icon: 'settings' },
    ]
  },
]

export default function AdminSidebar({ open = true, onClose }) {
  const { user, logout } = useAuth()
  const initial = (user?.name || user?.email || 'A').charAt(0).toUpperCase()

  return (
    <aside className={`admin-sidebar${open ? ' open' : ' closed'}`}>
      <div className="sb-top">
        <NavLink to="/dashboard" className="sb-brand" aria-label="Dreams POS">
          <span className="sb-brand-mark">
            <img src={logoImg} alt="" />
          </span>
          <span className="sb-brand-text">Dreams POS</span>
        </NavLink>
        <button
          type="button"
          className="sb-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          <Icon name="x" size={18} strokeWidth={1.75} />
        </button>
      </div>

      {SECTIONS.map(section => (
        <div className="sb-section" key={section.title}>
          <p className="sb-heading">{section.title}</p>
          {section.items.map(it => (
            it.soon ? (
              <button
                key={it.to}
                className="sb-item"
                disabled
                title="Coming soon"
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                <span className="sb-icon"><Icon name={it.icon} size={18} strokeWidth={1.75} /></span>
                <span className="sb-label">{it.label}</span>
                <span className="sb-badge">Soon</span>
              </button>
            ) : (
              <NavLink
                key={it.to}
                to={it.to}
                className={({ isActive }) => `sb-item${isActive ? ' active' : ''}`}
              >
                <span className="sb-icon"><Icon name={it.icon} size={18} strokeWidth={1.75} /></span>
                <span className="sb-label">{it.label}</span>
              </NavLink>
            )
          ))}
        </div>
      ))}

      <div className="sb-section">
        <p className="sb-heading">Shortcut</p>
        <NavLink to="/pos" className="sb-item sb-pos">
          <span className="sb-icon"><Icon name="pos" size={18} strokeWidth={1.75} /></span>
          <span className="sb-label">Open POS</span>
        </NavLink>
      </div>

      <div className="sb-footer">
        <div className="sb-avatar">{initial}</div>
        <div className="sb-user">
          <div className="sb-user-name">{user?.name || 'Guest'}</div>
          <div className="sb-user-email">{user?.email}</div>
        </div>
        <button className="sb-logout" onClick={logout} aria-label="Logout">
          <Icon name="logout" size={14} />
        </button>
      </div>
    </aside>
  )
}
