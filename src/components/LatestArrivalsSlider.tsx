'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ProductGrid from './ProductGrid'
import styles from './LatestArrivalsSlider.module.css'

type Product = {
  id: string
  title: string
  image_default: string
  image_hover?: string
  price?: string
}

const STEP_MS = 5000
const PAGE_SIZE = 4

// Splits the newest products into pages of 4 and auto-advances between them
// every 5s by sliding the track sideways, looping back to the start. Renders
// its own header row (title left, a small progress-bar indicator centered,
// "View all mockups" right) so the indicator sits between the two rather
// than below the images — and so the link doesn't move as page height
// varies. Pauses on hover; a segment can be clicked to jump to it.
export default function LatestArrivalsSlider({ products }: { products: Product[] }) {
  const chunks: Product[][] = []
  for (let i = 0; i < products.length; i += PAGE_SIZE) chunks.push(products.slice(i, i + PAGE_SIZE))

  const [step, setStep] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (chunks.length <= 1 || paused) return
    const id = setInterval(() => {
      setStep(s => (s + 1) % chunks.length)
    }, STEP_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chunks.length, paused])

  if (chunks.length === 0) return null

  function prevStep() { setStep(s => (s - 1 + chunks.length) % chunks.length) }
  function nextStep() { setStep(s => (s + 1) % chunks.length) }

  return (
    <div
      className={`${styles.wrap} ${paused ? styles.paused : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className={styles.headRow}>
        <div className={styles.headText}>
          <p className="label">Just added</p>
          <h2 className="display-lg">Latest mockups</h2>
        </div>

        {chunks.length > 1 && (
          <div className={styles.progress}>
            {chunks.map((_, i) => (
              <button
                key={i}
                type="button"
                className={styles.segment}
                onClick={() => setStep(i)}
                aria-label={`Show set ${i + 1} of ${chunks.length}`}
              >
                <span
                  className={`${styles.segmentFill} ${
                    i < step ? styles.segmentFillDone : i === step ? styles.segmentFillActive : ''
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        <Link href="/mockups" className={`btn-ghost ${styles.viewAllLink}`}>
          View all mockups
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M7.5 3l3 3.5-3 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </Link>
      </div>

      <div className={styles.viewport}>
        {chunks.length > 1 && (
          <button type="button" className={`${styles.arrow} ${styles.arrowPrev}`} onClick={prevStep} aria-label="Previous mockups">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2.5L4 7l5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        )}
        <div
          className={styles.track}
          style={{
            // Each slide has a fixed width (--chunk-w, set in CSS — the same
            // pixel width the 4-product row always had inside the old
            // container). This centers the active slide inside the now
            // full-bleed viewport: viewport-center minus this slide's
            // center, in px, via the CSS var so it stays correct at any
            // screen width without a resize listener.
            transform: `translateX(calc(50vw - (var(--chunk-w) * ${step + 0.5})))`,
          }}
        >
          {chunks.map((chunk, i) => (
            <div
              key={i}
              className={`${styles.slide} ${i === step ? styles.slideActive : ''}`}
            >
              <ProductGrid products={chunk} cols={4} uniform />
            </div>
          ))}
        </div>
        {chunks.length > 1 && (
          <button type="button" className={`${styles.arrow} ${styles.arrowNext}`} onClick={nextStep} aria-label="Next mockups">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2.5l5 4.5-5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        )}
      </div>
    </div>
  )
}
