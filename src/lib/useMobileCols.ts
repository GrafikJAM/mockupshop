'use client'
import { useEffect, useState } from 'react'

// Phone grid column choice (1 or 2) for /mockups and category pages,
// remembered per browser so it sticks between pages and visits.
const KEY = 'grafikjam_mobile_cols'

export function useMobileCols(): [number, (n: number) => void] {
  const [cols, setCols] = useState(2)
  useEffect(() => {
    try {
      const v = Number(localStorage.getItem(KEY))
      if (v === 1 || v === 2) setCols(v)
    } catch {}
  }, [])
  function set(n: number) {
    setCols(n)
    try { localStorage.setItem(KEY, String(n)) } catch {}
  }
  return [cols, set]
}
