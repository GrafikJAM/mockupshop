import Link from 'next/link'
import Image from 'next/image'
import styles from './Marquee.module.css'

interface Product {
  id: string
  title: string
  href: string
  image: string
}

interface MarqueeProps {
  products: Product[]
  direction?: 'left' | 'right'
  speed?: number // seconds for one full cycle
}

export default function Marquee({ products, direction = 'left', speed = 40 }: MarqueeProps) {
  // Duplicate items for seamless loop
  const items = [...products, ...products]

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.track} ${direction === 'right' ? styles.reverse : ''}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {items.map((product, i) => (
          <Link key={`${product.id}-${i}`} href={product.href} className={styles.item}>
            <div className={styles.imageWrap}>
              <Image
                src={product.image}
                alt={product.title}
                fill
                sizes="220px"
                className={styles.image}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
