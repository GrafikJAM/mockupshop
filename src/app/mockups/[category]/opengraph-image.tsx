import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'
import { getCategory } from '@/lib/categories'
import { GridCard, OG_SIZE, ogFont, ogImage } from '@/lib/ogCard'

export const runtime = 'edge'
export const revalidate = 3600
export const alt = 'GrafikJAM category mockups'
export const size = OG_SIZE
export const contentType = 'image/png'

// Category link preview: "<Category> Mockups" next to four mockups from it.
export default async function OGImage({ params }: { params: { category: string } }) {
  const cat = getCategory(params.category)
  const { data } = cat
    ? await supabase
        .from('products')
        .select('image_default')
        .eq('active', true)
        .contains('tags', [cat.tag])
        .order('created_at', { ascending: false })
        .limit(4)
    : { data: [] as { image_default: string }[] }
  const [fonts, ...photos] = await Promise.all([ogFont(), ...(data || []).map(p => ogImage(p.image_default))])
  const title = [`${cat?.label || 'Mockups'}.`, 'Made for real brands.']
  return new ImageResponse(
    <GridCard title={title} sub="PSD mockups · Smart Objects" photos={photos} />,
    { ...size, fonts }
  )
}
