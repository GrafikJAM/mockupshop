'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
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
// every 5s by sliding the track sideways. Renders its own header row (title
// left, a small progress-bar indicator centered, "View all mockups" right)
// so the indicator sits between the two rather than below the images — and
// so the link doesn't move as page height varies. Pauses on hover; a
// segment can be clicked to jump to it.
//
// Looping: a plain modulo wrap (last page -> step 0) makes the track slide
// backwards across everything to get there, which reads as a glitch. This
// uses the standard clone-slide trick instead — a copy of the last page is
// placed before the first, and a copy of the first page after the last —
// so "next" past the end always animates forward into a (visually
// identical) clone, then snaps instantly, transition-free, to the real
// page at the same spot. Same in reverse for "prev" before the start.
export default function LatestArrivalsSlider({ products }: { products: Product[] }) {
  const chunks: Product[][] = []
  for (let i = 0; i < products.length; i += PAGE_SIZE) chunks.push(products.slice(i, i + PAGE_SIZE))

  const looped = chunks.length > 1
  const extended = looped ? [chunks[chunks.length - 1], ...chunks, chunks[0]] : chunks

  const [trackIndex, setTrackIndex] = useState(looped ? 1 : 0)
  const [animate, setAnimate] = useState(true)
  const [paused, setPaused] = useState(false)
  const raf2Ref = useRef<number | null>(null)

  // Real page index (0..chunks.length-1) that trackIndex currently maps to
  // — used for the dots and for which slide is "active" (full opacity).
  const realStep = looped ? (((trackIndex - 1) % chunks.length) + chunks.length) % chunks.length : 0

  useEffect(() => {
    if (!looped || paused) return
    const id = setInterval(() => setTrackIndex(i => i + 1), STEP_MS)
    return () => clearInterval(id)
  }, [looped, paused])

  // After a snap (animate set to false), wait two frames — one for the
  // transition-free jump to actually paint, one more as a safety margin —
  // before re-enabling the transition, so the jump itself never animates.
  useEffect(() => {
    if (animate) return
    const raf1 = requestAnimationFrame(() => {
      raf2Ref.current = requestAnimationFrame(() => setAnimate(true))
    })
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2Ref.current) cancelAnimationFrame(raf2Ref.current)
    }
  }, [animate])

  if (chunks.length === 0) return null

  function prevStep() { if (looped) setTrackIndex(i => i - 1) }
  function nextStep() { if (looped) setTrackIndex(i => i + 1) }
  function goToStep(i: number) { setTrackIndex(i + 1) }

  function handleTrackTransitionEnd(e: React.TransitionEvent<HTMLDivElement>) {
    if (!looped || e.propertyName !== 'transform') return
    if (trackIndex === chunks.length + 1) {
      setAnimate(false)
      setTrackIndex(1)
    } else if (trackIndex === 0) {
      setAnimate(false)
      setTrackIndex(chunks.length)
    }
  }

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

        {looped && (
          <div className={styles.progress}>
            {chunks.map((_, i) => (
              <button
                key={i}
                type="button"
                className={styles.segment}
                onClick={() => goToStep(i)}
                aria-label={`Show set ${i + 1} of ${chunks.length}`}
              >
                <span
                  className={`${styles.segmentFill} ${
                    i < realStep ? styles.segmentFillDone : i === realStep ? styles.segmentFillActive : ''
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
        {looped && (
          <button type="button" className={`${styles.arrow} ${styles.arrowPrev}`} onClick={prevStep} aria-label="Previous mockups">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2.5L4 7l5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        )}
        <div
          className={styles.track}
          onTransitionEnd={handleTrackTransitionEnd}
          style={{
            // Each slide has a fixed width (--chunk-w, set in CSS — the same
            // pixel width the 4-product row always had inside the old
            // container). This centers the active slide inside the
            // full-bleed viewport: viewport-center minus this slide's
            // center, in px, via the CSS var so it stays correct at any
            // screen width without a resize listener. transitionDuration is
            // zeroed only for the transition-free loop-snap above.
            transform: `translateX(calc(50vw - (var(--chunk-w) * ${trackIndex + 0.5})))`,
            transitionDuration: animate ? undefined : '0s',
          }}
        >
          {extended.map((chunk, i) => (
            <div
              key={i}
              className={`${styles.slide} ${i === trackIndex ? styles.slideActive : ''}`}
            >
              <ProductGrid products={chunk} cols={4} uniform />
            </div>
          ))}
        </div>
        {looped && (
          <button type="button" className={`${styles.arrow} ${styles.arrowNext}`} onClick={nextStep} aria-label="Next mockups">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 2.5l5 4.5-5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        )}
      </div>
    </div>
  )
}
