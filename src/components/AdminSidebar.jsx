import { NavLink } from 'react-router-dom'
import { Icon } from '../icons.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

const logo = '/favicon.svg'

const NAV = [
  { to: '/dashboard',     label: 'Dashboard',   icon: 'chart' },
  { to: '/admin/orders',  label: 'Orders',      icon: 'orders' },
  { to: '/admin/menu',    label: 'Accessories', icon: 'kitchen' },
  { to: '/admin/categories', label: 'Categories', icon: 'grid' },
  { to: '/admin/kitchen', label: 'Kitchen',     icon: 'kitchen' },
  { to: '/admin/reservations', label: 'Reservations', icon: 'reservation' },
  { to: '/admin/tables',  label: 'Tables',      icon: 'table' },
  { to: '/admin/transactions', label: 'Transactions', icon: 'transactions' }
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="admin-sidebar">
      <div className="side-brand">
        <img src={logo} alt="Dreams POS" />
      </div>

      <nav className="side-nav">
        <div className="side-section-label">Main</div>
        {NAV.slice(0, 4).map(n => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
            <Icon name={n.icon} size={16} />
            <span>{n.label}</span>
          </NavLink>
        ))}

        <div className="side-section-label">Operations</div>
        {NAV.slice(4).map(n => (
          <NavLink key={n.to} to={n.to} className={({ isActive }) => `side-link${isActive ? ' active' : ''}`}>
            <Icon name={n.icon} size={16} />
            <span>{n.label}</span>
          </NavLink>
        ))}

        <div className="side-section-label">Shortcut</div>
        <NavLink to="/pos" className="side-link side-pos">
          <Icon name="pos" size={16} />
          <span>Open POS</span>
        </NavLink>
      </nav>

      <div className="side-footer">
        <div className="side-user">
          <div className="side-avatar">
            <img src="https://i.pravatar.cc/64?img=12" alt={user?.name || 'user'} />
          </div>
          <div className="side-user-info">
            <div className="side-user-name">{user?.name || 'Guest'}</div>
            <div className="side-user-email">{user?.email}</div>
          </div>
        </div>
        <button className="side-logout" onClick={logout} aria-label="Logout">
          <Icon name="x" size={14} />
        </button>
      </div>
    </aside>
  )
}
