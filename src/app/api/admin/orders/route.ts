import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getStripe } from '@/lib/stripe'
import { sendOrderNotificationEmail } from '@/lib/email'
import { LICENSE_TIERS } from '@/lib/config'

// Same staleness concern as account/purchases and account/invoices — force
// this to always hit Supabase/Stripe live rather than a cached response.
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

type OrderRow = {
  id: string
  user_id: string | null
  product_id: string | null
  type: string
  tier_key: string | null
  stripe_session_id: string | null
  referral_code: string | null
  created_at: string
}

type GroupedOrder = {
  sessionId: string
  type: string
  email: string
  guest: boolean
  items: string[]
  amountTotal: number | null
  currency: string | null
  referralCode: string | null
  createdAt: string
}

function tierLabel(tierKey: string | null) {
  return LICENSE_TIERS.find(t => t.key === tierKey)?.label || null
}

// Shared by GET (admin order list) and POST (one-time notification
// backfill below) — both need the same "one order per Stripe session,
// with buyer email/amount resolved" view of the orders table.
async function fetchGroupedOrders(): Promise<GroupedOrder[]> {
  // High enough that "All time" earnings stay accurate for a good while —
  // the admin UI sums straight off this list, so silently truncating it
  // would silently under-report real revenue rather than just trimming
  // the visible list.
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, user_id, product_id, type, tier_key, stripe_session_id, referral_code, created_at')
    .order('created_at', { ascending: false })
    .limit(5000)

  if (error) throw new Error(error.message)
  const rows = (data || []) as OrderRow[]

  // A single Stripe Checkout Session can insert several `orders` rows (a
  // cart purchase inserts one row per product) — group back down to one
  // order per session, same approach as account/invoices/route.ts.
  const bySession = new Map<string, OrderRow[]>()
  const noSession: OrderRow[] = []
  for (const o of rows) {
    if (!o.stripe_session_id) { noSession.push(o); continue }
    const list = bySession.get(o.stripe_session_id) || []
    list.push(o)
    bySession.set(o.stripe_session_id, list)
  }

  const productIds = Array.from(new Set(rows.map(o => o.product_id).filter(Boolean) as string[]))
  const { data: productRows } = productIds.length
    ? await supabaseAdmin.from('products').select('id, title').in('id', productIds)
    : { data: [] as { id: string; title: string }[] }
  const productTitleById = new Map((productRows || []).map(p => [p.id, p.title]))

  const userIds = Array.from(new Set(rows.map(o => o.user_id).filter(Boolean) as string[]))
  const emailById = new Map<string, string>()
  await Promise.all(userIds.map(async id => {
    try {
      const { data } = await supabaseAdmin.auth.admin.getUserById(id)
      if (data?.user?.email) emailById.set(id, data.user.email)
    } catch {
      // Left unresolved — shown as "Unknown" below rather than failing the whole list.
    }
  }))

  function itemsFor(group: OrderRow[]) {
    const first = group[0]
    if (first.type === 'full-access') {
      const label = tierLabel(first.tier_key)
      return [`Full Access${label ? ` — ${label}` : ''}`]
    }
    return group.map(o => productTitleById.get(o.product_id || '') || 'Unknown product')
  }

  const stripe = getStripe()

  const grouped = await Promise.all(
    Array.from(bySession.entries()).map(async ([sessionId, group]) => {
      const first = group[0]
      let amountTotal: number | null = null
      let currency: string | null = null
      let created: number | null = null
      let sessionEmail: string | null = null
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId)
        amountTotal = session.amount_total
        currency = session.currency
        created = session.created
        // Guest orders (see checkout/route.ts) have no user_id to resolve
        // via Supabase auth below — Stripe's own record of the checkout
        // email is the only place left to find it.
        sessionEmail = session.customer_details?.email || session.customer_email || null
      } catch {
        // Stripe lookup failed (deleted/expired test session, etc.) — fall
        // back to what we already have locally instead of dropping the order.
      }
      return {
        sessionId,
        type: first.type,
        email: (first.user_id && emailById.get(first.user_id)) || sessionEmail || 'Unknown',
        guest: !first.user_id,
        items: itemsFor(group),
        amountTotal,
        currency,
        referralCode: first.referral_code,
        createdAt: created ? new Date(created * 1000).toISOString() : first.created_at,
      }
    })
  )

  // Rows that somehow never got a stripe_session_id (shouldn't normally
  // happen) still get surfaced rather than silently dropped.
  const orphaned = noSession.map(o => ({
    sessionId: o.id,
    type: o.type,
    email: (o.user_id && emailById.get(o.user_id)) || 'Unknown',
    guest: !o.user_id,
    items: itemsFor([o]),
    amountTotal: null as number | null,
    currency: null as string | null,
    referralCode: o.referral_code,
    createdAt: o.created_at,
  }))

  return [...grouped, ...orphaned].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function GET(req: NextRequest) {
  const adminPassword = req.headers.get('x-admin-password')
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await fetchGroupedOrders()
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to load orders' }, { status: 500 })
  }
}

// One-time utility: sends the admin order-notification email for every
// existing order, for the stretch of time RESEND_API_KEY/
// ORDER_NOTIFICATION_EMAIL were missing in Production so nothing ever
// actually went out (see the "wtf, didn't get my order email" thread —
// those vars had been filled into the Vercel dialog but never saved).
// Safe to call more than once in the sense that it won't corrupt any
// data, but it WILL re-send duplicate backfill emails for every order
// each time it's hit — this is meant to be run once, by hand, not wired
// into any UI button.
export async function POST(req: NextRequest) {
  const adminPassword = req.headers.get('x-admin-password')
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let orders: GroupedOrder[]
  try {
    orders = await fetchGroupedOrders()
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to load orders' }, { status: 500 })
  }

  let sent = 0
  let skipped = 0
  for (const o of orders) {
    if (!o.email || o.email === 'Unknown') { skipped++; continue }
    await sendOrderNotificationEmail({
      buyerEmail: o.email,
      items: o.items,
      amountTotal: o.amountTotal,
      currency: o.currency,
      referralCode: o.referralCode,
      backfill: { placedAt: o.createdAt },
    })
    sent++
  }

  return NextResponse.json({ total: orders.length, sent, skipped })
}
