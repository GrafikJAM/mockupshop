import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { LICENSE_TIERS } from '@/lib/config'
import styles from '@/styles/legal.module.css'

export const metadata: Metadata = {
  title: 'License Terms',
  description: 'What each GrafikJAM Mockups license tier covers, and how you can use the mockups you buy.',
}

export default function LicensesPage() {
  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.wrap}>
            <p className="label">License terms</p>
            <h1 className={`display-lg ${styles.title}`}>How you can use GrafikJAM mockups</h1>
            <p className={styles.intro}>
              Every mockup you download from GrafikJAM is licensed, not sold outright — you're buying the right
              to use the finished mockup files under the terms below, not the underlying design itself.
            </p>

            <div className={styles.section}>
              <h2 className={styles.heading}>License tiers</h2>
              <p className={styles.text}>
                Each mockup can be licensed individually at one of three tiers, sized to your team. A{' '}
                <span className={styles.link} style={{ textDecoration: 'none' }}>Full Access</span> pass grants the
                same tier of license across the entire library, for life, including everything added after you buy it.
              </p>
              <div className={styles.tierGrid}>
                {LICENSE_TIERS.map(tier => (
                  <div key={tier.key} className={styles.tierCard}>
                    <div className={styles.tierName}>{tier.label} License</div>
                    <div className={styles.tierScale}>{tier.scale}</div>
                    <div className={styles.tierPrices}>${tier.price} per mockup · ${tier.fullAccessPrice} Full Access (all mockups, lifetime)</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.heading}>What you can do</h2>
              <ul className={styles.list}>
                <li>Use the mockup in client work, pitches, portfolios, and marketing — your own or your team's, up to the size covered by your license tier.</li>
                <li>Composite your own designs into the mockup scene and export the result as a flattened image (JPG, PNG, etc.) for any commercial or personal project.</li>
                <li>Use the finished, composited image in unlimited end products — websites, social posts, ads, presentations, print — with no additional fee.</li>
                <li>Upgrade your license tier at any time by purchasing the difference; contact us if you're not sure which tier fits your team.</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2 className={styles.heading}>What you can't do</h2>
              <ul className={styles.list}>
                <li>Resell, redistribute, or share the mockup source files (PSD or otherwise) on their own — as a freebie, a paid product, part of a template bundle, or through a shared team asset library outside your licensed team.</li>
                <li>Claim authorship of the mockup design itself, or register it (or a derivative of it) as your own trademark or design asset.</li>
                <li>Use a license tier below what your team's size actually requires — e.g. licensing a Freelancer tier while working across a 5-person studio.</li>
                <li>Use the mockups to build a product that competes directly with GrafikJAM (e.g. a mockup marketplace or template pack built around our source files).</li>
              </ul>
            </div>

            <div className={styles.section}>
              <h2 className={styles.heading}>Full Access passes</h2>
              <p className={styles.text}>
                A Full Access pass is a one-time payment for lifetime access to every mockup in the library, present
                and future, at the license tier you purchased. It doesn't change what the license permits — see
                above — it just covers the whole catalog instead of one mockup at a time.
              </p>
            </div>

            <div className={styles.contactBox}>
              <p className={styles.text}>Not sure which tier is right for you, or need a custom license (e.g. for a large agency)?</p>
              <a href="mailto:hello@grafikjam.shop" className={styles.link}>Get in touch</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
