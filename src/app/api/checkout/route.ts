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

    let user: { id: string; email?: string | null } | null = null
    if (token) {
      const { data, error: userError } = await supabase.auth.getUser(token)
      if (!userError && data.user) user = data.user
    }

    const body = await req.json()
    const origin = req.nextUrl.origin

    // Full Access always requires an account — it grants "everything I make
    // next" too, and a one-time guest email can't cover mockups that don't
    // exist yet. Single/cart purchases can go through as a guest instead,
    // sign-in stays the primary path (offered first in the UI) but isn't
    // required — as long as a valid email came along to send the download
    // link(s) to, since with no account that email is the only place those
    // links will ever live.
    let guestEmail: string | null = null
    if (!user) {
      if (body.mode === 'full-access') {
        return NextResponse.json({ error: 'Please sign in to check out.' }, { status: 401 })
      }
      const rawEmail = typeof body.guestEmail === 'string' ? body.guestEmail.trim() : ''
      if (!rawEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
        return NextResponse.json({ error: 'Please sign in, or enter a valid email to check out as a guest.' }, { status: 401 })
      }
      guestEmail = rawEmail
    }

    let line_items: { price_data: any; quantity: number }[] = []
    const metadata: Record<string, string> = user ? { user_id: user.id } : { guest: 'true' }

    // Basic affiliate/referral tracking — see src/lib/referral.ts. Purely
    // informational (no automatic payouts): it just rides along on the
    // order row so referred sales can be found and paid out manually.
    if (typeof body.referralCode === 'string') {
      const cleanReferral = body.referralCode.trim().slice(0, 40).replace(/[^a-zA-Z0-9_-]/g, '')
      if (cleanReferral) metadata.referral_code = cleanReferral
    }

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

    const isFullAccess = body.mode === 'full-access'

    // Promo codes (e.g. the Black Friday BLACKFRIDAY35 code) only ever apply
    // to Full Access purchases, never single-mockup cart checkouts — see
    // claude/content-and-black-friday-plan.md. If the client sent a
    // promoCode (captured from a ?promo= link or the homepage banner — see
    // src/lib/promo.ts) and it resolves to a real, currently-active Stripe
    // promotion code, pre-apply it so the discount shows up on the Checkout
    // page without the buyer having to type anything in. If it doesn't
    // resolve (typo, expired, or none supplied), fall back to letting
    // full-access buyers type a code in manually at checkout.
    let discounts: { promotion_code: string }[] | undefined
    if (isFullAccess && typeof body.promoCode === 'string' && body.promoCode.trim()) {
      const cleanPromo = body.promoCode.trim().slice(0, 40).toUpperCase().replace(/[^A-Z0-9_-]/g, '')
      if (cleanPromo) {
        try {
          const found = await getStripe().promotionCodes.list({ code: cleanPromo, active: true, limit: 1 })
          if (found.data[0]) discounts = [{ promotion_code: found.data[0].id }]
        } catch {
          // Lookup failed (bad code, API hiccup) — fall through to manual entry below.
        }
      }
    }

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items,
      metadata,
      customer_email: user?.email || guestEmail || undefined,
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
      // Either a pre-applied discount (a captured/link-based promo code
      // resolved above — Full Access only, e.g. BLACKFRIDAY35) or the
      // option to type a promotion code in manually at checkout. Manual
      // entry is available on both Full Access and single-mockup cart
      // checkouts — cart purchases just never get a code auto-applied,
      // so a Full-Access-only code like BLACKFRIDAY35 can't silently
      // discount an individual mockup; any promo code meant for cart
      // purchases has to be typed in on purpose.
      // Stripe doesn't allow combining `discounts` with `allow_promotion_codes`.
      ...(discounts ? { discounts } : { allow_promotion_codes: true }),
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
