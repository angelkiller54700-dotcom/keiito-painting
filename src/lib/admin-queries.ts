import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type {
  Category,
  CreationWithRelations,
  PricingTier,
  QuoteRequest,
} from "@/lib/types";

const CREATION_SELECT = "*, category:categories(*), images:creation_images(*)";

export async function adminListCreations(): Promise<CreationWithRelations[]> {
  await requireAdmin();
  const supabase = createClient();
  const { data } = await supabase
    .from("creations")
    .select(CREATION_SELECT)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
  return ((data ?? []) as unknown as CreationWithRelations[]).map((c) => ({
    ...c,
    images: [...(c.images ?? [])].sort((a, b) => a.position - b.position),
  }));
}

export async function adminGetCreation(id: string): Promise<CreationWithRelations | null> {
  await requireAdmin();
  const supabase = createClient();
  const { data } = await supabase
    .from("creations")
    .select(CREATION_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;
  const row = data as unknown as CreationWithRelations;
  return { ...row, images: [...(row.images ?? [])].sort((a, b) => a.position - b.position) };
}

export async function adminListCategories(): Promise<Category[]> {
  await requireAdmin();
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("position", { ascending: true });
  return data ?? [];
}

export async function adminListQuotes(): Promise<QuoteRequest[]> {
  await requireAdmin();
  const supabase = createClient();
  const { data } = await supabase
    .from("quote_requests")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function adminListPricingTiers(): Promise<PricingTier[]> {
  await requireAdmin();
  const supabase = createClient();
  const { data } = await supabase
    .from("pricing_tiers")
    .select("*")
    .order("position", { ascending: true });
  return data ?? [];
}

export interface DashboardStats {
  published: number;
  drafts: number;
  categories: number;
  quotesNew: number;
  quotesTotal: number;
}

export async function adminGetStats(): Promise<DashboardStats> {
  await requireAdmin();
  const supabase = createClient();

  const [pub, draft, cats, quotesNew, quotesTotal] = await Promise.all([
    supabase.from("creations").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("creations").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("quote_requests").select("id", { count: "exact", head: true }).eq("status", "nouveau"),
    supabase.from("quote_requests").select("id", { count: "exact", head: true }),
  ]);

  return {
    published: pub.count ?? 0,
    drafts: draft.count ?? 0,
    categories: cats.count ?? 0,
    quotesNew: quotesNew.count ?? 0,
    quotesTotal: quotesTotal.count ?? 0,
  };
}
