'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import styles from './page.module.css'

type Purchase = { id: string; title: string; image_default: string; download_url: string }
type Invoice = {
  sessionId: string
  type: string
  tierKey: string | null
  created: number | null
  amountTotal: number | null
  currency: string | null
  invoiceNumber: string | null
  hostedInvoiceUrl: string | null
  invoicePdf: string | null
}

function formatAmount(amountTotal: number | null, currency: string | null) {
  if (amountTotal === null || !currency) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amountTotal / 100)
}

function formatDate(created: number | null) {
  if (!created) return '—'
  return new Date(created * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ProfilePage() {
  const { user, loading, accessToken, signOut } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<'purchases' | 'invoices'>('purchases')

  const [purchases, setPurchases] = useState<Purchase[] | null>(null)
  const [purchasesError, setPurchasesError] = useState('')

  const [invoices, setInvoices] = useState<Invoice[] | null>(null)
  const [invoicesError, setInvoicesError] = useState('')
  const [invoicesLoaded, setInvoicesLoaded] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user, router])

  useEffect(() => {
    if (!accessToken) return
    fetch('/api/account/purchases', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not load purchases.')
        return data
      })
      .then(data => setPurchases(data.products || []))
      .catch(err => setPurchasesError(err.message || 'Could not load purchases.'))
  }, [accessToken])

  useEffect(() => {
    if (!accessToken || tab !== 'invoices' || invoicesLoaded) return
    fetch('/api/account/invoices', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not load invoices.')
        return data
      })
      .then(data => { setInvoices(data.invoices || []); setInvoicesLoaded(true) })
      .catch(err => { setInvoicesError(err.message || 'Could not load invoices.'); setInvoicesLoaded(true) })
  }, [accessToken, tab, invoicesLoaded])

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  if (loading || !user) return <><Nav /><main className={styles.main} /><Footer /></>

  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className="container">
        <div className={styles.state}>
          <p className="label">My profile</p>
          <h1 className={`display-lg ${styles.title}`}>{user.email}</h1>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tab === 'purchases' ? styles.tabActive : ''}`}
              onClick={() => setTab('purchases')}
            >
              Purchases
            </button>
            <button
              className={`${styles.tab} ${tab === 'invoices' ? styles.tabActive : ''}`}
              onClick={() => setTab('invoices')}
            >
              Invoices
            </button>
            <button className={`${styles.tab} ${styles.tabDanger}`} onClick={handleSignOut}>
              Log out
            </button>
          </div>

          {tab === 'purchases' && (
            <div className={styles.panel}>
              {purchasesError && <p className={styles.error}>{purchasesError}</p>}
              {!purchasesError && purchases === null && <p className={styles.stateText}>Loading your purchases…</p>}
              {purchases && purchases.length === 0 && (
                <div className={styles.empty}>
                  <p className={styles.stateText}>You haven't purchased any mockups yet.</p>
                  <Link href="/mockups" className="btn-ghost">Browse mockups →</Link>
                </div>
              )}
              {purchases && purchases.length > 0 && (
                <div className={styles.list}>
                  {purchases.map(p => (
                    <div key={p.id} className={styles.row}>
                      <div className={styles.thumb} style={{ backgroundImage: `url(${p.image_default})` }} />
                      <span className={styles.rowTitle}>{p.title}</span>
                      <a href={p.download_url} className={styles.rowBtn} target="_blank" rel="noopener noreferrer">
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'invoices' && (
            <div className={styles.panel}>
              {invoicesError && <p className={styles.error}>{invoicesError}</p>}
              {!invoicesError && invoices === null && <p className={styles.stateText}>Loading your invoices…</p>}
              {invoices && invoices.length === 0 && <p className={styles.stateText}>No invoices yet.</p>}
              {invoices && invoices.length > 0 && (
                <div className={styles.list}>
                  {invoices.map(inv => (
                    <div key={inv.sessionId} className={styles.invoiceRow}>
                      <div className={styles.invoiceInfo}>
                        <span className={styles.rowTitle}>
                          {inv.invoiceNumber ? `Invoice ${inv.invoiceNumber}` : (inv.type === 'full-access' ? 'Full Access purchase' : 'Mockup purchase')}
                        </span>
                        <span className={styles.invoiceMeta}>
                          {formatDate(inv.created)} · {formatAmount(inv.amountTotal, inv.currency)}
                        </span>
                      </div>
                      {inv.hostedInvoiceUrl ? (
                        <a href={inv.hostedInvoiceUrl} className={styles.rowBtn} target="_blank" rel="noopener noreferrer">
                          View invoice
                        </a>
                      ) : (
                        <span className={styles.invoiceUnavailable}>Not available</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
