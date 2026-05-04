import { Link } from 'react-router-dom'
import { Icon } from '../icons.jsx'
import logo from '../assets/Fashion Brand Art Design Logo.svg'
import { useAuth } from '../auth/AuthContext.jsx'

const NAV = [
  { id: 'pos',         label: 'POS',         icon: 'pos',         to: '/pos' },
  { id: 'orders',      label: 'Orders',      icon: 'orders',      to: '/pos' },
  { id: 'kitchen',     label: 'Kitchen',     icon: 'kitchen',     to: '/pos' },
  { id: 'reservation', label: 'Reservation', icon: 'reservation', to: '/pos' },
  { id: 'table',       label: 'Table',       icon: 'table',       to: '/pos' }
]

export default function Header({ active = 'pos', onChange }) {
  const { user, logout } = useAuth()

  return (
    <header className="app-header">
      <div className="brand">
        <img src={logo} alt="Dreams POS" className="brand-logo-img" />
        <button className="brand-grid" aria-label="Menu">
          <Icon name="grid" size={18} />
        </button>
      </div>

      <nav className="top-nav">
        {user && (
          <Link to="/dashboard" className="nav-tab">
            <Icon name="chart" size={16} /> Dashboard
          </Link>
        )}
        {NAV.map(n => (
          <Link
            key={n.id}
            to={n.to}
            className={`nav-tab${active === n.id ? ' active' : ''}`}
            onClick={() => onChange?.(n.id)}
          >
            <Icon name={n.icon} size={16} />
            <span>{n.label}</span>
          </Link>
        ))}
      </nav>

      <div className="header-right">
        <button className="icon-btn" aria-label="Charts"><Icon name="chart" size={18} /></button>
        <button className="icon-btn notif" aria-label="Notifications">
          <Icon name="bell" size={18} />
          <span className="dot" />
        </button>

        {user ? (
          <>
            <div className="avatar">
              <img src="https://i.pravatar.cc/64?img=12" alt={user.name} />
            </div>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="logout-btn" style={{ textDecoration: 'none' }}>
            Login
          </Link>
        )}
      </div>
    </header>
  )
}
