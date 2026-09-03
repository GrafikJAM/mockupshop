'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

type Props = {
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export default function BuyFullAccessButton({ className, children, onClick }: Props) {
  const { user, accessToken, loading } = useAuth()
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    onClick?.()
    if (loading) return

    if (!user || !accessToken) {
      router.push('/login')
      return
    }

    setBusy(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ mode: 'full-access' }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      alert(data.error || 'Something went wrong starting checkout. Please try again.')
    } catch {
      alert('Something went wrong starting checkout. Please try again.')
    }
    setBusy(false)
  }

  return (
    <button type="button" onClick={handleClick} className={className} disabled={busy}>
      {busy ? 'Loading…' : children}
    </button>
  )
}
