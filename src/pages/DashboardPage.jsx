import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../icons.jsx'
import { api } from '../api.js'
import AdminLayout from '../layouts/AdminLayout.jsx'

const fmt = n => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n || 0)
const money = n => '$' + fmt(n)

const TYPE_META = {
  dinein:   { label: 'Dine In',   color: 'green' },
  takeaway: { label: 'Take Away', color: 'pink' },
  delivery: { label: 'Delivery',  color: 'orange' },
  table:    { label: 'Table',     color: 'green' }
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.dashboard().then(setData).catch(e => setError(e.message))
  }, [])

  const stats = data?.stats
  const last7 = data?.last_7_days || []
  const top   = data?.top_items || []
  const recent = data?.recent || []
  const lowStock = data?.low_stock || []

  const maxRev = Math.max(1, ...last7.map(d => Number(d.revenue) || 0))

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Overview of today's activity"
      actions={
        <Link to="/pos" className="btn-primary">
          <Icon name="pos" size={14} /> Open POS
        </Link>
      }
    >
      {error && <div className="auth-error" style={{ marginBottom: 16 }}>Error: {error}</div>}
      {!data && !error && <div className="muted">Loading dashboard…</div>}

      {stats && (
        <>
          <section className="stat-row">
            <StatCard label="Today's Orders"    value={stats.today_orders}              accent="blue"   icon="orders" />
            <StatCard label="Today's Revenue"   value={money(stats.today_revenue)}      accent="green"  icon="chart" />
            <StatCard label="Items Sold Today"  value={fmt(stats.items_sold_today)}     accent="orange" icon="cart" />
            <StatCard label="Total Orders"      value={fmt(stats.total_orders)}         accent="pink"   icon="invoice" />
            <StatCard label="All-Time Revenue"  value={money(stats.total_revenue)}      accent="green"  icon="transactions" />
            <StatCard label="Active Accessories" value={fmt(stats.menu_count)}          accent="blue"   icon="kitchen" />
            <StatCard label="Low Stock"          value={fmt(stats.low_stock_count ?? 0)}   accent="orange" icon="warning" />
            <StatCard label="Out of Stock"       value={fmt(stats.out_of_stock_count ?? 0)} accent="pink"   icon="warning" />
          </section>

          {(lowStock.length > 0 || (stats.out_of_stock_count ?? 0) > 0) && (
            <section className="panel">
              <div className="panel-head">
                <h2 className="panel-title">Stock alerts</h2>
                <Link to="/admin/inventory" className="link-btn">Open Inventory →</Link>
              </div>
              {lowStock.length === 0 ? (
                <div className="muted">No low-stock items right now.</div>
              ) : (
                <ul className="top-list">
                  {lowStock.map(m => {
                    const out = m.stock_qty <= 0
                    return (
                      <li key={m.id}>
                        <span className="rank" style={{ width: 32, height: 32 }}>
                          {m.image_url
                            ? <img src={m.image_url} alt="" style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover' }} />
                            : <Icon name="box" size={14} />}
                        </span>
                        <span className="top-name">
                          <div>{m.name}</div>
                          <div className="muted" style={{ fontSize: 11 }}>{m.sku || '—'}</div>
                        </span>
                        <span className={`stock-tag ${out ? 'out' : 'low'}`}>{m.stock_qty}</span>
                        <span className="muted" style={{ fontSize: 11, minWidth: 80, textAlign: 'right' }}>
                          ≤ {m.low_stock_threshold}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          )}

          <section className="dash-grid">
            <div className="panel">
              <div className="panel-head">
                <h2 className="panel-title">Last 7 Days · Revenue</h2>
              </div>
              <div className="bars">
                {last7.length === 0 && <div className="muted">No data yet.</div>}
                {last7.map(d => (
                  <div key={d.day} className="bar-col">
                    <div className="bar-wrap">
                      <div
                        className="bar-fill"
                        style={{ height: `${(Number(d.revenue) / maxRev) * 100}%` }}
                        title={money(d.revenue)}
                      >
                        <span className="bar-val">{money(d.revenue)}</span>
                      </div>
                    </div>
                    <div className="bar-label">{new Date(d.day).toLocaleDateString([], { weekday: 'short' })}</div>
                    <div className="bar-sub">{d.orders} orders</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head">
                <h2 className="panel-title">Top Selling Items</h2>
              </div>
              <ul className="top-list">
                {top.length === 0 && <li className="muted">No sales yet.</li>}
                {top.map((t, i) => (
                  <li key={t.name + i}>
                    <span className="rank">#{i + 1}</span>
                    <span className="top-name">{t.name}</span>
                    <span className="top-qty">{t.qty} sold</span>
                    <span className="top-rev">{money(t.revenue)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">Recent Orders</h2>
              <Link to="/pos" className="link-btn">Open POS →</Link>
            </div>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Placed</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 && (
                  <tr><td colSpan={7} className="muted" style={{padding: '16px 0', textAlign: 'center'}}>No orders yet.</td></tr>
                )}
                {recent.map(o => {
                  const t = TYPE_META[o.type] || TYPE_META.dinein
                  return (
                    <tr key={o.id}>
                      <td>{o.order_no}</td>
                      <td>{o.customer_name || '—'}</td>
                      <td><span className={`order-type type-${t.color}`}>{t.label}</span></td>
                      <td>{o.items?.length ?? 0}</td>
                      <td>{money(o.total)}</td>
                      <td><span className={`status-pill st-${o.status}`}>{o.status}</span></td>
                      <td>{new Date(o.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>
        </>
      )}
    </AdminLayout>
  )
}

function StatCard({ label, value, accent, icon }) {
  return (
    <div className={`stat-card stat-${accent}`}>
      <div className="stat-icon"><Icon name={icon} size={18} /></div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  )
}
