'use client'

// Promo code capture, mirroring src/lib/referral.ts's pattern. A link like
// https://grafikjam.shop/mockups?promo=BLACKFRIDAY35 stores the code for 10
// days (long enough to cover someone clicking a Pinterest pin or email link
// during the Black Friday window and buying a few days later after
// browsing around). The homepage Black Friday banner also calls
// setPromoCode() directly while it's showing, so anyone who lands on the
// homepage during the window gets the code captured even without the URL
// param.

const STORAGE_KEY = 'gj_promo'
const TTL_MS = 10 * 24 * 60 * 60 * 1000 // 10 days

type StoredPromo = { code: string; savedAt: number }

function clean(code: string) {
  return code.trim().slice(0, 40).toUpperCase().replace(/[^A-Z0-9_-]/g, '')
}

export function setPromoCode(code: string) {
  if (typeof window === 'undefined') return
  const c = clean(code)
  if (!c) return
  try {
    const record: StoredPromo = { code: c, savedAt: Date.now() }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  } catch {
    // localStorage unavailable (private browsing, etc.) — just skip tracking.
  }
}

export function capturePromoFromUrl() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const code = params.get('promo')
  if (!code) return
  setPromoCode(code)
}

export function getPromoCode(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const record: StoredPromo = JSON.parse(raw)
    if (!record?.code || !record?.savedAt) return null
    if (Date.now() - record.savedAt > TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return record.code
  } catch {
    return null
  }
}
