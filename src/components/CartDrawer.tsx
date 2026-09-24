'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'
import { getReferralCode } from '@/lib/referral'
import styles from './CartDrawer.module.css'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, total } = useCart()
  const { user, accessToken } = useAuth()
  const router = useRouter()
  const [checkingOut, setCheckingOut] = useState(false)
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [guestEmail, setGuestEmail] = useState('')
  const [guestError, setGuestError] = useState('')

  function goToSignIn() {
    closeCart()
    router.push('/login')
  }

  // Shared by both the signed-in and guest paths — guestEmail is only sent
  // (and only required server-side) when there's no accessToken.
  async function startCheckout(guestEmailValue?: string) {
    setCheckingOut(true)
    setGuestError('')
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          mode: 'cart',
          items: items.map(i => ({ productId: i.productId, title: i.title, tierKey: i.tierKey })),
          referralCode: getReferralCode(),
          ...(guestEmailValue ? { guestEmail: guestEmailValue } : {}),
        }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      setGuestError(data.error || 'Something went wrong starting checkout. Please try again.')
    } catch {
      setGuestError('Something went wrong starting checkout. Please try again.')
    }
    setCheckingOut(false)
  }

  function handleGuestSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!guestEmail.trim()) return
    startCheckout(guestEmail.trim())
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
              {user ? (
                <>
                  <button type="button" className={styles.checkoutBtn} onClick={() => startCheckout()} disabled={checkingOut}>
                    {checkingOut ? 'Redirecting…' : 'Checkout'}
                  </button>
                  <p className={styles.note}>
                    You'll get your download link(s) on the confirmation page right after payment.
                  </p>
                </>
              ) : !showGuestForm ? (
                <>
                  <button type="button" className={styles.checkoutBtn} onClick={goToSignIn}>
                    Sign in to checkout
                  </button>
                  <button type="button" className={styles.guestLink} onClick={() => setShowGuestForm(true)}>
                    Continue as guest instead
                  </button>
                  <p className={styles.note}>
                    Sign in and your purchases are saved to your account for later — or check out as a
                    guest and we'll email your download link(s) instead.
                  </p>
                </>
              ) : (
                <form onSubmit={handleGuestSubmit} className={styles.guestForm}>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={guestEmail}
                    onChange={e => setGuestEmail(e.target.value)}
                    className={styles.guestInput}
                  />
                  <button type="submit" className={styles.checkoutBtn} disabled={checkingOut}>
                    {checkingOut ? 'Redirecting…' : 'Continue to payment'}
                  </button>
                  <button type="button" className={styles.guestLink} onClick={() => { setShowGuestForm(false); setGuestError('') }}>
                    Sign in instead
                  </button>
                  {guestError && <p className={styles.guestError}>{guestError}</p>}
                  <p className={styles.note}>
                    We'll email your download link(s) to this address right after payment — it won't
                    be saved to an account.
                  </p>
                </form>
              )}

              <div className={styles.divider}><span /><span className={styles.dividerLabel}>or</span><span /></div>
              <div className={styles.upsell}>
                <p className={styles.upsellText}>Want every mockup instead? Full Access pricing depends on your team size.</p>
                <Link href="/mockups" className={styles.upsellBtn} onClick={closeCart}>
                  See Full Access pricing
                </Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
