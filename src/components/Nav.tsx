'use client'
import Link from 'next/link'
import { useTheme } from '@/lib/theme'
import { SITE, PRICING } from '@/lib/config'
import styles from './Nav.module.css'

export default function Nav() {
  const { theme, toggle } = useTheme()

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>{SITE.name}</span>
          <span className={styles.est}>est. {SITE.established}</span>
        </Link>

        <div className={styles.links}>
          {SITE.nav.map(item => (
            <Link key={item.href} href={item.href} className={styles.link}>{item.label}</Link>
          ))}
        </div>

        <div className={styles.right}>
          {/* Theme toggle */}
          <button className={styles.toggle} onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.5 8.5A5.5 5.5 0 0 1 7.5 3a5.5 5.5 0 1 0 6 5.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <Link href={PRICING.href} className={styles.cta}>Get access</Link>
        </div>
      </div>
    </nav>
  )
}
