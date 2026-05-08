import { useEffect, useState } from 'react'
import AdminLayout from '../layouts/AdminLayout.jsx'
import { Icon } from '../icons.jsx'
import { api } from '../api.js'

const DEFAULTS = {
  store_name: '',
  currency: '$',
  tax_rate: '18',
  receipt_footer: 'Thank you for your purchase!',
  default_low_stock_threshold: '5',
  store_phone: '',
  store_address: ''
}

export default function AdminSettingsPage() {
  const [form, setForm]   = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(null)

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const data = await api.getSettings()
      setForm({ ...DEFAULTS, ...data })
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError(null); setSuccess(null)
    try {
      const payload = {
        store_name: form.store_name?.trim() || null,
        currency: form.currency?.trim() || '$',
        tax_rate: form.tax_rate === '' ? 0 : Number(form.tax_rate),
        receipt_footer: form.receipt_footer?.trim() || null,
        default_low_stock_threshold: form.default_low_stock_threshold === '' ? 5 : Number(form.default_low_stock_threshold),
        store_phone: form.store_phone?.trim() || null,
        store_address: form.store_address?.trim() || null
      }
      const updated = await api.updateSettings(payload)
      setForm({ ...DEFAULTS, ...updated })
      setSuccess('Settings saved.')
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <AdminLayout title="Settings" subtitle="Store information, tax, and receipt configuration">
      <form onSubmit={submit}>
        <section className="panel">
          <div className="panel-head"><h2 className="panel-title">Store details</h2></div>
          {loading && <div className="muted">Loading…</div>}
          {error && <div className="auth-error" style={{ margin: '8px 0' }}>{error}</div>}
          {success && (
            <div className="auth-error" style={{ margin: '8px 0', background: 'var(--green-soft)', color: 'var(--green)', borderColor: 'var(--green-soft)' }}>
              {success}
            </div>
          )}
          <div className="form-row">
            <Field label="Store name">
              <input value={form.store_name || ''} onChange={e => setForm({ ...form, store_name: e.target.value })} />
            </Field>
            <Field label="Phone">
              <input value={form.store_phone || ''} onChange={e => setForm({ ...form, store_phone: e.target.value })} />
            </Field>
          </div>
          <Field label="Address">
            <input value={form.store_address || ''} onChange={e => setForm({ ...form, store_address: e.target.value })} />
          </Field>
        </section>

        <section className="panel">
          <div className="panel-head"><h2 className="panel-title">Sales</h2></div>
          <div className="form-row">
            <Field label="Currency symbol">
              <input value={form.currency || ''} onChange={e => setForm({ ...form, currency: e.target.value })} placeholder="$" />
            </Field>
            <Field label="Tax rate (%)">
              <input type="number" step="0.01" min="0" max="100" value={form.tax_rate ?? ''} onChange={e => setForm({ ...form, tax_rate: e.target.value })} />
            </Field>
            <Field label="Default low-stock threshold">
              <input type="number" min="0" value={form.default_low_stock_threshold ?? ''} onChange={e => setForm({ ...form, default_low_stock_threshold: e.target.value })} />
            </Field>
          </div>
          <p className="muted" style={{ fontSize: 11, margin: 0 }}>
            <Icon name="info" size={12} /> Tax rate applies to all new orders. Existing orders keep their captured tax.
          </p>
        </section>

        <section className="panel">
          <div className="panel-head"><h2 className="panel-title">Receipt</h2></div>
          <Field label="Footer text">
            <textarea rows="3" value={form.receipt_footer || ''} onChange={e => setForm({ ...form, receipt_footer: e.target.value })} placeholder="Thank you for your purchase!" />
          </Field>
        </section>

        <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn-ghost" onClick={load} disabled={loading || saving}>Reset</button>
          <button type="submit" className="btn-primary" disabled={loading || saving}>
            {saving ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}

function Field({ label, children }) {
  return <label className="field"><span className="field-label">{label}</span>{children}</label>
}
