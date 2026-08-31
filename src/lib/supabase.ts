import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Product = {
  id: string
  created_at: string
  title: string
  description: string
  download_url: string
  image_default: string
  image_hover: string
  images_extra: string[]
  category: string
  active: boolean
}
