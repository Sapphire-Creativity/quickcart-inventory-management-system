"use client";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";
import type { Database } from "@/types/supabase";

export function useSupabaseClient() {
  const { getToken } = useAuth();

  const client = useMemo(() => {
    return createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          fetch: async (url, options = {}) => {
            const clerkToken = await getToken({ template: "supabase" });
            const headers = new Headers(options.headers);
            if (clerkToken) {
              headers.set("Authorization", `Bearer ${clerkToken}`);
            }
            return fetch(url, { ...options, headers });
          },
        },
      },
    );
  }, [getToken]);

  return client;
}
