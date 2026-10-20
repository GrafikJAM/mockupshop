'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { LICENSE_TIERS } from './config'
import { useCart } from './cart'

// One license choice for the whole site (picked in the nav, on a product
// page, or in the quick-buy popup). Card prices, the product page and new
// cart items all follow it, and changing it moves the cart to it too.
// Remembered per browser; falls back to Freelancer.
type Tier = (typeof LICENSE_TIERS)[number]
type Ctx = { tier: Tier; setTierKey: (key: string) => void }

const STORAGE_KEY = 'grafikjam_license'
const LicenseContext = createContext<Ctx>({ tier: LICENSE_TIERS[0], setTierKey: () => {} })

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const [key, setKey] = useState<string>(LICENSE_TIERS[0].key)
  const { setAllTiers } = useCart()

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && LICENSE_TIERS.some(t => t.key === saved)) setKey(saved)
    } catch {}
  }, [])

  const setTierKey = useCallback((next: string) => {
    const t = LICENSE_TIERS.find(x => x.key === next)
    if (!t) return
    setKey(t.key)
    setAllTiers({ key: t.key, label: t.label, price: t.price })
    try { localStorage.setItem(STORAGE_KEY, t.key) } catch {}
  }, [setAllTiers])

  const tier = LICENSE_TIERS.find(t => t.key === key) || LICENSE_TIERS[0]
  const value = useMemo(() => ({ tier, setTierKey }), [tier, setTierKey])
  return <LicenseContext.Provider value={value}>{children}</LicenseContext.Provider>
}

export const useLicense = () => useContext(LicenseContext)
