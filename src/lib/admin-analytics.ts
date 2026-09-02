import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { prettyPath } from "@/lib/analytics";

const TZ = "Europe/Paris";
const dayFmt = new Intl.DateTimeFormat("fr-CA", { timeZone: TZ }); // -> YYYY-MM-DD
const dayLabelFmt = new Intl.DateTimeFormat("fr-FR", {
  timeZone: TZ,
  day: "2-digit",
  month: "2-digit",
});
const monthKeyFmt = new Intl.DateTimeFormat("fr-CA", { timeZone: TZ, year: "numeric", month: "2-digit" });
const monthLabelFmt = new Intl.DateTimeFormat("fr-FR", { timeZone: TZ, month: "short", year: "2-digit" });

function dayKey(d: Date) {
  return dayFmt.format(d);
}

export interface DayPoint {
  day: string;
  label: string;
  views: number;
  visitors: number;
}
export interface Ranked {
  key: string;
  label: string;
  value: number;
}

export interface TrafficAnalytics {
  rangeDays: number;
  totalViews: number;
  uniqueVisitors: number;
  viewsPerVisitor: number;
  quoteRequests: number;
  trend: { views: number | null; visitors: number | null; quotes: number | null };
  byDay: DayPoint[];
  topPages: Ranked[];
  topCreations: Ranked[];
  sources: Ranked[];
  devices: Ranked[];
  peakDay: DayPoint | null;
  hasData: boolean;
}

type RawView = {
  path: string;
  creation_slug: string | null;
  source: string | null;
  device: string | null;
  session_id: string;
  viewed_at: string;
};

function pct(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function rank(counts: Map<string, number>, labeller: (k: string) => string, limit = 8): Ranked[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, value]) => ({ key, label: labeller(key), value }));
}

export async function adminGetTrafficAnalytics(rangeDays = 30): Promise<TrafficAnalytics> {
  await requireAdmin();
  const supabase = createClient();

  const now = new Date();
  const since = new Date(now.getTime() - rangeDays * 864e5);
  const sincePrev = new Date(now.getTime() - rangeDays * 2 * 864e5);

  const [{ data: rows }, quotesCur, quotesPrev] = await Promise.all([
    supabase
      .from("page_views")
      .select("path, creation_slug, source, device, session_id, viewed_at")
      .gte("viewed_at", sincePrev.toISOString())
      .order("viewed_at", { ascending: false })
      .limit(100000),
    supabase
      .from("quote_requests")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since.toISOString()),
    supabase
      .from("quote_requests")
      .select("id", { count: "exact", head: true })
      .gte("created_at", sincePrev.toISOString())
      .lt("created_at", since.toISOString()),
  ]);

  const all = (rows ?? []) as RawView[];
  const sinceMs = since.getTime();
  const current = all.filter((r) => new Date(r.viewed_at).getTime() >= sinceMs);
  const previous = all.filter((r) => new Date(r.viewed_at).getTime() < sinceMs);

  const totalViews = current.length;
  const uniqueVisitors = new Set(current.map((r) => r.session_id)).size;
  const prevViews = previous.length;
  const prevVisitors = new Set(previous.map((r) => r.session_id)).size;

  // --- par jour (remplit les jours vides) ---
  const dayViews = new Map<string, number>();
  const daySessions = new Map<string, Set<string>>();
  for (const r of current) {
    const k = dayKey(new Date(r.viewed_at));
    dayViews.set(k, (dayViews.get(k) ?? 0) + 1);
    if (!daySessions.has(k)) daySessions.set(k, new Set());
    daySessions.get(k)!.add(r.session_id);
  }
  const byDay: DayPoint[] = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 864e5);
    const k = dayKey(d);
    byDay.push({
      day: k,
      label: dayLabelFmt.format(d),
      views: dayViews.get(k) ?? 0,
      visitors: daySessions.get(k)?.size ?? 0,
    });
  }
  const peakDay = byDay.reduce<DayPoint | null>(
    (best, p) => (!best || p.views > best.views ? p : best),
    null,
  );

  // --- classements ---
  const pathCounts = new Map<string, number>();
  const creationCounts = new Map<string, number>();
  const sourceCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();
  for (const r of current) {
    pathCounts.set(r.path, (pathCounts.get(r.path) ?? 0) + 1);
    if (r.creation_slug)
      creationCounts.set(r.creation_slug, (creationCounts.get(r.creation_slug) ?? 0) + 1);
    const s = r.source || "Direct";
    sourceCounts.set(s, (sourceCounts.get(s) ?? 0) + 1);
    const dv = r.device || "inconnu";
    deviceCounts.set(dv, (deviceCounts.get(dv) ?? 0) + 1);
  }

  // titres des créations
  let creationTitles = new Map<string, string>();
  const slugs = [...creationCounts.keys()];
  if (slugs.length > 0) {
    const { data: creas } = await supabase
      .from("creations")
      .select("slug, title")
      .in("slug", slugs);
    creationTitles = new Map((creas ?? []).map((c) => [c.slug, c.title]));
  }

  const deviceLabels: Record<string, string> = {
    mobile: "Mobile",
    tablet: "Tablette",
    desktop: "Ordinateur",
    inconnu: "Inconnu",
  };

  return {
    rangeDays,
    totalViews,
    uniqueVisitors,
    viewsPerVisitor: uniqueVisitors > 0 ? Math.round((totalViews / uniqueVisitors) * 10) / 10 : 0,
    quoteRequests: quotesCur.count ?? 0,
    trend: {
      views: pct(totalViews, prevViews),
      visitors: pct(uniqueVisitors, prevVisitors),
      quotes: pct(quotesCur.count ?? 0, quotesPrev.count ?? 0),
    },
    byDay,
    topPages: rank(pathCounts, prettyPath),
    topCreations: rank(creationCounts, (s) => creationTitles.get(s) ?? s),
    sources: rank(sourceCounts, (s) => s),
    devices: rank(deviceCounts, (d) => deviceLabels[d] ?? d, 4),
    peakDay,
    hasData: totalViews > 0,
  };
}

