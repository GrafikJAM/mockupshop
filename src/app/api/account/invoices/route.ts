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
