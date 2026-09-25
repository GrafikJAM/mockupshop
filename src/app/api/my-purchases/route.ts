import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// See account/purchases/route.ts: Next.js caches fetch() calls by default
// in route handlers, which was silently serving stale Supabase/Stripe data.
// Force this route to always hit them live.
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user }, error: userError } = await supabase.auth.getUser(token)
  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('type, product_id')
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const hasFullAccess = (data || []).some(o => o.type === 'full-access')
  const productIds = (data || [])
    .filter(o => o.type === 'product' && o.product_id)
    .map(o => o.product_id as string)

  // Which products this buyer has actually clicked "Download" on (see
  // /api/dl) — lets the product page show "Already downloaded" next to the
  // Download button, same signal as the /profile purchases list.
  // Best-effort: if the `downloads` table isn't there yet, this just comes
  // back empty rather than failing ownership lookup for the whole page.
  let downloadedProductIds: string[] = []
  try {
    const { data: downloads } = await supabaseAdmin
      .from('downloads')
      .select('product_id')
      .eq('user_id', user.id)
    downloadedProductIds = Array.from(new Set((downloads || []).map(d => d.product_id).filter(Boolean) as string[]))
  } catch {
    // Left empty.
  }

  return NextResponse.json({ hasFullAccess, productIds, downloadedProductIds })
}
