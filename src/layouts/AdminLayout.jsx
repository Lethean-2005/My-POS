import AdminSidebar from '../components/AdminSidebar.jsx'

export default function AdminLayout({ title, subtitle, actions, children }) {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">
        <div className="admin-topbar">
          <div>
            {title && <h1 className="admin-title">{title}</h1>}
            {subtitle && <div className="admin-sub">{subtitle}</div>}
          </div>
          {actions && <div className="admin-actions">{actions}</div>}
        </div>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  )
}
