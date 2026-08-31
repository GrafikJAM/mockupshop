'use client'
import Link from 'next/link'
import { useState } from 'react'
import styles from './ProductGrid.module.css'

type Product = {
  id: string
  title: string
  image_default: string
  image_hover: string
}

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className={styles.grid}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false)
  const img = hovered && product.image_hover ? product.image_hover : product.image_default

  return (
    <Link href={`/product/${product.id}`} className={styles.item}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div className={styles.imageWrap}>
        <img src={img} alt={product.title} className={styles.image} />
      </div>
      <div className={styles.meta}>
        <span className={styles.title}>{product.title}</span>
        <svg className={styles.arrow} width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </Link>
  )
}
