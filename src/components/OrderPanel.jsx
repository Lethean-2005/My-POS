import { useMemo } from 'react'
import { Icon } from '../icons.jsx'

const TYPES = [
  { id: 'dinein', label: 'Dine In', icon: 'dinein' },
  { id: 'takeaway', label: 'Take Away', icon: 'takeaway' },
  { id: 'delivery', label: 'Delivery', icon: 'delivery' },
  { id: 'table', label: 'Table', icon: 'table' }
]

const TAX_RATE = 0.18

export default function OrderPanel({
  items = [],
  type = 'dinein',
  onTypeChange,
  customerName = '',
  onCustomerNameChange,
  onUpdateQty,
  onRemoveItem,
  onPlaceOrder,
  placing = false,
  error,
  success
}) {
  const subTotal = useMemo(
    () => items.reduce((s, i) => s + (Number(i.itemPrice) || 0) * i.qty, 0),
    [items]
  )
  const tax = subTotal * TAX_RATE
  const total = subTotal + tax

  const placedAt = useMemo(
    () => new Date().toLocaleString([], {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }),
    [items.length]
  )

  return (
    <aside className="order-panel">
      <div className="order-head">
        <div>
          <h2 className="order-title">{items.length === 0 ? 'New Order' : 'Current Order'}</h2>
        </div>
        <div className="order-date">{placedAt}</div>
      </div>

      <div className="type-row">
        {TYPES.map(t => (
          <button
            key={t.id}
            className={`type-btn${type === t.id ? ' active' : ''}`}
            onClick={() => onTypeChange?.(t.id)}
          >
            <Icon name={t.icon} size={14} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <div className="select-row">
        <div className="select" style={{ flex: 1 }}>
          <input
            className="customer-input"
            placeholder="Customer name (optional)"
            value={customerName}
            onChange={e => onCustomerNameChange?.(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              width: '100%',
              fontSize: 13
            }}
          />
        </div>
      </div>

      <div className="ordered-head">
        <h3>Ordered Items</h3>
        <span className="muted">Total Items : {items.length}</span>
      </div>

      <div className="ordered-list">
        {items.length === 0 && (
          <div className="muted" style={{ padding: '24px 0', textAlign: 'center' }}>
            Cart is empty. Tap + on an accessory to add it.
          </div>
        )}
        {items.map((it, idx) => (
          <div key={it.id} className={`order-item${idx === 0 ? ' highlight' : ''}`}>
            {idx === 0 ? (
              <>
                <div className="order-item-head">
                  <img src={it.img} alt={it.name} />
                  <div className="oi-info">
                    <div className="oi-name">{it.name}</div>
                    <div className="oi-size">{it.size || '—'}</div>
                  </div>
                  <div className="qty-pill dark">
                    <button onClick={() => onUpdateQty?.(it.id, -1)}>−</button>
                    <span>{it.qty}</span>
                    <button onClick={() => onUpdateQty?.(it.id, +1)}>+</button>
                  </div>
                  <button className="x-btn" onClick={() => onRemoveItem?.(it.id)} aria-label="Remove">
                    <Icon name="x" size={12} />
                  </button>
                </div>
                <div className="oi-totals">
                  <div><span className="muted">Item Price</span><strong>${(Number(it.itemPrice) || 0).toFixed(2)}</strong></div>
                  <div><span className="muted">Qty</span><strong>{it.qty}</strong></div>
                  <div><span className="muted">Total</span><strong className="blue">${((Number(it.itemPrice) || 0) * it.qty).toFixed(2)}</strong></div>
                </div>
              </>
            ) : (
              <div className="oi-row">
                <img src={it.img} alt={it.name} />
                <div className="oi-info">
                  <div className="oi-name">{it.name}</div>
                  <div className="oi-size">{it.size || '—'}</div>
                </div>
                <div className="qty-pill light">
                  <button onClick={() => onUpdateQty?.(it.id, -1)}>−</button>
                  <span>{it.qty}</span>
                  <button onClick={() => onUpdateQty?.(it.id, +1)}>+</button>
                </div>
                <button className="x-btn" onClick={() => onRemoveItem?.(it.id)} aria-label="Remove">
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

      {error && (
        <div style={{ color: 'var(--red)', fontSize: 12, marginBottom: 8 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ color: 'var(--green, #10b981)', fontSize: 12, marginBottom: 8 }}>
          {success}
        </div>
      )}

      <button
        className="place-btn"
        onClick={onPlaceOrder}
        disabled={items.length === 0 || placing}
      >
        {placing ? 'Placing…' : 'Place an Order'}
      </button>

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
