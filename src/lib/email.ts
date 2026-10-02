import { Resend } from 'resend'
import { SITE } from './config'

const SITE_URL = 'https://grafikjam.shop'

// Matches the site's light-theme palette (see :root in globals.css) — email
// clients render on a white/light background regardless of the recipient's
// OS theme, so these are fixed values rather than CSS variables.
const BRAND = {
  bg: '#fafaf8',
  card: '#ffffff',
  border: '#ece9e3',
  rowBg: '#faf9f6',
  textPrimary: '#0c0c0b',
  textSecondary: '#6b6865',
  textMuted: '#a09d9a',
  accentYellow: '#f6ec3e',
  accentRed: '#ea1c24',
  ctaBg: '#0c0c0b',
  ctaText: '#f0ede8',
}
// NeueMontreal (the site's display font) isn't available to email clients,
// so this falls back to the same system-sans stack most clients render
// cleanly, same spirit as --font-body's fallback in globals.css.
const FONT = `-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif`

// Shared letterhead/footer wrapper for every customer-facing email, so they
// read as one system instead of each being a one-off plain-text message.
// Table-based layout with inline styles throughout — the only approach that
// renders reliably across Gmail, Apple Mail, and Outlook alike.
function emailLayout(bodyHtml: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:${BRAND.bg};font-family:${FONT};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden;">
            <tr>
              <td style="height:4px;line-height:4px;font-size:4px;background:${BRAND.accentYellow};">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:28px 40px 20px;">
                <img src="${SITE_URL}/email-logo.png" width="92" alt="${escapeHtml(SITE.name)}" style="display:block;height:auto;border:0;">
              </td>
            </tr>
            <tr>
              <td style="padding:4px 40px 36px;">
                ${bodyHtml}
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
            <tr>
              <td style="padding:20px 40px;text-align:center;">
                <p style="margin:0;font-size:12px;color:${BRAND.textMuted};">
                  ${escapeHtml(SITE.name)} · <a href="${SITE_URL}" style="color:${BRAND.textMuted};">grafikjam.shop</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function emailHeading(text: string) {
  return `<h1 style="margin:0 0 14px;font-size:21px;line-height:1.3;font-weight:600;letter-spacing:-0.01em;color:${BRAND.textPrimary};">${escapeHtml(text)}</h1>`
}

function emailParagraph(html: string) {
  return `<p style="margin:0 0 22px;font-size:14px;line-height:1.65;color:${BRAND.textSecondary};">${html}</p>`
}

function emailButton(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:${BRAND.ctaBg};color:${BRAND.ctaText};font-size:13px;font-weight:500;padding:11px 22px;border-radius:8px;text-decoration:none;">${escapeHtml(label)}</a>`
}

// Renders each purchased item as a row with its thumbnail, title, and a
// download button — the HTML counterpart to the plain-text "title + url on
// the next line" lists used in the text versions of these emails, styled to
// match the product rows on /profile. Table-based (not flex) since that's
// what renders reliably across email clients; the thumbnail is skipped
// rather than left as a broken-image icon when a product has none.
function downloadItemsHtml(items: { title: string; downloadUrl: string; image?: string }[]) {
  return items
    .map(i => {
      const thumbCell = i.image
        ? `<td width="64" style="width:64px;padding:12px 0 12px 12px;vertical-align:middle;">
            <img src="${i.image}" width="56" height="56" alt="" style="display:block;width:56px;height:56px;object-fit:cover;border-radius:6px;background:${BRAND.border};">
          </td>`
        : ''
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 10px;background:${BRAND.rowBg};border:1px solid ${BRAND.border};border-radius:10px;">
        <tr>
          ${thumbCell}
          <td style="padding:${i.image ? '12px 16px 12px 14px' : '16px 18px'};vertical-align:middle;">
            <p style="margin:0 0 12px;font-size:14px;font-weight:500;color:${BRAND.textPrimary};">${escapeHtml(i.title)}</p>
            ${emailButton(i.downloadUrl, 'Download')}
          </td>
        </tr>
      </table>`
    })
    .join('')
}

function emailNote(html: string) {
  return `<p style="margin:22px 0 0;font-size:12px;line-height:1.6;color:${BRAND.textMuted};">${html}</p>`
}

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
  items: { title: string; downloadUrl: string; image?: string }[]
}) {
  if (!params.items.length) return

  const linesText = params.items.map(i => `${i.title}\n${i.downloadUrl}`).join('\n\n')

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
      html: emailLayout([
        emailHeading('Thanks for your purchase!'),
        emailParagraph(`Here${params.items.length > 1 ? ' are your download links' : "'s your download link"} from ${escapeHtml(SITE.name)}:`),
        downloadItemsHtml(params.items),
        emailNote("These links aren't saved to an account, so keep this email — it's the only place you'll find them."),
      ].join('')),
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
  items: { title: string; downloadUrl: string; image?: string }[]
}) {
  if (!params.items.length) return

  const linesText = params.items.map(i => `${i.title}\n${i.downloadUrl}`).join('\n\n')

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
      html: emailLayout([
        emailHeading('Thanks for your purchase!'),
        emailParagraph(`Here${params.items.length > 1 ? ' are your download links' : "'s your download link"} from ${escapeHtml(SITE.name)}:`),
        downloadItemsHtml(params.items),
        emailNote(`You can always come back for these later from <a href="${SITE_URL}/profile" style="color:${BRAND.textMuted};text-decoration:underline;">your profile</a>.`),
      ].join('')),
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
      html: emailLayout([
        emailHeading(`You're in — Full Access${label}`),
        emailParagraph(`Thanks for grabbing Full Access${escapeHtml(label)} on ${escapeHtml(SITE.name)}! You now have lifetime access to every mockup in the library — including everything added after today, no extra charge.`),
        emailButton(`${SITE_URL}/mockups`, 'Browse the library'),
      ].join('')),
    })
  } catch (err) {
    console.error('Full Access confirmation email failed:', err)
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}
