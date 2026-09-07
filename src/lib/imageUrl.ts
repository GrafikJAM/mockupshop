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
