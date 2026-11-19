'use client'
import { useState } from 'react'
import Link from 'next/link'
import ProductGrid from './ProductGrid'
import ColumnToggle from './ColumnToggle'
import { useMobileCols } from '@/lib/useMobileCols'
import StarburstBadge from './StarburstBadge'
import { CATEGORIES } from '@/lib/categories'
import styles from '@/app/mockups/page.module.css'

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

export type Product = { id: string; title: string; image_default: string; image_hover: string; price: string; tags: string[]; category: string }

function productMatches(product: Product, matches: string[]) {
  const productTags = product.tags && product.tags.length > 0 ? product.tags : [product.category]
  return matches.some(m => productTags.includes(m))
}

// The /mockups browsing UI (filters, column toggles). Products come in
// already loaded from the server page (app/mockups/page.tsx), so the full
// catalog is in the HTML Google crawls instead of appearing only after the
// browser fetches it.
export default function MockupsBrowser({ initialProducts }: { initialProducts: Product[] }) {
  const products = initialProducts
  const [activeTag, setActiveTag] = useState('All')
  const [cols, setCols] = useState(4)
  const [mobileCols, setMobileCols] = useMobileCols()

  const activeMatches = TAGS.find(t => t.key === activeTag)?.matches
  const filtered = activeTag === 'All' || !activeMatches ? products : products.filter(p => productMatches(p, activeMatches))

  return (
    <>
          <div className={styles.header}>
            <h1 className="display-lg">Mockups</h1>
            <span className={styles.count}>{filtered.length} files</span>
            {products.length > 0 && (
              <StarburstBadge
                text={`${products.length}+`}
                size={84}
                rotate={-8}
                className={styles.headerBadge}
              />
            )}
            <ColumnToggle options={[2, 4, 6]} value={cols} onChange={setCols} className={styles.headerToggle} />
            <ColumnToggle options={[1, 2]} value={mobileCols} onChange={setMobileCols} className={styles.mobileToggle} />
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
          {filtered.length > 0 ? <ProductGrid products={filtered} cols={cols} mobileCols={mobileCols} /> : <p className={styles.empty}>No products in this category yet.</p>}

          {(() => {
            const liveTags = new Set(products.flatMap(p => (p.tags && p.tags.length > 0 ? p.tags : [p.category])))
            const liveCategories = CATEGORIES.filter(c => liveTags.has(c.tag))
            if (liveCategories.length === 0) return null
            return (
              <div className={styles.browseByCategory}>
                <span className={styles.browseByCategoryLabel}>Or jump straight to a category:</span>
                <div className={styles.browseByCategoryList}>
                  {liveCategories.map(c => (
                    <Link key={c.slug} href={`/mockups/${c.slug}`} className={styles.browseByCategoryLink}>{c.label}</Link>
                  ))}
                </div>
              </div>
            )
          })()}
    </>
  )
}
