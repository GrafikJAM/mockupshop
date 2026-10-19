import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import PricingCard from '@/components/PricingCard'
import LicenseSelector from '@/components/LicenseSelector'
import Link from 'next/link'
import ProductGrid from '@/components/ProductGrid'
import { CATEGORIES } from '@/lib/categories'
import { supabase } from '@/lib/supabase'
import { LICENSE_TIERS } from '@/lib/config'
import { toDirectImageUrl } from '@/lib/imageUrl'
import type { Metadata } from 'next'
import styles from './page.module.css'

const SITE_URL = 'https://grafikjam.shop'

export const revalidate = 60

// Per-product title/description/OG image, so a link to a specific mockup
// (e.g. pinned on Pinterest, posted on Dribbble/Behance) previews with that
// mockup's own image and name instead of the generic site-wide card.
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: product } = await supabase.from('products').select('*').eq('id', params.slug).single()
  if (!product) return {}

  const description = product.description
    ? product.description.split('\n')[0].slice(0, 155)
    : `${product.title} — a premium Photoshop mockup from GrafikJAM Mockups.`
  const image = toDirectImageUrl(product.image_default)

  return {
    title: product.title,
    description,
    alternates: { canonical: `/product/${product.id}` },
    openGraph: {
      type: 'website',
      url: `/product/${product.id}`,
      title: product.title,
      description,
      images: image ? [{ url: image, width: 1200, height: 1200, alt: product.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { data: product } = await supabase.from('products').select('*').eq('id', params.slug).single()
  if (!product) return <div style={{ padding: '100px', color: '#f0ede8' }}>Product not found.</div>

  const { data: others } = await supabase
    .from('products')
    .select('id, title, image_default, image_hover, tags, sort_order, created_at')
    .eq('active', true)
  const productCount = (others || []).length

  // "Similar mockups": rank every other active product by how many tags it
  // shares with this one (best sellers first on ties, via sort_order), then
  // top up with the rest of the library so there are always 8.
  const myTags: string[] = product.tags || (product.category ? [product.category] : [])
  const similar = (others || [])
    .filter(p => p.id !== product.id)
    .map(p => ({ p, shared: (p.tags || []).filter((t: string) => myTags.includes(t)).length }))
    .sort((a, b) =>
      b.shared - a.shared ||
      (a.p.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.p.sort_order ?? Number.MAX_SAFE_INTEGER) ||
      new Date(b.p.created_at).getTime() - new Date(a.p.created_at).getTime()
    )
    .slice(0, 8)
    .map(x => x.p)

  const allImages = [product.image_default, product.image_hover, ...(product.images_extra || [])]
    .filter(Boolean)
    .map(toDirectImageUrl)

  // Product structured data — lets Google understand price/availability for
  // this mockup and makes it eligible for rich results in search listings.
  const lowPrice = Math.min(...LICENSE_TIERS.map(t => t.price))
  const highPrice = Math.max(...LICENSE_TIERS.map(t => t.price))
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || `${product.title} — a premium Photoshop mockup from GrafikJAM Mockups.`,
    image: allImages,
    url: `${SITE_URL}/product/${product.id}`,
    brand: { '@type': 'Brand', name: 'GrafikJAM Mockups' },
    category: product.category,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice,
      highPrice,
      offerCount: LICENSE_TIERS.length,
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/product/${product.id}`,
    },
  }

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
            <span>{product.title}</span>
          </nav>
          <div className={styles.layout}>
            <div className={styles.images}>
              {allImages.map((img: string, i: number) => (
                <div key={i} className={i === 0 ? styles.mainImage : styles.extraImage}>
                  <img src={img} alt={`${product.title} ${i + 1}`} className={styles.img} />
                </div>
              ))}
            </div>
            <div className={styles.info}>
              <div className={styles.tags}>
                {myTags.map((tag: string) => {
                  const cat = CATEGORIES.find(c => c.tag === tag)
                  return cat ? (
                    <Link key={tag} href={`/mockups/${cat.slug}`} className={`${styles.tag} ${styles.tagLink}`}>{tag}</Link>
                  ) : (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  )
                })}
              </div>
              <h1 className={styles.title}>{product.title}</h1>
              {product.description && (
                <div className={styles.desc}>
                  {product.description.split('\n').map((line: string, i: number) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
              <LicenseSelector
                productCount={productCount}
                productId={product.id}
                productTitle={product.title}
                productImage={toDirectImageUrl(product.image_default)}
                downloadUrl={product.download_url}
              />
            </div>
          </div>
        </div>
        {similar.length > 0 && (
          <section className={`section ${styles.similar}`}>
            <div className="container">
              <div className={styles.similarHead}>
                <h2 className="display-lg">Similar mockups</h2>
                <Link href="/mockups" className="btn-ghost">View all mockups</Link>
              </div>
              <ProductGrid products={similar} cols={4} uniform showPrice />
            </div>
          </section>
        )}
        <div className="section"><div className="container"><PricingCard /></div></div>
      </main>
      <Footer />
    </>
  )
}
