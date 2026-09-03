import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: { user }, error: userError } = await supabase.auth.getUser(token)
  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: orders, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select('type, product_id')
    .eq('user_id', user.id)

  if (ordersError) return NextResponse.json({ error: ordersError.message }, { status: 500 })

  const hasFullAccess = (orders || []).some(o => o.type === 'full-access')
  const productIds = (orders || [])
    .filter(o => o.type === 'product' && o.product_id)
    .map(o => o.product_id as string)

  // Full Access grants every currently-active mockup; a cart purchase only
  // grants the specific products bought. Skip the query entirely when
  // there's nothing to look up — passing an empty/placeholder id into
  // .in() throws a Postgres uuid-syntax error instead of just matching zero rows.
  let products: { id: string; title: string; image_default: string; download_url: string }[] = []

  if (hasFullAccess) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id, title, image_default, download_url')
      .eq('active', true)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    products = data || []
  } else if (productIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('id, title, image_default, download_url')
      .in('id', productIds)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    products = data || []
  }

  return NextResponse.json({ hasFullAccess, products })
}
