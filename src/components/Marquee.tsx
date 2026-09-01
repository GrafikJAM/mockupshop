import Link from 'next/link'
import styles from './Marquee.module.css'

type Product = { id: string; title: string; image_default: string }

export default function Marquee({ products, direction = 'left', speed = 40 }: {
  products: Product[]
  direction?: 'left' | 'right'
  speed?: number
}) {
  const items = [...products, ...products, ...products]
  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.track} ${direction === 'right' ? styles.reverse : ''}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {items.map((p, i) => (
          <Link key={`${p.id}-${i}`} href={`/product/${p.id}`} className={styles.item}>
            <img src={p.image_default} alt={p.title} className={styles.img} />
          </Link>
        ))}
      </div>
    </div>
  )
}
