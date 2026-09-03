import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import styles from '@/styles/legal.module.css'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'What data GrafikJAM Mockups collects, why, and the choices you have about it.',
}

const LAST_UPDATED = 'September 3, 2026'

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.wrap}>
            <p className="label">Legal</p>
            <h1 className={`display-lg ${styles.title}`}>Privacy Policy</h1>
            <p className={styles.updated}>Last updated {LAST_UPDATED}</p>

            <p className={styles.intro}>
              This explains what data GrafikJAM Mockups (grafikjam.shop) collects when you use the site, why, and
              how to reach us about it. GrafikJAM is operated from Latvia. This is a template covering the
              essentials for a small shop — if you have specific compliance requirements, have it reviewed by a
              lawyer before relying on it.
            </p>

            <div className={styles.section}>
              <h2 className={styles.heading}>What we collect</h2>
              <ul className={styles.list}>
                <li><strong>Account info:</strong> your email address, used to sign you in via a magic link and to identify your purchases.</li>
                <li><strong>Purchase records:</strong> which mockups or license tiers you bought, when, and the associated Stripe checkout session — so we can grant access and show your purchase history and invoices.</li>
                <li><strong>Payment info:</strong> handled entirely by Stripe. We never see or store your card number — only the resulting order and invoice records.</li>
                <li><strong>Basic usage data:</strong> aggregate page-view and traffic-source analytics (via Vercel Analytics), which doesn't identify you individually.</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2 className={styles.heading}>How we use it</h2>
              <ul className={styles.list}>
                <li>To sign you in and keep your session active.</li>
                <li>To deliver the mockups and licenses you've paid for, and show them in your profile.</li>
                <li>To generate and provide invoices/receipts for your purchases.</li>
                <li>To respond if you contact us for support.</li>
                <li>To understand, in aggregate, how the site is used and improve it.</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2 className={styles.heading}>Who we share it with</h2>
              <p className={styles.text}>
                We use a small number of service providers to run the shop, each of which processes data on our
                behalf under their own privacy/security terms:
              </p>
              <ul className={styles.list}>
                <li><strong>Supabase</strong> — authentication and our database (accounts, orders).</li>
                <li><strong>Stripe</strong> — payment processing and invoicing.</li>
                <li><strong>Vercel</strong> — hosting and basic site analytics.</li>
              </ul>
              <p className={styles.text}>We don't sell your data, and we don't share it with anyone else for their own marketing purposes.</p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.heading}>Cookies &amp; local storage</h2>
              <p className={styles.text}>
                We use essential cookies/local storage to keep you signed in and to remember your cart between
                pages. We don't use third-party advertising trackers.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.heading}>How long we keep it</h2>
              <p className={styles.text}>
                We keep account and order records for as long as your account is active, and as needed afterward to
                meet accounting and tax obligations (invoices, in particular, need to be retained for a legally
                required period).
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.heading}>Your rights</h2>
              <p className={styles.text}>
                If you're in the EU/EEA (or covered by similar data-protection law elsewhere), you have the right
                to access, correct, or delete your personal data, and to object to or restrict certain processing.
                Contact us to exercise any of these — for most requests this means deleting your account and its
                associated data, though we may need to retain order/invoice records where the law requires it. You
                can also lodge a complaint with your local data protection authority (in Latvia, the Data State
                Inspectorate).
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.heading}>Changes to this policy</h2>
              <p className={styles.text}>
                We may update this policy as the shop evolves. Material changes will update the "last updated" date
                above.
              </p>
            </div>

            <div className={styles.contactBox}>
              <p className={styles.text}>Questions about your data, or want to make a request?</p>
              <a href="mailto:hello@grafikjam.shop" className={styles.link}>hello@grafikjam.shop</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
