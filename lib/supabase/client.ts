import { createBrowserClient } from "@supabase/ssr";

/**
 * Use inside Client Components only. Uses the publishable key, which is
 * safe to expose to the browser — Row Level Security is what actually
 * restricts what it can read or write.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
