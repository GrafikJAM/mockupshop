'use client'
import Link from 'next/link'
import { useState } from 'react'
import { toDirectImageUrl } from '@/lib/imageUrl'
import styles from './ProductGrid.module.css'

type Product = {
  id: string
  title: string
  image_default: string
  image_hover?: string
  price?: string
}

function Card({ product, uniform = false }: { product: Product; uniform?: boolean }) {
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
            alt={product.title}
            className={`${styles.img} ${styles.imgHover} ${hovered ? styles.visible : ''}`}
          />
        )}
      </div>
      <div className={styles.meta}>
        <span className={styles.title}>{product.title}</span>
      </div>
    </Link>
  )
}

// `uniform` opts a grid into a fixed 3:2 aspect-ratio, cropped
// (object-fit: cover) cards on a real CSS grid instead of the default
// masonry columns — used by the homepage's "Just added" slider, where
// mixed product-photo aspect ratios made the gap between pages too big.
// Default (masonry) behavior is unchanged everywhere else.
export default function ProductGrid({ products, cols = 4, uniform = false }: { products: Product[]; cols?: number; uniform?: boolean }) {
  return (
    <div className={uniform ? styles.uniformGrid : styles.grid} style={{ '--cols': cols } as React.CSSProperties}>
      {products.map(p => <Card key={p.id} product={p} uniform={uniform} />)}
    </div>
  )
}
