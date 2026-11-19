import { supabase } from '@/lib/supabase'
import { CATEGORIES } from '@/lib/categories'
import { productPath } from '@/lib/productUrl'
import { toDirectImageUrl } from '@/lib/imageUrl'

// Hand-built sitemap (replaces app/sitemap.ts) so each product page can list
// its images — Next's built-in sitemap type has no image support, and Google
// Image search is a major way people find mockups. Rebuilt at most hourly.
export const revalidate = 3600

const SITE_URL = 'https://grafikjam.shop'

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

type Entry = { loc: string; lastmod?: string; changefreq: string; priority: number; images?: string[] }

export async function GET() {
  const entries: Entry[] = [
    { loc: `${SITE_URL}/`, changefreq: 'weekly', priority: 1 },
    { loc: `${SITE_URL}/mockups`, changefreq: 'daily', priority: 0.9 },
    { loc: `${SITE_URL}/free-mockup`, changefreq: 'monthly', priority: 0.7 },
    { loc: `${SITE_URL}/licenses`, changefreq: 'monthly', priority: 0.5 },
    { loc: `${SITE_URL}/help`, changefreq: 'monthly', priority: 0.4 },
    { loc: `${SITE_URL}/terms`, changefreq: 'yearly', priority: 0.1 },
    { loc: `${SITE_URL}/privacy`, changefreq: 'yearly', priority: 0.1 },
  ]

  const { data: products } = await supabase
    .from('products')
    .select('id, title, created_at, tags, image_default, image_hover, images_extra')
    .eq('active', true)

  // Only categories that currently have products (same rule as the
  // category pages' generateStaticParams), so no empty page is submitted.
  const liveTags = new Set((products || []).flatMap(p => p.tags || []))
  for (const c of CATEGORIES.filter(c => liveTags.has(c.tag))) {
    entries.push({ loc: `${SITE_URL}/mockups/${c.slug}`, changefreq: 'weekly', priority: 0.85 })
  }

  for (const p of products || []) {
    const images = [p.image_default, p.image_hover, ...((p.images_extra as string[] | null) || [])]
      .filter(Boolean)
      .map((u: string) => toDirectImageUrl(u))
    entries.push({
      loc: `${SITE_URL}${productPath(p)}`,
      lastmod: p.created_at ? new Date(p.created_at).toISOString() : undefined,
      changefreq: 'weekly',
      priority: 0.8,
      images,
    })
  }

  const body = entries.map(e => [
    '  <url>',
    `    <loc>${esc(e.loc)}</loc>`,
    e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : '',
    `    <changefreq>${e.changefreq}</changefreq>`,
    `    <priority>${e.priority}</priority>`,
    ...(e.images || []).map(i => `    <image:image><image:loc>${esc(i)}</image:loc></image:image>`),
    '  </url>',
  ].filter(Boolean).join('\n')).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${body}
</urlset>
`
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
