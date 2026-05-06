import { useEffect, useState } from 'react'
import { Icon } from '../icons.jsx'
import { api } from '../api.js'

export default function MenuSection({ cart = [], onAdd, onRemove }) {
  const [active, setActive] = useState('all')
  const [query, setQuery] = useState('')
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([api.categories(), api.menuItems()])
      .then(([cats, mi]) => {
        if (cancelled) return
        setCategories(cats)
        setItems(mi)
      })
      .catch(err => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [])

  const cartQty = id => cart.find(i => i.id === id)?.qty ?? 0

  const activeCat = categories.find(c => c.slug === active)
  const filtered = items.filter(m => {
    const matchesCat =
      active === 'all' ||
      (activeCat && m.category_label?.toLowerCase().includes(activeCat.name.toLowerCase()))
    const matchesQuery = m.name.toLowerCase().includes(query.toLowerCase())
    return matchesCat && matchesQuery
  })

  return (
    <section className="panel menu-section">
      <div className="panel-head">
        <h2 className="panel-title">Accessory Categories</h2>
        <div className="search-wrap">
          <Icon name="search" size={14} color="#94a3b8" />
          <input
            placeholder="Search"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
        <div className="pager">
          <button className="pager-btn"><Icon name="filter" size={13} /></button>
          <button className="pager-btn"><Icon name="arrow-left" size={13} /></button>
          <button className="pager-btn"><Icon name="arrow-right" size={13} /></button>
        </div>
      </div>

      {error && <div style={{ color: 'var(--red)' }}>Error: {error}</div>}

      <div className="cat-row">
        {categories.map(c => (
          <button
            key={c.id}
            className={`cat-card${active === c.slug ? ' active' : ''}`}
            onClick={() => setActive(c.slug)}
          >
            {c.image_url ? (
              <img className="cat-image" src={c.image_url} alt={c.name} loading="lazy" />
            ) : (
              <div className="cat-emoji">
                <Icon name={c.icon || 'box'} size={18} />
              </div>
            )}
            <div className="cat-text">
              <div className="cat-name">{c.name}</div>
              <div className="cat-count">{c.item_count} Items</div>
            </div>
          </button>
        ))}
      </div>

      {loading && <div className="muted">Loading accessories…</div>}

      <div className="menu-grid">
        {filtered.map(m => {
          const qty = cartQty(m.id)
          const stock = Number(m.stock_qty) || 0
          const out = stock <= 0
          const low = !out && stock <= (Number(m.low_stock_threshold) || 5)
          const remaining = stock - qty
          return (
            <article key={m.id} className={`menu-card${out ? ' menu-out' : ''}`}>
              <div className="menu-img-wrap">
                <img src={m.image_url} alt={m.name} loading="lazy" />
                {out && <span className="stock-badge stock-out">Out of stock</span>}
                {low && <span className="stock-badge stock-low">Only {stock} left</span>}
              </div>
              <div className="menu-info">
                <div className="menu-meta">
                  <span className="menu-cat">{m.category_label}</span>
                </div>
                <h3 className="menu-name">{m.name}</h3>
                <div className="menu-bottom">
                  <div className="menu-price">${m.price}</div>
                  <div className="qty-pill">
                    <button onClick={() => onRemove?.(m.id, -1)} disabled={qty === 0}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => onAdd?.(m)} disabled={out || remaining <= 0}>+</button>
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
