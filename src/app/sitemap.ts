import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const SITE_URL = 'https://grafikjam.shop'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Only routes that actually resolve to a real page today. (The footer
  // links to /help, /terms, /licenses, /privacy — none of those pages
  // exist yet, so they're deliberately left out of the sitemap.)
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/mockups`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/login`, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const { data: products } = await supabase
    .from('products')
    .select('id, created_at')
    .eq('active', true)

  const productRoutes: MetadataRoute.Sitemap = (products || []).map(p => ({
    url: `${SITE_URL}/product/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : undefined,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...productRoutes]
}
