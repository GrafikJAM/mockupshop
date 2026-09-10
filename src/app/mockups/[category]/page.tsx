import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProductGrid from '@/components/ProductGrid'
import { supabase } from '@/lib/supabase'
import { CATEGORIES, getCategory } from '@/lib/categories'
import type { Metadata } from 'next'
import styles from './page.module.css'

const SITE_URL = 'https://grafikjam.shop'

export const revalidate = 3600

// Only pre-render a category page for tags that actually have at least one
// active product — an empty landing page is worse for SEO than no page at
// all (thin/no content), and this keeps the page list correct automatically
// as products are added, removed, or re-tagged in the admin panel.
export async function generateStaticParams() {
  const { data } = await supabase.from('products').select('tags').eq('active', true)
  const liveTags = new Set((data || []).flatMap(p => p.tags || []))
  return CATEGORIES.filter(c => liveTags.has(c.tag)).map(c => ({ category: c.slug }))
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const cat = getCategory(params.category)
  if (!cat) return {}
  return {
    title: cat.metaTitle,
    description: cat.metaDescription,
    alternates: { canonical: `/mockups/${cat.slug}` },
    openGraph: {
      type: 'website',
      url: `/mockups/${cat.slug}`,
      title: cat.metaTitle,
      description: cat.metaDescription,
    },
    twitter: {
      card: 'summary_large_image',
      title: cat.metaTitle,
      description: cat.metaDescription,
    },
  }
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const cat = getCategory(params.category)
  if (!cat) {
    return (
      <>
        <Nav />
        <main className={styles.main}>
          <div className="container">
            <p className={styles.empty}>That category doesn&apos;t exist. <Link href="/mockups">Browse all mockups →</Link></p>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const { data: products } = await supabase
    .from('products')
    .select('id, title, image_default, image_hover, price, tags')
    .eq('active', true)
    .contains('tags', [cat.tag])
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  const items = products || []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: cat.label,
    description: cat.metaDescription,
    url: `${SITE_URL}/mockups/${cat.slug}`,
  }

  const otherCategories = CATEGORIES.filter(c => c.slug !== cat.slug)

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <main className={styles.main}>
        <div className="container">
          <nav className={styles.breadcrumb}>
            <Link href="/mockups">Mockups</Link>
            <span>/</span>
            <span>{cat.label}</span>
          </nav>
          <div className={styles.header}>
            <h1 className="display-lg">{cat.label}</h1>
            <span className={styles.count}>{items.length} files</span>
          </div>
          <p className={styles.intro}>{cat.intro}</p>

          {items.length > 0 ? (
            <ProductGrid products={items} cols={4} />
          ) : (
            <p className={styles.empty}>No {cat.label.toLowerCase()} live right now — <Link href="/mockups">browse the full catalog →</Link></p>
          )}

          <div className={styles.otherCats}>
            <span className={styles.otherCatsLabel}>Browse other categories:</span>
            <div className={styles.otherCatsList}>
              {otherCategories.map(c => (
                <Link key={c.slug} href={`/mockups/${c.slug}`} className={styles.otherCatLink}>{c.label}</Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
