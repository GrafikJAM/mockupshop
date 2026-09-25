'use client'
import { useState } from 'react'
import ProductGrid from './ProductGrid'
import styles from './TopMockupsSection.module.css'

type Product = { id: string; title: string; image_default: string; image_hover?: string; price?: string }

// A 2/4-column toggle for the homepage's "Top mockups this month" grid —
// lets a visitor see fewer, bigger cards or more, smaller ones. Only these
// two options (not the ProductGrid default of 4, and not the 3 this
// section used to render at) are offered, matching the icon pair design.
export default function TopMockupsSection({ products }: { products: Product[] }) {
  const [cols, setCols] = useState<2 | 4>(4)

  return (
    <>
      <div className={styles.sectionHeadRow}>
        <div className={styles.sectionHead}>
          <p className="label">Best sellers</p>
          <h2 className="display-lg">Top mockups this month</h2>
        </div>
        <div className={styles.colToggle} role="group" aria-label="Grid columns">
          <button
            type="button"
            className={`${styles.colBtn} ${cols === 2 ? styles.colBtnActive : ''}`}
            onClick={() => setCols(2)}
            aria-pressed={cols === 2}
            aria-label="2 columns"
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
              <rect x="1" y="0" width="8" height="14" rx="1.5" fill="currentColor" />
              <rect x="11" y="0" width="8" height="14" rx="1.5" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.colBtn} ${cols === 4 ? styles.colBtnActive : ''}`}
            onClick={() => setCols(4)}
            aria-pressed={cols === 4}
            aria-label="4 columns"
          >
            <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
              <rect x="1.8" y="0" width="3.2" height="14" rx="1.2" fill="currentColor" />
              <rect x="6.2" y="0" width="3.2" height="14" rx="1.2" fill="currentColor" />
              <rect x="10.6" y="0" width="3.2" height="14" rx="1.2" fill="currentColor" />
              <rect x="15.0" y="0" width="3.2" height="14" rx="1.2" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
      <ProductGrid products={products} cols={cols} />
    </>
  )
}
