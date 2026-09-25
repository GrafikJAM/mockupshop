'use client'
import { useState } from 'react'
import ProductGrid from './ProductGrid'
import ColumnToggle from './ColumnToggle'
import styles from './TopMockupsSection.module.css'

type Product = { id: string; title: string; image_default: string; image_hover?: string; price?: string }

// A 2/4-column toggle for the homepage's "Top mockups this month" grid —
// lets a visitor see fewer, bigger cards or more, smaller ones. Only these
// two options (not the ProductGrid default of 4, and not the 3 this
// section used to render at) are offered here; /mockups gets its own
// wider 2/4/6 range via the same shared ColumnToggle.
export default function TopMockupsSection({ products }: { products: Product[] }) {
  const [cols, setCols] = useState(4)

  return (
    <>
      <div className={styles.sectionHeadRow}>
        <div className={styles.sectionHead}>
          <p className="label">Best sellers</p>
          <h2 className="display-lg">Top mockups this month</h2>
        </div>
        <ColumnToggle options={[2, 4]} value={cols} onChange={setCols} />
      </div>
      <ProductGrid products={products} cols={cols} />
    </>
  )
}
