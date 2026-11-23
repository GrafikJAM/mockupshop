import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'
import { GridCard, OG_SIZE, ogFont, ogImage } from '@/lib/ogCard'

export const runtime = 'edge'
export const revalidate = 3600
export const alt = 'GrafikJAM mockups. Made for real brands. — Photoshop PSD mockups with Smart Objects'
export const size = OG_SIZE
export const contentType = 'image/png'

// Site-wide link preview: the homepage headline next to the four newest mockups.
export default async function OGImage() {
  const { data } = await supabase
    .from('products')
    .select('image_default')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(4)
  const [fonts, ...photos] = await Promise.all([ogFont(), ...(data || []).map(p => ogImage(p.image_default))])
  return new ImageResponse(
    <GridCard title={['GrafikJAM mockups.', 'Made for real brands.']} sub="PSD mockups · Smart Objects" photos={photos} />,
    { ...size, fonts }
  )
}
