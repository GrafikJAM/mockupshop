import styles from './CircleTagBadge.module.css'

// Companion mark to StarburstBadge, traced from icons-02.svg — the small
// red "from"-style disc that sits on top of the starburst.
type Props = {
  text: string
  size?: number
  rotate?: number
  bg?: string
  textColor?: string
  className?: string
}

export default function CircleTagBadge({
  text,
  size = 76,
  rotate = -6,
  bg = '#ea1c24',
  textColor = '#f6ec3e',
  className,
}: Props) {
  return (
    <div className={`${styles.wrap} ${className || ''}`} style={{ width: size, height: size, background: bg }}>
      <span
        className={styles.text}
        style={{ fontSize: size * 0.26, color: textColor, transform: `rotate(${rotate}deg) skewX(-5.93deg)` }}
      >
        {text}
      </span>
    </div>
  )
}
