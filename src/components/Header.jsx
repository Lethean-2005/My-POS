import { Icon } from '../icons.jsx'
import logo from '../assets/Fashion Brand Art Design Logo.svg'

const NAV = [
  { id: 'pos', label: 'POS', icon: 'pos' },
  { id: 'orders', label: 'Orders', icon: 'orders' },
  { id: 'kitchen', label: 'Kitchen', icon: 'kitchen' },
  { id: 'reservation', label: 'Reservation', icon: 'reservation' },
  { id: 'table', label: 'Table', icon: 'table' }
]

export default function Header({ active = 'pos', onChange }) {
  return (
    <header className="app-header">
      <div className="brand">
        <img src={logo} alt="Dreams POS" className="brand-logo-img" />
        <button className="brand-grid" aria-label="Menu">
          <Icon name="grid" size={18} />
        </button>
      </div>

      <nav className="top-nav">
        {NAV.map(n => (
          <button
            key={n.id}
            className={`nav-tab${active === n.id ? ' active' : ''}`}
            onClick={() => onChange?.(n.id)}
          >
            <Icon name={n.icon} size={16} />
            <span>{n.label}</span>
          </button>
        ))}
      </nav>

      <div className="header-right">
        <button className="icon-btn" aria-label="Charts"><Icon name="chart" size={18} /></button>
        <button className="icon-btn notif" aria-label="Notifications">
          <Icon name="bell" size={18} />
          <span className="dot" />
        </button>
        <div className="avatar">
          <img src="https://i.pravatar.cc/64?img=12" alt="profile" />
        </div>
      </div>
    </header>
  )
}
