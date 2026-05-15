import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/../types/supabase";

/**
 * Server-side Supabase client (native Clerk integration — April 2025+).
 *
 * No JWT template needed. Clerk's session token is passed directly as the
 * Authorization header. Supabase verifies it via the Clerk JWKS endpoint
 * configured under Authentication → Third-Party Auth in the Supabase dashboard.
 *
 * Use this inside:
 *   - Server Actions  ('use server' functions)
 *   - Route Handlers  (app/api/...)
 *   - Server Components (for read-only data fetching)
 *
 * ⚠️  RLS policies must use auth.jwt()->>'sub' to get the Clerk user ID.
 *     auth.uid() will NOT work — Clerk uses string IDs, not UUIDs.
 *
 * Usage:
 *   const supabase = await createServerClient()
 *   const { data, error } = await supabase.from('customers').select()
 */
export async function createServerClient() {
  const { getToken } = await auth();

  const clerkToken = await getToken();

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${clerkToken ?? ""}`,
        },
      },
      auth: {
        // Clerk handles all auth — disable Supabase's own session management
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
