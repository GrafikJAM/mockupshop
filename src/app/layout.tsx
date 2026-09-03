import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import { ThemeProvider } from '@/lib/theme'
import { AuthProvider } from '@/lib/auth'
import { CartProvider } from '@/lib/cart'
import CartDrawer from '@/components/CartDrawer'
import ReferralCapture from '@/components/ReferralCapture'

const SITE_URL = 'https://grafikjam.shop'
const TITLE = 'GrafikJAM Mockups — High-quality Photoshop Mockups'
const DESCRIPTION =
  'Standout Photoshop mockups with unique scenes and exceptional quality. Buy individual mockups or get lifetime Full Access to the entire library.'

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <CartDrawer />
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
