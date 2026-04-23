import Nav from '@/components/Nav'
import Marquee from '@/components/Marquee'
import Testimonials from '@/components/Testimonials'
import PricingCard from '@/components/PricingCard'
import ProductGrid from '@/components/ProductGrid'
import Footer from '@/components/Footer'
import Link from 'next/link'
import {
  SITE,
  PRICING,
  FEATURED_PRODUCTS,
  ALL_PRODUCTS,
  LATEST_PRODUCTS,
  TESTIMONIALS,
} from '@/lib/config'
import styles from './page.module.css'

export default function Home() {
  return (
    <>
      <Nav />

      <main className={styles.main}>

        {/* ── Hero ───────────────────────────────────── */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <p className={`label animate-fade-up delay-1`}>{SITE.tagline}</p>
            <h1 className={`display-xl animate-fade-up delay-2`}>
              {SITE.name}<br />
              <em>high-quality</em><br />
              Photoshop mockups
            </h1>
            <p className={`${styles.heroDesc} animate-fade-up delay-3`}>
              {SITE.description}
            </p>
            <div className={`${styles.heroCtas} animate-fade-up delay-4`}>
              <Link href="/mockups" className="btn-primary">
                Browse mockups
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link href={PRICING.href} className="btn-ghost">
                Get access from {PRICING.amount}
              </Link>
            </div>
          </div>
        </section>

        {/* ── Featured marquee ───────────────────────── */}
        <div className={styles.marqueeSection}>
          <Marquee products={FEATURED_PRODUCTS} direction="left" speed={42} />
        </div>

        {/* ── Access-all deal + second marquee ──────── */}
        <section className={`${styles.dealSection} section-sm`}>
          <div className="container">
            <div className={styles.dealHeader}>
              <p className="label">The best deal in the market</p>
              <h2 className="display-sm">
                The price of a few mockups.<br />Access to everything.
              </h2>
              <p className={styles.dealSub}>Enough mockups for your work</p>
            </div>
          </div>
          <div className={styles.marqueeGap}>
            <Marquee products={ALL_PRODUCTS} direction="right" speed={55} />
          </div>
          <div className="container" style={{ marginTop: '56px' }}>
            <PricingCard />
          </div>
        </section>

        {/* ── Social proof ───────────────────────────── */}
        <section className={`${styles.socialSection} section-sm`}>
          <Testimonials items={TESTIMONIALS} />
        </section>

        {/* ── Latest products ────────────────────────── */}
        <section className={`section`}>
          <div className="container">
            <div className={styles.sectionHead}>
              <p className="label">What's new</p>
              <h2 className="display-lg">Latest mockups</h2>
            </div>
            <ProductGrid products={LATEST_PRODUCTS} columns={4} />
            <div className={styles.viewAll}>
              <Link href="/mockups" className="btn-ghost">
                View all mockups
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Pricing CTA ────────────────────────────── */}
        <section className={`section`}>
          <div className="container">
            <PricingCard />
          </div>
        </section>

        {/* ── Founder ────────────────────────────────── */}
        <section className={`${styles.founderSection} section`}>
          <div className="container">
            <div className={styles.founder}>
              <p className="label">Why {SITE.name}?</p>
              <h2 className={`display-sm ${styles.founderTagline}`}>
                I build these like I'd use them myself
              </h2>
              <div className={styles.founderBio}>
                {SITE.founderBio.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
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
