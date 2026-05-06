import { useEffect, useRef, useState } from 'react'

const PER_PAGE_OPTIONS = [10, 20, 50]

export default function Pagination({
  total,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
  options = PER_PAGE_OPTIONS
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const visible = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
      visible.push(i)
    } else if (visible[visible.length - 1] !== '...') {
      visible.push('...')
    }
  }

  const pickSize = (n) => {
    onPageSizeChange?.(n)
    onPageChange?.(1)
    setOpen(false)
  }

  return (
    <div className="pg-row">
      <div className="pg-meta" ref={ref}>
        <button type="button" className="pg-dropdown-trigger" onClick={() => setOpen(o => !o)}>
          {total} {total === 1 ? 'result' : 'results'} · {pageSize}/page
          <svg className={`pg-chev${open ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {open && (
          <div className="pg-dropdown-panel">
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                className={`pg-dropdown-opt${opt === pageSize ? ' active' : ''}`}
                onClick={() => pickSize(opt)}
              >
                {opt} / page
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pg-nav">
        <button
          type="button"
          className="pg-nav-btn"
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(currentPage - 1)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M15 18l-6-6 6-6" /></svg>
          Prev
        </button>
        {visible.map((p, i) => (
          p === '...'
            ? <span key={`e-${i}`} className="pg-ellipsis">…</span>
            : (
              <button
                key={p}
                type="button"
                className={`pg-num${p === currentPage ? ' active' : ''}`}
                onClick={() => onPageChange?.(p)}
              >
                {p}
              </button>
            )
        ))}
        <button
          type="button"
          className="pg-nav-btn"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(currentPage + 1)}
        >
          Next
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M9 18l6-6-6-6" /></svg>
        </button>
      </div>
    </div>
  )
}
