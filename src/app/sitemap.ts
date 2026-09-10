import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'
import { CATEGORIES } from '@/lib/categories'

const SITE_URL = 'https://grafikjam.shop'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/mockups`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/free-mockup`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/licenses`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/help`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.1 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.1 },
  ]

  const { data: products } = await supabase
    .from('products')
    .select('id, created_at, tags')
    .eq('active', true)

  const productRoutes: MetadataRoute.Sitemap = (products || []).map(p => ({
    url: `${SITE_URL}/product/${p.id}`,
    lastModified: p.created_at ? new Date(p.created_at) : undefined,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Only list category pages for tags that currently have at least one active
  // product — matches generateStaticParams in mockups/[category]/page.tsx, so
  // we never submit an empty landing page to Google.
  const liveTags = new Set((products || []).flatMap(p => p.tags || []))
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.filter(c => liveTags.has(c.tag)).map(c => ({
    url: `${SITE_URL}/mockups/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.85,
  }))

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
