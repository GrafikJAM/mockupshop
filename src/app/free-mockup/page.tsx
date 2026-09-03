'use client'
import { useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import styles from './page.module.css'

type Product = { id: string; title: string; image_default: string; download_url: string }

export default function FreeMockupPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const [product, setProduct] = useState<Product | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('sending')
    try {
      const res = await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'free-mockup' }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.'); setStatus('error'); return }
      setProduct(data.product || null)
      setStatus('done')
    } catch {
      setError('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className={styles.card}>
          {status === 'done' ? (
            product ? (
              <>
                <p className="label">It's yours</p>
                <h1 className={`display-sm ${styles.title}`}>Here's your free mockup</h1>
                <div className={styles.thumb} style={{ backgroundImage: `url(${product.image_default})` }} />
                <p className={styles.sub}>{product.title}</p>
                <a href={product.download_url} className={styles.downloadBtn} target="_blank" rel="noopener noreferrer">
                  Download now
                </a>
                <Link href="/mockups" className={styles.backLink}>Browse the full library →</Link>
              </>
            ) : (
              <>
                <p className="label">Thanks!</p>
                <h1 className={`display-sm ${styles.title}`}>You're on the list</h1>
                <p className={styles.sub}>We'll let you know as soon as the free mockup is ready.</p>
                <Link href="/mockups" className={styles.backLink}>Browse mockups →</Link>
              </>
            )
          ) : (
            <>
              <p className="label">Free mockup</p>
              <h1 className={`display-sm ${styles.title}`}>Get a free Photoshop mockup</h1>
              <p className={styles.sub}>
                Drop your email and we'll send you one of our mockups, on us — no strings, and you can
                unsubscribe any time.
              </p>
              <form onSubmit={handleSubmit} className={styles.form}>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={styles.input}
                />
                {status === 'error' && <p className={styles.error}>{error}</p>}
                <button type="submit" className={styles.submitBtn} disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Get my free mockup'}
                </button>
              </form>
              <p className={styles.fineprint}>We'll only email you about GrafikJAM — see our <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>Privacy Policy</Link>.</p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
