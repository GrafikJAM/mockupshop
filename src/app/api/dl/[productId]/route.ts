import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Every download link in the app (profile, product page, the success page,
// and the guest/cart confirmation emails) points through here instead of
// straight at the product's `download_url`. This is the one place that logs
// a `downloads` row before handing the file over, so the admin Clients view
// can show what a buyer actually clicked "Download" on — not just what's on
// their order.
//
// Identity (`email` / `uid` / `session`) arrives as plain query params, not
// a signed token. That's a deliberate simplification: this endpoint isn't
// an access-control boundary — the `download_url` it redirects to is
// already handed straight to the browser today (profile, product page,
// success page, download emails all did this before this route existed),
// so nothing here makes a file reachable that wasn't already reachable. A
// tampered param just mislabels a row in `downloads`, it doesn't grant
// access to anything new. If that trust model ever needs to tighten, sign
// these params instead of trusting them outright.
//
// Logging is best-effort and never blocks the actual download — if the
// `downloads` table isn't migrated yet, or the insert fails for any other
// reason, this still 302s to the real file.
export async function GET(req: NextRequest, { params }: { params: { productId: string } }) {
  const { productId } = params
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email') || null
  const uid = searchParams.get('uid') || null
  const session = searchParams.get('session') || null
  const source = searchParams.get('source') || null

  const { data: product } = await supabaseAdmin
    .from('products')
    .select('download_url')
    .eq('id', productId)
    .limit(1)

  const downloadUrl = product?.[0]?.download_url
  if (!downloadUrl) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  try {
    // A session id (present on the success page and in the guest/cart
    // confirmation emails) ties back to a specific paid order — prefer the
    // user_id on that order over a client-supplied one when both are
    // somehow present, since the order row is the more authoritative source.
    let resolvedUserId = uid
    if (session) {
      const { data: orderRows } = await supabaseAdmin
        .from('orders')
        .select('user_id')
        .eq('stripe_session_id', session)
        .eq('product_id', productId)
        .limit(1)
      if (orderRows?.[0]?.user_id) resolvedUserId = orderRows[0].user_id
    }

    await supabaseAdmin.from('downloads').insert([{
      product_id: productId,
      user_id: resolvedUserId,
      email,
      order_session_id: session,
      source,
    }])
  } catch (err) {
    console.error('Download logging failed:', err)
  }

  return NextResponse.redirect(downloadUrl)
}
