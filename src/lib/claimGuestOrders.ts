import { supabaseAdmin } from './supabaseAdmin'
import { getStripe } from './stripe'

// Guest checkouts (see api/checkout) are saved with user_id = null. When a
// buyer later signs in with the same email — sign-in is by emailed code, so
// that address is verified — attach those orders to their account, so their
// Purchases, downloads and Invoices all show them. Matches only this shop's
// own paid Checkout sessions (metadata.mode is always set by api/checkout),
// and only ever fills in rows that have no owner yet.
export async function claimGuestOrders(user: { id: string; email?: string | null }) {
  if (!user.email) return
  try {
    const sessions = await getStripe().checkout.sessions.list({
      customer_details: { email: user.email },
      status: 'complete',
      limit: 100,
    })
    const ids = sessions.data
      .filter(s => s.payment_status === 'paid' || s.payment_status === 'no_payment_required')
      .filter(s => s.metadata?.mode === 'full-access' || s.metadata?.mode === 'cart')
      .map(s => s.id)
    if (ids.length === 0) return
    await supabaseAdmin
      .from('orders')
      .update({ user_id: user.id })
      .in('stripe_session_id', ids)
      .is('user_id', null)
  } catch (err) {
    // Best-effort: never break the page over this.
    console.error('claimGuestOrders failed:', err)
  }
}
