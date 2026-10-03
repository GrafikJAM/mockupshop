import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { toDirectImageUrl } from '@/lib/imageUrl'

// One-time utility (same spirit as the order-notification backfill in
// admin/orders/route.ts — meant to be triggered by hand, not wired into a
// UI button) for moving product files off Dropbox hotlinks and onto
// Supabase Storage, where FileDropField/uploadAdminFile already sends
// anything newly uploaded through the admin (see src/lib/upload.ts).
//
// Dropbox shared links aren't built to serve files to the public at real
// traffic volume — they get throttled once enough different visitors hit
// the same link around the same time, which reads as "works for about half
// the people, broken for the rest" rather than a clean outage. Products
// created/edited before FileDropField existed (or wherever a Dropbox link
// was pasted in directly rather than dropped as a file) are still on the
// old hotlinks and still exposed to that throttling.
//
// GET reports what's still on Dropbox without changing anything. POST
// migrates a bounded batch of fields (not all of them — a full catalog can
// be 100+ external fetches, too slow for one serverless invocation) and
// reports what's left; call it repeatedly until remainingDropboxFields is 0.

const BUCKET = 'product-files'

type Product = {
  id: string
  title: string
  download_url: string | null
  image_default: string | null
  image_hover: string | null
  images_extra: string[] | null
}

type FieldRef = { productId: string; title: string; field: string; index?: number; url: string }

function isDropboxUrl(url: string | null | undefined): url is string {
  if (!url) return false
  try {
    const host = new URL(url).hostname
    return host === 'dl.dropboxusercontent.com' || host === 'www.dropbox.com' || host === 'dropbox.com'
  } catch {
    return false
  }
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-140)
}

function folderFor(field: string) {
  return field === 'download_url' ? 'downloads' : 'images'
}

// Every Dropbox-hosted field across every product, as a flat list — lets
// POST just take the first N regardless of which product/field they belong
// to, rather than needing to reason about per-product batching.
function collectDropboxFields(products: Product[]): FieldRef[] {
  const refs: FieldRef[] = []
  for (const p of products) {
    if (isDropboxUrl(p.download_url)) refs.push({ productId: p.id, title: p.title, field: 'download_url', url: p.download_url! })
    if (isDropboxUrl(p.image_default)) refs.push({ productId: p.id, title: p.title, field: 'image_default', url: p.image_default! })
    if (isDropboxUrl(p.image_hover)) refs.push({ productId: p.id, title: p.title, field: 'image_hover', url: p.image_hover! })
    ;(p.images_extra || []).forEach((url, i) => {
      if (isDropboxUrl(url)) refs.push({ productId: p.id, title: p.title, field: 'images_extra', index: i, url })
    })
  }
  return refs
}

function requireAdmin(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, title, download_url, image_default, image_hover, images_extra')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const refs = collectDropboxFields((data || []) as Product[])
  const byProduct = new Map<string, { title: string; fields: string[] }>()
  for (const r of refs) {
    const entry = byProduct.get(r.productId) || { title: r.title, fields: [] }
    entry.fields.push(r.index != null ? `${r.field}[${r.index}]` : r.field)
    byProduct.set(r.productId, entry)
  }

  return NextResponse.json({
    totalProducts: (data || []).length,
    remainingDropboxFields: refs.length,
    productsStillOnDropbox: Array.from(byProduct.entries()).map(([id, v]) => ({ id, title: v.title, fields: v.fields })),
  })
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const limit = Math.min(Math.max(Number(body?.limit) || 8, 1), 20)

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id, title, download_url, image_default, image_hover, images_extra')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const products = (data || []) as Product[]
  const allRefs = collectDropboxFields(products)
  const batch = allRefs.slice(0, limit)

  const migrated: { productId: string; title: string; field: string; newUrl: string }[] = []
  const failed: { productId: string; title: string; field: string; error: string }[] = []

  // Modest concurrency (not fully sequential, not unbounded) — fast enough
  // to make real progress per call without hammering Dropbox hard enough to
  // trigger more throttling while trying to migrate away from it.
  const CONCURRENCY = 3
  for (let i = 0; i < batch.length; i += CONCURRENCY) {
    const chunk = batch.slice(i, i + CONCURRENCY)
    await Promise.all(chunk.map(async ref => {
      try {
        const directUrl = toDirectImageUrl(ref.url)
        const res = await fetch(directUrl)
        if (!res.ok) throw new Error(`Fetch failed: HTTP ${res.status}`)
        const contentType = res.headers.get('content-type') || 'application/octet-stream'
        const buffer = Buffer.from(await res.arrayBuffer())

        const urlPath = new URL(ref.url).pathname
        const originalName = decodeURIComponent(urlPath.split('/').pop() || 'file')
        const storagePath = `${folderFor(ref.field)}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName(originalName)}`

        const { error: uploadError } = await supabaseAdmin.storage.from(BUCKET).upload(storagePath, buffer, { contentType })
        if (uploadError) throw new Error(uploadError.message)

        const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath)
        const newUrl = pub.publicUrl

        const product = products.find(p => p.id === ref.productId)!
        if (ref.field === 'images_extra') {
          const next = [...(product.images_extra || [])]
          next[ref.index!] = newUrl
          const { error: updateError } = await supabaseAdmin.from('products').update({ images_extra: next }).eq('id', ref.productId)
          if (updateError) throw new Error(updateError.message)
        } else {
          const { error: updateError } = await supabaseAdmin.from('products').update({ [ref.field]: newUrl }).eq('id', ref.productId)
          if (updateError) throw new Error(updateError.message)
        }

        migrated.push({ productId: ref.productId, title: ref.title, field: ref.index != null ? `${ref.field}[${ref.index}]` : ref.field, newUrl })
      } catch (err) {
        failed.push({
          productId: ref.productId,
          title: ref.title,
          field: ref.index != null ? `${ref.field}[${ref.index}]` : ref.field,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }))
  }

  return NextResponse.json({
    processedThisCall: batch.length,
    migrated,
    failed,
    // Only successes actually come off Dropbox — anything that failed this
    // call is still Dropbox-hosted and will be picked up again next call.
    remainingDropboxFields: allRefs.length - migrated.length,
  })
}
