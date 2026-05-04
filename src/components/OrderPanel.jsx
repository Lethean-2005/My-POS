import { useMemo, useState } from 'react'
import { Icon } from '../icons.jsx'
import { orderItems as initial } from '../data.js'

const TYPES = [
  { id: 'dinein', label: 'Dine In', icon: 'dinein' },
  { id: 'takeaway', label: 'Take Away', icon: 'takeaway' },
  { id: 'delivery', label: 'Delivery', icon: 'delivery' },
  { id: 'table', label: 'Table', icon: 'table' }
]

export default function OrderPanel() {
  const [type, setType] = useState('dinein')
  const [items, setItems] = useState(initial)

  const updateQty = (id, delta) =>
    setItems(items.map(i => {
      if (i.id !== id) return i
      const qty = Math.max(0, i.qty + delta)
      const total = qty * (i.itemPrice || 33)
      return { ...i, qty, total }
    }))

  const removeItem = id => setItems(items.filter(i => i.id !== id))

  const subTotal = useMemo(
    () => items.reduce((s, i) => s + (i.total || i.qty * (i.itemPrice || 33)), 0),
    [items]
  )
  const tax = subTotal * 0.18
  const total = subTotal + tax

  return (
    <aside className="order-panel">
      <div className="order-head">
        <div>
          <h2 className="order-title">Order #56998</h2>
        </div>
        <div className="order-date">08 Oct, 2025, 12:44 PM</div>
      </div>

      <div className="type-row">
        {TYPES.map(t => (
          <button
            key={t.id}
            className={`type-btn${type === t.id ? ' active' : ''}`}
            onClick={() => setType(t.id)}
          >
            <Icon name={t.icon} size={14} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="select-row">
        <div className="select">
          <span className="select-label">Waiter</span>
          <Icon name="caret" size={14} color="#94a3b8" />
        </div>
        <div className="select">
          <span className="select-label">Select Customer</span>
          <Icon name="caret" size={14} color="#94a3b8" />
        </div>
        <button className="add-btn"><Icon name="plus" size={14} /></button>
      </div>

      <div className="ordered-head">
        <h3>Ordered Menus</h3>
        <span className="muted">Total Menus : {items.length}</span>
      </div>

      <div className="ordered-list">
        {items.map((it, idx) => (
          <div key={it.id} className={`order-item${idx === 0 ? ' highlight' : ''}`}>
            {idx === 0 && (
              <div className="order-item-head">
                <img src={it.img} alt={it.name} />
                <div className="oi-info">
                  <div className="oi-name">{it.name}</div>
                  <div className="oi-size">{it.size}</div>
                </div>
                <div className="qty-pill dark">
                  <button onClick={() => updateQty(it.id, -1)}>−</button>
                  <span>{it.qty}</span>
                  <button onClick={() => updateQty(it.id, +1)}>+</button>
                </div>
                <button className="ghost-link"><Icon name="edit" size={12} /> Add Note</button>
              </div>
            )}
            {idx === 0 ? (
              <div className="oi-totals">
                <div><span className="muted">Item Price</span><strong>${it.itemPrice || 33}</strong></div>
                <div><span className="muted">Amount</span><strong>${(it.itemPrice || 33) * it.qty}</strong></div>
                <div><span className="muted">Total</span><strong className="blue">${(it.itemPrice || 33) * it.qty}</strong></div>
              </div>
            ) : (
              <div className="oi-row">
                <img src={it.img} alt={it.name} />
                <div className="oi-info">
                  <div className="oi-name">{it.name}</div>
                  <div className="oi-size">{it.size}</div>
                </div>
                <div className="qty-pill light">
                  <button onClick={() => updateQty(it.id, -1)}>−</button>
                  <span>{it.qty}</span>
                  <button onClick={() => updateQty(it.id, +1)}>+</button>
                </div>
                <button className={`ghost-link ${it.note === 'View Note' ? 'green' : ''}`}>
                  <Icon name="edit" size={12} /> {it.note}
                </button>
                <button className="x-btn" onClick={() => removeItem(it.id)}>
                  <Icon name="x" size={12} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pay-summary">
        <h3>Payment Summary</h3>
        <div className="pay-row"><span className="muted">Sub Total</span><span>${subTotal.toFixed(2)}</span></div>
        <div className="pay-row"><span className="muted">Tax (18%)</span><span>${tax.toFixed(2)}</span></div>
        <div className="pay-row total"><span>Amount to be Paid</span><span>${total.toFixed(2)}</span></div>
      </div>

      <button className="place-btn">Place an Order</button>

      <div className="action-grid">
        <button><Icon name="print" size={14} /> Print</button>
        <button><Icon name="invoice" size={14} /> Invoice</button>
        <button><Icon name="draft" size={14} /> Draft</button>
        <button><Icon name="x" size={14} /> Cancel</button>
        <button><Icon name="minus" size={14} /> Void</button>
        <button><Icon name="transactions" size={14} /> Transactions</button>
      </div>
    </aside>
  )
}
