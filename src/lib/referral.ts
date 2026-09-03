'use client'

// Basic affiliate/referral tracking: a creator shares a link like
// https://grafikjam.shop/?ref=somecreator, we remember that code for 30
// days, and attach it to any purchase made in that window so it shows up
// on the order row for manual commission payouts (see the referral_code
// column added to `orders`).

const STORAGE_KEY = 'gj_referral'
const TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

type StoredReferral = { code: string; savedAt: number }

export function captureReferralFromUrl() {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const code = params.get('ref')
  if (!code) return

  // Keep it short and simple — letters, numbers, dashes, underscores only.
  const clean = code.trim().slice(0, 40).replace(/[^a-zA-Z0-9_-]/g, '')
  if (!clean) return

  try {
    const record: StoredReferral = { code: clean, savedAt: Date.now() }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  } catch {
    // localStorage unavailable (private browsing, etc.) — just skip tracking.
  }
}

export function getReferralCode(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const record: StoredReferral = JSON.parse(raw)
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
