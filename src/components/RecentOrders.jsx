import { useEffect, useState } from 'react'
import { Icon } from '../icons.jsx'
import { api } from '../api.js'

const TABS = ['All Orders', 'Dine In', 'Take Away', 'Delivery', 'Table']

const TYPE_LABELS = {
  dinein:   { label: 'Dine In',   color: 'green',  icon: 'dinein' },
  takeaway: { label: 'Take Away', color: 'pink',   icon: 'takeaway' },
  delivery: { label: 'Delivery',  color: 'orange', icon: 'delivery' },
  table:    { label: 'Table',     color: 'green',  icon: 'table' }
}

const TAB_TO_TYPE = {
  'Dine In':   'dinein',
  'Take Away': 'takeaway',
  'Delivery':  'delivery',
  'Table':     'table'
}

const timerColor = (eta) => {
  if (eta == null) return 'green'
  if (eta <= 10) return 'red'
  if (eta <= 15) return 'orange'
  return 'green'
}

export default function RecentOrders() {
  const [active, setActive] = useState('All Orders')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    api.recentOrders()
      .then(data => { if (!cancelled) setOrders(data) })
      .catch(err => { if (!cancelled) setError(err.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const visible = active === 'All Orders'
    ? orders
    : orders.filter(o => o.type === TAB_TO_TYPE[active])

  return (
    <section className="panel recent-orders">
      <div className="panel-head">
        <h2 className="panel-title">Recent Orders</h2>
        <div className="tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`tab${active === t ? ' active' : ''}`}
              onClick={() => setActive(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="pager">
          <button className="pager-btn"><Icon name="arrow-left" size={14} /></button>
          <button className="pager-btn"><Icon name="arrow-right" size={14} /></button>
        </div>
      </div>

      {loading && <div className="muted">Loading orders…</div>}
      {error && <div style={{ color: 'var(--red)' }}>Error: {error}</div>}

      <div className="orders-row">
        {visible.map(o => {
          const type = TYPE_LABELS[o.type] || TYPE_LABELS.dinein
          const tColor = timerColor(o.eta_minutes)
          const timerText = o.eta_minutes != null
            ? `${o.eta_minutes} Mins`
            : (o.table_no ? `Table ${o.table_no}` : '—')
          return (
            <article key={o.id} className="order-card">
              <div className="order-top">
                <div>
                  <div className="order-id">{o.order_no}</div>
                  <div className="order-name">{o.customer_name}</div>
                  <div className="order-time">{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className={`order-type type-${type.color}`}>
                  <Icon name={type.icon} size={12} />
                  <span>{type.label}</span>
                </div>
              </div>
              <div className="order-meta">
                <span className={`pill pill-${tColor}`}>
                  <Icon name="clock" size={11} />
                  {timerText}
                </span>
                <span className="order-price">${Number(o.total).toFixed(2)}</span>
              </div>
              <div className="progress">
                <div
                  className={`progress-bar bar-${tColor}`}
                  style={{ width: `${o.progress || 0}%` }}
                />
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
