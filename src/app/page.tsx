import Link from 'next/link'
import { SITE, PRICING, TESTIMONIALS } from '@/lib/config'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import PricingCard from '@/components/PricingCard'
import Testimonials from '@/components/Testimonials'
import ProductGrid from '@/components/ProductGrid'
import styles from './page.module.css'

export const revalidate = 60

export default async function Home() {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <>
      <Nav />
      <main className={styles.main}>

        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <p className="label animate-fade-up delay-1">{SITE.tagline}</p>
            <h1 className="display-xl animate-fade-up delay-2">
              {SITE.name}<br /><em>high-quality</em><br />Photoshop mockups
            </h1>
            <p className={`${styles.heroDesc} animate-fade-up delay-3`}>{SITE.description}</p>
            <div className={`${styles.heroCtas} animate-fade-up delay-4`}>
              <Link href="/mockups" className="btn-primary">
                Browse mockups
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link href={PRICING.href} className="btn-ghost">Get access from {PRICING.amount}</Link>
            </div>
          </div>
        </section>

        {/* Latest products */}
        {products && products.length > 0 && (
          <section className="section">
            <div className="container">
              <div className={styles.sectionHead}>
                <p className="label">What's new</p>
                <h2 className="display-lg">Latest mockups</h2>
              </div>
              <ProductGrid products={products} />
              <div className={styles.viewAll}>
                <Link href="/mockups" className="btn-ghost">
                  View all mockups
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        <section className={styles.socialSection}>
          <Testimonials items={TESTIMONIALS} />
        </section>

        {/* Pricing */}
        <section className="section">
          <div className="container"><PricingCard /></div>
        </section>

        {/* Founder */}
        <section className="section" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="container">
            <div className={styles.founder}>
              <p className="label">Why {SITE.name}?</p>
              <h2 className="display-sm">I build these like I'd use them myself</h2>
              <div className={styles.founderBio}>
                {SITE.founderBio.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
              </div>
              <p className={styles.founderName}>{SITE.founderName}</p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
