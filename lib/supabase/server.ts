import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Use inside Server Components, Server Actions, and Route Handlers.
 * Still uses the publishable key + the signed-in user's session — this is
 * NOT an admin client. RLS still applies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — safe to ignore since
            // middleware is responsible for refreshing the session.
          }
        },
      },
    }
  );
}
