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

// Splits the newest products into pages of 3 (matching Best Sellers' 3-col
// grid) and auto-advances between them every 5s, looping back to the start.
// Pauses while the visitor's mouse is over it, and dots let them jump/control
// it manually.
export default function LatestArrivalsSlider({ products }: { products: Product[] }) {
  const chunks: Product[][] = []
  for (let i = 0; i < products.length; i += 3) chunks.push(products.slice(i, i + 3))

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
      className={styles.wrap}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div key={step} className={styles.fade}>
        <ProductGrid products={chunks[step]} cols={3} />
      </div>

      {chunks.length > 1 && (
        <div className={styles.dots}>
          {chunks.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dot} ${i === step ? styles.dotActive : ''}`}
              onClick={() => setStep(i)}
              aria-label={`Show set ${i + 1} of ${chunks.length}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
