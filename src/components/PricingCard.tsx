import Link from 'next/link'
import { PRICING } from '@/lib/config'
import styles from './PricingCard.module.css'

export default function PricingCard() {
  return (
    <div className={styles.card}>
      <div className={styles.badge}>{PRICING.badge}</div>
      <h2 className={styles.headline}>{PRICING.headline}</h2>
      <p className={styles.sub}>{PRICING.subline}</p>
      <div className={styles.priceRow}>
        <div className={styles.priceBlock}>
          <span className={styles.from}>Starting from</span>
          <span className={styles.amount}>{PRICING.amount}</span>
        </div>
      </div>
      <p className={styles.desc}>{PRICING.description}</p>
      <Link href={PRICING.href} className={styles.cta}>
        {PRICING.cta}
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M2.5 7.5h10M8.5 4l3.5 3.5L8.5 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>
    </div>
  )
}
