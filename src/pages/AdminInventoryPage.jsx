import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../layouts/AdminLayout.jsx'
import { Icon } from '../icons.jsx'
import Dropdown from '../components/Dropdown.jsx'
import Pagination from '../components/Pagination.jsx'
import { api } from '../api.js'

const fmt$ = n => '$' + (Number(n) || 0).toFixed(2)
const fmtN = n => new Intl.NumberFormat('en-US').format(Number(n) || 0)

const TABS = [
  { id: 'overview',   label: 'Overview',   icon: 'chart' },
  { id: 'movements',  label: 'Movements',  icon: 'transactions' },
  { id: 'stocktake',  label: 'Stocktake',  icon: 'draft' }
]

export default function AdminInventoryPage() {
  const [tab, setTab] = useState('overview')

  return (
    <AdminLayout
      title="Inventory"
      subtitle="Stock health, movement history, and bulk receiving"
    >
      <div className="tabs" style={{ marginBottom: 16, width: 'fit-content' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            className={`tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview'  && <OverviewTab />}
      {tab === 'movements' && <MovementsTab />}
      {tab === 'stocktake' && <StocktakeTab />}
    </AdminLayout>
  )
}

/* ---------------- Overview ---------------- */
function OverviewTab() {
  const [data, setData]       = useState(null)
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.inventorySummary()
      setData(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  if (loading) return <div className="muted">Loading inventory…</div>
  if (error)   return <div className="auth-error">{error}</div>
  if (!data)   return null

  const t = data.totals

  return (
    <>
      <section className="stat-row">
        <StatCard label="SKUs (active)"     value={fmtN(t.active_skus)}        sub={`${fmtN(t.total_skus)} total`}  accent="blue"   icon="box" />
        <StatCard label="Units in stock"    value={fmtN(t.total_units)}        accent="green"  icon="cart" />
        <StatCard label="Stock value (cost)" value={fmt$(t.stock_value_cost)}  sub={`Retail ${fmt$(t.stock_value_retail)}`} accent="orange" icon="dollar" />
        <StatCard label="Potential margin"  value={fmt$(t.potential_margin)}   accent="pink"   icon="chart" />
        <StatCard label="Low stock"         value={fmtN(t.low_stock_count)}    accent="orange" icon="warning" />
        <StatCard label="Out of stock"      value={fmtN(t.out_of_stock_count)} accent="red"    icon="warning" />
      </section>

      <section className="dash-grid">
        <div className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Low stock</h2>
            <span className="muted" style={{ fontSize: 11 }}>{data.low_stock.length} items</span>
          </div>
          <StockList items={data.low_stock} emptyLabel="Nothing low — keep selling." tone="low" />
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Out of stock</h2>
            <span className="muted" style={{ fontSize: 11 }}>{data.out_of_stock.length} items</span>
          </div>
          <StockList items={data.out_of_stock} emptyLabel="No out-of-stock items." tone="out" />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2 className="panel-title">By category</h2>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>SKUs</th>
                <th>Units</th>
                <th>Cost value</th>
                <th>Retail value</th>
                <th>Margin</th>
              </tr>
            </thead>
            <tbody>
              {data.by_category.length === 0 && (
                <tr><td colSpan={6} className="muted" style={{ textAlign: 'center', padding: 24 }}>No products yet.</td></tr>
              )}
              {data.by_category.map(c => (
                <tr key={c.category_id ?? 'none'}>
                  <td>{c.category_name}</td>
                  <td>{fmtN(c.sku_count)}</td>
                  <td>{fmtN(c.units)}</td>
                  <td className="muted">{fmt$(c.value_cost)}</td>
                  <td>{fmt$(c.value_retail)}</td>
                  <td><strong style={{ color: 'var(--green)' }}>{fmt$(c.value_retail - c.value_cost)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

function StockList({ items, emptyLabel, tone }) {
  if (!items || items.length === 0) {
    return <div className="muted" style={{ padding: '8px 0' }}>{emptyLabel}</div>
  }
  return (
    <ul className="top-list">
      {items.map(m => (
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
          <span className={`stock-tag ${tone}`}>{m.stock_qty}</span>
          <span className="muted" style={{ fontSize: 11, minWidth: 70, textAlign: 'right' }}>
            {tone === 'out' ? 'Reorder' : `≤ ${m.low_stock_threshold}`}
          </span>
        </li>
      ))}
    </ul>
  )
}

/* ---------------- Movements ---------------- */
function MovementsTab() {
  const [rows, setRows]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)
  const [filters, setFilters] = useState({ reason: '', reference_type: '', from: '', to: '' })
  const [page, setPage]     = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const data = await api.inventoryMovements({ ...filters, limit: 500 })
      setRows(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, []) // initial
  useEffect(() => { setPage(1) }, [rows, pageSize])

  const apply = (e) => { e.preventDefault(); load() }
  const reset = () => {
    setFilters({ reason: '', reference_type: '', from: '', to: '' })
    setTimeout(load, 0)
  }

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [rows, page, pageSize])

  return (
    <section className="panel">
      <form onSubmit={apply} className="panel-head" style={{ flexWrap: 'wrap', gap: 8 }}>
        <Dropdown
          value={filters.reference_type}
          onChange={v => setFilters(f => ({ ...f, reference_type: v }))}
          placeholder="Any source"
          options={[
            { value: '',             label: 'Any source' },
            { value: 'order',        label: 'Sale (order)' },
            { value: 'order_refund', label: 'Refund' },
            { value: 'adjustment',   label: 'Manual adjust' },
            { value: 'bulk_receive', label: 'Bulk receive' },
            { value: 'create',       label: 'Initial stock' }
          ]}
        />
        <input
          placeholder="Reason contains…"
          value={filters.reason}
          onChange={e => setFilters(f => ({ ...f, reason: e.target.value }))}
          style={{ height: 34, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 12 }}
        />
        <input
          type="date"
          value={filters.from}
          onChange={e => setFilters(f => ({ ...f, from: e.target.value }))}
          style={{ height: 34, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 12 }}
        />
        <input
          type="date"
          value={filters.to}
          onChange={e => setFilters(f => ({ ...f, to: e.target.value }))}
          style={{ height: 34, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 12 }}
        />
        <button type="submit" className="btn-primary"><Icon name="filter" size={14} /> Apply</button>
        <button type="button" className="btn-ghost" onClick={reset}>Reset</button>
        <span className="muted" style={{ marginLeft: 'auto' }}>{rows.length} movements</span>
      </form>

      {error && <div className="auth-error" style={{ margin: '8px 0' }}>{error}</div>}
      {loading && <div className="muted">Loading…</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Product</th>
              <th>Change</th>
              <th>Before → After</th>
              <th>Reason</th>
              <th>Source</th>
              <th>By</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 && (
              <tr><td colSpan={7} className="muted" style={{ textAlign: 'center', padding: 24 }}>No movements match.</td></tr>
            )}
            {paged.map(mv => (
              <tr key={mv.id}>
                <td className="muted">
                  {new Date(mv.created_at).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td>
                  <div className="ap-name">
                    {mv.menu_item?.image_url && <img src={mv.menu_item.image_url} alt="" />}
                    <div>
                      <div className="ap-title">{mv.menu_item?.name || `#${mv.menu_item_id}`}</div>
                      {mv.menu_item?.sku && <span className="muted" style={{ fontSize: 11 }}>{mv.menu_item.sku}</span>}
                    </div>
                  </div>
                </td>
                <td>
                  <strong style={{ color: mv.qty_change > 0 ? 'var(--green)' : 'var(--red)' }}>
                    {mv.qty_change > 0 ? '+' : ''}{mv.qty_change}
                  </strong>
                </td>
                <td className="muted">{mv.qty_before} → <strong style={{ color: 'var(--text)' }}>{mv.qty_after}</strong></td>
                <td>{mv.reason}</td>
                <td><span className="status-pill st-pending" style={{ textTransform: 'none' }}>{mv.reference_type || '—'}</span></td>
                <td className="muted">{mv.user_label || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        total={rows.length}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </section>
  )
}

/* ---------------- Stocktake ---------------- */
function StocktakeTab() {
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)
  const [query, setQuery]   = useState('')
  const [reason, setReason] = useState('Stock receipt')
  const [refType, setRefType] = useState('bulk_receive')
  const [lines, setLines]   = useState({}) // { [id]: '+5' / '-3' / '' }
  const [saving, setSaving] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    api.adminMenuItems()
      .then(setItems)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(m =>
      m.name?.toLowerCase().includes(q) ||
      m.sku?.toLowerCase().includes(q) ||
      m.barcode?.toLowerCase().includes(q)
    )
  }, [items, query])

  const setLine = (id, val) => setLines(l => ({ ...l, [id]: val }))

  const filledLines = useMemo(() =>
    Object.entries(lines)
      .map(([id, v]) => ({ menu_item_id: Number(id), qty_change: Number(v) }))
      .filter(l => Number.isInteger(l.qty_change) && l.qty_change !== 0)
  , [lines])

  const submit = async (e) => {
    e.preventDefault()
    if (filledLines.length === 0) {
      setError('Enter a non-zero quantity for at least one product.')
      return
    }
    setSaving(true); setError(null); setResult(null)
    try {
      const res = await api.bulkReceive({ reason, reference_type: refType, lines: filledLines })
      setResult(res)
      setLines({})
      // refresh stock numbers
      const refreshed = await api.adminMenuItems()
      setItems(refreshed)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="panel">
      <div className="panel-head" style={{ flexWrap: 'wrap', gap: 8 }}>
        <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
          <Icon name="search" size={14} color="#94a3b8" />
          <input placeholder="Search name, SKU, barcode" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <Dropdown
          value={refType}
          onChange={setRefType}
          options={[
            { value: 'bulk_receive', label: 'Bulk receive (delivery)' },
            { value: 'stocktake',    label: 'Stocktake correction' },
            { value: 'adjustment',   label: 'Manual adjust' }
          ]}
        />
        <input
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Reason / reference"
          style={{ height: 34, padding: '0 10px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 12, minWidth: 220 }}
        />
        <span className="muted" style={{ marginLeft: 'auto' }}>
          {filledLines.length} line{filledLines.length === 1 ? '' : 's'} pending
        </span>
      </div>

      {error  && <div className="auth-error" style={{ margin: '8px 0' }}>{error}</div>}
      {result && (
        <div className="auth-error" style={{ margin: '8px 0', background: 'var(--green-soft)', color: 'var(--green)', borderColor: 'var(--green-soft)' }}>
          Applied {result.count} adjustment{result.count === 1 ? '' : 's'}.
        </div>
      )}

      <form onSubmit={submit}>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>On hand</th>
                <th>Adjust (+/-)</th>
                <th>New total</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 24 }}>No products match.</td></tr>
              )}
              {filtered.map(m => {
                const raw = lines[m.id] ?? ''
                const change = Number(raw)
                const next = Number.isInteger(change) ? m.stock_qty + change : m.stock_qty
                const out = next <= 0
                const low = !out && next <= m.low_stock_threshold
                return (
                  <tr key={m.id}>
                    <td>
                      <div className="ap-name">
                        {m.image_url && <img src={m.image_url} alt="" />}
                        <div>
                          <div className="ap-title">{m.name}</div>
                          {m.category_label && <span className="muted" style={{ fontSize: 11 }}>{m.category_label}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="muted">{m.sku || '—'}</td>
                    <td><span className={`stock-tag${m.stock_qty <= 0 ? ' out' : m.stock_qty <= m.low_stock_threshold ? ' low' : ''}`}>{m.stock_qty}</span></td>
                    <td>
                      <input
                        type="number"
                        step="1"
                        value={raw}
                        onChange={e => setLine(m.id, e.target.value)}
                        placeholder="0"
                        style={{ width: 90, height: 32, padding: '0 8px', border: '1px solid var(--border)', borderRadius: 5, fontSize: 12 }}
                      />
                    </td>
                    <td>
                      {raw !== '' && Number.isInteger(change) && change !== 0
                        ? <span className={`stock-tag${out ? ' out' : low ? ' low' : ''}`}>{next}</span>
                        : <span className="muted">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
          <button type="button" className="btn-ghost" onClick={() => setLines({})} disabled={saving || filledLines.length === 0}>
            Clear
          </button>
          <button type="submit" className="btn-primary" disabled={saving || filledLines.length === 0}>
            {saving ? 'Applying…' : `Apply ${filledLines.length} change${filledLines.length === 1 ? '' : 's'}`}
          </button>
        </div>
      </form>
    </section>
  )
}

/* ---------------- helpers ---------------- */
function StatCard({ label, value, accent, icon, sub }) {
  return (
    <div className={`stat-card stat-${accent}`}>
      <div className="stat-icon"><Icon name={icon} size={18} /></div>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {sub && <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}
