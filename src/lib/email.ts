import { Resend } from 'resend'
import { SITE } from './config'

let _resend: Resend | null = null

// Lazily instantiated for the same reason as getStripe() in ./stripe.ts —
// importing this module (e.g. transitively, when Next.js collects route
// data at build time) must never throw just because RESEND_API_KEY isn't
// set in that environment. The error only surfaces if something actually
// tries to send.
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set')
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

function formatAmount(amountTotal: number | null, currency: string | null) {
  if (amountTotal == null || !currency) return null
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amountTotal / 100)
  } catch {
    return `${(amountTotal / 100).toFixed(2)} ${currency.toUpperCase()}`
  }
}

export async function sendOrderNotificationEmail(params: {
  buyerEmail: string
  items: string[]
  amountTotal: number | null
  currency: string | null
  referralCode?: string | null
}) {
  const to = process.env.ORDER_NOTIFICATION_EMAIL
  if (!to) return // Not configured — silently skip rather than error the webhook.

  const amount = formatAmount(params.amountTotal, params.currency)
  const itemsList = params.items.map(i => `- ${i}`).join('\n')

  try {
    await getResend().emails.send({
      from: process.env.ORDER_NOTIFICATION_FROM || 'GrafikJAM Orders <onboarding@resend.dev>',
      to,
      subject: `New order${amount ? ` — ${amount}` : ''} on ${SITE.name}`,
      text: [
        `New order on ${SITE.name}.`,
        '',
        `Buyer: ${params.buyerEmail}`,
        amount ? `Amount: ${amount}` : null,
        params.referralCode ? `Referral code: ${params.referralCode}` : null,
        '',
        'Items:',
        itemsList,
      ].filter(Boolean).join('\n'),
    })
  } catch (err) {
    // Never let a notification failure affect order recording or the
    // webhook's response to Stripe — just log it for later debugging.
    console.error('Order notification email failed:', err)
  }
}
