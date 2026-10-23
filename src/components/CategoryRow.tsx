import { CATEGORIES } from '@/lib/categories'
import { resizedImageUrl } from '@/lib/imageUrl'
import CategoryIndex from './CategoryIndex'

type Product = { id: string; image_default: string; tags?: string[] | null }

// Homepage "Browse by category" — one entry per category that has at least
// one active product, linking to its server-rendered /mockups/[category]
// landing page. Besides helping visitors browse by need, these are the
// internal links that let Google find and weight the category pages.
// Same rule as generateStaticParams there: empty categories are skipped.
export default function CategoryRow({ products }: { products: Product[] }) {
  const tiles = CATEGORIES.map(cat => {
    const matches = products.filter(p => (p.tags || []).includes(cat.tag))
    return { cat, matches, count: matches.length, cover: undefined as string | undefined }
  }).filter(t => t.count > 0)

  // Products carry several tags, so "first product in each category" gives
  // the same few images over and over. Hand out covers so no product is
  // used twice: categories with the fewest products choose first (they
  // have the least to pick from), each taking its highest-ranked product
  // that hasn't been used yet. Display order is unaffected.
  const used = new Set<string>()
  for (const t of [...tiles].sort((a, b) => a.count - b.count)) {
    const pick = t.matches.find(p => !used.has(p.id)) || t.matches[0]
    used.add(pick.id)
    t.cover = pick.image_default
  }

  if (tiles.length === 0) return null

  return (
    <CategoryIndex
      items={tiles.map(t => ({
        slug: t.cat.slug,
        name: t.cat.label.replace(/ Mockups$/, ''),
        count: t.count,
        cover: t.cover ? resizedImageUrl(t.cover, 828) : undefined,
      }))}
    />
  )
}
