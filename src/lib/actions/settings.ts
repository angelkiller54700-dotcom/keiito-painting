"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth";
import type { SiteSettingsKey } from "@/lib/types";

export interface SettingsResult {
  ok: boolean;
  error?: string;
}

export async function updateSetting(
  key: SiteSettingsKey,
  value: unknown,
): Promise<SettingsResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = createClient();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value: value as never }, { onConflict: "key" });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  revalidatePath("/admin/parametres");
  return { ok: true };
}

export async function updateAccount(input: {
  displayName: string;
  newPassword?: string;
}): Promise<SettingsResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = createClient();

  if (input.displayName.trim()) {
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: input.displayName.trim() })
      .eq("id", admin.id);
    if (error) return { ok: false, error: error.message };
  }

  if (input.newPassword && input.newPassword.length > 0) {
    if (input.newPassword.length < 8) {
      return { ok: false, error: "Le mot de passe doit faire au moins 8 caractères." };
    }
    const { error } = await supabase.auth.updateUser({ password: input.newPassword });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/admin", "layout");
  return { ok: true };
}
