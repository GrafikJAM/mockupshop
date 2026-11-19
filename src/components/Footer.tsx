'use client'
import Link from 'next/link'
import { useTheme } from '@/lib/theme'
import { SITE } from '@/lib/config'
import { CATEGORIES } from '@/lib/categories'
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
      {/* Every page links to every category — helps visitors and gives Google
          a path to each category page from anywhere on the site. */}
      <nav className={styles.categories} aria-label="Mockup categories">
        {CATEGORIES.map(c => (
          <Link key={c.slug} href={`/mockups/${c.slug}`} className={styles.link}>{c.label}</Link>
        ))}
      </nav>
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
