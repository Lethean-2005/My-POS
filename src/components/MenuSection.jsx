import { useState } from 'react'
import { Icon } from '../icons.jsx'
import { categories, menuItems } from '../data.js'

export default function MenuSection({ onAdd }) {
  const [active, setActive] = useState('all')
  const [query, setQuery] = useState('')
  const [qtys, setQtys] = useState({})

  const updateQty = (id, delta) =>
    setQtys(prev => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }))

  const filtered = menuItems.filter(m => {
    const matchesCat =
      active === 'all' ||
      m.category.toLowerCase().includes(categories.find(c => c.id === active)?.name.toLowerCase() || '')
    const matchesQuery = m.name.toLowerCase().includes(query.toLowerCase())
    return matchesCat && matchesQuery
  })

  return (
    <section className="panel menu-section">
      <div className="panel-head">
        <h2 className="panel-title">Menu Categories</h2>
        <div className="legend">
          <span className="leg leg-veg"><i /> Veg</span>
          <span className="leg leg-non"><i /> Non Veg</span>
          <span className="leg leg-egg"><i /> Egg</span>
        </div>
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

      <div className="cat-row">
        {categories.map(c => (
          <button
            key={c.id}
            className={`cat-card${active === c.id ? ' active' : ''}`}
            onClick={() => setActive(c.id)}
          >
            <div className="cat-emoji">{c.emoji}</div>
            <div className="cat-name">{c.name}</div>
            <div className="cat-count">{c.count} Menus</div>
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {filtered.map(m => {
          const qty = qtys[m.id] ?? (m.qty || 0)
          return (
            <article key={m.id} className="menu-card">
              <div className="menu-img-wrap">
                <img src={m.img} alt={m.name} loading="lazy" />
              </div>
              <div className="menu-info">
                <div className="menu-meta">
                  <span className="menu-cat">{m.category}</span>
                  <span className={`dietary ${m.veg ? 'veg' : m.egg ? 'egg' : 'non'}`}>
                    <i />{m.veg ? 'Veg' : m.egg ? 'Egg' : 'Non Veg'}
                  </span>
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
