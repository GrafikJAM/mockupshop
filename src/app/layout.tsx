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
import QuickBuyModal from '@/components/QuickBuyModal'
import { QuickBuyProvider } from '@/lib/quickBuy'
import { LicenseProvider } from '@/lib/license'
import ReferralCapture from '@/components/ReferralCapture'

const SITE_URL = 'https://grafikjam.shop'
const TITLE = 'GrafikJAM Mockups — Photoshop PSD Mockups with Smart Objects'
const DESCRIPTION =
  "Realistic Photoshop PSD mockups with Smart Objects, built from real branding work — billboards, packaging, apparel, screens. Buy one or get Full Access."

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
  icons: {
    // Two SVG favicons, swapped automatically by the browser based on the
    // user's OS/browser color scheme (not our site's own light/dark toggle,
    // which the browser tab has no knowledge of) — a dark mark reads on a
    // light tab bar, a light mark reads on a dark one. The first entry with
    // no `media` is the fallback for browsers that ignore the media queries.
    // These point at favicon-light/dark.svg (square canvases wrapping the
    // same JAM logo marks) rather than the raw JAM-06.svg/jam_white.svg —
    // those are wide rectangles (~1.7:1), so squeezed into a square tab
    // icon they rendered tiny and letterboxed instead of filling the space.
    icon: [
      { url: '/favicon-light.svg', type: 'image/svg+xml' },
      { url: '/favicon-light.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-dark.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
    ],
  },
  other: {
    // Pinterest "Claim your website" verification — renders as
    // <meta name="p:domain_verify" content="..."/> in <head>. Unlocks pin
    // analytics/attribution for grafikjam.shop once verified in Pinterest.
    'p:domain_verify': 'f780c21812437c3eef09cd7780ccece2',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'GrafikJAM Mockups',
  url: SITE_URL,
  // Google's logo feature needs a raster image (it ignores SVG).
  logo: `${SITE_URL}/email-logo.png`,
  sameAs: ['https://grafikjam.com'],
  founder: { '@type': 'Person', name: 'Jekabs A. Mucenieks', url: 'https://grafikjam.com' },
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
    // Dark is the default theme. suppressHydrationWarning: the inline script
    // below may switch data-theme to a visitor's saved "light" before React
    // hydrates, which is intentional.
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        {/* Apply a saved theme choice before first paint, so visitors who
            picked light mode don't see a dark flash on every page load. */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}" }}
        />
      </head>
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
              <LicenseProvider>
              <QuickBuyProvider>
                <FullAccessModalProvider>
                  {children}
                  <CartDrawer />
                  <FullAccessModal />
                  <QuickBuyModal />
                </FullAccessModalProvider>
              </QuickBuyProvider>
              </LicenseProvider>
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
