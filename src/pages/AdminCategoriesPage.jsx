import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../layouts/AdminLayout.jsx'
import { Icon, CATEGORY_ICON_NAMES } from '../icons.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import Pagination from '../components/Pagination.jsx'
import { api } from '../api.js'

const EMPTY_FORM = {
  name: '',
  slug: '',
  icon: '',
  image_url: '',
  sort: ''
}

export default function AdminCategoriesPage() {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [editing, setEditing]   = useState(null)   // null | 'new' | <id>
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(null)   // category | null
  const [uploading, setUploading] = useState(false)
  const [previewImg, setPreviewImg] = useState(null)
  const [page, setPage]           = useState(1)
  const [pageSize, setPageSize]   = useState(20)

  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])
  useEffect(() => { setPage(1) }, [pageSize])

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await api.categories())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { refresh() }, [])

  const openNew = () => { setEditing('new'); setForm({ ...EMPTY_FORM }) }
  const openEdit = (c) => {
    setEditing(c.id)
    setForm({
      name: c.name || '',
      slug: c.slug || '',
      icon: c.icon || '',
      image_url: c.image_url || '',
      sort: c.sort ?? ''
    })
  }
  const closeEdit = () => { setEditing(null); setForm(EMPTY_FORM); setError(null) }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || null,
        icon: form.icon || null,
        image_url: form.image_url.trim() || null,
        sort: form.sort === '' ? null : Number(form.sort)
      }
      if (editing === 'new') {
        await api.createCategory(payload)
      } else {
        await api.updateCategory(editing, payload)
      }
      closeEdit()
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const browseImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const { url } = await api.uploadImage(file, 'categories')
      setForm(f => ({ ...f, image_url: url }))
    } catch (err) {
      setError('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const askRemove = (c) => {
    if (c.slug === 'all') { alert("The 'all' category cannot be deleted."); return }
    setDeleting(c)
  }
  const confirmRemove = async () => {
    if (!deleting) return
    const target = deleting
    setDeleting(null)
    try {
      await api.deleteCategory(target.id)
      await refresh()
    } catch (err) {
      alert('Delete failed: ' + err.message)
    }
  }

  return (
    <AdminLayout
      title="Categories"
      subtitle="Group products with images cashiers will see on the POS"
      actions={
        <button className="btn-primary" onClick={openNew}>
          <Icon name="plus" size={14} /> New category
        </button>
      }
    >
      <section className="panel">
        {error && !editing && <div className="auth-error" style={{ marginBottom: 8 }}>{error}</div>}
        {loading && <div className="muted">Loading…</div>}

        <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Icon</th>
              <th>Items</th>
              <th>Sort</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 && (
              <tr><td colSpan={7} className="muted" style={{ textAlign: 'center', padding: 24 }}>No categories yet.</td></tr>
            )}
            {paged.map(c => (
              <tr key={c.id}>
                <td>
                  <div
                    className={`cat-thumb${c.image_url ? ' clickable' : ''}`}
                    onClick={c.image_url ? () => setPreviewImg(c.image_url) : undefined}
                    title={c.image_url ? 'Click to view image' : undefined}
                  >
                    {c.image_url
                      ? <img src={c.image_url} alt="" />
                      : <Icon name={c.icon || 'box'} size={18} color={c.icon ? undefined : '#94a3b8'} />
                    }
                  </div>
                </td>
                <td><strong>{c.name}</strong></td>
                <td className="muted">{c.slug}</td>
                <td>{c.icon ? <Icon name={c.icon} size={18} /> : <span className="muted">—</span>}</td>
                <td>{c.item_count ?? 0}</td>
                <td className="muted">{c.sort}</td>
                <td>
                  <div className="row-actions">
                    <button title="Edit" onClick={() => openEdit(c)}><Icon name="edit" size={14} /></button>
                    <button
                      title={c.slug === 'all' ? "Can't delete" : 'Delete'}
                      disabled={c.slug === 'all'}
                      onClick={() => askRemove(c)}
                      className="danger"
                    >
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        <Pagination
          total={items.length}
          pageSize={pageSize}
          currentPage={page}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </section>

      {previewImg && (
        <div className="lightbox" onClick={() => setPreviewImg(null)}>
          <button className="lightbox-close" aria-label="Close" onClick={() => setPreviewImg(null)}>
            <Icon name="x" size={18} />
          </button>
          <img src={previewImg} alt="" onClick={e => e.stopPropagation()} />
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete category"
        message={deleting ? `You're going to delete "${deleting.name}". Products keep their existing label.` : ''}
        confirmLabel="Yes, delete!"
        cancelLabel="No, keep it."
        tone="danger"
        onConfirm={confirmRemove}
        onCancel={() => setDeleting(null)}
      />

      {editing && (
        <Modal title={editing === 'new' ? 'New category' : 'Edit category'} onClose={closeEdit}>
          <form onSubmit={submit} className="admin-form">
            {error && <div className="auth-error">{error}</div>}

            <div
              className={`cat-image-preview${form.image_url ? ' clickable' : ''}`}
              onClick={form.image_url ? () => setPreviewImg(form.image_url) : undefined}
              title={form.image_url ? 'Click to view image' : undefined}
            >
              {form.image_url
                ? <img src={form.image_url} alt="" />
                : (form.icon
                    ? <Icon name={form.icon} size={42} color="#475569" />
                    : <Icon name="box" size={42} color="#cbd5e1" />)
              }
            </div>

            <div className="form-row">
              <Field label="Name *">
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Slug">
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto from name" />
              </Field>
            </div>
            <Field label="Image">
              <div className="image-input">
                <input
                  value={form.image_url}
                  onChange={e => setForm({ ...form, image_url: e.target.value })}
                  placeholder="Paste a URL or click Browse"
                />
                <label className="btn-ghost image-browse">
                  <Icon name="draft" size={14} />
                  {uploading ? 'Uploading…' : 'Browse'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={browseImage}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>
                {form.image_url && (
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                    title="Remove image"
                  >
                    <Icon name="x" size={14} />
                  </button>
                )}
              </div>
            </Field>
            <Field label="Icon (fallback)">
              <div className="icon-picker">
                <button
                  type="button"
                  className={`icon-pick${!form.icon ? ' active' : ''}`}
                  onClick={() => setForm({ ...form, icon: '' })}
                  title="No icon"
                >
                  <span className="muted" style={{ fontSize: 11 }}>None</span>
                </button>
                {CATEGORY_ICON_NAMES.map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`icon-pick${form.icon === n ? ' active' : ''}`}
                    onClick={() => setForm({ ...form, icon: n })}
                    title={n}
                  >
                    <Icon name={n} size={18} />
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Sort order">
              <input type="number" min="0" value={form.sort} onChange={e => setForm({ ...form, sort: e.target.value })} />
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
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  )
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
