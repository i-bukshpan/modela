import { createServerClient } from '@supabase/ssr'

// Admin client using service_role key — bypasses RLS
// ⚠️  Only use in Server Actions or API routes — NEVER client-side
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: { schema: 'modela' },
      cookies: { getAll: () => [], setAll: () => {} },
      auth: { persistSession: false },
    }
  )
}
