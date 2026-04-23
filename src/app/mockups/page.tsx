import Nav from '@/components/Nav'
import ProductGrid from '@/components/ProductGrid'
import Footer from '@/components/Footer'
import { ALL_PRODUCTS } from '@/lib/config'
import styles from './page.module.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Mockups',
}

// ── Derive categories from product IDs for filter tabs
const CATEGORIES = ['All', 'Billboard', 'Screen', 'Apparel', 'Print', 'Signage', 'Other']

export default function MockupsPage() {
  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <h1 className="display-lg">Mockups</h1>
            <p className={styles.count}>{ALL_PRODUCTS.length} files</p>
          </div>

          {/* Category filter tabs */}
          <div className={styles.filters}>
            {CATEGORIES.map((cat) => (
              <button key={cat} className={`${styles.filter} ${cat === 'All' ? styles.active : ''}`}>
                {cat}
              </button>
            ))}
          </div>

          <ProductGrid products={ALL_PRODUCTS} columns={4} />
        </div>
      </main>
      <Footer />
    </>
  )
}
