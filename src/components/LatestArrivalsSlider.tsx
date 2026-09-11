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
        <div
          className={styles.track}
          style={{
            width: `${chunks.length * 100}%`,
            transform: `translateX(-${step * (100 / chunks.length)}%)`,
          }}
        >
          {chunks.map((chunk, i) => (
            <div key={i} className={styles.slide} style={{ width: `${100 / chunks.length}%` }}>
              <ProductGrid products={chunk} cols={4} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
