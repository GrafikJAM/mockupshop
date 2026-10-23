'use client'
import Link from 'next/link'
import { resizedImageUrl } from '@/lib/imageUrl'
import styles from './Marquee.module.css'

type Product = { id: string; title: string; image_default: string }

export default function Marquee({ products, direction = 'left', speed = 7 }: {
  products: Product[]
  direction?: 'left' | 'right'
  speed?: number
}) {
  const items = [...products, ...products, ...products]
  // Duration scales with catalog size (seconds per item) so the pace stays
  // consistent as products are added, instead of a fixed total loop time
  // that speeds up the more images there are.
  const duration = Math.max(products.length * speed, 20)
  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.track} ${direction === 'right' ? styles.reverse : ''}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {items.map((p, i) => (
          <Link key={`${p.id}-${i}`} href={`/product/${p.id}`} className={styles.item}>
            <img src={resizedImageUrl(p.image_default, 384)} loading="lazy" decoding="async" alt={p.title} className={styles.img} onError={e => { e.currentTarget.style.visibility = 'hidden' }} />
          </Link>
        ))}
      </div>
    </div>
  )
}
