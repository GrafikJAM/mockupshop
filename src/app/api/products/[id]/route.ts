import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function checkAuth(req: NextRequest) { return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD }

// Uses supabaseAdmin (service role, bypasses RLS), not the anon client — see
// the note in ../route.ts. Row Level Security only grants anonymous SELECT
// on this table, so updates/deletes through the anon key can fail silently.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabaseAdmin.from('products').update(body).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { error } = await supabaseAdmin.from('products').update({ active: false }).eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
