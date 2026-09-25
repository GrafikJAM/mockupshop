import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Same staleness concern as admin/orders — always hit Supabase live rather
// than a cached response.
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

type DownloadRow = {
  id: string
  product_id: string | null
  user_id: string | null
  email: string | null
  order_session_id: string | null
  source: string | null
  created_at: string
}

export async function GET(req: NextRequest) {
  const adminPassword = req.headers.get('x-admin-password')
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // High enough that the Clients view stays complete for a good while —
    // same reasoning as the 5000 cap on admin/orders.
    const { data, error } = await supabaseAdmin
      .from('downloads')
      .select('id, product_id, user_id, email, order_session_id, source, created_at')
      .order('created_at', { ascending: false })
      .limit(5000)

    // The `downloads` table is a new addition — if it hasn't been created
    // in Supabase yet, surface an empty list rather than a 500 so the rest
    // of the admin UI keeps working.
    if (error) {
      if (error.code === '42P01') return NextResponse.json([])
      throw new Error(error.message)
    }

    const rows = (data || []) as DownloadRow[]

    const productIds = Array.from(new Set(rows.map(r => r.product_id).filter(Boolean) as string[]))
    const { data: productRows } = productIds.length
      ? await supabaseAdmin.from('products').select('id, title').in('id', productIds)
      : { data: [] as { id: string; title: string }[] }
    const titleById = new Map((productRows || []).map(p => [p.id, p.title]))

    // A row's `email` column is set directly at log time whenever it was
    // available there (profile/product page, or the webhook-built email
    // links). Rows that only had a user_id to go on (shouldn't normally
    // happen, but fall back just in case) get resolved here instead.
    const missingEmailUserIds = Array.from(new Set(
      rows.filter(r => !r.email && r.user_id).map(r => r.user_id as string)
    ))
    const emailById = new Map<string, string>()
    await Promise.all(missingEmailUserIds.map(async id => {
      try {
        const { data } = await supabaseAdmin.auth.admin.getUserById(id)
        if (data?.user?.email) emailById.set(id, data.user.email)
      } catch {
        // Left unresolved — shown as "Unknown" below rather than failing the whole list.
      }
    }))

    const result = rows.map(r => ({
      id: r.id,
      productId: r.product_id,
      productTitle: r.product_id ? (titleById.get(r.product_id) || 'Unknown product') : 'Unknown product',
      email: r.email || (r.user_id && emailById.get(r.user_id)) || 'Unknown',
      source: r.source,
      sessionId: r.order_session_id,
      createdAt: r.created_at,
    }))

    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to load downloads' }, { status: 500 })
  }
}
