import styles from './StarburstBadge.module.css'

// Traced from the GrafikJAM brand starburst mark (icons-01.svg). Keep this
// path in sync if the mark itself is ever redrawn.
const BURST_PATH =
  'M196.11,67.78l8.78-58.78,33.78,58.78S261.65.21,261.65,2.91s18.92,64.86,18.92,64.86l47.97-57.43,5.41,62.84,61.49-54.05-8.11,63.51,55.41-45.95-21.62,65.54,62.16-21.62-37.84,64.86,56.08,7.43-52.03,46.62,70.95,25-80.41,14.19,58.78,52.03-68.24,12.84,79.05,67.57-89.19-29.73,50.68,75.68-101.35-55.41,32.43,58.78-82.43-54.05,20.95,82.43-52.7-79.73-22.97,75.68-31.76-66.22s-56.08,60.81-53.38,60.14,22.3-71.62,22.3-71.62c0,0-88.51,62.16-85.81,61.49s37.84-64.19,35.14-63.51-96.62,50.68-94.59,50,50-72.3,50-72.3l-78.38,24.32,66.22-65.54-75.68-15.54,72.3-41.22-79.05-18.96,81.08-18.88-69.59-48.65,66.89,2.03-49.32-71.62,67.57,27.03L54.89,36.7l81.76,35.14-4.73-56.08,64.19,52.03Z'

type Props = {
  /** Main line, e.g. "$99" or "60+" */
  text: string
  /** Optional small line under the main text, e.g. "MOCKUPS" */
  sub?: string
  /** Width in px — height follows the mark's natural proportions */
  size?: number
  rotate?: number
  fill?: string
  stroke?: string
  textColor?: string
  className?: string
}

export default function StarburstBadge({
  text,
  sub,
  size = 140,
  rotate = -6,
  fill = '#f6ec3e',
  stroke = '#ea1c24',
  textColor = '#ea1c24',
  className,
}: Props) {
  return (
    <div className={`${styles.wrap} ${className || ''}`} style={{ width: size }}>
      <svg viewBox="0 0 531.56 464.4" className={styles.burst} style={{ transform: `rotate(${rotate}deg)` }}>
        <path d={BURST_PATH} fill={fill} />
        <path d={BURST_PATH} fill="none" stroke={stroke} strokeWidth={5.67} strokeMiterlimit={10} />
      </svg>
      <div
        className={styles.textWrap}
        style={{ transform: `rotate(${rotate}deg) skewX(-5.93deg)`, color: textColor }}
      >
        <span className={styles.text} style={{ fontSize: size * 0.26 }}>{text}</span>
        {sub && <span className={styles.sub} style={{ fontSize: size * 0.095 }}>{sub}</span>}
      </div>
    </div>
  )
}
