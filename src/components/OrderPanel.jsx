import { useMemo, useState } from 'react'
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

  const [invoiceOpen, setInvoiceOpen] = useState(false)

  const invoiceData = useMemo(() => {
    if (!invoiceOpen) return null
    const now = new Date()
    const refNo = 'REF' + now.getTime().toString().slice(-10)
    const txnNo = String(now.getTime()).slice(-11)
    return {
      refNo,
      txnNo,
      typeLabel: TYPES.find(t => t.id === type)?.label || type,
      dateText: now.toLocaleString([], {
        month: 'short', day: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }),
      timeText: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }, [invoiceOpen, type])

  const openInvoice = () => {
    if (items.length === 0) return
    setInvoiceOpen(true)
  }

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
        <button onClick={openInvoice} disabled={items.length === 0}><Icon name="invoice" size={14} /> Invoice</button>
        <button><Icon name="draft" size={14} /> Draft</button>
        <button><Icon name="x" size={14} /> Cancel</button>
        <button><Icon name="minus" size={14} /> Void</button>
        <button><Icon name="transactions" size={14} /> Transactions</button>
      </div>

      {invoiceOpen && invoiceData && (
        <InvoiceReceipt
          customerName={customerName}
          typeLabel={invoiceData.typeLabel}
          total={total}
          subTotal={subTotal}
          tax={tax}
          itemsCount={items.length}
          refNo={invoiceData.refNo}
          txnNo={invoiceData.txnNo}
          dateText={invoiceData.dateText}
          timeText={invoiceData.timeText}
          onClose={() => setInvoiceOpen(false)}
        />
      )}
    </aside>
  )
}

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'WI'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function fmtAmount(n) {
  return (Number(n) || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function InvoiceReceipt({
  customerName, typeLabel, total, subTotal, tax,
  itemsCount, refNo, txnNo, dateText, onClose
}) {
  const display = (customerName || '').trim() || 'Walk-in Customer'
  const init = initials(display)

  const handleShare = async () => {
    const text = `Invoice ${refNo} — ${fmtAmount(total)} USD — ${display}`
    if (navigator.share) {
      try { await navigator.share({ title: 'Invoice', text }) } catch {}
    } else if (navigator.clipboard) {
      try { await navigator.clipboard.writeText(text) } catch {}
    }
  }
  const handlePrint = () => window.print()
  const handleDownload = () => {
    const lines = [
      `Invoice ${refNo}`,
      `Transaction ID: ${txnNo}`,
      `Customer: ${display}`,
      `Order type: ${typeLabel}`,
      `Items: ${itemsCount}`,
      `Subtotal: ${fmtAmount(subTotal)} USD`,
      `Tax: ${fmtAmount(tax)} USD`,
      `Total: ${fmtAmount(total)} USD`,
      `Date: ${dateText}`
    ].join('\n')
    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${refNo}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }
  const handleSave = handleDownload

  return (
    <div className="aba-backdrop" onClick={onClose}>
      <div className="aba-stage" onClick={e => e.stopPropagation()}>
        <div className="aba-receipt">
          <button className="aba-close" onClick={onClose} aria-label="Close">
            <Icon name="x" size={14} />
          </button>

          <div className="aba-head">
            <div className="aba-avatar" aria-label={`Sender ${init}`}>{init}</div>
            <div className="aba-head-text">
              <div className="aba-amount">
                <span>{fmtAmount(total)}</span><span className="aba-ccy">USD</span>
              </div>
              <div className="aba-from">Received from {display.toUpperCase()}</div>
            </div>
          </div>

          <div className="aba-perf"><div className="aba-perf-dash" /></div>

          <div className="aba-body">
            <div className="aba-row">
              <span className="aba-lbl aba-kh">លេខកូដប្រតិបត្តិការ៖</span>
              <span className="aba-val">{txnNo}</span>
            </div>
            <div className="aba-row">
              <span className="aba-lbl">Order type:</span>
              <span className="aba-val">{typeLabel}</span>
            </div>
            <div className="aba-row">
              <span className="aba-lbl">Original amount:</span>
              <span className="aba-val">{fmtAmount(total)} USD</span>
            </div>
            <div className="aba-row">
              <span className="aba-lbl">Subtotal:</span>
              <span className="aba-val">{fmtAmount(subTotal)} USD</span>
            </div>
            <div className="aba-row">
              <span className="aba-lbl">Tax:</span>
              <span className="aba-val">{fmtAmount(tax)} USD</span>
            </div>
            <div className="aba-row">
              <span className="aba-lbl">Reference #:</span>
              <span className="aba-val">{refNo}</span>
            </div>
            <div className="aba-row">
              <span className="aba-lbl">Items:</span>
              <span className="aba-val">{itemsCount}</span>
            </div>
            <div className="aba-row">
              <span className="aba-lbl">Customer:</span>
              <span className="aba-val">{display.toUpperCase()}</span>
            </div>
            <div className="aba-row">
              <span className="aba-lbl">Transaction date:</span>
              <span className="aba-val">{dateText}</span>
            </div>
          </div>

          <div className="aba-foot">
            <div className="aba-foot-tag">POINT OF SALE</div>
            <div className="aba-foot-divider" />
            <div className="aba-foot-brand">Dreams POS</div>
          </div>
        </div>

        <div className="aba-actions">
          <ActionBtn icon="share" label="Share" onClick={handleShare} />
          <ActionBtn icon="print" label="Print" onClick={handlePrint} />
          <ActionBtn icon="download" label="Download" onClick={handleDownload} />
          <ActionBtn icon="star" label="Save" onClick={handleSave} />
        </div>
      </div>
    </div>
  )
}

function ActionBtn({ icon, label, onClick }) {
  return (
    <button type="button" className="aba-action" onClick={onClick}>
      <span className="aba-action-circle"><Icon name={icon} size={20} /></span>
      <span className="aba-action-label">{label}</span>
    </button>
  )
}
