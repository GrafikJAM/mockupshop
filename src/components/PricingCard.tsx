import Link from 'next/link'
import { PRICING, LICENSE_TIERS, LICENSES_HREF } from '@/lib/config'
import GetAccessButton from '@/components/GetAccessButton'
import BuyFullAccessButton from '@/components/BuyFullAccessButton'
import StarburstBadge from '@/components/StarburstBadge'
import styles from './PricingCard.module.css'

// `showTiers` (homepage) puts the three Full Access tiers inside the card
// as the call to action, each going straight to checkout. Without it
// (product pages, which already show tiers in the license selector) the
// card keeps its single "Get Full Access" button that opens the modal.
export default function PricingCard({ showTiers = false }: { showTiers?: boolean }) {
  return (
    <div className={`${styles.card} ${showTiers ? styles.cardWide : ''}`}>
      <div className={styles.badge}>{PRICING.badge}</div>
      <div className={styles.headline}>{PRICING.headline}</div>
      <div className={styles.sub}>{PRICING.subline}</div>
      <div className={styles.price}>
        <span className={styles.from}>Starting from</span>
        <StarburstBadge text={PRICING.amount} size={160} rotate={-4} className={styles.amountBadge} />
      </div>
      <p className={styles.desc}>{PRICING.description}</p>

      {showTiers ? (
        <>
          <div className={styles.tiers}>
            {LICENSE_TIERS.map(tier => (
              <BuyFullAccessButton key={tier.key} tierKey={tier.key} className={styles.tier}>
                <span className={styles.tierName}>{tier.label}</span>
                <span className={styles.tierScale}>{tier.scale}</span>
                <span className={styles.tierPrice}>${tier.fullAccessPrice}</span>
              </BuyFullAccessButton>
            ))}
          </div>
          <p className={styles.note}>
            Same library on every tier, licensed by team size. <Link href={LICENSES_HREF}>Compare licenses</Link>
          </p>
        </>
      ) : (
        <GetAccessButton className={styles.cta}>
          {PRICING.cta}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </GetAccessButton>
      )}
    </div>
  )
}
