import Link from 'next/link'
import { SITE, PRICING, TESTIMONIALS } from '@/lib/config'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import Marquee from '@/components/Marquee'
import ProductGrid from '@/components/ProductGrid'
import PricingCard from '@/components/PricingCard'
import Testimonials from '@/components/Testimonials'
import BuyFullAccessButton from '@/components/BuyFullAccessButton'
import styles from './page.module.css'

export const revalidate = 60

export default async function Home() {
    const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  const all = products || []
  const latest = all.slice(0, 10)

  return (
    <>
      <Nav />
      <main className={styles.main}>

        <section className={styles.hero}>
                    <h1 className={styles.heroDesc}>
            {SITE.description.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h1>
          <div className={styles.heroCtas}>
            <Link href="/mockups" className="btn-primary">
              Browse mockups
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5h10M8.5 4l3.5 3.5L8.5 11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <BuyFullAccessButton className="btn-ghost">
              Get access from {PRICING.amount}
            </BuyFullAccessButton>
          </div>
        </section>


        {latest.length > 0 && (
          <section className={`${styles.section} section`}>
            <div className="container">
              <div className={styles.sectionHead}>
                <p className="label">What's new</p>
                <h2 className="display-lg">Latest mockups</h2>
              </div>
              <ProductGrid products={latest} cols={3} />
              <div className={styles.viewAll}>
                <Link href="/mockups" className="btn-ghost">
                  View all mockups
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7.5 3l3 3.5-3 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </div>
            </div>
          </section>
        )}

    
        <section className={styles.pricingSection}>
          <div className="container">
            <div className={styles.pricingTop}>
          
            </div>
          </div>
          {all.length > 0 && (
            <div className={styles.pricingMarquee}>
                 <Marquee products={[...all].reverse()} direction="right" speed={7} />
            </div>
          )}
          <div className="container" style={{ marginTop: 56 }}>
            <PricingCard />
          </div>
        </section>

               <section className={`section ${styles.founderSection}`}>
          <div className="container">
            <div className={styles.founderRow}>
              <img src="/founder-portrait.png" alt={SITE.founderName} className={styles.founderImg} />
              <div className={styles.founder}>
                <p className="label">About GrafikJAM</p>
                <h2 className="display-sm">Mockups built for real branding work</h2>
                <div className={styles.founderBio}>
                  {SITE.founderBio.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
                <p className={styles.sig}>{SITE.founderName}</p>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
