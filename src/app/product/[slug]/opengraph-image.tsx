import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'
import { parseProductParam } from '@/lib/productUrl'
import { productBaseName } from '@/lib/seoName'
import { OG_BG, OG_MUTED, OG_SIZE, OG_TEXT, Wordmark, ogFont, ogImage } from '@/lib/ogCard'

export const runtime = 'edge'
export const revalidate = 3600
export const alt = 'GrafikJAM Photoshop mockup'
export const size = OG_SIZE
export const contentType = 'image/png'

// Product link preview: the mockup photo large on the left, its name on the right.
export default async function OGImage({ params }: { params: { slug: string } }) {
  const parsed = parseProductParam(params.slug)
  let product: { title: string; image_default: string } | null = null
  if (parsed) {
    let id = 'id' in parsed ? parsed.id : undefined
    if (!id && 'prefix' in parsed) {
      const { data } = await supabase.from('products').select('id')
      id = (data || []).find((p: { id: string }) => p.id.toLowerCase().startsWith(parsed.prefix))?.id
    }
    if (id) product = (await supabase.from('products').select('title, image_default').eq('id', id).single()).data
  }
  const [fonts, photo] = await Promise.all([ogFont(), ogImage(product?.image_default, 1200)])
  const name = product ? productBaseName(product.title) : 'Photoshop'
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: OG_BG, fontFamily: 'NeueMontreal' }}>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
          <img src={photo as unknown as string} width={760} height={630} style={{ objectFit: 'cover' }} />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, padding: 48 }}>
          <Wordmark />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: name.length > 14 ? 52 : 64, lineHeight: 1.05, letterSpacing: '-0.035em', color: OG_TEXT }}>
              <div style={{ display: 'flex' }}>{name}</div>
              <div style={{ display: 'flex' }}>Mockup</div>
            </div>
            <div style={{ display: 'flex', fontSize: 24, color: OG_MUTED }}>PSD · Smart Object</div>
          </div>
          <div style={{ display: 'flex', fontSize: 22, color: OG_MUTED }}>grafikjam.shop</div>
        </div>
      </div>
    ),
    { ...size, fonts }
  )
}
