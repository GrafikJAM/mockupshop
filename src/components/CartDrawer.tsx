'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'
import { PRICING } from '@/lib/config'
import BuyFullAccessButton from './BuyFullAccessButton'
import styles from './CartDrawer.module.css'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, total } = useCart()
  const { user, accessToken } = useAuth()
  const router = useRouter()
  const [checkingOut, setCheckingOut] = useState(false)

  async function handleCheckout() {
    if (!user || !accessToken) {
      closeCart()
      router.push('/login')
      return
    }
    setCheckingOut(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          mode: 'cart',
          items: items.map(i => ({ productId: i.productId, title: i.title, tierKey: i.tierKey })),
        }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      alert(data.error || 'Something went wrong starting checkout. Please try again.')
    } catch {
      alert('Something went wrong starting checkout. Please try again.')
    }
    setCheckingOut(false)
  }

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
              <button type="button" className={styles.checkoutBtn} onClick={handleCheckout} disabled={checkingOut}>
                {checkingOut ? 'Redirecting…' : user ? 'Checkout' : 'Sign in to checkout'}
              </button>
              <p className={styles.note}>
                {user
                  ? "You'll get your download link(s) on the confirmation page right after payment."
                  : "You'll be asked to sign in with a magic link before paying, so your purchases are saved to your account."}
              </p>

              {remaining > 0 && (
                <>
                  <div className={styles.divider}><span /><span className={styles.dividerLabel}>or</span><span /></div>
                  <div className={styles.upsell}>
                    <p className={styles.upsellText}>Unlock every mockup instead — just ${remaining} more.</p>
                    <BuyFullAccessButton className={styles.upsellBtn} onClick={closeCart}>
                      Get full access — {PRICING.amount}
                    </BuyFullAccessButton>
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
