'use client'
import Link from 'next/link'
import { useState } from 'react'
import { toDirectImageUrl } from '@/lib/imageUrl'
import { LICENSE_TIERS } from '@/lib/config'
import styles from './ProductGrid.module.css'

type Product = {
  id: string
  title: string
  image_default: string
  image_hover?: string
  price?: string
}

// Every single mockup is sold at the same license-tier prices (see
// LICENSE_TIERS — this is what checkout actually charges), so the card shows
// the cheapest tier as a "from" price rather than the free-text `price`
// field in admin, which isn't used for billing and can drift.
const FROM_PRICE = Math.min(...LICENSE_TIERS.map(t => t.price))

function Card({ product, uniform = false, showPrice = false }: { product: Product; uniform?: boolean; showPrice?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const src = hovered && product.image_hover ? product.image_hover : product.image_default

  return (
    <Link
      href={`/product/${product.id}`}
      className={styles.card}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`${styles.imgWrap} ${uniform ? styles.uniformImgWrap : ''}`}>
        <img
          src={toDirectImageUrl(product.image_default)}
          alt={product.title}
          className={`${styles.img} ${styles.imgDefault} ${hovered ? styles.hidden : ''}`}
        />
        {product.image_hover && (
          <img
            src={toDirectImageUrl(product.image_hover)}
            alt=""
            className={`${styles.img} ${styles.imgHover} ${hovered ? styles.visible : ''}`}
          />
        )}
      </div>
      <div className={styles.meta}>
        <span className={styles.title}>{product.title}</span>
        {showPrice && <span className={styles.price}>From ${FROM_PRICE}</span>}
      </div>
    </Link>
  )
}

// `uniform` opts a grid into a fixed 3:2 aspect-ratio, cropped
// (object-fit: cover) cards on a real CSS grid instead of the default
// masonry columns — used by the homepage's "Just added" slider, where
// mixed product-photo aspect ratios made the gap between pages too big.
// Default (masonry) behavior is unchanged everywhere else.
export default function ProductGrid({ products, cols = 4, uniform = false, showPrice = false }: { products: Product[]; cols?: number; uniform?: boolean; showPrice?: boolean }) {
  return (
    <div className={uniform ? styles.uniformGrid : styles.grid} style={{ '--cols': cols } as React.CSSProperties}>
      {products.map(p => <Card key={p.id} product={p} uniform={uniform} showPrice={showPrice} />)}
    </div>
  )
}
