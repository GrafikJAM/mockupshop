import { supabase } from '@/lib/supabase'

// Uploads a File straight from the browser to Supabase Storage using a
// short-lived signed upload URL minted by /api/admin/upload-url (gated by
// the same x-admin-password header used everywhere else in /api/products).
// Resolves to the file's public URL — a plain string, exactly like the
// Dropbox links this is meant to replace, so nothing downstream (stored
// product rows, toDirectImageUrl, thumbnails) has to change to understand it.
export async function uploadAdminFile(file: File, adminPassword: string, folder: string): Promise<string> {
  const res = await fetch('/api/admin/upload-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
    body: JSON.stringify({ filename: file.name, folder }),
  })
  if (!res.ok) {
    const e = await res.json().catch(() => ({}))
    throw new Error(e.error || `Could not start upload (${res.status})`)
  }
  const { bucket, path, token, publicUrl } = await res.json()

  const { error } = await supabase.storage.from(bucket).uploadToSignedUrl(path, token, file)
  if (error) throw new Error(error.message)

  return publicUrl
}
