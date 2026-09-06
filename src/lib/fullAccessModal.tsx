'use client'
import { createContext, useContext, useState } from 'react'

type FullAccessModalContextValue = {
  isOpen: boolean
  openModal: () => void
  closeModal: () => void
}

const FullAccessModalContext = createContext<FullAccessModalContextValue>({
  isOpen: false,
  openModal: () => {},
  closeModal: () => {},
})

export function FullAccessModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  function openModal() { setIsOpen(true) }
  function closeModal() { setIsOpen(false) }

  return (
    <FullAccessModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </FullAccessModalContext.Provider>
  )
}

export const useFullAccessModal = () => useContext(FullAccessModalContext)
