import { PRICING } from '@/lib/config'
import BuyFullAccessButton from './BuyFullAccessButton'
import styles from './PricingCard.module.css'

export default function PricingCard() {
  return (
    <div className={styles.card}>
      <div className={styles.badge}>{PRICING.badge}</div>
      <div className={styles.headline}>{PRICING.headline}</div>
      <div className={styles.sub}>{PRICING.subline}</div>
      <div className={styles.price}>
        <span className={styles.from}>Starting from</span>
        <span className={styles.amount}>{PRICING.amount}</span>
      </div>
      <p className={styles.desc}>{PRICING.description}</p>
      <BuyFullAccessButton className={styles.cta}>
        {PRICING.cta}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </BuyFullAccessButton>
    </div>
  )
}
