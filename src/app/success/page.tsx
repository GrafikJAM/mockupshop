'use client'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCart } from '@/lib/cart'
import { useAuth } from '@/lib/auth'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import styles from './page.module.css'

type Product = { id: string; title: string; download_url: string }

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clear } = useCart()
  const { user } = useAuth()
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')
  const [products, setProducts] = useState<Product[]>([])
  const [buyerEmail, setBuyerEmail] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionId) { setStatus('error'); setError('Missing checkout session.'); return }
    fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`)
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not verify payment.')
        return data
      })
      .then(data => {
        setProducts(data.products || [])
        setBuyerEmail(data.email || null)
        setStatus('ok')
        clear()
      })
      .catch(err => {
        setError(err.message || 'Could not verify payment.')
        setStatus('error')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  return (
    <main className={styles.main}>
      <div className="container">
        {status === 'loading' && (
          <div className={styles.state}>
            <p className={styles.stateText}>Confirming your payment…</p>
          </div>
        )}

        {status === 'error' && (
          <div className={styles.state}>
            <p className="label">Something's not right</p>
            <h1 className={`display-lg ${styles.title}`}>We couldn't confirm that payment</h1>
            <p className={styles.stateText}>{error}</p>
            <p className={styles.stateText}>If you were charged, contact us and we'll sort it out.</p>
            <Link href="/mockups" className="btn-primary" style={{ marginTop: 24 }}>Back to mockups</Link>
          </div>
        )}

        {status === 'ok' && (
          <div className={styles.state}>
            <p className="label">Payment confirmed</p>
            <h1 className={`display-lg ${styles.title}`}>You're all set</h1>
            <p className={styles.stateText}>
              {user
                ? "Download your files below now — and since you're signed in, they'll also show as \"Download\" the next time you visit these product pages."
                : "Download your files below now — we've also emailed these download links to you, since they won't be saved to an account."}
            </p>

            <div className={styles.downloads}>
              {products.map(p => {
                // Routed through /api/dl (rather than p.download_url
                // directly) so this click logs a download event tied back
                // to this order — see that route for why the params here
                // are plain query params, not a signed token.
                const params = new URLSearchParams({ source: 'success' })
                if (sessionId) params.set('session', sessionId)
                if (buyerEmail) params.set('email', buyerEmail)
                return (
                  <div key={p.id} className={styles.downloadRow}>
                    <span className={styles.downloadTitle}>{p.title}</span>
                    <a href={`/api/dl/${p.id}?${params.toString()}`} className={styles.downloadBtn} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  </div>
                )
              })}
              {products.length === 0 && <p className={styles.stateText}>No files found for this order.</p>}
            </div>

            <Link href="/mockups" className="btn-ghost" style={{ marginTop: 32 }}>Browse more mockups →</Link>
          </div>
        )}
      </div>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <>
      <Nav />
      <Suspense fallback={<main className={styles.main} />}>
        <SuccessContent />
      </Suspense>
      <Footer />
    </>
  )
}
