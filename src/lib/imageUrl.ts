// Product images are hosted as direct Dropbox share links. Depending on how
// each link was generated, the stored URL can carry `dl=1` (forces a
// download — Dropbox sends `Content-Disposition: attachment`), `dl=0`, or no
// `dl` param at all. Mobile Safari/Chrome are much stricter than desktop
// about refusing to render an <img> inline when the server says "download
// this instead," so `dl=1` links show up as a broken-image icon on mobile
// even though they work fine on desktop.
//
// Normalizing every Dropbox URL to `raw=1` (Dropbox's actual "serve this
// inline, no download header" flag) fixes that everywhere the image is
// used — thumbnails, OG/social previews, JSON-LD — without needing to
// hand-edit every product's stored URL.
export function toDirectImageUrl(url: string | null | undefined): string {
  if (!url) return ''
  try {
    const parsed = new URL(url)
    const isDropbox =
      parsed.hostname === 'dl.dropboxusercontent.com' ||
      parsed.hostname === 'www.dropbox.com' ||
      parsed.hostname === 'dropbox.com'
    if (!isDropbox) return url

    parsed.searchParams.delete('dl')
    parsed.searchParams.set('raw', '1')
    return parsed.toString()
  } catch {
    // Not a parseable URL (shouldn't happen for stored image URLs) — return
    // as-is rather than throwing.
    return url
  }
}

// Product photos are full-size originals (often several MB). Served as-is,
// every page view pulled them straight from Supabase Storage, which blew
// through the plan's bandwidth. This routes them through Vercel's image
// optimizer instead: visitors get a resized WebP, and Vercel caches each
// size for a month (see next.config.js), so Supabase serves each file only
// about once. Only known hosts are optimized; anything else is returned
// unchanged. `width` must be one of the sizes in next.config.js.
const OPTIMIZE_HOSTS = [/\.supabase\.co$/, /(^|\.)dropboxusercontent\.com$/, /(^|\.)dropbox\.com$/]
export const IMAGE_WIDTHS = [256, 384, 640, 828, 1080, 1200, 1920] as const
type Width = (typeof IMAGE_WIDTHS)[number]

export function resizedImageUrl(url: string | null | undefined, width: Width): string {
  const direct = toDirectImageUrl(url)
  if (!direct) return ''
  try {
    const host = new URL(direct).hostname
    if (!OPTIMIZE_HOSTS.some(re => re.test(host))) return direct
  } catch {
    return direct
  }
  return `/_next/image?url=${encodeURIComponent(direct)}&w=${width}&q=75`
}

export function resizedSrcSet(url: string | null | undefined, widths: Width[]): string {
  return widths.map(w => `${resizedImageUrl(url, w)} ${w}w`).join(', ')
}
