'use client'
import { useEffect, useState } from 'react'
import { useFullAccessModal } from '@/lib/fullAccessModal'
import { setPromoCode } from '@/lib/promo'
import { BLACK_FRIDAY, isBlackFridayActive, getCountdown } from '@/lib/blackFriday'
import styles from './BlackFridayBanner.module.css'

// Homepage-only, date-gated banner for the Black Friday / Cyber Monday
// window. Evaluated client-side so it always reflects the visitor's actual
// current time rather than whenever the page was last statically built.
export default function BlackFridayBanner() {
  const { openModal } = useFullAccessModal()
  const [active, setActive] = useState(false)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0 })

  useEffect(() => {
    function tick() {
      const now = new Date()
      const isActive = isBlackFridayActive(now)
      setActive(isActive)
      if (isActive) {
        // Anyone who sees this banner has the code captured immediately —
        // no need for them to have arrived via a ?promo= link.
        setPromoCode(BLACK_FRIDAY.code)
        setCountdown(getCountdown(now))
      }
    }
    tick()
    const id = setInterval(tick, 60000)
    return () => clearInterval(id)
  }, [])

  if (!active) return null

  return (
    <div className={styles.banner}>
      <div className={styles.text}>
        <strong>Black Friday — {BLACK_FRIDAY.percentOff}% off Full Access</strong>
        <span className={styles.sub}>
          Code {BLACK_FRIDAY.code} · ends in {countdown.days}d {countdown.hours}h {countdown.minutes}m
        </span>
      </div>
      <button type="button" className={styles.cta} onClick={openModal}>Get Full Access</button>
    </div>
  )
}