// ---------------------------------------------------------------------------
// Statistiques d'activité (données métier existantes)
// ---------------------------------------------------------------------------

export interface ActivityAnalytics {
  totalPublished: number;
  totalDrafts: number;
  totalQuotes: number;
  conversionRate: number | null;
  creationsByMonth: { key: string; label: string; value: number }[];
  quotesByMonth: { key: string; label: string; value: number }[];
  quotesByStatus: Ranked[];
  creationsByCategory: Ranked[];
}

const QUOTE_STATUS_ORDER = ["nouveau", "contacte", "en_discussion", "accepte", "refuse", "termine"];
const QUOTE_STATUS_LABEL: Record<string, string> = {
  nouveau: "Nouveau",
  contacte: "Contacté",
  en_discussion: "En discussion",
  accepte: "Accepté",
  refuse: "Refusé",
  termine: "Terminé",
};

export async function adminGetActivityAnalytics(months = 6): Promise<ActivityAnalytics> {
  await requireAdmin();
  const supabase = createClient();

  const [{ data: creations }, { data: quotes }, { data: cats }] = await Promise.all([
    supabase.from("creations").select("status, published_at, created_at, category_id"),
    supabase.from("quote_requests").select("status, created_at"),
    supabase.from("categories").select("id, name"),
  ]);

  const crList = creations ?? [];
  const qList = quotes ?? [];
  const catName = new Map((cats ?? []).map((c) => [c.id as string, c.name as string]));

  const now = new Date();
  const monthBuckets: { key: string; label: string }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthBuckets.push({ key: monthKeyFmt.format(d), label: monthLabelFmt.format(d) });
  }
  const emptyMonths = () => monthBuckets.map((b) => ({ ...b, value: 0 }));

  const creationsByMonth = emptyMonths();
  for (const c of crList) {
    if (c.status !== "published") continue;
    const when = c.published_at || c.created_at;
    if (!when) continue;
    const k = monthKeyFmt.format(new Date(when));
    const b = creationsByMonth.find((m) => m.key === k);
    if (b) b.value += 1;
  }

  const quotesByMonth = emptyMonths();
  for (const q of qList) {
    const k = monthKeyFmt.format(new Date(q.created_at));
    const b = quotesByMonth.find((m) => m.key === k);
    if (b) b.value += 1;
  }

  const statusCounts = new Map<string, number>();
  for (const q of qList) statusCounts.set(q.status, (statusCounts.get(q.status) ?? 0) + 1);
  const quotesByStatus: Ranked[] = QUOTE_STATUS_ORDER.filter((s) => statusCounts.has(s)).map((s) => ({
    key: s,
    label: QUOTE_STATUS_LABEL[s],
    value: statusCounts.get(s) ?? 0,
  }));

  const catCounts = new Map<string, number>();
  for (const c of crList) {
    if (c.status !== "published") continue;
    const name = c.category_id ? catName.get(c.category_id) ?? "Sans catégorie" : "Sans catégorie";
    catCounts.set(name, (catCounts.get(name) ?? 0) + 1);
  }
  const creationsByCategory: Ranked[] = [...catCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({ key, label: key, value }));

  const totalQuotes = qList.length;
  const won = (statusCounts.get("accepte") ?? 0) + (statusCounts.get("termine") ?? 0);
  const decided = won + (statusCounts.get("refuse") ?? 0);

  return {
    totalPublished: crList.filter((c) => c.status === "published").length,
    totalDrafts: crList.filter((c) => c.status === "draft").length,
    totalQuotes,
    conversionRate: decided > 0 ? Math.round((won / decided) * 100) : null,
    creationsByMonth,
    quotesByMonth,
    quotesByStatus,
    creationsByCategory,
  };
}
