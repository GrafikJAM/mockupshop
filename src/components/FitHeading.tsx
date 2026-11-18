'use client'
import { useEffect, useRef } from 'react'

// A heading whose font size is set so its single line exactly fills the
// width of its container, at any screen size. It renders at a sensible
// CSS size first (so there's no blank flash or layout jump without JS),
// then measures and scales to fit; re-fits on resize and once the web
// font has loaded, since that changes the text's width.
export default function FitHeading({ children, className }: { children: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !el.parentElement) return
    const parent = el.parentElement

    function fit() {
      if (!el) return
      el.style.fontSize = '100px'
      const w = el.scrollWidth
      if (w > 0) el.style.fontSize = `${(100 * parent.clientWidth) / w}px`
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(parent)
    document.fonts?.ready.then(fit)
    return () => ro.disconnect()
  }, [])

  return (
    <h2 ref={ref} className={className} style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
      {children}
    </h2>
  )
}
