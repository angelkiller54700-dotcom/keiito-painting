"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export interface CatResult {
  ok: boolean;
  error?: string;
}

function revalidateCats() {
  revalidatePath("/");
  revalidatePath("/galerie");
  revalidatePath("/admin", "layout");
}

export async function createCategory(input: {
  name: string;
  description: string;
  is_public: boolean;
}): Promise<CatResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  if (!input.name.trim()) return { ok: false, error: "Le nom est obligatoire." };

  const supabase = createClient();
  const { count } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true });

  let slug = slugify(input.name);
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const { error } = await supabase.from("categories").insert({
    name: input.name.trim(),
    slug,
    description: input.description.trim() || null,
    is_public: input.is_public,
    position: count ?? 0,
  });
  if (error) return { ok: false, error: error.message };

  revalidateCats();
  return { ok: true };
}

export async function updateCategory(input: {
  id: string;
  name: string;
  description: string;
  is_public: boolean;
}): Promise<CatResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = createClient();
  const { error } = await supabase
    .from("categories")
    .update({
      name: input.name.trim(),
      description: input.description.trim() || null,
      is_public: input.is_public,
    })
    .eq("id", input.id);
  if (error) return { ok: false, error: error.message };

  revalidateCats();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<CatResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = createClient();
  // Les créations liées voient leur category_id passer à NULL (ON DELETE SET NULL).
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidateCats();
  return { ok: true };
}

export async function reorderCategories(orderedIds: string[]): Promise<CatResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = createClient();
  await Promise.all(
    orderedIds.map((id, position) =>
      supabase.from("categories").update({ position }).eq("id", id),
    ),
  );
  revalidateCats();
  return { ok: true };
}
