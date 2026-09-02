import { cache } from "react";
import { createStaticClient } from "@/lib/supabase/server";
import { IS_SUPABASE_CONFIGURED } from "@/lib/env";
import type { SiteSettings } from "@/lib/types";

export const DEFAULT_SETTINGS: SiteSettings = {
  hero: {
    eyebrow: "Peinture sur figurines",
    title: "WARHAMMER",
    brush: "Donne vie à tes armées",
    description:
      "Peinture sur figurines Warhammer 40K, Age of Sigmar et plus encore. Qualité, passion et détails au rendez-vous.",
    perks: [
      { title: "Travail soigné", text: "Haute qualité" },
      { title: "Délais respectés", text: "Suivi personnalisé" },
      { title: "Passion & expérience", text: "Peintre passionné" },
    ],
  },
  about: {
    title: "La passion du détail",
    body: "Peintre passionné par l'univers Warhammer, je mets tout mon savoir-faire au service de vos figurines. Chaque projet est réalisé avec soin, patience et exigence pour un résultat à la hauteur de vos attentes.",
    points: [
      { title: "Techniques avancées", text: "Dégradés, NMM, OSL, effets spéciaux..." },
      { title: "Matériel professionnel", text: "Peintures et outils de qualité" },
      { title: "À l'écoute", text: "Conseils et suivi personnalisé" },
    ],
  },
  stats: {
    enabled: false,
    items: [
      { value: "", label: "Figurines peintes" },
      { value: "", label: "Clients satisfaits" },
      { value: "", label: "Respect des délais" },
      { value: "", label: "Passion" },
    ],
  },
  contact: {
    email: "",
    instagram: "https://instagram.com/keiit0_painting",
    facebook: "",
    tiktok: "https://www.tiktok.com/@keiit0_painting",
    intro:
      "Décrivez votre projet le plus précisément possible : je reviens vers vous avec un devis personnalisé.",
  },
  seo: {
    siteName: "Keiito Painting",
    defaultTitle: "Peinture figurines Warhammer | Keiito Painting",
    defaultDescription:
      "Peinture professionnelle de figurines Warhammer 40K, Age of Sigmar et miniatures. Travail soigné, techniques avancées, sur devis.",
  },
};

function mergeDeep<T>(base: T, override: unknown): T {
  if (override === null || override === undefined) return base;
  if (typeof base !== "object" || Array.isArray(base)) return (override as T) ?? base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
    out[k] = mergeDeep((base as Record<string, unknown>)[k], v);
  }
  return out as T;
}

/**
 * Récupère tous les réglages du site, fusionnés avec les valeurs par défaut.
 * Mise en cache pour la durée du rendu.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!IS_SUPABASE_CONFIGURED) return DEFAULT_SETTINGS;

  try {
    const supabase = createStaticClient();
    const { data } = await supabase.from("site_settings").select("key, value");
    if (!data) return DEFAULT_SETTINGS;

    const byKey = Object.fromEntries(data.map((r) => [r.key, r.value]));
    return {
      hero: mergeDeep(DEFAULT_SETTINGS.hero, byKey.hero),
      about: mergeDeep(DEFAULT_SETTINGS.about, byKey.about),
      stats: mergeDeep(DEFAULT_SETTINGS.stats, byKey.stats),
      contact: mergeDeep(DEFAULT_SETTINGS.contact, byKey.contact),
      seo: mergeDeep(DEFAULT_SETTINGS.seo, byKey.seo),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
});
