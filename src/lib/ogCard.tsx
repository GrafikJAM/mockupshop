import { resizedImageUrl } from './imageUrl'

// Shared pieces for the social preview images (opengraph-image.tsx files).
// Previews are what people see when a link is pasted into WhatsApp, iMessage,
// Slack, X, Facebook etc. — they match the site: dark background, Neue
// Montreal, real mockup photos.

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_BG = '#171715'
export const OG_TEXT = '#e2ded5'
export const OG_MUTED = '#8a877f'
export const OG_RED = '#ea1c24'
export const OG_YELLOW = '#f6ec3e'

// Images are fetched through the site's own image resizer (small, cached,
// JPEG/PNG — the preview renderer can't read WebP or 6000px originals).
const SITE = process.env.OG_IMAGE_ORIGIN || 'https://grafikjam.shop'

export async function ogFont() {
  const res = await fetch(new URL('../../public/fonts/NeueMontreal-Regular.woff', import.meta.url))
  return [{ name: 'NeueMontreal', data: await res.arrayBuffer(), weight: 400 as const, style: 'normal' as const }]
}

// Returns image bytes, or null if the photo can't be loaded — a missing photo
// must never break the whole preview.
export async function ogImage(url: string | null | undefined, width: 640 | 1080 | 1200 = 640): Promise<ArrayBuffer | null> {
  const path = resizedImageUrl(url, width)
  if (!path) return null
  try {
    const res = await fetch(path.startsWith('/') ? SITE + path : path, { headers: { Accept: 'image/jpeg,image/png' } })
    const type = res.headers.get('content-type') || ''
    if (!res.ok || !/image\/(jpeg|png)/.test(type)) return null
    return await res.arrayBuffer()
  } catch {
    return null
  }
}

export function Wordmark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 22, letterSpacing: '0.12em', color: OG_TEXT }}>
      <div style={{ display: 'flex', width: 12, height: 12, borderRadius: 6, background: OG_RED }} />
      GRAFIKJAM MOCKUPS
    </div>
  )
}

// Top: brand line, then the headline on two lines (as on the homepage).
// Bottom: a strip of up to four mockup photos.
export function GridCard({ title, sub, photos }: { title: string[]; sub: string; photos: (ArrayBuffer | null)[] }) {
  const pics = photos.filter(Boolean).slice(0, 4) as ArrayBuffer[]
  const gap = 12
  const w = Math.floor((1104 - gap * 3) / 4)
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: OG_BG, fontFamily: 'NeueMontreal', padding: 48 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Wordmark />
        <div style={{ display: 'flex', fontSize: 22, color: OG_MUTED }}>{sub}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', fontSize: pics.length ? 76 : 96, lineHeight: 1.02, letterSpacing: '-0.035em', color: OG_TEXT }}>
        {title.map(t => <div key={t} style={{ display: 'flex' }}>{t}</div>)}
      </div>
      {pics.length > 0 && (
        <div style={{ display: 'flex', gap }}>
          {pics.map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img key={i} src={p as unknown as string} width={w} height={210} style={{ objectFit: 'cover', borderRadius: 10 }} />
          ))}
        </div>
      )}
    </div>
  )
}
