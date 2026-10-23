'use client'
import Link from 'next/link'
import { useRef, useState } from 'react'
import styles from './CategoryIndex.module.css'

type Item = { slug: string; name: string; count: number; cover?: string }

// Big typographic category index. On devices with a mouse, hovering a name
// lights it up in the accent colour, dims the rest, and floats that
// category's cover image at the cursor. Touch devices get a small inline
// thumbnail next to each name instead (CSS: @media (hover: none)).
// The floating preview is moved via a ref, not state, so mouse movement
// never re-renders the list.
export default function CategoryIndex({ items }: { items: Item[] }) {
  const [active, setActive] = useState<Item | null>(null)
  // Only fetch a cover once its name has been hovered, not all of them up front.
  const [seen, setSeen] = useState<Set<string>>(new Set())
  function show(item: Item) { setActive(item); setSeen(prev => prev.has(item.slug) ? prev : new Set(prev).add(item.slug)) }
  const previewRef = useRef<HTMLDivElement>(null)

  function onMove(e: React.MouseEvent) {
    const el = previewRef.current
    if (el) el.style.transform = `translate3d(${e.clientX + 24}px, ${e.clientY - 120}px, 0) rotate(-4deg)`
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h2 className="label">Browse by category</h2>
      </div>

      <ul className={styles.list} onMouseMove={onMove} onMouseLeave={() => setActive(null)}>
        {items.map(item => (
          <li key={item.slug} className={styles.item}>
            <Link
              href={`/mockups/${item.slug}`}
              className={`${styles.link} ${active?.slug === item.slug ? styles.linkActive : ''}`}
              onMouseEnter={() => show(item)}
              onFocus={() => show(item)}
              onBlur={() => setActive(null)}
            >
              {item.cover && <img src={item.cover} alt="" loading="lazy" className={styles.thumb} />}
              <span className={styles.name}>{item.name}</span>
              <sup className={styles.count}>{item.count}</sup>
            </Link>
          </li>
        ))}
        <li className={styles.item}>
          <Link href="/mockups" className={`${styles.link} ${styles.all}`}>
            <span className={styles.name}>All →</span>
          </Link>
        </li>
      </ul>

      <div ref={previewRef} className={`${styles.preview} ${active?.cover ? styles.previewOn : ''}`} aria-hidden>
        {items.map(item => item.cover && seen.has(item.slug) && (
          <img
            key={item.slug}
            src={item.cover}
            alt=""
            className={`${styles.previewImg} ${active?.slug === item.slug ? styles.previewImgOn : ''}`}
          />
        ))}
      </div>
    </div>
  )
}
