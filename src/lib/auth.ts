import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IS_SUPABASE_CONFIGURED } from "@/lib/env";

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
}

/**
 * À appeler en tête de chaque page/action admin.
 * Redirige vers /admin/login si l'utilisateur n'est pas un admin.
 */
export async function requireAdmin(): Promise<AdminUser> {
  if (!IS_SUPABASE_CONFIGURED) redirect("/admin/login");
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/admin/login?error=forbidden");
  }

  return {
    id: user.id,
    email: user.email ?? "",
    displayName: profile.display_name || user.email?.split("@")[0] || "Keiito",
  };
}

/** Variante pour les Server Actions : renvoie null au lieu de rediriger. */
export async function getAdminUser(): Promise<AdminUser | null> {
  if (!IS_SUPABASE_CONFIGURED) return null;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") return null;

  return {
    id: user.id,
    email: user.email ?? "",
    displayName: profile.display_name || user.email?.split("@")[0] || "Keiito",
  };
}
