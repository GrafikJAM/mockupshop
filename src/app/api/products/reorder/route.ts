import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const adminPassword = req.headers.get('x-admin-password')
  if (adminPassword !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const ids: string[] = body.ids
  if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: 'No ids provided' }, { status: 400 })

  const results = await Promise.all(
    ids.map((id, i) => supabase.from('products').update({ sort_order: i }).eq('id', id))
  )
  const failed = results.find(r => r.error)
  if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
