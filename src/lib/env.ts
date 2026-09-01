/**
 * Accès centralisé et vérifié aux variables d'environnement.
 * Évite les erreurs silencieuses quand une variable Supabase manque.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const IS_SUPABASE_CONFIGURED =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;

export function assertSupabaseConfigured(): void {
  if (!IS_SUPABASE_CONFIGURED) {
    throw new Error(
      "Supabase n'est pas configuré. Renseigne NEXT_PUBLIC_SUPABASE_URL et " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local (voir .env.example).",
    );
  }
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";
