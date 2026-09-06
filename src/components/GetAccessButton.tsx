'use client'
import { useFullAccessModal } from '@/lib/fullAccessModal'

type Props = {
  className?: string
  children: React.ReactNode
}

export default function GetAccessButton({ className, children }: Props) {
  const { openModal } = useFullAccessModal()
  return (
    <button type="button" className={className} onClick={openModal}>
      {children}
    </button>
  )
}
