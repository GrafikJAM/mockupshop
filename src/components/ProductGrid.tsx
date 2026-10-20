'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { toDirectImageUrl } from '@/lib/imageUrl'
import { useCart } from '@/lib/cart'
import { useQuickBuy } from '@/lib/quickBuy'
import { useLicense } from '@/lib/license'
import styles from './ProductGrid.module.css'

type Product = {
  id: string
  title: string
  image_default: string
  image_hover?: string
  price?: string
}

function Card({ product, uniform = false, showPrice = false }: { product: Product; uniform?: boolean; showPrice?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const [added, setAdded] = useState(false)
  // Vertical mockups keep the hover image anchored to the bottom (their
  // focal point); horizontal ones stay centred so the swap doesn't shift.
  const [portrait, setPortrait] = useState(false)
  // Image failed to load (e.g. a throttled Dropbox link): show a neutral
  // tile with the name instead of the browser's broken-image icon.
  const [broken, setBroken] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  // A cached image can finish loading before hydration, so onLoad never
  // fires for it — check once on mount too.
  useEffect(() => {
    const i = imgRef.current
    if (i && i.complete && i.naturalWidth) setPortrait(i.naturalHeight > i.naturalWidth)
    else if (i && i.complete && !i.naturalWidth) setBroken(true)
  }, [])
  const { items, addItem } = useCart()
  const { open } = useQuickBuy()
  const { tier } = useLicense()
  const image = toDirectImageUrl(product.image_default)
  const inCart = items.some(i => i.productId === product.id)

  // First item in the cart: confirm the license in a popup. After that,
  // add straight away with the site-wide license (nav selector).
  function handleAdd() {
    if (items.length === 0) { open({ id: product.id, title: product.title, image }, 'cart'); return }
    addItem({ productId: product.id, title: product.title, image, tierKey: tier.key, tierLabel: tier.label, price: tier.price })
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  return (
    <div
      className={styles.card}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`${styles.imgWrap} ${uniform ? styles.uniformImgWrap : ''}`}>
        <Link href={`/product/${product.id}`} className={styles.imgLink} tabIndex={-1} aria-hidden>
          {broken ? (
            <div className={styles.placeholder}><span>{product.title}</span></div>
          ) : (
          <img
            ref={imgRef}
            src={image}
            alt=""
            className={`${styles.img} ${styles.imgDefault} ${hovered && product.image_hover ? styles.hidden : ''}`}
            onLoad={e => { const i = e.currentTarget; setPortrait(i.naturalHeight > i.naturalWidth) }}
            onError={() => setBroken(true)}
          />
          )}
          {product.image_hover && !broken && (
            <img
              src={toDirectImageUrl(product.image_hover)}
              alt=""
              className={`${styles.img} ${styles.imgHover} ${portrait ? styles.imgHoverPortrait : ''} ${hovered ? styles.visible : ''}`}
            />
          )}
        </Link>
        <div className={styles.actions}>
          <button type="button" className={`${styles.action} ${styles.actionGhost}`} onClick={handleAdd} disabled={added}>
            {added ? 'Added' : inCart ? 'In cart' : 'Add to cart'}
          </button>
          <button
            type="button"
            className={`${styles.action} ${styles.actionPrimary}`}
            onClick={() => open({ id: product.id, title: product.title, image }, 'purchase')}
          >
            Purchase
          </button>
        </div>
      </div>
      <Link href={`/product/${product.id}`} className={styles.meta}>
        <span className={styles.title}>{product.title}</span>
        {showPrice && <span className={styles.price}>${tier.price}</span>}
      </Link>
    </div>
  )
}

// `uniform` opts a grid into a fixed 3:2 aspect-ratio, cropped
// (object-fit: cover) cards on a real CSS grid instead of the default
// masonry columns — used by the homepage's "Just added" slider, where
// mixed product-photo aspect ratios made the gap between pages too big.
// Default (masonry) behavior is unchanged everywhere else.
export default function ProductGrid({ products, cols = 4, uniform = false, showPrice = false }: { products: Product[]; cols?: number; uniform?: boolean; showPrice?: boolean }) {
  return (
    <div className={uniform ? styles.uniformGrid : styles.grid} style={{ '--cols': cols } as React.CSSProperties}>
      {products.map(p => <Card key={p.id} product={p} uniform={uniform} showPrice={showPrice} />)}
    </div>
  )
}
