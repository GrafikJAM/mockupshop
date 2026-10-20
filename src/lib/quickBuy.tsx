'use client'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

// Product-card quick actions ("Add to cart" / "Purchase" on hover) open a
// small license picker. This holds which product it's for and what the
// confirm button should do once a license is chosen.
export type QuickBuyProduct = { id: string; title: string; image: string }
export type QuickBuyIntent = 'cart' | 'purchase'

type Ctx = {
  product: QuickBuyProduct | null
  intent: QuickBuyIntent
  open: (product: QuickBuyProduct, intent: QuickBuyIntent) => void
  close: () => void
}

const QuickBuyContext = createContext<Ctx>({ product: null, intent: 'cart', open: () => {}, close: () => {} })

export function QuickBuyProvider({ children }: { children: React.ReactNode }) {
  const [product, setProduct] = useState<QuickBuyProduct | null>(null)
  const [intent, setIntent] = useState<QuickBuyIntent>('cart')
  const open = useCallback((p: QuickBuyProduct, i: QuickBuyIntent) => { setProduct(p); setIntent(i) }, [])
  const close = useCallback(() => setProduct(null), [])
  const value = useMemo(() => ({ product, intent, open, close }), [product, intent, open, close])
  return <QuickBuyContext.Provider value={value}>{children}</QuickBuyContext.Provider>
}

export const useQuickBuy = () => useContext(QuickBuyContext)
