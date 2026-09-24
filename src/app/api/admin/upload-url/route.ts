import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// Where admin-uploaded product files (zips + images) land. Public bucket —
// these are the same files that already get linked to publicly via Dropbox
// today, so making them public here is not a new exposure.
const BUCKET = 'product-files'

let bucketChecked = false
async function ensureBucket() {
  if (bucketChecked) return
  const { data } = await supabaseAdmin.storage.getBucket(BUCKET)
  if (!data) {
    const { error } = await supabaseAdmin.storage.createBucket(BUCKET, { public: true })
    // Ignore "already exists" races from concurrent cold starts — anything
    // else is a real failure and gets surfaced to the caller below.
    if (error && !/already exists/i.test(error.message)) throw error
  }
  bucketChecked = true
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-140)
}

// Mints a one-time signed upload URL for a single file. The browser then
// uploads directly to Supabase Storage (see src/lib/upload.ts) — the file
// bytes never pass through this Vercel function, which matters for zips
// well over the ~4.5MB body limit on serverless function requests.
export async function POST(req: NextRequest) {
  const adminPassword = req.headers.get('x-admin-password')
  if (adminPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const filename = body?.filename
  if (!filename) return NextResponse.json({ error: 'Missing filename' }, { status: 400 })
  const folder = typeof body?.folder === 'string' ? body.folder.replace(/[^a-zA-Z0-9/_-]/g, '') : ''

  try {
    await ensureBucket()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not prepare storage bucket'
    return NextResponse.json({ error: message }, { status: 500 })
  }

  const path = `${folder ? `${folder}/` : ''}${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName(filename)}`

  const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path)
  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Could not create upload URL' }, { status: 500 })
  }

  const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(data.path)

  return NextResponse.json({
    bucket: BUCKET,
    path: data.path,
    token: data.token,
    publicUrl: pub.publicUrl,
  })
}
