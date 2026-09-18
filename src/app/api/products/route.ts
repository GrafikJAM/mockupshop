import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Writes below use supabaseAdmin (service role, bypasses RLS) rather than the
// anon `supabase` client — these routes are already gated by the admin
// password check, but the anon key is still subject to Row Level Security,
// which only grants anonymous SELECT on this table. Without this, an insert
// or update here can fail silently (RLS just returns zero rows affected
// instead of an error the UI would show) — this is what was happening.
export async function POST(req: NextRequest) {
  const adminPassword = req.headers.get('x-admin-password')
  if (adminPassword !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  if (body._test) return NextResponse.json({ ok: true })

  const { data: minRow } = await supabaseAdmin
    .from('products')
    .select('sort_order')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .limit(1)
    .single()
  const newOrder = (minRow?.sort_order ?? 0) - 1

  const { data, error } = await supabaseAdmin.from('products').insert([{
    title: body.title, description: body.description, download_url: body.download_url,
    image_default: body.image_default, image_hover: body.image_hover,
    images_extra: body.images_extra || [], category: body.category || 'Other',
    tags: body.tags || [], price: body.price || '', active: true,
    sort_order: newOrder, is_lead_magnet: !!body.is_lead_magnet,
  }]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
