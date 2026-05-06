import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../layouts/AdminLayout.jsx'
import { Icon } from '../icons.jsx'
import Dropdown from '../components/Dropdown.jsx'
import Pagination from '../components/Pagination.jsx'
import { api } from '../api.js'

const TYPE_META = {
  dinein:   { label: 'Dine In',   color: 'green' },
  takeaway: { label: 'Take Away', color: 'pink' },
  delivery: { label: 'Delivery',  color: 'orange' },
  table:    { label: 'Table',     color: 'green' }
}

const fmt$ = n => '$' + (Number(n) || 0).toFixed(2)
const fmtDate = d => new Date(d).toLocaleString([], {
  month: 'short', day: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit'
})

export default function AdminOrdersPage() {
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [query, setQuery]       = useState('')
  const [statusF, setStatusF]   = useState('all')
  const [typeF, setTypeF]       = useState('all')
  const [viewing, setViewing]   = useState(null)
  const [refunding, setRefunding] = useState(null) // {id, order_no, reason}
  const [page, setPage]         = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      setOrders(await api.allOrders())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { refresh() }, [])

  const filtered = useMemo(() => orders.filter(o => {
    if (statusF !== 'all' && o.status !== statusF) return false
    if (typeF !== 'all' && o.type !== typeF) return false
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      o.order_no?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q)
    )
  }), [orders, query, statusF, typeF])

  useEffect(() => { setPage(1) }, [query, statusF, typeF, pageSize])
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const summary = useMemo(() => {
    const paid = filtered.filter(o => o.status !== 'refunded')
    return {
      count: paid.length,
      revenue: paid.reduce((s, o) => s + Number(o.total || 0), 0),
      refunded: filtered.filter(o => o.status === 'refunded').length
    }
  }, [filtered])

  const submitRefund = async (e) => {
    e.preventDefault()
    if (!refunding) return
    try {
      await api.refundOrder(refunding.id, { reason: refunding.reason || null })
      setRefunding(null)
      await refresh()
      if (viewing?.id === refunding.id) setViewing(null)
    } catch (err) {
      alert('Refund failed: ' + err.message)
    }
  }

  return (
    <AdminLayout
      title="Recent Orders"
      subtitle="View, refund and inspect every transaction"
      actions={
        <button className="btn-ghost" onClick={refresh}>
          <Icon name="transactions" size={14} /> Refresh
        </button>
      }
    >
      <section className="stat-row">
        <Stat label="Orders shown" value={summary.count} accent="blue" icon="orders" />
        <Stat label="Revenue (filtered)" value={fmt$(summary.revenue)} accent="green" icon="chart" />
        <Stat label="Refunded" value={summary.refunded} accent="pink" icon="x" />
      </section>

      <section className="panel">
        <div className="panel-head" style={{ gap: 12, flexWrap: 'wrap' }}>
          <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
            <Icon name="search" size={14} color="#94a3b8" />
            <input placeholder="Search order # or customer" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <Dropdown
            value={statusF}
            onChange={setStatusF}
            options={[
              { value: 'all',      label: 'All statuses' },
              { value: 'pending',  label: 'Pending'  },
              { value: 'paid',     label: 'Paid'     },
              { value: 'refunded', label: 'Refunded' }
            ]}
          />
          <Dropdown
            value={typeF}
            onChange={setTypeF}
            options={[
              { value: 'all',      label: 'All types' },
              { value: 'dinein',   label: 'Dine In'   },
              { value: 'takeaway', label: 'Take Away' },
              { value: 'delivery', label: 'Delivery'  },
              { value: 'table',    label: 'Table'     }
            ]}
          />
          <span className="muted" style={{ marginLeft: 'auto' }}>
            {filtered.length} of {orders.length} orders
          </span>
        </div>

        {error && <div className="auth-error" style={{ margin: '8px 0' }}>{error}</div>}
        {loading && <div className="muted">Loading…</div>}

        <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Items</th>
              <th>Subtotal</th>
              <th>Tax</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={10} className="muted" style={{ textAlign: 'center', padding: 24 }}>No orders match.</td></tr>
            )}
            {paged.map(o => {
              const t = TYPE_META[o.type] || TYPE_META.dinein
              return (
                <tr key={o.id}>
                  <td><strong>{o.order_no}</strong></td>
                  <td className="muted">{fmtDate(o.created_at)}</td>
                  <td>{o.customer_name || '—'}</td>
                  <td><span className={`order-type type-${t.color}`}>{t.label}</span></td>
                  <td>{o.items?.length ?? 0}</td>
                  <td className="muted">{fmt$(o.subtotal)}</td>
                  <td className="muted">{fmt$(o.tax)}</td>
                  <td><strong>{fmt$(o.total)}</strong></td>
                  <td><span className={`status-pill st-${o.status}`}>{o.status}</span></td>
                  <td>
                    <div className="row-actions">
                      <button title="View detail" onClick={() => setViewing(o)}><Icon name="eye" size={14} /></button>
                      <button
                        title={o.status === 'refunded' ? 'Already refunded' : 'Refund'}
                        disabled={o.status === 'refunded'}
                        onClick={() => setRefunding({ id: o.id, order_no: o.order_no, reason: '' })}
                        className="danger"
                      >
                        <Icon name="x" size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>

        <Pagination
          total={filtered.length}
          pageSize={pageSize}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </section>

      {viewing && (
        <Modal title={`Order ${viewing.order_no}`} onClose={() => setViewing(null)}>
          <OrderDetail
            order={viewing}
            onRefund={() => setRefunding({ id: viewing.id, order_no: viewing.order_no, reason: '' })}
          />
        </Modal>
      )}

      {refunding && (
        <Modal title={`Refund order ${refunding.order_no}`} onClose={() => setRefunding(null)}>
          <form onSubmit={submitRefund} className="admin-form">
            <p className="muted" style={{ fontSize: 12, margin: 0 }}>
              This restores stock to inventory and marks the order as refunded. The order is kept for audit.
            </p>
            <label className="field">
              <span className="field-label">Reason (optional)</span>
              <input
                value={refunding.reason}
                onChange={e => setRefunding({ ...refunding, reason: e.target.value })}
                placeholder="e.g. customer changed mind, defective"
                autoFocus
              />
            </label>
            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={() => setRefunding(null)}>Cancel</button>
              <button type="submit" className="btn-primary">Confirm refund</button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  )
}

function OrderDetail({ order, onRefund }) {
  const t = TYPE_META[order.type] || TYPE_META.dinein
  return (
    <div className="admin-form">
      <div className="form-row">
        <Info label="Date">{fmtDate(order.created_at)}</Info>
        <Info label="Type"><span className={`order-type type-${t.color}`}>{t.label}</span></Info>
        <Info label="Status"><span className={`status-pill st-${order.status}`}>{order.status}</span></Info>
        <Info label="Customer">{order.customer_name || '—'}</Info>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map(it => (
            <tr key={it.id}>
              <td>
                <div className="ap-name">
                  {it.image_url && <img src={it.image_url} alt="" />}
                  <div className="ap-title">{it.name}</div>
                </div>
              </td>
              <td>{it.quantity}</td>
              <td className="muted">{fmt$(it.item_price)}</td>
              <td><strong>{fmt$(it.total)}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="totals-block">
        <div><span className="muted">Subtotal</span><span>{fmt$(order.subtotal)}</span></div>
        <div><span className="muted">Tax</span><span>{fmt$(order.tax)}</span></div>
        <div className="total-row"><span>Total</span><span>{fmt$(order.total)}</span></div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={() => window.print()}>
          <Icon name="print" size={14} /> Print
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={order.status === 'refunded'}
          onClick={onRefund}
          style={order.status === 'refunded' ? { opacity: 0.5 } : {}}
        >
          {order.status === 'refunded' ? 'Already refunded' : 'Refund this order'}
        </button>
      </div>
    </div>
  )
}

function Info({ label, children }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div style={{ padding: '6px 0', fontSize: 13 }}>{children}</div>
    </div>
  )
}

function Stat({ label, value, accent, icon }) {
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

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="x-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={14} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
