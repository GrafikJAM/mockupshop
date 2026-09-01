'use client'
import { useState } from 'react'
import Link from 'next/link'
import { LICENSE_TIERS, LICENSES_HREF, PRICING } from '@/lib/config'
import styles from './LicenseSelector.module.css'

export default function LicenseSelector({ productCount }: { productCount: number }) {
  const [selected, setSelected] = useState(0)
  const tier = LICENSE_TIERS[selected]

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

      {/* Buy links go to the full-access checkout for now — swap PRICING.href
          for per-tier payment links once single-license checkout exists. */}
      <Link href={PRICING.href} className={styles.addToCart}>
        Add to cart
      </Link>

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
          <span className={styles.fullAccessPrice}>{PRICING.amount}</span>
        </div>
        <p className={styles.fullAccessDesc}>
          Get this mockup for ${tier.price} or get all {productCount}+ mockups with Full Access for {PRICING.amount}
        </p>
        <Link href={PRICING.href} className={styles.purchaseBtn}>
          Purchase full access
        </Link>
      </div>

      <Link href={LICENSES_HREF} className={styles.licensesLink}>
        Read more about licenses here
      </Link>
    </div>
  )
}
