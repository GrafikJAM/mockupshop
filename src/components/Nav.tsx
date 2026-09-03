'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/lib/theme'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'
import { SITE } from '@/lib/config'
import BuyFullAccessButton from './BuyFullAccessButton'
import styles from './Nav.module.css'

export default function Nav() {
  const { theme, toggle } = useTheme()
  const { items, toggleCart } = useCart()
  const { user, loading, signOut } = useAuth()

  return (
    <nav className={styles.nav}>
      <div className={styles.bar}>
        <div className={styles.links}>
          {SITE.nav.map(item => (
            <Link key={item.href} href={item.href} className={styles.link}>{item.label}</Link>
          ))}
        </div>
        <Link href="/" className={styles.logo}>
          <Image src={theme === 'dark' ? '/jam_white.svg' : '/JAM-06.svg'} alt={SITE.name} width={64} height={38} priority />
        </Link>
        <div className={styles.right}>
          <button className={styles.toggle} onClick={toggle} aria-label="Toggle theme">
            {theme === 'dark' ? (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13.5 8.5A5.5 5.5 0 0 1 7.5 3a5.5 5.5 0 1 0 6 5.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </button>
          <button className={styles.toggle} onClick={toggleCart} aria-label="Open cart">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M1.5 1.5h1.5l1.6 8.6a1.2 1.2 0 0 0 1.2 1h6.4a1.2 1.2 0 0 0 1.2-1L14.5 4.5h-10.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><circle cx="6.5" cy="14" r="1" fill="currentColor"/><circle cx="11.5" cy="14" r="1" fill="currentColor"/></svg>
            {items.length > 0 && <span className={styles.badge}>{items.length}</span>}
          </button>
          {!loading && (
            user ? (
              <button className={styles.account} onClick={signOut} title={`Signed in as ${user.email} — click to sign out`}>
                {user.email?.split('@')[0]}
              </button>
            ) : (
              <Link href="/login" className={styles.account}>Sign in</Link>
            )
          )}
          <BuyFullAccessButton className={styles.cta}>Get access</BuyFullAccessButton>
        </div>
      </div>
    </nav>
  )
}
