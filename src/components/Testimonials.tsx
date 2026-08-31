import styles from './Testimonials.module.css'

type Testimonial = { handle: string; name: string; avatar: string; text: string }

function Card({ item }: { item: Testimonial }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <img src={item.avatar} alt={item.name} className={styles.avatar} width={36} height={36} />
        <div>
          <div className={styles.name}>{item.name}</div>
          <div className={styles.handle}>{item.handle}</div>
        </div>
      </div>
      <p className={styles.text}>{item.text}</p>
    </div>
  )
}

export default function Testimonials({ items }: { items: Testimonial[] }) {
  const doubled = [...items, ...items]
  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <div className={styles.track} style={{ animationDuration: '35s' }}>
          {doubled.map((item, i) => <Card key={`r1-${i}`} item={item} />)}
        </div>
      </div>
      <div className={styles.row}>
        <div className={`${styles.track} ${styles.reverse}`} style={{ animationDuration: '45s' }}>
          {[...doubled].reverse().map((item, i) => <Card key={`r2-${i}`} item={item} />)}
        </div>
      </div>
    </div>
  )
}
