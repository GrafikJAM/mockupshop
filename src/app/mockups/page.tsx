'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProductGrid from '@/components/ProductGrid'
import styles from './page.module.css'

const ALL_TAGS = ['Human', 'Devices', 'Outdoor', 'Poster', 'Billboard', 'Screen', 'Apparel', 'Print', 'Signage', 'Packaging', 'Vehicle', 'Interior', 'Stationery', 'Other']

type Product = { id: string; title: string; image_default: string; image_hover: string; price: string; tags: string[]; category: string }

export default function MockupsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [activeTag, setActiveTag] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const filtered = activeTag === 'All' ? products : products.filter(p => (p.tags || [p.category]).includes(activeTag))

  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <h1 className="display-lg">Mockups</h1>
            <span className={styles.count}>{filtered.length} files</span>
          </div>
          <div className={styles.filters}>
            <button className={`${styles.filter} ${activeTag === 'All' ? styles.active : ''}`} onClick={() => setActiveTag('All')}>All</button>
            {ALL_TAGS.map(tag => (
              <button key={tag} className={`${styles.filter} ${activeTag === tag ? styles.active : ''}`} onClick={() => setActiveTag(tag)}>{tag}</button>
            ))}
          </div>
          {loading ? <p className={styles.empty}>Loading...</p> : filtered.length > 0 ? <ProductGrid products={filtered} cols={4} /> : <p className={styles.empty}>No products in this category yet.</p>}
        </div>
      </main>
      <Footer />
    </>
  )
}
