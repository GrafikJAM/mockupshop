'use client'
import { useState } from 'react'
import Link from 'next/link'
import { toDirectImageUrl } from '@/lib/imageUrl'
import styles from './FreeMockupSection.module.css'

type LeadMagnet = { title: string; image_default: string }
type Delivered = { title: string; download_url: string }

// Homepage version of the /free-mockup funnel: same /api/lead-magnet
// endpoint, tagged source "homepage" so signups from here can be told apart
// in email_subscribers. Only receives the lead magnet's title and preview
// image from the server — the download link comes back from the API after
// the email is submitted, so it's never in the page source.
export default function FreeMockupSection({ leadMagnet }: { leadMagnet: LeadMagnet }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const [delivered, setDelivered] = useState<Delivered | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('sending')
    try {
      const res = await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'homepage' }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.'); setStatus('error'); return }
      setDelivered(data.product || null)
      setStatus('done')
    } catch {
      setError('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className={styles.row}>
      <div className={styles.preview}>
        <img src={toDirectImageUrl(leadMagnet.image_default)} alt={leadMagnet.title} loading="lazy" className={styles.img} />
        <span className={styles.badge}>Free</span>
      </div>

      <div className={styles.copy}>
        {status === 'done' ? (
          <>
            <p className="label">It&apos;s yours</p>
            <h2 className="display-lg">Here&apos;s your free mockup</h2>
            {delivered ? (
              <>
                <p className={styles.sub}>{delivered.title} — full-resolution PSD with smart objects.</p>
                <a href={delivered.download_url} className="btn-primary" target="_blank" rel="noopener noreferrer">
                  Download now
                </a>
              </>
            ) : (
              <p className={styles.sub}>You&apos;re on the list — we&apos;ll email you as soon as it&apos;s ready.</p>
            )}
          </>
        ) : (
          <>
            <p className="label">Not ready to buy?</p>
            <h2 className="display-lg">Try one free</h2>
            <p className={styles.sub}>
              Get <strong>{leadMagnet.title}</strong> as a full Photoshop PSD with smart objects — the same
              quality as the paid library. Drop your email and it&apos;s yours.
            </p>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="email"
                required
                placeholder="you@example.com"
                aria-label="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={styles.input}
              />
              <button type="submit" className={`btn-primary ${styles.submit}`} disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Get the free mockup'}
              </button>
            </form>
            {status === 'error' && <p className={styles.error}>{error}</p>}
            <p className={styles.fineprint}>
              Occasional emails about new mockups, unsubscribe any time. See our <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
