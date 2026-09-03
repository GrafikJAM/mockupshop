import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Next.js caches fetch() calls in route handlers by default unless told
// not to — see account/purchases/route.ts for the full story of the bug
// that caused. Force this one live too.
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const source = typeof body?.source === 'string' ? body.source.slice(0, 100) : 'free-mockup'

  // Upsert on email so re-submitting the form doesn't error or create duplicates.
  const { error: insertError } = await supabaseAdmin
    .from('email_subscribers')
    .upsert([{ email, source }], { onConflict: 'email', ignoreDuplicates: true })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Whichever product is currently flagged in the admin panel as the free
  // lead magnet. If none is flagged yet, we still record the email —
  // there's just nothing to hand back right now.
  const { data: product } = await supabaseAdmin
    .from('products')
    .select('id, title, image_default, download_url')
    .eq('is_lead_magnet', true)
    .eq('active', true)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({ success: true, product: product || null })
}
