'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useQuickBuy } from '@/lib/quickBuy'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'
import { getReferralCode } from '@/lib/referral'
import { useLicense } from '@/lib/license'
import { LICENSE_TIERS, LICENSES_HREF } from '@/lib/config'
import styles from './QuickBuyModal.module.css'

// License picker opened from a product card's hover buttons.
//  - "Add to cart": adds the mockup with the chosen license and opens the
//    cart. (Only shown for the first item — later "Add to cart" clicks on
//    cards reuse the license already in the cart; see ProductGrid.)
//  - "Purchase": signed-in buyers go straight to Stripe for just this one
//    mockup; signed-out buyers get it added to the cart, which opens with
//    the usual sign-in / continue-as-guest checkout.
export default function QuickBuyModal() {
  const { product, intent, close } = useQuickBuy()
  const { addItem, openCart } = useCart()
  const { accessToken } = useAuth()
  const { tier, setTierKey } = useLicense()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!product) return
    setBusy(false); setError('')
    confirmRef.current?.focus()
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [product, close])

  if (!product) return null

  function addToCart() {
    addItem({ productId: product!.id, title: product!.title, image: product!.image, tierKey: tier.key, tierLabel: tier.label, price: tier.price })
  }

  async function confirm() {
    if (intent === 'cart' || !accessToken) {
      addToCart()
      close()
      openCart()
      return
    }
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          mode: 'cart',
          items: [{ productId: product!.id, title: product!.title, tierKey: tier.key }],
          referralCode: getReferralCode(),
        }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      setError(data.error || 'Could not start checkout. Please try again.')
    } catch {
      setError('Could not start checkout. Please try again.')
    }
    setBusy(false)
  }

  const label = intent === 'cart' ? 'Add to cart' : 'Purchase'

  return (
    <div className={styles.overlay} onClick={close}>
      <div className={styles.panel} role="dialog" aria-modal="true" aria-labelledby="quickbuy-title" onClick={e => e.stopPropagation()}>
        <button type="button" className={styles.closeBtn} onClick={close} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        </button>

        <div className={styles.head}>
          <img src={product.image} alt="" className={styles.thumb} />
          <div>
            <p id="quickbuy-title" className={styles.title}>{product.title}</p>
            <p className={styles.sub}>Choose a license</p>
          </div>
        </div>

        <div className={styles.tiers} role="radiogroup" aria-label="License">
          {LICENSE_TIERS.map(t => (
            <button
              key={t.key}
              type="button"
              role="radio"
              aria-checked={t.key === tier.key}
              onClick={() => setTierKey(t.key)}
              className={`${styles.tier} ${t.key === tier.key ? styles.tierActive : ''}`}
            >
              <span className={styles.tierName}>{t.label}</span>
              <span className={styles.tierScale}>{t.scale}</span>
              <span className={styles.tierPrice}>${t.price}</span>
            </button>
          ))}
        </div>

        <button ref={confirmRef} type="button" className={styles.confirm} onClick={confirm} disabled={busy}>
          {busy ? 'Starting checkout…' : `${label} — $${tier.price}`}
        </button>
        {error && <p className={styles.error}>{error}</p>}

        <p className={styles.note}>
          {intent === 'cart' ? 'Mockups you add next use this license — change it any time from the menu. ' : ''}
          <Link href={LICENSES_HREF} onClick={close}>Compare licenses</Link>
        </p>
      </div>
    </div>
  )
}
