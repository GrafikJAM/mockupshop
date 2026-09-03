'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'
import { LICENSE_TIERS, LICENSES_HREF } from '@/lib/config'
import BuyFullAccessButton from './BuyFullAccessButton'
import styles from './LicenseSelector.module.css'

type Props = {
  productCount: number
  productId: string
  productTitle: string
  productImage: string
  downloadUrl: string
}

type Ownership = { hasFullAccess: boolean; productIds: string[] }

export default function LicenseSelector({ productCount, productId, productTitle, productImage, downloadUrl }: Props) {
  const [selected, setSelected] = useState(0)
  const tier = LICENSE_TIERS[selected]
  const { addItem, openCart } = useCart()
  const { user, accessToken } = useAuth()
  const [ownership, setOwnership] = useState<Ownership | null>(null)

  useEffect(() => {
    if (!user || !accessToken) { setOwnership(null); return }
    fetch('/api/my-purchases', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(res => (res.ok ? res.json() : null))
      .then(data => { if (data) setOwnership(data) })
      .catch(() => {})
  }, [user, accessToken])

  const owned = !!ownership && (ownership.hasFullAccess || ownership.productIds.includes(productId))

  function handleAddToCart() {
    addItem({ productId, title: productTitle, image: productImage, tierKey: tier.key, tierLabel: tier.label, price: tier.price })
    openCart()
  }

  if (owned) {
    return (
      <div className={styles.wrap}>
        <div className={styles.fullAccess}>
          <div className={styles.fullAccessTop}>
            <div>
              <div className={styles.fullAccessLabel}>You own this mockup</div>
              <div className={styles.fullAccessScale}>
                {ownership?.hasFullAccess ? 'Included with your Full Access pass' : 'Purchased'}
              </div>
            </div>
          </div>
          <a href={downloadUrl} className={styles.addToCart} target="_blank" rel="noopener noreferrer">
            Download
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.tiers}>
        {LICENSE_TIERS.map((t, i) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setSelected(i)}
            className={`${styles.tier} ${i === selected ? styles.tierActive : ''}`}
            aria-pressed={i === selected}
          >
            <div className={styles.tierTop}>
              <span className={styles.tierLabel}>{t.label}</span>
              <span className={styles.tierPrice}>${t.price}</span>
            </div>
            <div className={styles.tierScale}>{t.scale}</div>
          </button>
        ))}
      </div>

      <button type="button" onClick={handleAddToCart} className={styles.addToCart}>
        Add to cart
      </button>

      <div className={styles.divider}>
        <span />
        <span className={styles.dividerLabel}>or</span>
        <span />
      </div>

      <div className={styles.fullAccess}>
        <div className={styles.fullAccessTop}>
          <div>
            <div className={styles.fullAccessLabel}>Full Access</div>
            <div className={styles.fullAccessScale}>{tier.scale}</div>
          </div>
          <span className={styles.fullAccessPrice}>${tier.fullAccessPrice}</span>
        </div>
        <p className={styles.fullAccessDesc}>
          Get this mockup for ${tier.price} or get all {productCount}+ mockups with Full Access for ${tier.fullAccessPrice}
        </p>
        <BuyFullAccessButton className={styles.purchaseBtn} tierKey={tier.key}>
          Purchase full access
        </BuyFullAccessButton>
      </div>

      <Link href={LICENSES_HREF} className={styles.licensesLink}>
        Read more about licenses here
      </Link>
    </div>
  )
}
