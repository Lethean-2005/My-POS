import { useState } from 'react'
import { Icon } from '../icons.jsx'
import { recentOrders } from '../data.js'

const TABS = ['All Orders', 'Dine In', 'Take Away', 'Delivery', 'Table']

const typeIcon = type => {
  if (type === 'Delivery') return 'delivery'
  if (type === 'Take Away') return 'takeaway'
  if (type === 'Dine In') return 'dinein'
  return 'orders'
}

export default function RecentOrders() {
  const [active, setActive] = useState('All Orders')

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

      <div className="orders-row">
        {recentOrders.map(o => (
          <article key={o.id} className="order-card">
            <div className="order-top">
              <div>
                <div className="order-id">{o.id}</div>
                <div className="order-name">{o.name}</div>
                <div className="order-time">{o.time}</div>
              </div>
              <div className={`order-type type-${o.typeColor}`}>
                <Icon name={typeIcon(o.type)} size={12} />
                <span>{o.type}</span>
              </div>
            </div>
            <div className="order-meta">
              <span className={`pill pill-${o.timerColor}`}>
                <Icon name="clock" size={11} />
                {o.timer}
              </span>
              <span className="order-price">${o.price.toFixed(2)}</span>
            </div>
            <div className="progress">
              <div
                className={`progress-bar bar-${o.timerColor}`}
                style={{ width: `${o.progress}%` }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
