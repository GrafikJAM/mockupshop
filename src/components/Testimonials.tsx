import styles from './Testimonials.module.css'

type T = { handle: string; name: string; avatar: string; text: string }

function Card({ t }: { t: T }) {
  return (
    <div className={styles.card}>
      <p className={styles.text}>{t.text}</p>
      <div className={styles.author}>
        <img src={t.avatar} alt={t.name} className={styles.avatar} width={32} height={32} />
        <div>
          <div className={styles.name}>{t.name}</div>
          <div className={styles.handle}>{t.handle}</div>
        </div>
      </div>
    </div>
  )
}

export default function Testimonials({ items }: { items: T[] }) {
  const d = [...items, ...items, ...items]
  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <div className={styles.track} style={{ animationDuration: '40s' }}>
          {d.map((t, i) => <Card key={`a${i}`} t={t} />)}
        </div>
      </div>
      <div className={styles.row}>
        <div className={`${styles.track} ${styles.rev}`} style={{ animationDuration: '52s' }}>
          {[...d].reverse().map((t, i) => <Card key={`b${i}`} t={t} />)}
        </div>
      </div>
    </div>
  )
}
