import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { getStripe } from '@/lib/stripe'

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

  const { data: orders, error: ordersError } = await supabaseAdmin
    .from('orders')
    .select('stripe_session_id, type, tier_key')
    .eq('user_id', user.id)

  if (ordersError) return NextResponse.json({ error: ordersError.message }, { status: 500 })

  // A single cart checkout inserts one order row per product but they all
  // share one Stripe session — collapse those back down to one invoice.
  const seen = new Map<string, { type: string; tierKey: string | null }>()
  for (const o of orders || []) {
    if (!o.stripe_session_id) continue
    if (!seen.has(o.stripe_session_id)) {
      seen.set(o.stripe_session_id, { type: o.type, tierKey: o.tier_key })
    }
  }

  const stripe = getStripe()

  // Guest checkouts (see checkout/route.ts) are saved with no user_id, so a
  // buyer who paid as a guest and signed in later with the same email saw
  // an empty Invoices tab. Sign-in is by emailed code, so the account email
  // is verified — also pick up every paid Stripe Checkout session made with
  // that email.
  if (user.email) {
    try {
      const byEmail = await stripe.checkout.sessions.list({
        customer_details: { email: user.email },
        status: 'complete',
        limit: 100,
      })
      for (const s of byEmail.data) {
        if (s.payment_status !== 'paid' && s.payment_status !== 'no_payment_required') continue
        // Only this shop's own checkouts (checkout/route.ts always sets mode).
        if (s.metadata?.mode !== 'full-access' && s.metadata?.mode !== 'cart') continue
        if (seen.has(s.id)) continue
        seen.set(s.id, {
          type: s.metadata?.mode === 'full-access' ? 'full-access' : 'product',
          tierKey: s.metadata?.tierKey || null,
        })
      }
    } catch {
      // Stripe lookup failed — still return whatever the orders table had.
    }
  }

  const invoices = await Promise.all(
    Array.from(seen.entries()).map(async ([sessionId, info]) => {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['invoice'] })
        const invoice = typeof session.invoice === 'object' ? session.invoice : null
        return {
          sessionId,
          type: info.type,
          tierKey: info.tierKey,
          created: session.created,
          amountTotal: session.amount_total,
          currency: session.currency,
          invoiceNumber: invoice?.number || null,
          hostedInvoiceUrl: invoice?.hosted_invoice_url || null,
          invoicePdf: invoice?.invoice_pdf || null,
        }
      } catch {
        return {
          sessionId,
          type: info.type,
          tierKey: info.tierKey,
          created: null,
          amountTotal: null,
          currency: null,
          invoiceNumber: null,
          hostedInvoiceUrl: null,
          invoicePdf: null,
        }
      }
    })
  )

  invoices.sort((a, b) => (b.created || 0) - (a.created || 0))

  return NextResponse.json({ invoices })
}
