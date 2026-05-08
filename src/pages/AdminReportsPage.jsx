import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../layouts/AdminLayout.jsx'
import { Icon } from '../icons.jsx'
import { api } from '../api.js'

const fmt = n => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(n) || 0)
const money = n => '$' + fmt(n)

const TYPE_LABELS = { dinein: 'Dine In', takeaway: 'Take Away', delivery: 'Delivery', table: 'Table' }

const PRESETS = [
  { id: 'today',  label: 'Today',     days: 0  },
  { id: '7',      label: 'Last 7',    days: 6  },
  { id: '30',     label: 'Last 30',   days: 29 },
  { id: '90',     label: 'Last 90',   days: 89 },
]

const isoDay = (d) => d.toISOString().slice(0, 10)

export default function AdminReportsPage() {
  const today = new Date()
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 29); return isoDay(d)
  })
  const [to, setTo]     = useState(() => isoDay(today))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = async (f, t) => {
    setLoading(true); setError(null)
    try { setData(await api.reports({ from: f, to: t })) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load(from, to) }, []) // initial

  const apply = (e) => { e.preventDefault(); load(from, to) }
  const setPreset = (preset) => {
    const t = new Date()
    const f = new Date(); f.setDate(f.getDate() - preset.days)
    setFrom(isoDay(f)); setTo(isoDay(t))
    setTimeout(() => load(isoDay(f), isoDay(t)), 0)
  }

  const maxRev = useMemo(() => {
    if (!data?.by_day?.length) return 1
    return Math.max(1, ...data.by_day.map(d => Number(d.revenue) || 0))
  }, [data])

  return (
    <AdminLayout title="Reports" subtitle="Sales performance and inventory snapshot">
      <section className="panel">
        <form onSubmit={apply} className="panel-head" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div className="tabs">
            {PRESETS.map(p => (
              <button key={p.id} type="button" className="tab" onClick={() => setPreset(p)}>{p.label}</button>
            ))}
          </div>
          <Field inline label="From">
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </Field>
          <Field inline label="To">
            <input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </Field>
          <button type="submit" className="btn-primary"><Icon name="filter" size={14} /> Apply</button>
        </form>
        {error && <div className="auth-error" style={{ margin: '8px 0' }}>{error}</div>}
        {loading && <div className="muted">Loading…</div>}
      </section>

      {data && !loading && (
        <>
          <section className="stat-row">
            <StatCard label="Revenue"        value={money(data.totals.revenue)}         accent="green"  icon="chart" />
            <StatCard label="Orders"         value={fmt(data.totals.orders)}            accent="blue"   icon="orders" />
            <StatCard label="Items sold"     value={fmt(data.totals.items_sold)}        accent="orange" icon="cart" />
            <StatCard label="Avg order"      value={money(data.totals.avg_order_value)} accent="pink"   icon="invoice" />
            <StatCard label="Tax collected"  value={money(data.totals.tax)}             accent="blue"   icon="dollar" />
            <StatCard label="Refunded"       value={fmt(data.totals.refunded_count)}    accent="orange" icon="warning" />
          </section>

          <section className="dash-grid">
            <div className="panel">
              <div className="panel-head">
                <h2 className="panel-title">Revenue by day</h2>
                <span className="muted" style={{ fontSize: 11 }}>{data.range.from} → {data.range.to}</span>
              </div>
              <div className="bars">
                {data.by_day.length === 0 && <div className="muted">No sales in range.</div>}
                {data.by_day.map(d => (
                  <div key={d.day} className="bar-col">
                    <div className="bar-wrap">
                      <div className="bar-fill" style={{ height: `${(Number(d.revenue) / maxRev) * 100}%` }} title={money(d.revenue)}>
                        <span className="bar-val">{money(d.revenue)}</span>
                      </div>
                    </div>
                    <div className="bar-label">{new Date(d.day).toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
                    <div className="bar-sub">{d.orders} orders</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-head"><h2 className="panel-title">By order type</h2></div>
              <ul className="top-list">
                {data.by_type.length === 0 && <li className="muted">No data.</li>}
                {data.by_type.map(t => (
                  <li key={t.type}>
                    <span className="rank"><Icon name={t.type === 'delivery' ? 'delivery' : t.type === 'takeaway' ? 'takeaway' : 'dinein'} size={12} /></span>
                    <span className="top-name">{TYPE_LABELS[t.type] || t.type}</span>
                    <span className="top-qty">{t.orders} orders</span>
                    <span className="top-rev">{money(t.revenue)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="dash-grid">
            <div className="panel">
              <div className="panel-head"><h2 className="panel-title">By category</h2></div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Category</th><th>Items sold</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {data.by_category.length === 0 && (
                      <tr><td colSpan={3} className="muted" style={{ textAlign: 'center', padding: 24 }}>No sales.</td></tr>
                    )}
                    {data.by_category.map(c => (
                      <tr key={c.category}>
                        <td>{c.category}</td>
                        <td>{fmt(c.qty)}</td>
                        <td><strong>{money(c.revenue)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="panel">
              <div className="panel-head"><h2 className="panel-title">Top items</h2></div>
              <ul className="top-list">
                {data.top_items.length === 0 && <li className="muted">No sales.</li>}
                {data.top_items.map((t, i) => (
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
            <div className="panel-head"><h2 className="panel-title">Inventory snapshot (current)</h2></div>
            <div className="stat-row" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
              <MiniStat label="Units in stock"  value={fmt(data.inventory.units)} />
              <MiniStat label="Cost value"      value={money(data.inventory.value_cost)} />
              <MiniStat label="Retail value"    value={money(data.inventory.value_retail)} />
              <MiniStat label="Low stock"       value={fmt(data.inventory.low_stock)}     accent="orange" />
              <MiniStat label="Out of stock"    value={fmt(data.inventory.out_of_stock)}  accent="pink" />
            </div>
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
function MiniStat({ label, value, accent = 'blue' }) {
  return (
    <div className={`stat-card stat-${accent}`} style={{ padding: 12 }}>
      <div className="stat-info">
        <div className="stat-label">{label}</div>
        <div className="stat-value" style={{ fontSize: 22 }}>{value}</div>
      </div>
    </div>
  )
}
function Field({ label, children, inline }) {
  return (
    <label className="field" style={inline ? { flexDirection: 'row', alignItems: 'center', gap: 6 } : undefined}>
      <span className="field-label" style={inline ? { margin: 0 } : undefined}>{label}</span>
      {children}
    </label>
  )
}
