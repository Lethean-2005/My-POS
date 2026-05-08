import { Fragment, useEffect, useMemo, useState } from 'react'
import AdminLayout from '../layouts/AdminLayout.jsx'
import { Icon } from '../icons.jsx'
import Dropdown from '../components/Dropdown.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { api } from '../api.js'

const fmt$ = n => '$' + (Number(n) || 0).toFixed(2)

export default function AdminStockInPage() {
  const [tab, setTab] = useState('new')
  return (
    <AdminLayout title="Stock In" subtitle="Receive stock against a supplier and update on-hand quantities">
      <div className="tabs" style={{ marginBottom: 16, width: 'fit-content' }}>
        <button type="button" className={`tab${tab === 'new' ? ' active' : ''}`} onClick={() => setTab('new')}>
          <Icon name="plus" size={14} /> New receipt
        </button>
        <button type="button" className={`tab${tab === 'history' ? ' active' : ''}`} onClick={() => setTab('history')}>
          <Icon name="orders" size={14} /> History
        </button>
      </div>

      {tab === 'new' ? <NewReceipt /> : <HistoryView />}
    </AdminLayout>
  )
}

function NewReceipt() {
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [supplierId, setSupplierId] = useState('')
  const [reference, setReference]   = useState('')
  const [receivedAt, setReceivedAt] = useState(() => new Date().toISOString().slice(0, 10))
  const [updateCost, setUpdateCost] = useState(true)
  const [notes, setNotes]           = useState('')
  const [query, setQuery]           = useState('')
  const [lines, setLines]           = useState({}) // { [id]: { qty, unit_cost } }
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState(null)
  const [success, setSuccess]       = useState(null)

  useEffect(() => {
    Promise.all([api.suppliers(), api.adminMenuItems()])
      .then(([s, p]) => { setSuppliers(s); setProducts(p) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(p =>
      p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.barcode?.toLowerCase().includes(q)
    )
  }, [products, query])

  const setLine = (id, patch) => setLines(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }))

  const filledLines = useMemo(() =>
    Object.entries(lines)
      .map(([id, v]) => ({
        menu_item_id: Number(id),
        qty: Number(v.qty) || 0,
        unit_cost: Number(v.unit_cost) || 0,
      }))
      .filter(l => l.qty > 0),
    [lines]
  )

  const totalCost = useMemo(() =>
    filledLines.reduce((acc, l) => acc + l.qty * l.unit_cost, 0),
    [filledLines]
  )

  const submit = async (e) => {
    e.preventDefault()
    if (filledLines.length === 0) { setError('Add at least one product line with quantity > 0.'); return }
    setSaving(true); setError(null); setSuccess(null)
    try {
      await api.createStockReceipt({
        supplier_id: supplierId ? Number(supplierId) : null,
        reference: reference.trim() || null,
        received_at: receivedAt,
        notes: notes.trim() || null,
        update_cost_price: updateCost,
        lines: filledLines
      })
      setSuccess(`Saved receipt with ${filledLines.length} line${filledLines.length === 1 ? '' : 's'}.`)
      setLines({}); setReference(''); setNotes('')
      const refreshed = await api.adminMenuItems()
      setProducts(refreshed)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <form onSubmit={submit}>
      <section className="panel">
        <div className="form-row">
          <Field label="Supplier">
            <Dropdown
              value={supplierId}
              onChange={setSupplierId}
              placeholder="— No supplier —"
              options={[
                { value: '', label: '— No supplier —' },
                ...suppliers.filter(s => s.active).map(s => ({ value: String(s.id), label: s.name }))
              ]}
            />
          </Field>
          <Field label="Reference / PO #">
            <input value={reference} onChange={e => setReference(e.target.value)} placeholder="e.g. INV-2026-001" />
          </Field>
          <Field label="Received on">
            <input type="date" value={receivedAt} onChange={e => setReceivedAt(e.target.value)} />
          </Field>
        </div>
        <Field label="Notes">
          <textarea rows="2" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything special about this delivery" />
        </Field>
        <Field label="Update product cost prices">
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={updateCost} onChange={e => setUpdateCost(e.target.checked)} />
            <span className="muted">Set each product's `cost_price` to the unit cost entered below</span>
          </label>
        </Field>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
            <Icon name="search" size={14} color="#94a3b8" />
            <input placeholder="Search products" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <span className="muted" style={{ marginLeft: 'auto' }}>
            {filledLines.length} line{filledLines.length === 1 ? '' : 's'} · Total {fmt$(totalCost)}
          </span>
        </div>

        {error && <div className="auth-error" style={{ margin: '8px 0' }}>{error}</div>}
        {success && (
          <div className="auth-error" style={{ margin: '8px 0', background: 'var(--green-soft)', color: 'var(--green)', borderColor: 'var(--green-soft)' }}>
            {success}
          </div>
        )}
        {loading && <div className="muted">Loading…</div>}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>On hand</th>
                <th>Qty in</th>
                <th>Unit cost</th>
                <th>Line total</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 24 }}>No products match.</td></tr>
              )}
              {filtered.map(p => {
                const line = lines[p.id] || {}
                const qty  = Number(line.qty) || 0
                const uc   = Number(line.unit_cost) || 0
                const lt   = qty * uc
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="ap-name">
                        {p.image_url && <img src={p.image_url} alt="" />}
                        <div>
                          <div className="ap-title">{p.name}</div>
                          {p.category_label && <span className="muted" style={{ fontSize: 11 }}>{p.category_label}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="muted">{p.sku || '—'}</td>
                    <td><span className={`stock-tag${p.stock_qty <= 0 ? ' out' : p.stock_qty <= p.low_stock_threshold ? ' low' : ''}`}>{p.stock_qty}</span></td>
                    <td>
                      <input
                        type="number" min="0" step="1" value={line.qty ?? ''}
                        onChange={e => setLine(p.id, { qty: e.target.value })}
                        placeholder="0"
                        style={{ width: 80, height: 32, padding: '0 8px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 12 }}
                      />
                    </td>
                    <td>
                      <input
                        type="number" min="0" step="0.01"
                        value={line.unit_cost ?? (p.cost_price ? String(p.cost_price) : '')}
                        onChange={e => setLine(p.id, { unit_cost: e.target.value })}
                        placeholder={p.cost_price ? String(p.cost_price) : '0.00'}
                        style={{ width: 100, height: 32, padding: '0 8px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 12 }}
                      />
                    </td>
                    <td>{lt > 0 ? <strong>{fmt$(lt)}</strong> : <span className="muted">—</span>}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="form-actions" style={{ justifyContent: 'space-between', marginTop: 12 }}>
          <span className="muted">Total receipt cost: <strong style={{ color: 'var(--text)' }}>{fmt$(totalCost)}</strong></span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-ghost" onClick={() => setLines({})} disabled={saving || filledLines.length === 0}>Clear</button>
            <button type="submit" className="btn-primary" disabled={saving || filledLines.length === 0}>
              {saving ? 'Saving…' : `Save receipt (${filledLines.length})`}
            </button>
          </div>
        </div>
      </section>
    </form>
  )
}

function HistoryView() {
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const refresh = async () => {
    setLoading(true); setError(null)
    try { setItems(await api.stockReceipts()) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { refresh() }, [])

  const confirmRemove = async () => {
    const target = deleting; setDeleting(null)
    try { await api.deleteStockReceipt(target.id); await refresh() }
    catch (err) { alert('Delete failed: ' + err.message) }
  }

  return (
    <section className="panel">
      {error && <div className="auth-error" style={{ margin: '8px 0' }}>{error}</div>}
      {loading && <div className="muted">Loading…</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th></th>
              <th>Received</th>
              <th>Reference</th>
              <th>Supplier</th>
              <th>Lines</th>
              <th>Total cost</th>
              <th>By</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 && (
              <tr><td colSpan={8} className="muted" style={{ textAlign: 'center', padding: 24 }}>No receipts yet.</td></tr>
            )}
            {items.map(r => {
              const open = expanded === r.id
              return (
                <Fragment key={r.id}>
                  <tr>
                    <td>
                      <button type="button" className="btn-ghost" onClick={() => setExpanded(open ? null : r.id)} style={{ padding: '4px 8px' }}>
                        <Icon name={open ? 'minus' : 'plus'} size={12} />
                      </button>
                    </td>
                    <td>{r.received_at ? new Date(r.received_at).toLocaleDateString() : '—'}</td>
                    <td>{r.reference || '—'}</td>
                    <td>{r.supplier?.name || <span className="muted">—</span>}</td>
                    <td>{r.lines?.length ?? 0}</td>
                    <td>{fmt$(r.total_cost)}</td>
                    <td className="muted">{r.created_by || '—'}</td>
                    <td>
                      <button title="Reverse / delete" onClick={() => setDeleting(r)} className="danger" style={{ padding: 4 }}>
                        <Icon name="x" size={14} />
                      </button>
                    </td>
                  </tr>
                  {open && (
                    <tr>
                      <td></td>
                      <td colSpan={7} style={{ background: 'var(--bg)' }}>
                        {r.notes && <div style={{ marginBottom: 8 }} className="muted">Notes: {r.notes}</div>}
                        <table className="admin-table" style={{ background: 'var(--surface)' }}>
                          <thead>
                            <tr><th>Product</th><th>SKU</th><th>Qty</th><th>Unit cost</th><th>Line total</th></tr>
                          </thead>
                          <tbody>
                            {r.lines.map(l => (
                              <tr key={l.id}>
                                <td>
                                  <div className="ap-name">
                                    {l.menu_item?.image_url && <img src={l.menu_item.image_url} alt="" />}
                                    <div className="ap-title">{l.menu_item?.name || `#${l.menu_item_id}`}</div>
                                  </div>
                                </td>
                                <td className="muted">{l.menu_item?.sku || '—'}</td>
                                <td>{l.qty}</td>
                                <td>{fmt$(l.unit_cost)}</td>
                                <td><strong>{fmt$(l.line_total)}</strong></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleting}
        title="Reverse stock receipt"
        message={deleting ? `This will subtract the received quantities back from on-hand stock and delete receipt "${deleting.reference || deleting.id}". Continue?` : ''}
        confirmLabel="Yes, reverse it" cancelLabel="Cancel" tone="danger"
        onConfirm={confirmRemove} onCancel={() => setDeleting(null)}
      />
    </section>
  )
}

function Field({ label, children }) {
  return <label className="field"><span className="field-label">{label}</span>{children}</label>
}
