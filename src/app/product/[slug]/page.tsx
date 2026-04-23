import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import PricingCard from '@/components/PricingCard'
import Image from 'next/image'
import Link from 'next/link'
import { ALL_PRODUCTS, PRICING } from '@/lib/config'
import styles from './page.module.css'

interface Props {
  params: { slug: string }
}

export default function ProductPage({ params }: Props) {
  const product = ALL_PRODUCTS.find((p) => p.id === params.slug) ?? ALL_PRODUCTS[0]

  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className="container">

          {/* Breadcrumb */}
          <nav className={styles.breadcrumb}>
            <Link href="/mockups">Mockups</Link>
            <span>/</span>
            <span>{product.title}</span>
          </nav>

          <div className={styles.layout}>
            {/* Left: Images */}
            <div className={styles.images}>
              <div className={styles.mainImage}>
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className={styles.img}
                  priority
                />
              </div>
            </div>

            {/* Right: Info */}
            <div className={styles.info}>
              <h1 className="display-sm">{product.title}</h1>

              <p className={styles.desc}>
                A high-quality Photoshop mockup with smart object layers for easy customization.
                Perfect for presenting branding and design work with a professional finish.
              </p>

              <ul className={styles.specs}>
                {['Smart object layers', 'High resolution (3000×2000px)', 'Photoshop CC+', 'Included in all-access pass'].map((spec) => (
                  <li key={spec} className={styles.spec}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {spec}
                  </li>
                ))}
              </ul>

              <div className={styles.ctaBlock}>
                <Link href={PRICING.href} className="btn-primary">
                  Get access — {PRICING.amount}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <p className={styles.ctaNote}>{PRICING.description}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom upsell */}
        <div className={`section`}>
          <div className="container">
            <PricingCard />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
