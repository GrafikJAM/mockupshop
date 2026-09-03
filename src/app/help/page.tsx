import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import styles from '@/styles/legal.module.css'

export const metadata: Metadata = {
  title: 'Help',
  description: 'Answers to common questions about buying, downloading, and licensing GrafikJAM mockups.',
}

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: 'What file format do the mockups come in?',
    a: 'Photoshop (.psd) files with organized, editable smart object layers, so you can drop your own design in and export a finished image.',
  },
  {
    q: 'How do I access my purchases after buying?',
    a: (
      <>
        Sign in and go to your <Link href="/profile" className={styles.link}>profile</Link> — the Purchases tab
        lists every mockup you own with a direct download link, and it never expires.
      </>
    ),
  },
  {
    q: "What's the difference between a single license and Full Access?",
    a: (
      <>
        A single license covers one mockup. A Full Access pass is a one-time payment for lifetime access to every
        mockup in the library — including everything added after you buy it. See{' '}
        <Link href="/licenses" className={styles.link}>License Terms</Link> for what each tier permits.
      </>
    ),
  },
  {
    q: 'Can I use a mockup in client work?',
    a: (
      <>
        Yes, within the scope of your license tier — see{' '}
        <Link href="/licenses" className={styles.link}>License Terms</Link> for exactly what's covered at each tier.
      </>
    ),
  },
  {
    q: 'Where do I find my invoice?',
    a: (
      <>
        Your <Link href="/profile" className={styles.link}>profile</Link>'s Invoices tab has a link to every
        order's Stripe-generated invoice, including the amount, date, and — if you added one at checkout — your
        VAT/tax ID.
      </>
    ),
  },
  {
    q: 'I lost the confirmation email — can I still get my files?',
    a: (
      <>
        Yes — your purchases live permanently on your account, not just in that one email. Sign in with the same
        email you used to buy, and everything's in your <Link href="/profile" className={styles.link}>profile</Link>.
      </>
    ),
  },
  {
    q: 'Do you offer refunds?',
    a: (
      <>
        Digital purchases are generally final once a download link is issued — see our{' '}
        <Link href="/terms" className={styles.link}>Terms of Service</Link>. If something's genuinely gone wrong
        with an order, contact us and we'll help.
      </>
    ),
  },
  {
    q: "Something's not working — how do I reach you?",
    a: 'Email us at hello@grafikjam.shop and we\'ll get back to you as soon as we can.',
  },
]

export default function HelpPage() {
  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.wrap}>
            <p className="label">Help</p>
            <h1 className={`display-lg ${styles.title}`}>Frequently asked questions</h1>
            <p className={styles.intro}>
              Can't find what you need here? Email us at{' '}
              <a href="mailto:hello@grafikjam.shop" className={styles.link}>hello@grafikjam.shop</a>.
            </p>

            <div>
              {FAQS.map((item, i) => (
                <div key={i} className={styles.faqItem}>
                  <div className={styles.faqQ}>{item.q}</div>
                  <div className={styles.faqA}>{item.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
