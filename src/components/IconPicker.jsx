import { useMemo, useState } from 'react'
import * as Tabler from '@tabler/icons-react'

const PASCAL_TO_SLUG = (p) =>
  p.replace(/^Icon/, '').replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

const ICON_LIST = Object.keys(Tabler)
  .filter(k => k.startsWith('Icon') && k !== 'IconProps' && typeof Tabler[k] === 'function')
  .map(pascal => ({ pascal, slug: PASCAL_TO_SLUG(pascal) }))

const PAGE = 120

export default function IconPicker({ value = '', onChange, autoFocus = false }) {
  const [q, setQ] = useState('')
  const [limit, setLimit] = useState(PAGE)

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim().replace(/\s+/g, '-')
    if (!needle) return ICON_LIST
    return ICON_LIST.filter(i => i.slug.includes(needle))
  }, [q])

  const visible = filtered.slice(0, limit)
  const hidden = filtered.length - visible.length

  return (
    <div className="icon-picker-wrap">
      <input
        className="icon-search"
        placeholder={`Search ${ICON_LIST.length.toLocaleString()} icons…`}
        value={q}
        onChange={(e) => { setQ(e.target.value); setLimit(PAGE) }}
        autoFocus={autoFocus}
      />
      <div className="icon-picker">
        <button
          type="button"
          className={`icon-pick${!value ? ' active' : ''}`}
          onClick={() => onChange?.('')}
          title="No icon"
        >
          <span style={{ fontSize: 11, color: 'var(--slate-400)' }}>None</span>
        </button>
        {visible.map(({ pascal, slug }) => {
          const C = Tabler[pascal]
          return (
            <button
              key={slug}
              type="button"
              className={`icon-pick${value === slug ? ' active' : ''}`}
              onClick={() => onChange?.(slug)}
              title={slug}
            >
              <C size={18} stroke={1.75} />
            </button>
          )
        })}
      </div>
      <div className="icon-picker-foot">
        <span className="muted">
          {filtered.length} {filtered.length === 1 ? 'match' : 'matches'}
          {value ? <> · selected: <strong>{value}</strong></> : null}
        </span>
        {hidden > 0 && (
          <button type="button" className="btn-ghost" onClick={() => setLimit(l => l + PAGE)}>
            Show more ({hidden})
          </button>
        )}
      </div>
    </div>
  )
}
