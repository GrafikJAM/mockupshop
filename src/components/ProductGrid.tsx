'use client'
import Link from 'next/link'
import { useState } from 'react'
import styles from './ProductGrid.module.css'

type Product = { id: string; title: string; image_default: string; image_hover?: string }

function Card({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false)
  const src = hovered && product.image_hover ? product.image_hover : product.image_default
  return (
    <Link href={`/product/${product.id}`} className={styles.card}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className={styles.imgWrap}>
        <img src={src} alt={product.title} className={styles.img} />
      </div>
      <div className={styles.meta}>
        <span className={styles.title}>{product.title}</span>
        <svg className={styles.arrow} width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M2 6.5h9M7.5 3l3 3.5-3 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
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
