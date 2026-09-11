'use client'
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

// Splits the newest products into pages of 4 and auto-advances between them
// every 5s by sliding the track sideways, looping back to the start. Each
// page has a progress-bar segment underneath (like Instagram/Stories) that
// fills over the 5s instead of a plain dot. Pauses on hover, and a segment
// can be clicked to jump to it.
const PAGE_SIZE = 4

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
                            <ProductGrid products={chunk} cols={4} uniform />
            </div>
          ))}
        </div>
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
    </div>
  )
}
