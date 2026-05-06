import { useEffect, useState } from 'react'
import { Icon } from '../icons.jsx'
import { api } from '../api.js'

export default function MenuSection({ onAdd }) {
  const [active, setActive] = useState('all')
  const [query, setQuery] = useState('')
  const [qtys, setQtys] = useState({})
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

  const updateQty = (id, delta) =>
    setQtys(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }))

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
            <div className="cat-emoji">{c.emoji}</div>
            <div className="cat-name">{c.name}</div>
            <div className="cat-count">{c.item_count} Items</div>
          </button>
        ))}
      </div>

      {loading && <div className="muted">Loading accessories…</div>}

      <div className="menu-grid">
        {filtered.map(m => {
          const qty = qtys[m.id] ?? 0
          return (
            <article key={m.id} className="menu-card">
              <div className="menu-img-wrap">
                <img src={m.image_url} alt={m.name} loading="lazy" />
              </div>
              <div className="menu-info">
                <div className="menu-meta">
                  <span className="menu-cat">{m.category_label}</span>
                </div>
                <h3 className="menu-name">{m.name}</h3>
                <div className="menu-bottom">
                  <div className="menu-price">${m.price}</div>
                  <div className="qty-pill">
                    <button onClick={() => updateQty(m.id, -1)}>−</button>
                    <span>{qty}</span>
                    <button onClick={() => { updateQty(m.id, +1); onAdd?.(m) }}>+</button>
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
