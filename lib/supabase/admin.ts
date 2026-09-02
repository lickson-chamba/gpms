import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Admin client using the secret key — bypasses Row Level Security entirely.
 *
 * Only import this from server-only code that never ships to the browser:
 * Route Handlers, Server Actions, Edge Functions. Typical uses coming in
 * later phases: a manager inviting a new staff account (Phase 1), and the
 * payment webhook writing payment_status after a provider confirms a
 * charge (Phase 3).
 *
 * Never import this file from a Client Component.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
