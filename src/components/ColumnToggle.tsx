'use client'
import styles from './ColumnToggle.module.css'

// Renders an n-bar "columns" icon for the given count, evenly spaced within
// a fixed-size box so every option in the toggle reads as the same size
// button regardless of how many bars it draws.
function ColsIcon({ n }: { n: number }) {
  const viewW = 20
  const viewH = 14
  const gap = n <= 2 ? 2 : 1.2
  const barW = (viewW - gap * (n - 1)) / n
  return (
    <svg width={viewW} height={viewH} viewBox={`0 0 ${viewW} ${viewH}`} fill="none">
      {Array.from({ length: n }).map((_, i) => (
        <rect key={i} x={i * (barW + gap)} y="0" width={barW} height={viewH} rx={Math.min(1.5, barW / 2)} fill="currentColor" />
      ))}
    </svg>
  )
}

// Shared column-count toggle used wherever a ProductGrid's `cols` should be
// user-adjustable — the homepage's "Top mockups this month" (2/4) and the
// /mockups browse page (2/4/6) both render this with different `options`.
export default function ColumnToggle({ options, value, onChange, label = 'Grid columns', className = '' }: {
  options: number[]
  value: number
  onChange: (n: number) => void
  label?: string
  className?: string
}) {
  return (
    <div className={`${styles.colToggle} ${className}`} role="group" aria-label={label}>
      {options.map(n => (
        <button
          key={n}
          type="button"
          className={`${styles.colBtn} ${value === n ? styles.colBtnActive : ''}`}
          onClick={() => onChange(n)}
          aria-pressed={value === n}
          aria-label={`${n} columns`}
        >
          <ColsIcon n={n} />
        </button>
      ))}
    </div>
  )
}
