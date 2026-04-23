import Image from 'next/image'
import styles from './Testimonials.module.css'

interface Testimonial {
  handle: string
  name: string
  avatar: string
  text: string
}

interface TestimonialsProps {
  items: Testimonial[]
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatarWrap}>
          <Image src={item.avatar} alt={item.name} width={36} height={36} className={styles.avatar} />
        </div>
        <div>
          <div className={styles.name}>{item.name}</div>
          <div className={styles.handle}>{item.handle}</div>
        </div>
      </div>
      <p className={styles.text}>{item.text}</p>
    </div>
  )
}

export default function Testimonials({ items }: TestimonialsProps) {
  const doubled = [...items, ...items]

  return (
    <div className={styles.wrapper}>
      {/* Row 1 — left */}
      <div className={styles.row}>
        <div className={`${styles.track}`} style={{ animationDuration: '35s' }}>
          {doubled.map((item, i) => (
            <TestimonialCard key={`r1-${i}`} item={item} />
          ))}
        </div>
      </div>
      {/* Row 2 — right */}
      <div className={styles.row}>
        <div className={`${styles.track} ${styles.reverse}`} style={{ animationDuration: '45s' }}>
          {[...doubled].reverse().map((item, i) => (
            <TestimonialCard key={`r2-${i}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
