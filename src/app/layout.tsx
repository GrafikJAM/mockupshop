import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/theme'
import { CartProvider } from '@/lib/cart'
import CartDrawer from '@/components/CartDrawer'

export const metadata: Metadata = {
  title: 'Mockup Shop — High-quality design mockups',
  description: 'Standout Photoshop mockups with unique scenes and exceptional quality.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
