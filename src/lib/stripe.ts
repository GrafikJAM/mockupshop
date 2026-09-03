import Stripe from 'stripe'

let _stripe: Stripe | null = null

// Lazily instantiated so simply importing this module — which happens when
// Next.js loads route files during build-time page-data collection — never
// throws just because STRIPE_SECRET_KEY isn't set in that environment. The
// error only surfaces if a route handler actually runs without a key.
export function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-08-26.dahlia',
    })
  }
  return _stripe
}
