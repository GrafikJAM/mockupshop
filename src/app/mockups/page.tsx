import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ProductGrid from '@/components/ProductGrid'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

export const revalidate = 60

export default async function MockupsPage() {
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className="container">
          <div className={styles.header}>
            <h1 className="display-lg">Mockups</h1>
            <span className={styles.count}>{products?.length || 0} files</span>
          </div>
          {products && products.length > 0
            ? <ProductGrid products={products} />
            : <p className={styles.empty}>Products coming soon.</p>
          }
        </div>
      </main>
      <Footer />
    </>
  )
}
