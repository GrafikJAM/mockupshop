import { Resend } from 'resend'
import { SITE } from './config'

const SITE_URL = 'https://grafikjam.shop'

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
  // Set by the one-time admin backfill (see admin/orders/backfill-emails)
  // for orders that were placed before RESEND_API_KEY/ORDER_NOTIFICATION_EMAIL
  // were actually configured, so the notification never went out at the
  // time. Adds a note + the real order date so it doesn't read as a fresh
  // order landing right now.
  backfill?: { placedAt: string }
}) {
  const to = process.env.ORDER_NOTIFICATION_EMAIL
  if (!to) return // Not configured — silently skip rather than error the webhook.

  const amount = formatAmount(params.amountTotal, params.currency)
  const itemsList = params.items.map(i => `- ${i}`).join('\n')

  try {
    await getResend().emails.send({
      from: process.env.ORDER_NOTIFICATION_FROM || 'GrafikJAM Orders <onboarding@resend.dev>',
      to,
      subject: `${params.backfill ? '[Backfill] ' : ''}New order${amount ? ` — ${amount}` : ''} on ${SITE.name}`,
      text: [
        params.backfill
          ? `Backfilled notification for an order placed on ${new Date(params.backfill.placedAt).toLocaleString()} — email notifications weren't configured yet at the time, so this didn't go out until now.`
          : `New order on ${SITE.name}.`,
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

// Sent to guest (not-signed-in) buyers right after a cart purchase — this
// email IS the delivery mechanism for them, since with no account there's
// no /account page to revisit later. Unlike sendOrderNotificationEmail
// above, this always attempts to send (not gated behind
// ORDER_NOTIFICATION_EMAIL, which is the *admin's* address) and fails
// silently on error rather than breaking order recording, same as above.
export async function sendGuestDownloadEmail(params: {
  buyerEmail: string
  items: { title: string; downloadUrl: string }[]
}) {
  if (!params.items.length) return

  const linesText = params.items.map(i => `${i.title}\n${i.downloadUrl}`).join('\n\n')
  const linesHtml = params.items
    .map(i => `<p style="margin:0 0 16px;"><strong>${escapeHtml(i.title)}</strong><br/><a href="${i.downloadUrl}">${i.downloadUrl}</a></p>`)
    .join('')

  try {
    await getResend().emails.send({
      from: process.env.ORDER_NOTIFICATION_FROM || 'GrafikJAM Orders <onboarding@resend.dev>',
      to: params.buyerEmail,
      subject: `Your ${SITE.name} download${params.items.length > 1 ? 's' : ''}`,
      text: [
        `Thanks for your purchase from ${SITE.name}!`,
        '',
        `Here${params.items.length > 1 ? ' are your download links' : "'s your download link"}:`,
        '',
        linesText,
        '',
        "These links aren't saved to an account, so keep this email — it's the only place you'll find them.",
      ].join('\n'),
      html: [
        `<p>Thanks for your purchase from ${escapeHtml(SITE.name)}!</p>`,
        `<p>Here${params.items.length > 1 ? ' are your download links' : "'s your download link"}:</p>`,
        linesHtml,
        `<p style="color:#666;font-size:13px;">These links aren't saved to an account, so keep this email — it's the only place you'll find them.</p>`,
      ].join(''),
    })
  } catch (err) {
    console.error('Guest download email failed:', err)
  }
}

// Sent to the buyer right after a *signed-in* cart purchase — same
// download links as the guest email above, but they're also always
// reachable again from /profile since there's an account for them to live
// in, so the copy doesn't carry the guest email's "this is the only place
// you'll find them" warning.
export async function sendCartConfirmationEmail(params: {
  buyerEmail: string
  items: { title: string; downloadUrl: string }[]
}) {
  if (!params.items.length) return

  const linesText = params.items.map(i => `${i.title}\n${i.downloadUrl}`).join('\n\n')
  const linesHtml = params.items
    .map(i => `<p style="margin:0 0 16px;"><strong>${escapeHtml(i.title)}</strong><br/><a href="${i.downloadUrl}">${i.downloadUrl}</a></p>`)
    .join('')

  try {
    await getResend().emails.send({
      from: process.env.ORDER_NOTIFICATION_FROM || 'GrafikJAM Orders <onboarding@resend.dev>',
      to: params.buyerEmail,
      subject: `Your ${SITE.name} download${params.items.length > 1 ? 's' : ''}`,
      text: [
        `Thanks for your purchase from ${SITE.name}!`,
        '',
        `Here${params.items.length > 1 ? ' are your download links' : "'s your download link"}:`,
        '',
        linesText,
        '',
        `You can always come back for these later from your profile: ${SITE_URL}/profile`,
      ].join('\n'),
      html: [
        `<p>Thanks for your purchase from ${escapeHtml(SITE.name)}!</p>`,
        `<p>Here${params.items.length > 1 ? ' are your download links' : "'s your download link"}:</p>`,
        linesHtml,
        `<p style="color:#666;font-size:13px;">You can always come back for these later from <a href="${SITE_URL}/profile">your profile</a>.</p>`,
      ].join(''),
    })
  } catch (err) {
    console.error('Cart confirmation email failed:', err)
  }
}

// Sent to the buyer right after a Full Access purchase. Full Access always
// requires an account (see checkout/route.ts — there's no guest path for
// it), so unlike the two functions above this never carries direct
// download links: access is granted account-wide rather than per file, so
// it just confirms the purchase and points back to the catalog.
export async function sendFullAccessConfirmationEmail(params: {
  buyerEmail: string
  tierLabel: string | null
}) {
  const label = params.tierLabel ? ` — ${params.tierLabel}` : ''

  try {
    await getResend().emails.send({
      from: process.env.ORDER_NOTIFICATION_FROM || 'GrafikJAM Orders <onboarding@resend.dev>',
      to: params.buyerEmail,
      subject: `You're in — Full Access to ${SITE.name}`,
      text: [
        `Thanks for grabbing Full Access${label} on ${SITE.name}!`,
        '',
        "You now have lifetime access to every mockup in the library — including everything added after today, no extra charge.",
        '',
        `Browse and download anything, any time: ${SITE_URL}/mockups`,
      ].join('\n'),
      html: [
        `<p>Thanks for grabbing Full Access${escapeHtml(label)} on ${escapeHtml(SITE.name)}!</p>`,
        `<p>You now have lifetime access to every mockup in the library — including everything added after today, no extra charge.</p>`,
        `<p><a href="${SITE_URL}/mockups">Browse and download anything, any time →</a></p>`,
      ].join(''),
    })
  } catch (err) {
    console.error('Full Access confirmation email failed:', err)
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}
