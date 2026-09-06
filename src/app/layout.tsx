import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import { ThemeProvider } from '@/lib/theme'
import { AuthProvider } from '@/lib/auth'
import { CartProvider } from '@/lib/cart'
import { FullAccessModalProvider } from '@/lib/fullAccessModal'
import CartDrawer from '@/components/CartDrawer'
import FullAccessModal from '@/components/FullAccessModal'
import ReferralCapture from '@/components/ReferralCapture'

const SITE_URL = 'https://grafikjam.shop'
const TITLE = 'GrafikJAM Mockups — Photoshop Mockups That Actually Stand Out'
const DESCRIPTION =
  "Photoshop mockups built from real client work, not stock-photo filler. Grab one, or get lifetime Full Access to the whole library for one payment."

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: '%s — GrafikJAM Mockups',
  },
  description: DESCRIPTION,
  keywords: [
    'photoshop mockups',
    'design mockups',
    'psd mockups',
    'product mockups',
    'packaging mockups',
    'device mockups',
  ],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'GrafikJAM Mockups',
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'GrafikJAM Mockups',
  url: SITE_URL,
  logo: `${SITE_URL}/grafikjam-Black.svg`,
  founder: { '@type': 'Person', name: 'Jekabs A. Mucenieks' },
}

// Note: no SearchAction here (the sitelinks-search-box markup) — /mockups
// doesn't actually support a ?q= query search yet, only tag filtering, and
// declaring a SearchAction we don't honor would just break for anyone who
// lands via it. Add this back if/when real search ships.
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'GrafikJAM Mockups',
  url: SITE_URL,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <FullAccessModalProvider>
                {children}
                <CartDrawer />
                <FullAccessModal />
              </FullAccessModalProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
        <Suspense fallback={null}>
          <ReferralCapture />
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
