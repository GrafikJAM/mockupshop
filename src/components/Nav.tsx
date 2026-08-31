import Link from 'next/link'
import { SITE, PRICING } from '@/lib/config'
import styles from './Nav.module.css'

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>{SITE.name}</span>
        </Link>
        <div className={styles.links}>
          {SITE.nav.map(item => (
            <Link key={item.href} href={item.href} className={styles.link}>{item.label}</Link>
          ))}
        </div>
        <Link href={PRICING.href} className={styles.cta}>Get access</Link>
      </div>
    </nav>
  )
}
