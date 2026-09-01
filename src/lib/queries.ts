import { cache } from "react";
import { createStaticClient } from "@/lib/supabase/server";
import { IS_SUPABASE_CONFIGURED } from "@/lib/env";
import type {
  Category,
  Creation,
  CreationImage,
  CreationWithRelations,
  PricingTier,
} from "@/lib/types";

const CREATION_SELECT =
  "*, category:categories(*), images:creation_images(*)";

function sortImages(images: CreationImage[]): CreationImage[] {
  return [...images].sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
    return a.position - b.position;
  });
}

/** Catégories publiques, triées. */
export const getPublicCategories = cache(async (): Promise<Category[]> => {
  if (!IS_SUPABASE_CONFIGURED) return [];
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_public", true)
    .order("position", { ascending: true });
  return data ?? [];
});

/** Créations publiées, éventuellement filtrées par catégorie (slug). */
export const getPublishedCreations = cache(
  async (categorySlug?: string): Promise<CreationWithRelations[]> => {
    if (!IS_SUPABASE_CONFIGURED) return [];
    const supabase = createStaticClient();
    let query = supabase
      .from("creations")
      .select(CREATION_SELECT)
      .eq("status", "published")
      .order("position", { ascending: true })
      .order("published_at", { ascending: false });

    const { data } = await query;
    let rows = (data ?? []) as unknown as CreationWithRelations[];

    if (categorySlug && categorySlug !== "tout") {
      rows = rows.filter((c) => c.category?.slug === categorySlug);
    }
    return rows.map((c) => ({ ...c, images: sortImages(c.images ?? []) }));
  },
);

/** Créations mises en avant sur la page d'accueil. */
export const getFeaturedCreations = cache(
  async (limit = 8): Promise<CreationWithRelations[]> => {
    if (!IS_SUPABASE_CONFIGURED) return [];
    const supabase = createStaticClient();
    const { data } = await supabase
      .from("creations")
      .select(CREATION_SELECT)
      .eq("status", "published")
      .eq("featured", true)
      .order("position", { ascending: true })
      .order("published_at", { ascending: false })
      .limit(limit);
    return ((data ?? []) as unknown as CreationWithRelations[]).map((c) => ({
      ...c,
      images: sortImages(c.images ?? []),
    }));
  },
);

/** Une création par slug (publiée uniquement pour le public). */
export const getCreationBySlug = cache(
  async (slug: string): Promise<CreationWithRelations | null> => {
    if (!IS_SUPABASE_CONFIGURED) return null;
    const supabase = createStaticClient();
    const { data } = await supabase
      .from("creations")
      .select(CREATION_SELECT)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (!data) return null;
    const row = data as unknown as CreationWithRelations;
    return { ...row, images: sortImages(row.images ?? []) };
  },
);

/** Slugs des créations précédente / suivante (ordre galerie). */
export async function getAdjacentCreations(
  slug: string,
): Promise<{ prev: Pick<Creation, "slug" | "title"> | null; next: Pick<Creation, "slug" | "title"> | null }> {
  const all = await getPublishedCreations();
  const idx = all.findIndex((c) => c.slug === slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? { slug: all[idx - 1].slug, title: all[idx - 1].title } : null,
    next: idx < all.length - 1 ? { slug: all[idx + 1].slug, title: all[idx + 1].title } : null,
  };
}

/** Niveaux de tarifs actifs. */
export const getActivePricingTiers = cache(async (): Promise<PricingTier[]> => {
  if (!IS_SUPABASE_CONFIGURED) return [];
  const supabase = createStaticClient();
  const { data } = await supabase
    .from("pricing_tiers")
    .select("*")
    .eq("is_active", true)
    .order("position", { ascending: true });
  return data ?? [];
});
