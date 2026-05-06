import { useEffect, useRef, useState } from 'react'

export default function Dropdown({
  value,
  options,
  onChange,
  placeholder = 'Select…',
  className = '',
  align = 'left'
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return
      setOpen(false)
    }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selected = options.find(o => o.value === value)
  const label = selected?.label ?? placeholder

  const pick = (v) => {
    onChange?.(v)
    setOpen(false)
  }

  return (
    <div ref={ref} className={`dd-wrap ${className}`}>
      <button
        type="button"
        className={`dd-trigger${open ? ' open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`dd-value${selected ? '' : ' placeholder'}`}>{label}</span>
        <svg className={`dd-chev${open ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className={`dd-panel dd-${align}`} role="listbox">
          {options.map(opt => (
            <button
              key={String(opt.value)}
              type="button"
              role="option"
              aria-selected={opt.value === value}
              className={`dd-opt${opt.value === value ? ' active' : ''}`}
              onClick={() => pick(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
