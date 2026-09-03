'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import styles from './page.module.css'

export default function LoginPage() {
  const { user, loading, signInWithMagicLink, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('sending')
    const { error } = await signInWithMagicLink(email)
    if (error) { setError(error); setStatus('error'); return }
    setStatus('sent')
  }

  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className={styles.card}>
          {loading ? null : user ? (
            <>
              <p className="label">Signed in</p>
              <h1 className={`display-sm ${styles.title}`}>You're signed in as {user.email}</h1>
              <p className={styles.sub}>You can close this page, or sign out below.</p>
              <button type="button" className={styles.signOutBtn} onClick={signOut}>Sign out</button>
              <Link href="/mockups" className={styles.backLink}>Browse mockups →</Link>
            </>
          ) : status === 'sent' ? (
            <>
              <p className="label">Check your email</p>
              <h1 className={`display-sm ${styles.title}`}>We sent a sign-in link to {email}</h1>
              <p className={styles.sub}>Click the link in that email to sign in. You can close this tab.</p>
            </>
          ) : (
            <>
              <p className="label">Sign in</p>
              <h1 className={`display-sm ${styles.title}`}>Sign in to check out and manage your mockups</h1>
              <p className={styles.sub}>Enter your email and we'll send you a one-click sign-in link — no password needed.</p>
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
                  {status === 'sending' ? 'Sending…' : 'Send magic link'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
