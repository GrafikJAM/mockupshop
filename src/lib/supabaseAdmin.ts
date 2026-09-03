import { createClient } from '@supabase/supabase-js'

// Server-only client using the Supabase service role key — bypasses Row Level Security.
// Never import this into a 'use client' component or expose SUPABASE_SERVICE_ROLE_KEY to the browser.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
