import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

/**
 * Client Supabase pour Server Components / Route Handlers / Server Actions.
 * Lit la session depuis les cookies. Respecte les policies RLS.
 */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Appelé depuis un Server Component : ignoré, le middleware rafraîchit la session.
        }
      },
    },
  });
}

/**
 * Client Supabase "public" sans session (clé anon uniquement).
 * À utiliser pour les données publiques du site : ne lit aucun cookie,
 * ce qui permet aux pages publiques de rester statiques / ISR.
 */
export function createStaticClient() {
  return createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
