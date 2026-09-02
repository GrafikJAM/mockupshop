'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { PRICING } from '@/lib/config'
import styles from './CartDrawer.module.css'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, total } = useCart()

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') closeCart() }
    if (isOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, closeCart])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }, [isOpen])

  if (!isOpen) return null

  const remaining = Math.max(PRICING.amountValue - total, 0)

  return (
    <div className={styles.overlay} onClick={closeCart}>
      <aside className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Your selection {items.length > 0 && `(${items.length})`}</h2>
          <button className={styles.close} onClick={closeCart} aria-label="Close cart">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p>Nothing here yet.</p>
            <Link href="/mockups" className={styles.browseLink} onClick={closeCart}>Browse mockups →</Link>
          </div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map(item => (
                <div key={item.productId} className={styles.item}>
                  <div className={styles.thumb} style={{ backgroundImage: `url(${item.image})` }} />
                  <div className={styles.itemInfo}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemMeta}>{item.tierLabel} license · ${item.price}</span>
                    <button className={styles.remove} onClick={() => removeItem(item.productId)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <div className={styles.subtotalRow}>
                <span>Subtotal</span>
                <span className={styles.subtotalAmount}>${total}</span>
              </div>
              <Link href={PRICING.href} className={styles.checkoutBtn} onClick={closeCart}>
                Checkout
              </Link>
              <p className={styles.note}>You'll receive download links by email once payment clears.</p>

              {remaining > 0 && (
                <>
                  <div className={styles.divider}><span /><span className={styles.dividerLabel}>or</span><span /></div>
                  <div className={styles.upsell}>
                    <p className={styles.upsellText}>Unlock every mockup instead — just ${remaining} more.</p>
                    <Link href={PRICING.href} className={styles.upsellBtn} onClick={closeCart}>
                      Get full access — {PRICING.amount}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
