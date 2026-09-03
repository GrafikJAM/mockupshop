import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import { LICENSE_TIERS } from '@/lib/config'

type CartCheckoutItem = {
  productId: string
  title: string
  tierKey: string
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) return NextResponse.json({ error: 'Please sign in to check out.' }, { status: 401 })

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) return NextResponse.json({ error: 'Please sign in to check out.' }, { status: 401 })

    const body = await req.json()
    const origin = req.nextUrl.origin

    let line_items: { price_data: any; quantity: number }[] = []
    const metadata: Record<string, string> = { user_id: user.id }

    if (body.mode === 'full-access') {
      // Full Access price is tiered (Freelancer/Studio/Commercial) — always resolved
      // server-side from LICENSE_TIERS using the client-supplied tierKey, never a
      // client-supplied price.
      const tier = LICENSE_TIERS.find(t => t.key === body.tierKey)
      if (!tier) {
        return NextResponse.json({ error: 'Invalid license tier' }, { status: 400 })
      }
      line_items = [{
        price_data: {
          currency: 'usd',
          product_data: { name: `Full Access Pass — ${tier.label} — all mockups, lifetime access` },
          unit_amount: Math.round(tier.fullAccessPrice * 100),
        },
        quantity: 1,
      }]
      metadata.mode = 'full-access'
      metadata.tierKey = tier.key
    } else if (body.mode === 'cart') {
      const items: CartCheckoutItem[] = Array.isArray(body.items) ? body.items : []
      if (items.length === 0) {
        return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
      }

      // Prices are always looked up server-side from LICENSE_TIERS — never trust a price sent by the client.
      for (const item of items) {
        const tier = LICENSE_TIERS.find(t => t.key === item.tierKey)
        if (!tier || !item.productId || !item.title) {
          return NextResponse.json({ error: 'Invalid cart item' }, { status: 400 })
        }
      }

      line_items = items.map(item => {
        const tier = LICENSE_TIERS.find(t => t.key === item.tierKey)!
        return {
          price_data: {
            currency: 'usd',
            product_data: { name: `${item.title} — ${tier.label} License` },
            unit_amount: Math.round(tier.price * 100),
          },
          quantity: 1,
        }
      })

      metadata.mode = 'cart'
      metadata.productIds = items.map(i => i.productId).join(',')
      metadata.tierKeys = items.map(i => i.tierKey).join(',')
    } else {
      return NextResponse.json({ error: 'Invalid checkout mode' }, { status: 400 })
    }

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items,
      metadata,
      customer_email: user.email || undefined,
      // Always create a real Stripe Customer for this purchase (rather than
      // just a bare email) so the billing name/address/tax ID collected
      // below actually attach to something and carry through to the invoice.
      customer_creation: 'always',
      // Collects full billing name + address at checkout, so invoices show a
      // proper "Bill to" (not just an email) — needed for these to hold up
      // as real accounting documents for business clients.
      billing_address_collection: 'required',
      // Lets business buyers enter their VAT/Tax ID at checkout; Stripe
      // validates it and prints it on the invoice — required for EU B2B
      // reverse-charge accounting and generally expected on business invoices.
      tax_id_collection: { enabled: true },
      // Optional company name field, separate from the personal/cardholder
      // name on the billing address, since invoices are often addressed to
      // a company rather than the individual buyer.
      custom_fields: [
        {
          key: 'company_name',
          label: { type: 'custom', custom: 'Company name (for invoice)' },
          type: 'text',
          optional: true,
        },
      ],
      // Lets a Stripe promotion code (e.g. a 100%-off test coupon) be entered
      // on the Checkout page itself, so the full purchase flow — including
      // the webhook that grants access — can be exercised for $0.
      allow_promotion_codes: true,
      // Generates a real Stripe invoice for every order (even $0 ones from a
      // 100%-off promo code) so buyers can see/download it from their profile.
      invoice_creation: { enabled: true },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 })
  }
}
