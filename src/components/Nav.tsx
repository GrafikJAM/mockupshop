'use client'
import Link from 'next/link'
import { SITE, PRICING } from '@/lib/config'
import styles from './Nav.module.css'

export default function Nav() {
  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>{SITE.name}</span>
          <span className={styles.est}>est. {SITE.established}</span>
        </Link>

        {/* Links */}
        <div className={styles.links}>
          {SITE.nav.map((item) => (
            <Link key={item.href} href={item.href} className={styles.link}>
              {item.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link href={PRICING.href} className={styles.cta}>
          Get access
        </Link>
      </div>
    </nav>
  )
}
