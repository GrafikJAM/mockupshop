import Link from 'next/link'
import Image from 'next/image'
import styles from './ProductGrid.module.css'

interface Product {
  id: string
  title: string
  href: string
  image: string
}

interface ProductGridProps {
  products: Product[]
  columns?: 3 | 4 | 5
}

export default function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  return (
    <div className={styles.grid} data-cols={columns}>
      {products.map((product) => (
        <Link key={product.id} href={product.href} className={styles.item}>
          <div className={styles.imageWrap}>
            <Image
              src={product.image}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={styles.image}
            />
          </div>
          <div className={styles.meta}>
            <span className={styles.title}>{product.title}</span>
            <svg className={styles.arrow} width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </Link>
      ))}
    </div>
  )
}
