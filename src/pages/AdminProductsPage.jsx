import { useEffect, useMemo, useState } from 'react'
import AdminLayout from '../layouts/AdminLayout.jsx'
import { Icon } from '../icons.jsx'
import Dropdown from '../components/Dropdown.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import Pagination from '../components/Pagination.jsx'
import { api } from '../api.js'

const EMPTY_FORM = {
  name: '',
  sku: '',
  barcode: '',
  category_id: '',
  price: '',
  cost_price: '',
  stock_qty: '',
  low_stock_threshold: 5,
  badge: '',
  image_url: '',
  images: [],
  description: '',
  active: true
}

const fmt$ = n => '$' + (Number(n) || 0).toFixed(2)

export default function AdminProductsPage() {
  const [items, setItems]           = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [query, setQuery]           = useState('')
  const [catFilter, setCatFilter]   = useState('all')
  const [editing, setEditing]       = useState(null)   // null | 'new' | <id>
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [adjusting, setAdjusting]   = useState(null)   // {id, qty, reason} | null
  const [viewing, setViewing]       = useState(null)   // product | null
  const [movements, setMovements]   = useState([])
  const [movLoading, setMovLoading] = useState(false)
  const [uploading, setUploading]   = useState(false)
  const [deleting, setDeleting]     = useState(null)   // product | null
  const [page, setPage]             = useState(1)
  const [pageSize, setPageSize]     = useState(20)

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const [mi, cats] = await Promise.all([api.adminMenuItems(), api.categories()])
      setItems(mi)
      setCategories(cats.filter(c => c.slug !== 'all'))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { refresh() }, [])

  const filtered = useMemo(() => items.filter(m => {
    const matchesCat = catFilter === 'all' || m.category_id === Number(catFilter)
    const q = query.trim().toLowerCase()
    const matchesQuery = !q ||
      m.name?.toLowerCase().includes(q) ||
      m.sku?.toLowerCase().includes(q) ||
      m.barcode?.toLowerCase().includes(q)
    return matchesCat && matchesQuery
  }), [items, query, catFilter])

  useEffect(() => { setPage(1) }, [query, catFilter, pageSize])
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const openNew = () => {
    setEditing('new')
    setForm({ ...EMPTY_FORM, low_stock_threshold: 5 })
  }
  const openEdit = (m) => {
    const imgs = Array.isArray(m.images) && m.images.length > 0
      ? m.images
      : (m.image_url ? [m.image_url] : [])
    setEditing(m.id)
    setForm({
      name: m.name || '',
      sku: m.sku || '',
      barcode: m.barcode || '',
      category_id: m.category_id || '',
      price: m.price ?? '',
      cost_price: m.cost_price ?? '',
      stock_qty: m.stock_qty ?? '',
      low_stock_threshold: m.low_stock_threshold ?? 5,
      badge: m.badge || '',
      image_url: '',
      images: imgs,
      description: m.description || '',
      active: !!m.active
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
        sku: form.sku.trim() || null,
        barcode: form.barcode.trim() || null,
        category_id: form.category_id ? Number(form.category_id) : null,
        price: Number(form.price) || 0,
        cost_price: form.cost_price === '' ? 0 : Number(form.cost_price),
        low_stock_threshold: form.low_stock_threshold === '' ? 5 : Number(form.low_stock_threshold),
        badge: form.badge.trim() || null,
        images: form.images.filter(u => u && u.trim()),
        description: form.description.trim() || null,
        active: !!form.active
      }
      if (editing === 'new') {
        payload.stock_qty = form.stock_qty === '' ? 0 : Number(form.stock_qty)
        await api.createMenuItem(payload)
      } else {
        await api.updateMenuItem(editing, payload)
      }
      closeEdit()
      await refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const askRemove = (m) => setDeleting(m)
  const confirmRemove = async () => {
    if (!deleting) return
    const target = deleting
    setDeleting(null)
    try {
      await api.deleteMenuItem(target.id)
      await refresh()
    } catch (err) {
      alert('Delete failed: ' + err.message)
    }
  }

  const openView = async (m) => {
    setViewing(m)
    setMovements([])
    setMovLoading(true)
    try {
      const list = await api.stockMovements(m.id)
      setMovements(list)
    } catch {
      // ignore — the modal still shows product detail
    } finally {
      setMovLoading(false)
    }
  }
  const closeView = () => { setViewing(null); setMovements([]) }

  const browseImage = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    setError(null)
    try {
      const uploaded = []
      for (const file of files) {
        const { url } = await api.uploadImage(file, 'products')
        uploaded.push(url)
      }
      setForm(f => ({ ...f, images: [...f.images, ...uploaded] }))
    } catch (err) {
      setError('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const addImageUrl = () => {
    const url = (form.image_url || '').trim()
    if (!url) return
    setForm(f => ({ ...f, image_url: '', images: [...f.images, url] }))
  }
  const removeImageAt = (idx) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  const openAdjust = (m) => setAdjusting({ id: m.id, name: m.name, qty: '', reason: 'Manual adjustment' })
  const closeAdjust = () => setAdjusting(null)
  const submitAdjust = async (e) => {
    e.preventDefault()
    if (!adjusting) return
    const qty = Number(adjusting.qty)
    if (!qty) { alert('Quantity must be non-zero (use + or -).'); return }
    try {
      await api.adjustStock(adjusting.id, { qty_change: qty, reason: adjusting.reason || 'Manual adjustment' })
      closeAdjust()
      await refresh()
    } catch (err) {
      alert('Adjustment failed: ' + err.message)
    }
  }

  return (
    <AdminLayout
      title="Accessories"
      subtitle="Add, edit, delete products and adjust stock levels"
      actions={
        <button className="btn-primary" onClick={openNew}>
          <Icon name="plus" size={14} /> Add Product
        </button>
      }
    >
      <section className="panel">
        <div className="panel-head" style={{ gap: 12 }}>
          <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
            <Icon name="search" size={14} color="#94a3b8" />
            <input placeholder="Search name, SKU, barcode" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <Dropdown
            value={catFilter}
            onChange={setCatFilter}
            options={[
              { value: 'all', label: 'All categories' },
              ...categories.map(c => ({ value: String(c.id), label: c.name }))
            ]}
          />
          <span className="muted" style={{ marginLeft: 'auto' }}>
            {filtered.length} of {items.length} products
          </span>
        </div>

        {error && !editing && <div className="auth-error" style={{ margin: '8px 0' }}>{error}</div>}
        {loading && <div className="muted">Loading…</div>}

        <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Cost</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={8} className="muted" style={{ textAlign: 'center', padding: 24 }}>No products match.</td></tr>
            )}
            {paged.map((m) => {
              const out = m.stock_qty <= 0
              const low = !out && m.stock_qty <= m.low_stock_threshold
              return (
                <tr key={m.id}>
                  <td>
                    <div className="ap-name">
                      {m.image_url && <img src={m.image_url} alt="" />}
                      <div>
                        <div className="ap-title">{m.name}</div>
                        {m.badge && <span className="ap-badge">{m.badge}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="muted">{m.sku || '—'}</td>
                  <td>{m.category_label || '—'}</td>
                  <td>{fmt$(m.price)}</td>
                  <td className="muted">{fmt$(m.cost_price)}</td>
                  <td>
                    <span className={`stock-tag${out ? ' out' : low ? ' low' : ''}`}>
                      {m.stock_qty}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill st-${m.active ? 'paid' : 'pending'}`}>
                      {m.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button title="View detail" onClick={() => openView(m)}><Icon name="eye" size={14} /></button>
                      <button title="Adjust stock" onClick={() => openAdjust(m)}><Icon name="box" size={14} /></button>
                      <button title="Edit" onClick={() => openEdit(m)}><Icon name="edit" size={14} /></button>
                      <button title="Delete" onClick={() => askRemove(m)} className="danger"><Icon name="x" size={14} /></button>
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

      {editing && (
        <Modal title={editing === 'new' ? 'New product' : 'Edit product'} onClose={closeEdit}>
          <form onSubmit={submit} className="admin-form">
            {error && <div className="auth-error">{error}</div>}
            <div className="form-row">
              <Field label="Name *">
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Category">
                <Dropdown
                  value={form.category_id ? String(form.category_id) : ''}
                  onChange={v => setForm({ ...form, category_id: v })}
                  placeholder="—"
                  options={[
                    { value: '', label: '—' },
                    ...categories.map(c => ({ value: String(c.id), label: c.name }))
                  ]}
                />
              </Field>
            </div>
            <div className="form-row">
              <Field label="SKU"><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="Auto-generated if blank" /></Field>
              <Field label="Barcode"><input value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} /></Field>
            </div>
            <div className="form-row">
              <Field label="Selling price *">
                <input type="number" step="0.01" min="0" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
              </Field>
              <Field label="Cost price">
                <input type="number" step="0.01" min="0" value={form.cost_price} onChange={e => setForm({ ...form, cost_price: e.target.value })} />
              </Field>
            </div>
            <div className="form-row">
              {editing === 'new' && (
                <Field label="Initial stock">
                  <input type="number" min="0" value={form.stock_qty} onChange={e => setForm({ ...form, stock_qty: e.target.value })} />
                </Field>
              )}
              <Field label="Low-stock threshold">
                <input type="number" min="0" value={form.low_stock_threshold} onChange={e => setForm({ ...form, low_stock_threshold: e.target.value })} />
              </Field>
              {editing !== 'new' && (
                <Field label="Active">
                  <Dropdown
                    value={form.active ? '1' : '0'}
                    onChange={v => setForm({ ...form, active: v === '1' })}
                    options={[
                      { value: '1', label: 'Active' },
                      { value: '0', label: 'Hidden' }
                    ]}
                  />
                </Field>
              )}
            </div>
            <Field label="Images">
              <div className="image-input">
                <input
                  value={form.image_url}
                  onChange={e => setForm({ ...form, image_url: e.target.value })}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl() } }}
                  placeholder="Paste a URL and press Enter, or Browse"
                />
                <button type="button" className="btn-ghost" onClick={addImageUrl} disabled={!form.image_url.trim()}>
                  <Icon name="plus" size={14} /> Add
                </button>
                <label className="btn-ghost image-browse">
                  <Icon name="draft" size={14} />
                  {uploading ? 'Uploading…' : 'Browse'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={browseImage}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
              {form.images.length > 0 ? (
                <div className="image-thumbs">
                  {form.images.map((url, i) => (
                    <div key={`${url}-${i}`} className="image-thumb">
                      <img src={url} alt="" onError={e => { e.currentTarget.style.opacity = 0.3 }} />
                      {i === 0 && <span className="image-thumb-tag">Primary</span>}
                      <button
                        type="button"
                        className="image-thumb-remove"
                        onClick={() => removeImageAt(i)}
                        aria-label="Remove image"
                      >
                        <Icon name="x" size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="image-thumbs-empty">No images yet — paste a URL or browse to add.</div>
              )}
            </Field>
            <Field label="Badge">
              <input value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} placeholder="Trending / Must Try" />
            </Field>
            <Field label="Description">
              <textarea rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </Field>
            <div className="form-actions">
              <button type="button" onClick={closeEdit} className="btn-ghost">Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : (editing === 'new' ? 'Create' : 'Save changes')}
              </button>
            </div>
            {editing !== 'new' && (
              <p className="muted" style={{ fontSize: 11, marginTop: 8 }}>
                Stock changes are logged separately — use the box icon on the table row.
              </p>
            )}
          </form>
        </Modal>
      )}

      {viewing && (
        <Modal title="" onClose={closeView} size="xl">
          <ProductDetail
            product={viewing}
            category={categories.find(c => c.id === viewing.category_id)}
            movements={movements}
            movLoading={movLoading}
            onEdit={() => { closeView(); openEdit(viewing) }}
            onAdjust={() => { closeView(); openAdjust(viewing) }}
          />
        </Modal>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete product"
        message={deleting ? `You're going to delete "${deleting.name}". Past sales keep this item in their history.` : ''}
        confirmLabel="Yes, delete!"
        cancelLabel="No, keep it."
        tone="danger"
        onConfirm={confirmRemove}
        onCancel={() => setDeleting(null)}
      />

      {adjusting && (
        <Modal title={`Adjust stock — ${adjusting.name}`} onClose={closeAdjust}>
          <form onSubmit={submitAdjust} className="admin-form">
            <Field label="Change (use - to deduct)">
              <input
                type="number"
                step="1"
                value={adjusting.qty}
                onChange={e => setAdjusting({ ...adjusting, qty: e.target.value })}
                placeholder="e.g. +10 or -3"
                autoFocus
              />
            </Field>
            <Field label="Reason">
              <input
                value={adjusting.reason}
                onChange={e => setAdjusting({ ...adjusting, reason: e.target.value })}
                placeholder="e.g. damaged, count correction, found"
              />
            </Field>
            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={closeAdjust}>Cancel</button>
              <button type="submit" className="btn-primary">Apply</button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  )
}

function ProductDetail({ product, category, movements, movLoading, onEdit, onAdjust }) {
  const m = product
  const categoryName = category?.name || m.category_label || 'Catalog'
  const stock = Number(m.stock_qty) || 0
  const allImages = Array.isArray(m.images) && m.images.length > 0
    ? m.images
    : (m.image_url ? [m.image_url] : [])
  const [activeImg, setActiveImg] = useState(0)
  const heroSrc = allImages[activeImg] || allImages[0]
  const out = stock <= 0
  const low = !out && stock <= (Number(m.low_stock_threshold) || 5)
  const stockLabel = out ? 'Out of stock' : low ? `Only ${stock} left` : `${stock} in stock`
  const stockTone = out ? 'red' : low ? 'orange' : 'green'

  // Mocked rating (we don't store ratings yet) — keeps the layout faithful.
  const stars = 4

  return (
    <div className="px-detail">
      <div className="px-crumbs">
        <span>Catalog</span>
        <span className="px-sep">›</span>
        <span>{categoryName}</span>
        <span className="px-sep">›</span>
        <span className="px-here">{m.name}</span>
      </div>

      <div className="px-body">
        <div className="px-left">
          <div className="px-thumbs">
            {allImages.length === 0 ? (
              <div className="px-thumb px-thumb-none">None</div>
            ) : (
              allImages.map((url, i) => (
                <button
                  key={`${url}-${i}`}
                  type="button"
                  className={`px-thumb${i === activeImg ? ' active' : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={url} alt="" />
                </button>
              ))
            )}
          </div>
          <div className="px-hero">
            {heroSrc
              ? <img src={heroSrc} alt={m.name} />
              : <div className="px-hero-empty">
                  <Icon name="box" size={48} color="#cbd5e1" />
                  <span style={{ marginTop: 8, color: 'var(--slate-400)', fontSize: 13 }}>None</span>
                </div>
            }
          </div>
        </div>

        <div className="px-right">
          <div className="px-brand">
            <span className="px-brand-mark">
              <Icon name={category?.icon || 'box'} size={14} color="#fff" />
            </span>
            <span className="px-brand-name">{categoryName}</span>
          </div>

          <h2 className="px-name">{m.name}</h2>
          <div className="px-sub">{m.sku ? `SKU ${m.sku}` : 'No SKU'}{m.barcode ? ` · ${m.barcode}` : ''}</div>

          <div className="px-rating">
            <span className="px-stars">
              {[1,2,3,4,5].map(n => (
                <Icon
                  key={n}
                  name="heart"
                  size={14}
                  color={n <= stars ? '#facc15' : '#e2e8f0'}
                />
              ))}
            </span>
            <span className="px-reviews">{movements.length} stock events</span>
          </div>

          <div className="px-price">{fmt$(m.price)}</div>

          <div className="px-row-head">
            <span>Stock status</span>
            <button type="button" className="px-link" onClick={onAdjust}>Adjust →</button>
          </div>
          <div className={`px-stock-pill tone-${stockTone}`}>{stockLabel}</div>

          <div className="px-row-head" style={{ marginTop: 18 }}>
            <span>Pricing</span>
            <span className="muted" style={{ fontSize: 11 }}>Cost {fmt$(m.cost_price)} · Threshold {m.low_stock_threshold}</span>
          </div>
          <div className="px-meta-grid">
            <div className="px-meta">
              <span className="px-meta-label">Margin</span>
              <span className="px-meta-value">{fmt$((Number(m.price) || 0) - (Number(m.cost_price) || 0))}</span>
            </div>
            <div className="px-meta">
              <span className="px-meta-label">Status</span>
              <span className={`status-pill st-${m.active ? 'paid' : 'pending'}`}>{m.active ? 'Active' : 'Hidden'}</span>
            </div>
            {m.badge && (
              <div className="px-meta">
                <span className="px-meta-label">Badge</span>
                <span className="ap-badge">{m.badge}</span>
              </div>
            )}
          </div>

          <div className="px-action-cards">
            <button type="button" className="px-action-card" onClick={onEdit}>
              <Icon name="edit" size={14} />
              <span>Edit product</span>
            </button>
            <button type="button" className="px-action-card" onClick={onAdjust}>
              <Icon name="box" size={14} />
              <span>Adjust stock</span>
            </button>
          </div>
          <div className="px-tail">
            <Icon name="info" size={12} /> Low-stock alert at {m.low_stock_threshold} units
          </div>
        </div>
      </div>

      {m.description && (
        <div className="px-section">
          <h4 className="px-section-title">Description</h4>
          <p className="px-desc">{m.description}</p>
        </div>
      )}

      <div className="px-section">
        <h4 className="px-section-title">Stock movement history</h4>
        {movLoading && <div className="muted" style={{ padding: '6px 0' }}>Loading…</div>}
        {!movLoading && movements.length === 0 && (
          <div className="muted" style={{ padding: '6px 0' }}>No movements yet.</div>
        )}
        {!movLoading && movements.length > 0 && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Change</th>
                <th>Before</th>
                <th>After</th>
                <th>Reason</th>
                <th>By</th>
              </tr>
            </thead>
            <tbody>
              {movements.map(mv => (
                <tr key={mv.id}>
                  <td className="muted">{new Date(mv.created_at).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                  <td><strong style={{ color: mv.qty_change > 0 ? 'var(--green)' : 'var(--red)' }}>
                    {mv.qty_change > 0 ? '+' : ''}{mv.qty_change}
                  </strong></td>
                  <td className="muted">{mv.qty_before}</td>
                  <td>{mv.qty_after}</td>
                  <td>{mv.reason}</td>
                  <td className="muted">{mv.user_label || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
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

function Modal({ title, onClose, children, size }) {
  const cls = size === 'xl' ? 'modal modal-xl' : size === 'lg' ? 'modal modal-lg' : 'modal'
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={cls} onClick={e => e.stopPropagation()}>
        {title !== '' && (
          <div className="modal-head">
            <h2>{title}</h2>
            <button className="x-btn" onClick={onClose} aria-label="Close"><Icon name="x" size={14} /></button>
          </div>
        )}
        {title === '' && (
          <button className="modal-close-floating" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
