import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')
  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig!, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.payment_status === 'paid') {
      await recordOrder(session)
    }
  }

  return NextResponse.json({ received: true })
}

async function recordOrder(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const mode = session.metadata?.mode
  if (!userId || !mode) return

  // Idempotency guard: Stripe retries webhooks on non-2xx responses, so make sure
  // we don't double-record the same checkout session if this handler runs twice.
  const { data: existing } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .limit(1)
  if (existing && existing.length > 0) return

  if (mode === 'full-access') {
    await supabaseAdmin.from('orders').insert([{
      user_id: userId,
      product_id: null,
      type: 'full-access',
      tier_key: session.metadata?.tierKey || null,
      stripe_session_id: session.id,
    }])
    return
  }

  if (mode === 'cart') {
    const productIds = (session.metadata?.productIds || '').split(',').filter(Boolean)
    const tierKeys = (session.metadata?.tierKeys || '').split(',')
    const rows = productIds.map((productId, i) => ({
      user_id: userId,
      product_id: productId,
      type: 'product',
      tier_key: tierKeys[i] || null,
      stripe_session_id: session.id,
    }))
    if (rows.length > 0) await supabaseAdmin.from('orders').insert(rows)
  }
}
