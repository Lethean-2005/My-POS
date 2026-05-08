import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../layouts/AdminLayout.jsx'
import { Icon } from '../icons.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import Pagination from '../components/Pagination.jsx'
import { api } from '../api.js'

const EMPTY_FORM = {
  name: '', contact_name: '', email: '', phone: '', address: '', notes: '', active: true
}

export default function AdminSuppliersPage() {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [query, setQuery]       = useState('')
  const [page, setPage]         = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const refresh = async () => {
    setLoading(true); setError(null)
    try { setItems(await api.suppliers()) }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { refresh() }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.contact_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q)
    )
  }, [items, query])

  useEffect(() => { setPage(1) }, [query, pageSize])
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const openNew  = () => { setEditing('new'); setForm({ ...EMPTY_FORM }) }
  const openEdit = (s) => {
    setEditing(s.id)
    setForm({
      name: s.name || '', contact_name: s.contact_name || '', email: s.email || '',
      phone: s.phone || '', address: s.address || '', notes: s.notes || '', active: !!s.active
    })
  }
  const closeEdit = () => { setEditing(null); setForm(EMPTY_FORM); setError(null) }

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError(null)
    try {
      const payload = {
        name: form.name.trim(),
        contact_name: form.contact_name.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        notes: form.notes.trim() || null,
        active: !!form.active
      }
      if (editing === 'new') await api.createSupplier(payload)
      else await api.updateSupplier(editing, payload)
      closeEdit(); await refresh()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const confirmRemove = async () => {
    if (!deleting) return
    const target = deleting; setDeleting(null)
    try { await api.deleteSupplier(target.id); await refresh() }
    catch (err) { alert('Delete failed: ' + err.message) }
  }

  return (
    <AdminLayout
      title="Suppliers"
      subtitle="Manage supplier contacts for stock receipts"
      actions={
        <button className="btn-primary" onClick={openNew}>
          <Icon name="plus" size={14} /> New supplier
        </button>
      }
    >
      <section className="panel">
        <div className="panel-head" style={{ gap: 12 }}>
          <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
            <Icon name="search" size={14} color="#94a3b8" />
            <input placeholder="Search name, contact, email, phone" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <span className="muted" style={{ marginLeft: 'auto' }}>
            {filtered.length} of {items.length} suppliers
          </span>
        </div>

        {error && !editing && <div className="auth-error" style={{ margin: '8px 0' }}>{error}</div>}
        {loading && <div className="muted">Loading…</div>}

        <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Receipts</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} className="muted" style={{ textAlign: 'center', padding: 24 }}>No suppliers match.</td></tr>
            )}
            {paged.map(s => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong></td>
                <td>{s.contact_name || '—'}</td>
                <td className="muted">{s.email || '—'}</td>
                <td className="muted">{s.phone || '—'}</td>
                <td>{s.receipts_count ?? 0}</td>
                <td><span className={`status-pill st-${s.active ? 'paid' : 'pending'}`}>{s.active ? 'Active' : 'Inactive'}</span></td>
                <td>
                  <div className="row-actions">
                    <button title="Edit" onClick={() => openEdit(s)}><Icon name="edit" size={14} /></button>
                    <button title="Delete" onClick={() => setDeleting(s)} className="danger"><Icon name="x" size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <Pagination total={filtered.length} pageSize={pageSize} currentPage={page}
          onPageChange={setPage} onPageSizeChange={setPageSize} />
      </section>

      <ConfirmDialog
        open={!!deleting}
        title="Delete supplier"
        message={deleting ? `Delete "${deleting.name}"? Past receipts keep their reference.` : ''}
        confirmLabel="Yes, delete!" cancelLabel="No, keep it." tone="danger"
        onConfirm={confirmRemove} onCancel={() => setDeleting(null)}
      />

      {editing && (
        <Modal title={editing === 'new' ? 'New supplier' : 'Edit supplier'} onClose={closeEdit}>
          <form onSubmit={submit} className="admin-form">
            {error && <div className="auth-error">{error}</div>}
            <div className="form-row">
              <Field label="Name *"><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
              <Field label="Contact name"><input value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} /></Field>
            </div>
            <div className="form-row">
              <Field label="Email"><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></Field>
              <Field label="Phone"><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></Field>
            </div>
            <Field label="Address"><input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></Field>
            <Field label="Notes"><textarea rows="3" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></Field>
            <Field label="Active">
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
                <span className="muted">Show in supplier picker on Stock In</span>
              </label>
            </Field>
            <div className="form-actions">
              <button type="button" onClick={closeEdit} className="btn-ghost">Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : (editing === 'new' ? 'Create' : 'Save changes')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  )
}

function Field({ label, children }) {
  return <label className="field"><span className="field-label">{label}</span>{children}</label>
}
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="x-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={14} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
