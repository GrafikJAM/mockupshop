import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mockup Shop — High-quality design mockups',
  description: 'Standout Photoshop mockups with unique scenes and exceptional quality.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
