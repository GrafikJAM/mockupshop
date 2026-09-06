'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useFullAccessModal } from '@/lib/fullAccessModal'
import { LICENSE_TIERS, LICENSES_HREF } from '@/lib/config'
import BuyFullAccessButton from '@/components/BuyFullAccessButton'
import styles from './FullAccessModal.module.css'

export default function FullAccessModal() {
  const { isOpen, closeModal } = useFullAccessModal()
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    if (!isOpen) return
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCount(data.length) })
      .catch(() => {})
  }, [isOpen])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeModal() }
    if (isOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, closeModal])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={closeModal}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Full Access</h2>
          <button className={styles.close} onClick={closeModal} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Pay once, access forever</span>
            <span className={styles.rowValue}>One payment, no subscriptions or renewals</span>
          </div>
          <div className={styles.divider} />

          <div className={styles.row}>
            <span className={styles.rowLabel}>Mockups</span>
            <span className={styles.rowValue}>{count !== null ? `${count} and counting` : '…'}</span>
          </div>
          <div className={styles.divider} />

          <div className={styles.row}>
            <span className={styles.rowLabel}>License</span>
            <Link href={LICENSES_HREF} className={styles.rowLink} onClick={closeModal}>Unlimited — Read more</Link>
          </div>
          <div className={styles.divider} />

          <div className={styles.tiers}>
            {LICENSE_TIERS.map(tier => (
              <div key={tier.key} className={styles.tier}>
                <div className={styles.tierInfo}>
                  <span className={styles.tierLabel}>{tier.label}</span>
                  <span className={styles.tierScale}>{tier.scale}</span>
                </div>
                <BuyFullAccessButton tierKey={tier.key} className={styles.tierBtn} onClick={closeModal}>
                  ${tier.fullAccessPrice} <span className={styles.tierBtnDash}>–</span> Purchase
                </BuyFullAccessButton>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
