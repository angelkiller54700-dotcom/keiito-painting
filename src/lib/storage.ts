import { SUPABASE_URL } from "@/lib/env";

export const CREATIONS_BUCKET = "creations";
export const QUOTE_BUCKET = "quote-uploads";

/**
 * URL publique d'un objet du bucket "creations".
 * Le bucket est public : on peut construire l'URL sans appel réseau.
 */
export function publicImageUrl(storagePath: string | null | undefined): string {
  if (!storagePath) return "";
  if (storagePath.startsWith("http")) return storagePath;
  const clean = storagePath.replace(/^\/+/, "");
  return `${SUPABASE_URL}/storage/v1/object/public/${CREATIONS_BUCKET}/${clean}`;
}
