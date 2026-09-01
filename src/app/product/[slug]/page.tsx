import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import PricingCard from '@/components/PricingCard'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PRICING } from '@/lib/config'
import styles from './page.module.css'

export const revalidate = 60

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.slug)
    .single()

  if (!product) return <div style={{ padding: '100px', color: '#f0ede8' }}>Product not found.</div>

  const allImages = [product.image_default, product.image_hover, ...(product.images_extra || [])].filter(Boolean)

  return (
    <>
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
              <div className={styles.mainImage}>
                <Image src={product.image_default} alt={product.title} fill sizes="60vw" className={styles.img} priority />
              </div>
              {allImages.slice(1).map((img: string, i: number) => (
                <div key={i} className={styles.extraImage}>
                  <Image src={img} alt={`${product.title} ${i + 2}`} fill sizes="60vw" className={styles.img} />
                </div>
              ))}
            </div>
            <div className={styles.info}>
              <p className="label">{product.category}</p>
              <h1 className="display-sm">{product.title}</h1>
              {product.description && (
  <div className={styles.desc}>
    {product.description.split('\n').map((line, i) => (
      <p key={i}>{line}</p>
    ))}
  </div>
)}
              <ul className={styles.specs}>
                {['Smart object layers', 'High resolution', 'Photoshop CC+', 'Included in all-access pass'].map(spec => (
                  <li key={spec} className={styles.spec}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    {spec}
                  </li>
                ))}
              </ul>
              <div className={styles.ctaBlock}>
                <Link href={PRICING.href} className="btn-primary">
                  Get access — {PRICING.amount}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <p className={styles.ctaNote}>{PRICING.description}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="section"><div className="container"><PricingCard /></div></div>
      </main>
      <Footer />
    </>
  )
}
