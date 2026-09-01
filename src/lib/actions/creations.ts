"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth";
import { CREATIONS_BUCKET } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import type { CreationStatus } from "@/lib/types";

export interface CreationImageInput {
  storage_path: string;
  alt_text: string;
  position: number;
  is_cover: boolean;
}

export interface CreationInput {
  id?: string;
  title: string;
  slug: string;
  category_id: string | null;
  excerpt: string;
  body: string;
  techniques: string[];
  figure_type: string;
  completion_time: string;
  realized_on: string | null;
  status: CreationStatus;
  featured: boolean;
  images: CreationImageInput[];
  removed_storage_paths: string[];
}

export interface SaveResult {
  ok: boolean;
  error?: string;
  id?: string;
  slug?: string;
}

function revalidateEverywhere(slug?: string) {
  revalidatePath("/");
  revalidatePath("/galerie");
  if (slug) revalidatePath(`/galerie/${slug}`);
  revalidatePath("/admin", "layout");
}

async function uniqueSlug(
  supabase: ReturnType<typeof createClient>,
  base: string,
  ignoreId?: string,
): Promise<string> {
  let candidate = slugify(base) || `creation-${Date.now().toString(36)}`;
  for (let i = 0; i < 50; i++) {
    const { data } = await supabase
      .from("creations")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data || data.id === ignoreId) return candidate;
    candidate = `${slugify(base)}-${i + 2}`;
  }
  return `${slugify(base)}-${Date.now().toString(36)}`;
}

export async function saveCreation(input: CreationInput): Promise<SaveResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  if (!input.title.trim()) return { ok: false, error: "Le titre est obligatoire." };

  const supabase = createClient();
  const slug = await uniqueSlug(supabase, input.slug || input.title, input.id);

  const cover =
    input.images.find((im) => im.is_cover) ?? input.images[0] ?? null;

  const payload = {
    title: input.title.trim(),
    slug,
    category_id: input.category_id,
    excerpt: input.excerpt.trim() || null,
    body: input.body.trim() || null,
    techniques: input.techniques,
    figure_type: input.figure_type.trim() || null,
    completion_time: input.completion_time.trim() || null,
    realized_on: input.realized_on || null,
    status: input.status,
    featured: input.featured,
    cover_path: cover?.storage_path ?? null,
  };

  let creationId = input.id;

  if (creationId) {
    const { error } = await supabase.from("creations").update(payload).eq("id", creationId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await supabase
      .from("creations")
      .insert({ ...payload, published_at: input.status === "published" ? new Date().toISOString() : null })
      .select("id")
      .single();
    if (error || !data) return { ok: false, error: error?.message ?? "Création impossible." };
    creationId = data.id;
  }

  // --- Images : on remplace intégralement la liste (simple et fiable) ---
  await supabase.from("creation_images").delete().eq("creation_id", creationId);

  if (input.images.length > 0) {
    const rows = input.images.map((im, idx) => ({
      creation_id: creationId!,
      storage_path: im.storage_path,
      alt_text: im.alt_text.trim() || null,
      position: idx,
      is_cover: im.storage_path === cover?.storage_path,
    }));
    const { error } = await supabase.from("creation_images").insert(rows);
    if (error) return { ok: false, error: error.message };
  }

  // --- Nettoyage des fichiers supprimés dans le Storage ---
  const toRemove = input.removed_storage_paths.filter(Boolean);
  if (toRemove.length > 0) {
    await supabase.storage.from(CREATIONS_BUCKET).remove(toRemove);
  }

  revalidateEverywhere(slug);
  return { ok: true, id: creationId, slug };
}

export async function deleteCreation(id: string): Promise<SaveResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = createClient();

  const { data: images } = await supabase
    .from("creation_images")
    .select("storage_path")
    .eq("creation_id", id);

  const { error } = await supabase.from("creations").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  const paths = (images ?? []).map((i) => i.storage_path).filter(Boolean);
  if (paths.length > 0) {
    await supabase.storage.from(CREATIONS_BUCKET).remove(paths);
  }

  revalidateEverywhere();
  return { ok: true };
}

export async function setCreationStatus(
  id: string,
  status: CreationStatus,
): Promise<SaveResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("creations")
    .update({ status })
    .eq("id", id)
    .select("slug")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidateEverywhere(data?.slug);
  return { ok: true };
}

export async function toggleFeatured(id: string, featured: boolean): Promise<SaveResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = createClient();
  const { data, error } = await supabase
    .from("creations")
    .update({ featured })
    .eq("id", id)
    .select("slug")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidateEverywhere(data?.slug);
  return { ok: true };
}

export async function duplicateCreation(id: string): Promise<SaveResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = createClient();
  const { data: src } = await supabase
    .from("creations")
    .select("*, images:creation_images(*)")
    .eq("id", id)
    .maybeSingle();
  if (!src) return { ok: false, error: "Création introuvable." };

  const slug = await uniqueSlug(supabase, `${src.title} copie`);
  const { data: created, error } = await supabase
    .from("creations")
    .insert({
      title: `${src.title} (copie)`,
      slug,
      category_id: src.category_id,
      excerpt: src.excerpt,
      body: src.body,
      techniques: src.techniques,
      figure_type: src.figure_type,
      completion_time: src.completion_time,
      realized_on: src.realized_on,
      cover_path: src.cover_path,
      status: "draft",
      featured: false,
    })
    .select("id")
    .single();
  if (error || !created) return { ok: false, error: error?.message ?? "Duplication impossible." };

  const imgs = (src.images ?? []) as { storage_path: string; alt_text: string | null; position: number; is_cover: boolean }[];
  if (imgs.length > 0) {
    await supabase.from("creation_images").insert(
      imgs.map((im) => ({
        creation_id: created.id,
        storage_path: im.storage_path,
        alt_text: im.alt_text,
        position: im.position,
        is_cover: im.is_cover,
      })),
    );
  }

  revalidateEverywhere();
  return { ok: true, id: created.id, slug };
}

export async function reorderCreations(orderedIds: string[]): Promise<SaveResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = createClient();
  await Promise.all(
    orderedIds.map((id, position) =>
      supabase.from("creations").update({ position }).eq("id", id),
    ),
  );
  revalidateEverywhere();
  return { ok: true };
}
