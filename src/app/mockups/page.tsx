import type { Metadata } from 'next'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import MockupsBrowser, { type Product } from '@/components/MockupsBrowser'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'All Photoshop Mockups — PSD with Smart Objects',
  description:
    'Browse every GrafikJAM Photoshop mockup: billboards, posters, screens, vehicles, packaging, apparel and more. PSD files with Smart Objects, from real branding work.',
  alternates: { canonical: '/mockups' },
}

// Server-rendered so the whole catalog is in the page Google crawls (it
// used to load in the browser after the page opened, so crawlers saw an
// empty list). Same query as /api/products.
export default async function MockupsPage() {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className="container">
          <MockupsBrowser initialProducts={(data || []) as Product[]} />
        </div>
      </main>
      <Footer />
    </>
  )
}
