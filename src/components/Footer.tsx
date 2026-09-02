'use client'
import Link from 'next/link'
import { useTheme } from '@/lib/theme'
import { SITE } from '@/lib/config'
import styles from './Footer.module.css'

export default function Footer() {
  const { theme } = useTheme()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.brand}>{SITE.name}</span>
        <nav className={styles.links}>
          {SITE.footer.map(item => (
            <Link key={item.href} href={item.href} className={styles.link}>{item.label}</Link>
          ))}
        </nav>
      </div>
      <div className={styles.wordmark}>
        <img
          src={theme === 'dark' ? '/grafikjam-White.svg' : '/grafikjam-Black.svg'}
          alt={SITE.name}
          className={styles.wordmarkImg}
        />
      </div>
    </footer>
  )
}
