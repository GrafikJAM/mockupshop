import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })

  let session
  try {
    session = await getStripe().checkout.sessions.retrieve(sessionId)
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
  }

  if (session.payment_status !== 'paid') {
    return NextResponse.json({ error: 'Payment not completed' }, { status: 402 })
  }

  const mode = session.metadata?.mode
  // Surfaced so the success page can route its download links through
  // /api/dl with an identity attached (see that route) — same email Stripe
  // itself collected at checkout, guest or signed-in either way.
  const email = session.customer_details?.email || session.customer_email || null

  if (mode === 'full-access') {
    const { data, error } = await supabase
      .from('products')
      .select('id, title, download_url')
      .eq('active', true)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ mode: 'full-access', products: data, email })
  }

  if (mode === 'cart') {
    const ids = (session.metadata?.productIds || '').split(',').filter(Boolean)
    if (ids.length === 0) return NextResponse.json({ mode: 'cart', products: [], email })
    const { data, error } = await supabase
      .from('products')
      .select('id, title, download_url')
      .in('id', ids)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ mode: 'cart', products: data, email })
  }

  return NextResponse.json({ error: 'Unknown purchase type' }, { status: 400 })
}
