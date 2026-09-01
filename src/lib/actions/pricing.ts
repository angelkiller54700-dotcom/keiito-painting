"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export interface PricingResult {
  ok: boolean;
  error?: string;
}

function revalidatePricing() {
  revalidatePath("/tarifs");
  revalidatePath("/admin/tarifs");
  revalidatePath("/admin");
}

export async function savePricingTier(input: {
  id?: string;
  name: string;
  description: string;
  price_label: string;
  features: string[];
  is_active: boolean;
}): Promise<PricingResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };
  if (!input.name.trim()) return { ok: false, error: "Le nom est obligatoire." };

  const supabase = createClient();
  const payload = {
    name: input.name.trim(),
    description: input.description.trim() || null,
    price_label: input.price_label.trim() || null,
    features: input.features,
    is_active: input.is_active,
  };

  if (input.id) {
    const { error } = await supabase.from("pricing_tiers").update(payload).eq("id", input.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { count } = await supabase
      .from("pricing_tiers")
      .select("id", { count: "exact", head: true });
    let slug = slugify(input.name);
    const { data: existing } = await supabase
      .from("pricing_tiers")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

    const { error } = await supabase
      .from("pricing_tiers")
      .insert({ ...payload, slug, position: count ?? 0 });
    if (error) return { ok: false, error: error.message };
  }

  revalidatePricing();
  return { ok: true };
}

export async function deletePricingTier(id: string): Promise<PricingResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = createClient();
  const { error } = await supabase.from("pricing_tiers").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePricing();
  return { ok: true };
}

export async function reorderPricingTiers(orderedIds: string[]): Promise<PricingResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Non autorisé." };

  const supabase = createClient();
  await Promise.all(
    orderedIds.map((id, position) =>
      supabase.from("pricing_tiers").update({ position }).eq("id", id),
    ),
  );
  revalidatePricing();
  return { ok: true };
}
