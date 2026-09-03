import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/theme'
import { AuthProvider } from '@/lib/auth'
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
          <AuthProvider>
            <CartProvider>
              {children}
              <CartDrawer />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
