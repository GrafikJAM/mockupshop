'use client'
import ProductGrid from './ProductGrid'
import ColumnToggle from './ColumnToggle'
import { useMobileCols } from '@/lib/useMobileCols'
import styles from './CategoryProducts.module.css'

type Product = { id: string; title: string; image_default: string; image_hover?: string; price?: string }

// Category page grid, with a 1/2 column switch on phones.
export default function CategoryProducts({ products }: { products: Product[] }) {
  const [mobileCols, setMobileCols] = useMobileCols()
  return (
    <>
      <div className={styles.bar}>
        <ColumnToggle options={[1, 2]} value={mobileCols} onChange={setMobileCols} />
      </div>
      <ProductGrid products={products} cols={4} mobileCols={mobileCols} />
    </>
  )
}
