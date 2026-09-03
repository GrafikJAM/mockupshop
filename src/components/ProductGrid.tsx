'use client'
import Link from 'next/link'
import { useState } from 'react'
import styles from './ProductGrid.module.css'

type Product = {
  id: string
  title: string
  image_default: string
  image_hover?: string
  price?: string
}

function Card({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false)
  const src = hovered && product.image_hover ? product.image_hover : product.image_default

  return (
    <Link
      href={`/product/${product.id}`}
      className={styles.card}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.imgWrap}>
        <img
          src={product.image_default}
          alt={product.title}
          className={`${styles.img} ${styles.imgDefault} ${hovered ? styles.hidden : ''}`}
        />
        {product.image_hover && (
          <img
            src={product.image_hover}
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

export default function ProductGrid({ products, cols = 4 }: { products: Product[]; cols?: number }) {
  return (
    <div className={styles.grid} style={{ '--cols': cols } as React.CSSProperties}>
      {products.map(p => <Card key={p.id} product={p} />)}
    </div>
  )
}
