import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getStripe } from '@/lib/stripe'
import { sendGuestDownloadEmail, sendCartConfirmationEmail, sendFullAccessConfirmationEmail } from '@/lib/email'
import { toDirectImageUrl } from '@/lib/imageUrl'
import { LICENSE_TIERS } from '@/lib/config'

const SITE_URL = 'https://grafikjam.shop'

type OrderRow = {
  id: string
  user_id: string | null
  product_id: string | null
  type: string
  tier_key: string | null
  stripe_session_id: string | null
}

// Lets the admin manually re-trigger a buyer's confirmation/download email
// for a given Stripe Checkout session — the fix for "customer says they
// never got their email" (e.g. because ORDER_NOTIFICATION_FROM wasn't set
// yet when they originally checked out). Reuses the exact same send
// functions and tracked-download-link construction as the webhook, so the
// resent email is identical in shape to what would have gone out the first
// time, just with a distinguishable `source` on the download links.
export async function POST(req: NextRequest) {
  const adminPassword = req.headers.get('x-admin-password')
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { sessionId } = await req.json().catch(() => ({ sessionId: null }))
  if (!sessionId || typeof sessionId !== 'string') {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, user_id, product_id, type, tier_key, stripe_session_id')
    .eq('stripe_session_id', sessionId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const group = (data || []) as OrderRow[]
  if (group.length === 0) return NextResponse.json({ error: 'No order found for that session' }, { status: 404 })

  const first = group[0]
  const userId = first.user_id

  // Resolve the buyer's email the same way admin/orders does: a signed-in
  // buyer's email comes from Supabase auth; a guest's only exists on the
  // Stripe session itself.
  let buyerEmail: string | null = null
  if (userId) {
    try {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId)
      buyerEmail = userData?.user?.email || null
    } catch {
      // Fall through — still try the Stripe session below.
    }
  }
  if (!buyerEmail) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId)
      buyerEmail = session.customer_details?.email || session.customer_email || null
    } catch {
      // Leave null — handled below.
    }
  }
  if (!buyerEmail) {
    return NextResponse.json({ error: "Couldn't resolve a buyer email for this order" }, { status: 422 })
  }

  if (first.type === 'full-access') {
    const label = LICENSE_TIERS.find(t => t.key === first.tier_key)?.label || null
    await sendFullAccessConfirmationEmail({ buyerEmail, tierLabel: label })
    return NextResponse.json({ ok: true, email: buyerEmail })
  }

  const productIds = Array.from(new Set(group.map(o => o.product_id).filter(Boolean) as string[]))
  const { data: productRows } = await supabaseAdmin
    .from('products')
    .select('id, title, download_url, image_default')
    .in('id', productIds)
  const productById = new Map((productRows || []).map(p => [p.id, p]))

  const downloadItems = productIds
    .map(id => productById.get(id))
    .filter((p): p is { id: string; title: string; download_url: string; image_default: string } => !!p?.download_url)
    .map(p => ({
      title: p.title,
      downloadUrl: `${SITE_URL}/api/dl/${p.id}?session=${encodeURIComponent(sessionId)}&email=${encodeURIComponent(buyerEmail!)}&source=${userId ? 'email-cart-resend' : 'email-guest-resend'}`,
      image: toDirectImageUrl(p.image_default),
    }))

  if (downloadItems.length === 0) {
    return NextResponse.json({ error: 'No downloadable products found for this order' }, { status: 422 })
  }

  if (userId) {
    await sendCartConfirmationEmail({ buyerEmail, items: downloadItems })
  } else {
    await sendGuestDownloadEmail({ buyerEmail, items: downloadItems })
  }

  return NextResponse.json({ ok: true, email: buyerEmail })
}
