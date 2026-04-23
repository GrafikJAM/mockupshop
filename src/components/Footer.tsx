import Link from 'next/link'
import { SITE } from '@/lib/config'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.brand}>{SITE.name}</span>
        <nav className={styles.links}>
          {SITE.footer.map((item) => (
            <Link key={item.href} href={item.href} className={styles.link}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
