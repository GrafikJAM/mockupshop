import Link from 'next/link'
import { CATEGORIES } from '@/lib/categories'
import { toDirectImageUrl } from '@/lib/imageUrl'
import styles from './CategoryRow.module.css'

type Product = { id: string; image_default: string; tags?: string[] | null }

// Homepage "Shop by category" row — one tile per category that has at least
// one active product, linking to its server-rendered /mockups/[category]
// landing page. Besides helping visitors browse by need, these are the
// internal links that let Google find and weight the category pages.
// Same rule as generateStaticParams there: empty categories are skipped.
export default function CategoryRow({ products }: { products: Product[] }) {
  const tiles = CATEGORIES.map(cat => {
    const matches = products.filter(p => (p.tags || []).includes(cat.tag))
    return { cat, count: matches.length, cover: matches[0]?.image_default }
  }).filter(t => t.count > 0)

  if (tiles.length === 0) return null

  return (
    <div>
      <div className={styles.head}>
        <p className="label">Browse by category</p>
        <h2 className="display-lg">What are you presenting?</h2>
      </div>
      <div className={styles.row}>
        {tiles.map(({ cat, count, cover }) => (
          <Link key={cat.slug} href={`/mockups/${cat.slug}`} className={styles.tile}>
            <div className={styles.thumb}>
              {cover && <img src={toDirectImageUrl(cover)} alt="" loading="lazy" className={styles.img} />}
            </div>
            <div className={styles.meta}>
              <span className={styles.name}>{cat.label.replace(/ Mockups$/, '')}</span>
              <span className={styles.count}>{count}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
