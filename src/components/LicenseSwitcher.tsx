'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useLicense } from '@/lib/license'
import { LICENSE_TIERS, LICENSES_HREF } from '@/lib/config'
import styles from './LicenseSwitcher.module.css'

// Nav dropdown for the site-wide license. `inline` renders the three
// options as a plain list (used inside the mobile menu).
export default function LicenseSwitcher({ inline = false }: { inline?: boolean }) {
  const { tier, setTierKey } = useLicense()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  const options = (
    <div className={inline ? styles.inlineList : styles.menu} role="radiogroup" aria-label="License">
      {LICENSE_TIERS.map(t => (
        <button
          key={t.key}
          type="button"
          role="radio"
          aria-checked={t.key === tier.key}
          className={`${styles.option} ${t.key === tier.key ? styles.optionActive : ''}`}
          onClick={() => { setTierKey(t.key); setOpen(false) }}
        >
          <span className={styles.optionName}>{t.label}</span>
          <span className={styles.optionScale}>{t.scale}</span>
          <span className={styles.optionPrice}>${t.price}</span>
        </button>
      ))}
      <Link href={LICENSES_HREF} className={styles.compare} onClick={() => setOpen(false)}>Compare licenses</Link>
    </div>
  )

  if (inline) {
    return (
      <div className={styles.inline}>
        <span className={styles.inlineLabel}>License</span>
        {options}
      </div>
    )
  }

  return (
    <div className={styles.wrap} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className={styles.triggerLabel}>License</span>
        <span className={styles.triggerValue}>{tier.label}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden><path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {open && options}
    </div>
  )
}
