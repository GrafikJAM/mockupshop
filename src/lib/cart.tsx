'use client'
import { createContext, useContext, useEffect, useState } from 'react'

export type CartItem = {
  productId: string
  title: string
  image: string
  tierKey: string
  tierLabel: string
  price: number
}

type CartContextValue = {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  clear: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  total: number
}

const CartContext = createContext<CartContextValue>({
  items: [],
  isOpen: false,
  addItem: () => {},
  removeItem: () => {},
  clear: () => {},
  openCart: () => {},
  closeCart: () => {},
  toggleCart: () => {},
  total: 0,
})

const STORAGE_KEY = 'mockupshop_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setItems(JSON.parse(saved))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  function addItem(item: CartItem) {
    setItems(prev => [...prev.filter(i => i.productId !== item.productId), item])
  }

  function removeItem(productId: string) {
    setItems(prev => prev.filter(i => i.productId !== productId))
  }

  function clear() { setItems([]) }
  function openCart() { setIsOpen(true) }
  function closeCart() { setIsOpen(false) }
  function toggleCart() { setIsOpen(v => !v) }

  const total = items.reduce((sum, i) => sum + i.price, 0)

  return (
    <CartContext.Provider value={{ items, isOpen, addItem, removeItem, clear, openCart, closeCart, toggleCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
