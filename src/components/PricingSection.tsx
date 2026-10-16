import Link from 'next/link'
import { PRICING, LICENSE_TIERS, LICENSES_HREF } from '@/lib/config'
import PriceSticker from './PriceSticker'
import BuyFullAccessButton from './BuyFullAccessButton'
import styles from './PricingSection.module.css'

// Homepage pricing: a big statement + the $99 sticker, the library strip
// running underneath as proof of "every mockup", then the three Full
// Access tiers side by side so the choice is visible without opening the
// modal. Each tier button goes straight to checkout (same component the
// modal uses, so referral and promo codes still apply).
export default function PricingSection({ strip, productCount }: { strip?: React.ReactNode; productCount: number }) {
  return (
    <div className={styles.wrap}>
      <div className="container">
        <div className={styles.head}>
          <h2 className={styles.headline}>
            One price.<br />Every mockup.<br />Forever.
          </h2>
          <div className={styles.aside}>
            <PriceSticker amount={PRICING.amount} size={190} rotate={-6} className={styles.sticker} />
            <p className={styles.sub}>
              All {productCount}+ mockups, plus every one I make next. One payment, no subscription
              to forget about.
            </p>
          </div>
        </div>
      </div>

      {strip && <div className={styles.strip}>{strip}</div>}

      <div className="container">
        <div className={styles.tiers}>
          {LICENSE_TIERS.map(tier => (
            <div key={tier.key} className={styles.tier}>
              <div className={styles.tierTop}>
                <h3 className={styles.tierName}>{tier.label}</h3>
                <p className={styles.tierScale}>For a {tier.scale}</p>
              </div>
              <p className={styles.tierPrice}>${tier.fullAccessPrice}</p>
              <BuyFullAccessButton tierKey={tier.key} className={`btn-primary ${styles.tierBtn}`}>
                Get Full Access
              </BuyFullAccessButton>
            </div>
          ))}
        </div>
        <p className={styles.note}>
          Same library on every tier — the difference is how many people on your team can use it.{' '}
          <Link href={LICENSES_HREF}>Compare licenses</Link>
        </p>
      </div>
    </div>
  )
}
