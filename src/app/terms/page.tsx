import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import styles from '@/styles/legal.module.css'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that apply when you buy and use mockups from GrafikJAM Mockups.',
}

const LAST_UPDATED = 'September 3, 2026'

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.wrap}>
            <p className="label">Legal</p>
            <h1 className={`display-lg ${styles.title}`}>Terms of Service</h1>
            <p className={styles.updated}>Last updated {LAST_UPDATED}</p>

            <p className={styles.intro}>
              These terms govern your use of GrafikJAM Mockups (grafikjam.shop), operated by GrafikJAM, Ausekla 14,
              Lielvārde, Latvia. By creating an account or buying a mockup, you agree to them. This is a template
              covering the essentials for a small digital-goods shop — if you have specific legal requirements, have
              it reviewed by a lawyer before relying on it.
            </p>

            <div className={styles.section}>
              <h2 className={styles.heading}>1. What we sell</h2>
              <p className={styles.text}>
                GrafikJAM sells digital licenses to use Photoshop mockup files, individually or through a Full
                Access pass covering the whole library. What each license permits is set out in our{' '}
                <Link href="/licenses" className={styles.link}>License Terms</Link>, which are part of these Terms.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.heading}>2. Accounts</h2>
              <p className={styles.text}>
                You need an account (sign-in via a magic link sent to your email) to buy mockups and access your
                purchase history, downloads, and invoices. You're responsible for keeping access to the email
                address tied to your account, since that's how you sign in.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.heading}>3. Payment &amp; pricing</h2>
              <p className={styles.text}>
                Prices are listed in USD and charged at checkout through Stripe, our payment processor. We don't
                see or store your card details. Applicable taxes (e.g. VAT) are calculated and added at checkout
                where required.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.heading}>4. Refunds</h2>
              <p className={styles.text}>
                Because mockups are digital files delivered instantly, purchases are generally non-refundable once
                a download link has been issued. If something's genuinely wrong with an order — a broken file, a
                duplicate charge, a purchase made in error before any download — contact us and we'll sort it out
                on a case-by-case basis.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.heading}>5. Intellectual property</h2>
              <p className={styles.text}>
                All mockup designs, source files, and the GrafikJAM name and branding remain the property of
                GrafikJAM. Buying a mockup grants you a license to use it under our{' '}
                <Link href="/licenses" className={styles.link}>License Terms</Link> — it doesn't transfer ownership
                of the design itself.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.heading}>6. Prohibited use</h2>
              <ul className={styles.list}>
                <li>Reselling, redistributing, or sharing mockup source files outside the terms of your license.</li>
                <li>Attempting to circumvent, resell, or share account access to bypass paying for a license.</li>
                <li>Using the site or its content in any way that's unlawful, or that infringes someone else's rights.</li>
                <li>Interfering with the operation of the site (scraping at scale, attempting unauthorized access, etc.).</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2 className={styles.heading}>7. Termination</h2>
              <p className={styles.text}>
                We may suspend or close an account that violates these terms, in particular the licensing terms
                above. Licenses already purchased and used in good faith aren't retroactively revoked by a later
                account suspension.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.heading}>8. Liability</h2>
              <p className={styles.text}>
                The mockups and site are provided "as is." To the extent permitted by law, GrafikJAM isn't liable
                for indirect or consequential damages arising from your use of the mockups or the site. Nothing
                here limits liability where it can't legally be limited.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.heading}>9. Changes to these terms</h2>
              <p className={styles.text}>
                We may update these terms as the shop evolves. Material changes will update the "last updated" date
                above; continuing to use the site after a change means you accept the updated terms.
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.heading}>10. Governing law</h2>
              <p className={styles.text}>
                These terms are governed by the laws of Latvia, without regard to conflict-of-law principles,
                without prejudice to any mandatory consumer-protection rights you have under the laws of your own
                country of residence.
              </p>
            </div>

            <div className={styles.contactBox}>
              <p className={styles.text}>Questions about these terms?</p>
              <a href="mailto:hello@grafikjam.shop" className={styles.link}>hello@grafikjam.shop</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
