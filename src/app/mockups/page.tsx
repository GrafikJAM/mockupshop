'use client'
import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProductGrid from '@/components/ProductGrid'
import styles from './page.module.css'

// Each entry is a UI-facing filter. `matches` lists the underlying product tag
// values (as stored in Supabase) that should count toward it — this is how
// "Banners + Posters" combines two existing tags, and how "Indoor" can
// display a new label while still matching products still tagged "Interior",
// without touching any product data.
const TAGS = [
  { key: 'Human', label: 'Human', matches: ['Human'] },
  { key: 'Devices', label: 'Devices', matches: ['Devices'] },
  { key: 'Outdoor', label: 'Outdoor', matches: ['Outdoor'] },
  { key: 'BannersPosters', label: 'Banners + Posters', matches: ['Poster', 'Billboard'] },
  { key: 'Screen', label: 'Screen', matches: ['Screen'] },
  { key: 'Apparel', label: 'Apparel', matches: ['Apparel'] },
  { key: 'Print', label: 'Print', matches: ['Print'] },
  { key: 'Signage', label: 'Signage', matches: ['Signage'] },
  { key: 'Packaging', label: 'Packaging', matches: ['Packaging'] },
  { key: 'Vehicle', label: 'Vehicle', matches: ['Vehicle'] },
  { key: 'Indoor', label: 'Indoor', matches: ['Interior'] },
  { key: 'Other', label: 'Other', matches: ['Other'] },
]

type Product = { id: string; title: string; image_default: string; image_hover: string; price: string; tags: string[]; category: string }

function productMatches(product: Product, matches: string[]) {
  const productTags = product.tags && product.tags.length > 0 ? product.tags : [product.category]
  return matches.some(m => productTags.includes(m))
}

export default function MockupsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [activeTag, setActiveTag] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  const activeMatches = TAGS.find(t => t.key === activeTag)?.matches
  const filtered = activeTag === 'All' || !activeMatches ? products : products.filter(p => productMatches(p, activeMatches))

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
            {TAGS.map(tag => {
              const count = products.filter(p => productMatches(p, tag.matches)).length
              return (
                <button key={tag.key} className={`${styles.filter} ${activeTag === tag.key ? styles.active : ''}`} onClick={() => setActiveTag(tag.key)}>
                  {tag.label} {count}
                </button>
              )
            })}
          </div>
          {loading ? <p className={styles.empty}>Loading...</p> : filtered.length > 0 ? <ProductGrid products={filtered} cols={4} /> : <p className={styles.empty}>No products in this category yet.</p>}
        </div>
      </main>
      <Footer />
    </>
  )
}
