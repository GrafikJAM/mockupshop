import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { sendOrderNotificationEmail, sendGuestDownloadEmail, sendCartConfirmationEmail, sendFullAccessConfirmationEmail } from '@/lib/email'
import { LICENSE_TIERS } from '@/lib/config'

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
  // Guest cart checkouts (see checkout/route.ts) carry no user_id — orders.
  // user_id must be nullable in Supabase for this insert to succeed; see
  // the migration note left for the site owner. Full Access always requires
  // an account, so a missing user_id there shouldn't happen, but bail
  // defensively rather than record a Full Access grant nobody can use.
  const userId = session.metadata?.user_id || null
  const mode = session.metadata?.mode
  if (!mode) return
  if (mode === 'full-access' && !userId) return

  // Basic affiliate/referral tracking — see src/lib/referral.ts and
  // checkout/route.ts. Purely for later manual lookup (filter `orders` by
  // referral_code in Supabase); nothing here pays anyone automatically.
  const referralCode = session.metadata?.referral_code || null

  // Idempotency guard: Stripe retries webhooks on non-2xx responses, so make sure
  // we don't double-record the same checkout session if this handler runs twice.
  const { data: existing } = await supabaseAdmin
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .limit(1)
  if (existing && existing.length > 0) return

  const buyerEmail = session.customer_details?.email || session.customer_email || 'Unknown'

  if (mode === 'full-access') {
    await supabaseAdmin.from('orders').insert([{
      user_id: userId,
      product_id: null,
      type: 'full-access',
      tier_key: session.metadata?.tierKey || null,
      stripe_session_id: session.id,
      referral_code: referralCode,
    }])
    const label = LICENSE_TIERS.find(t => t.key === session.metadata?.tierKey)?.label
    await sendOrderNotificationEmail({
      buyerEmail,
      items: [`Full Access${label ? ` — ${label}` : ''}`],
      amountTotal: session.amount_total,
      currency: session.currency,
      referralCode,
    })

    // Buyer-facing confirmation — separate from the admin notification
    // above. Full Access always requires an account (checked at the top
    // of this function), so buyerEmail here is always the real signed-in
    // user's email, never a guest/unknown one.
    if (buyerEmail && buyerEmail !== 'Unknown') {
      await sendFullAccessConfirmationEmail({ buyerEmail, tierLabel: label || null })
    }
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
      referral_code: referralCode,
    }))
    if (rows.length > 0) {
      await supabaseAdmin.from('orders').insert(rows)

      // Notification lists product titles rather than raw ids — best-effort
      // lookup; falls back to a generic label per item if it fails. Also
      // pulls download_url, needed below for guest orders' download email.
      let items = productIds.map(() => 'Mockup')
      let productRows: { id: string; title: string; download_url: string }[] = []
      try {
        const { data } = await supabaseAdmin.from('products').select('id, title, download_url').in('id', productIds)
        productRows = data || []
        const titleById = new Map(productRows.map(p => [p.id, p.title]))
        items = productIds.map(id => titleById.get(id) || 'Unknown product')
      } catch {
        // Fall back to the generic labels above.
      }

      await sendOrderNotificationEmail({
        buyerEmail,
        items,
        amountTotal: session.amount_total,
        currency: session.currency,
        referralCode,
      })

      // Buyer-facing confirmation with download links — sent either way,
      // guest or signed-in. Guests get the "this is the only place you'll
      // find these" version since there's no account for them to revisit;
      // signed-in buyers get the version that points back to /profile
      // instead. Skip if the email lookup above somehow came up empty
      // rather than send to a bad address.
      if (buyerEmail && buyerEmail !== 'Unknown') {
        const productById = new Map(productRows.map(p => [p.id, p]))
        const downloadItems = productIds
          .map(id => productById.get(id))
          .filter((p): p is { id: string; title: string; download_url: string } => !!p?.download_url)
          .map(p => ({ title: p.title, downloadUrl: p.download_url }))
        if (!userId) {
          await sendGuestDownloadEmail({ buyerEmail, items: downloadItems })
        } else {
          await sendCartConfirmationEmail({ buyerEmail, items: downloadItems })
        }
      }
    }
  }
}
