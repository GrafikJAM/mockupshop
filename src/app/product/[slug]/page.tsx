import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import PricingCard from '@/components/PricingCard'
import LicenseSelector from '@/components/LicenseSelector'
import Link from 'next/link'
import ProductGrid from '@/components/ProductGrid'
import { CATEGORIES } from '@/lib/categories'
import { productBaseName, productSeoTitle } from '@/lib/seoName'
import { productPath, productSlug, parseProductParam } from '@/lib/productUrl'
import { notFound, permanentRedirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LICENSE_TIERS } from '@/lib/config'
import { toDirectImageUrl, resizedImageUrl, resizedSrcSet } from '@/lib/imageUrl'
import type { Metadata } from 'next'
import styles from './page.module.css'

const SITE_URL = 'https://grafikjam.shop'

export const revalidate = 60

// Finds the product a /product/<param> URL refers to — a readable slug
// ending in the id prefix, or an old full-uuid link. Includes inactive
// products, same as before.
async function loadProduct(param: string) {
  const parsed = parseProductParam(param)
  if (!parsed) return null
  let id: string | undefined
  if ('id' in parsed) id = parsed.id
  else {
    const { data } = await supabase.from('products').select('id')
    id = (data || []).find((p: { id: string }) => p.id.toLowerCase().startsWith(parsed.prefix))?.id
  }
  if (!id) return null
  const { data: product } = await supabase.from('products').select('*').eq('id', id).single()
  return product
}

// Per-product title/description/OG image, so a link to a specific mockup
// (e.g. pinned on Pinterest, posted on Dribbble/Behance) previews with that
// mockup's own image and name instead of the generic site-wide card.
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await loadProduct(params.slug)
  if (!product) return {}
  const path = productPath(product)

  // Search-friendly title/description (see lib/seoName): leads with what
  // people actually type — "<thing> mockup psd" — instead of "… 01JAM".
  const name = productBaseName(product.title)
  const seoTitle = productSeoTitle(product.title)
  const firstLine = product.description
    ? (product.description as string).split('\n').map((l: string) => l.trim()).find((l: string) => l.length > 60) || ''
    : ''
  const description = `${name} mockup for Photoshop — PSD with Smart Object.${firstLine ? ' ' + firstLine : ''}`.slice(0, 158)

  return {
    title: { absolute: seoTitle },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: path,
      title: seoTitle,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description,
    },
  }
}

// Descriptions are plain text, one line per paragraph. A line ending in ":"
// (e.g. "What you get:" / "Features:") starts a list: the short lines after
// it become bullet points — with or without a trailing full stop — until a
// long, sentence-length line (a normal paragraph) or another heading. Lets
// every existing description render as a compact list without editing it.
type DescBlock = { type: 'p'; text: string } | { type: 'list'; heading: string; items: string[] }
function descriptionBlocks(text: string): DescBlock[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const blocks: DescBlock[] = []
  let list: { type: 'list'; heading: string; items: string[] } | null = null
  for (const line of lines) {
    const isItem = line.length <= 110 && !line.endsWith(':')
    if (list && isItem) { list.items.push(line.replace(/^[-•*]\s*/, '')); continue }
    list = null
    if (line.endsWith(':')) { list = { type: 'list', heading: line, items: [] }; blocks.push(list); continue }
    blocks.push({ type: 'p', text: line })
  }
  return blocks
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await loadProduct(params.slug)
  if (!product) notFound()
  // One address per product: old /product/<uuid> links and outdated slugs
  // (title edited since) redirect permanently to the current readable URL.
  if (params.slug !== productSlug(product)) permanentRedirect(productPath(product))

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

  const allImages: string[] = [product.image_default, product.image_hover, ...(product.images_extra || [])]
    .filter(Boolean)

  // Product structured data — lets Google understand price/availability for
  // this mockup and makes it eligible for rich results in search listings.
  const lowPrice = Math.min(...LICENSE_TIERS.map(t => t.price))
  const highPrice = Math.max(...LICENSE_TIERS.map(t => t.price))
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${productBaseName(product.title)} Mockup (PSD)`,
    description: product.description || `${product.title} — a premium Photoshop mockup from GrafikJAM Mockups.`,
    image: allImages,
    url: `${SITE_URL}${productPath(product)}`,
    brand: { '@type': 'Brand', name: 'GrafikJAM Mockups' },
    category: product.category,
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice,
      highPrice,
      offerCount: LICENSE_TIERS.length,
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}${productPath(product)}`,
    },
  }

  // Breadcrumb trail for Google only (the visible breadcrumb was removed
  // for the design): Home > Mockups > first category > this mockup.
  const crumbCat = CATEGORIES.find(c => (product.tags || []).includes(c.tag))
  const crumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'Mockups', url: `${SITE_URL}/mockups` },
    ...(crumbCat ? [{ name: crumbCat.label, url: `${SITE_URL}/mockups/${crumbCat.slug}` }] : []),
    { name: `${productBaseName(product.title)} Mockup`, url: `${SITE_URL}${productPath(product)}` },
  ]
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbLd]) }}
      />
      <Nav />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.layout}>
            <div className={styles.images}>
              {allImages.map((img: string, i: number) => (
                <div key={i} className={i === 0 ? styles.mainImage : styles.extraImage}>
                  <img
                    src={resizedImageUrl(img, 1920)}
                    srcSet={resizedSrcSet(img, [828, 1200, 1920])}
                    sizes="(max-width: 900px) 100vw, 60vw"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    alt={`${productBaseName(product.title)} Photoshop mockup – view ${i + 1}`}
                    className={styles.img}
                  />
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
                  {descriptionBlocks(product.description).map((b, i) =>
                    b.type === 'list' ? (
                      <div key={i} className={styles.featureBlock}>
                        <p className={styles.featureHead}>{b.heading}</p>
                        <ul className={styles.features}>
                          {b.items.map((item, j) => <li key={j}>{item}</li>)}
                        </ul>
                      </div>
                    ) : (
                      <p key={i}>{b.text}</p>
                    )
                  )}
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
