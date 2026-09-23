import StarburstBadge from './StarburstBadge'
import CircleTagBadge from './CircleTagBadge'
import styles from './PriceSticker.module.css'

// The two brand marks used together, the way they're drawn as a pair:
// a small "from" disc perched on the corner of the "$99" starburst.
type Props = {
  amount: string
  tag?: string
  size?: number
  rotate?: number
  className?: string
}

export default function PriceSticker({ amount, tag = 'from', size = 140, rotate = -6, className }: Props) {
  return (
    <div className={`${styles.wrap} ${className || ''}`} style={{ width: size }}>
      <StarburstBadge text={amount} size={size} rotate={rotate} />
      <CircleTagBadge text={tag} size={size * 0.34} rotate={rotate} className={styles.tag} />
    </div>
  )
}
