// Types applicatifs alignés sur le schéma SQL (supabase/migrations).

export type CreationStatus = "draft" | "published";

export type QuoteStatus =
  | "nouveau"
  | "contacte"
  | "en_discussion"
  | "accepte"
  | "refuse"
  | "termine";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  position: number;
  is_public: boolean;
  created_at: string;
}

export interface CreationImage {
  id: string;
  creation_id: string;
  storage_path: string;
  alt_text: string | null;
  position: number;
  is_cover: boolean;
  created_at: string;
}

export interface Creation {
  id: string;
  title: string;
  slug: string;
  category_id: string | null;
  excerpt: string | null;
  body: string | null;
  techniques: string[];
  figure_type: string | null;
  completion_time: string | null;
  realized_on: string | null;
  cover_path: string | null;
  status: CreationStatus;
  featured: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface CreationWithRelations extends Creation {
  category: Category | null;
  images: CreationImage[];
}

export interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  project_type: string | null;
  figure_count: string | null;
  figure_type: string | null;
  paint_level: string | null;
  budget: string | null;
  desired_date: string | null;
  message: string;
  image_paths: string[];
  status: QuoteStatus;
  created_at: string;
}

export interface PricingTier {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_label: string | null;
  features: string[];
  position: number;
  is_active: boolean;
  created_at: string;
}

// -------- site_settings (clé / valeur JSON) --------

export interface PerkItem {
  title: string;
  text: string;
}

export interface HeroSettings {
  eyebrow: string;
  title: string;
  brush: string;
  description: string;
  perks: PerkItem[];
}

export interface AboutSettings {
  title: string;
  body: string;
  points: PerkItem[];
}

export interface StatItem {
  value: string;
  label: string;
}

export interface StatsSettings {
  enabled: boolean;
  items: StatItem[];
}

export interface ContactSettings {
  email: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  intro: string;
}

export interface SeoSettings {
  siteName: string;
  defaultTitle: string;
  defaultDescription: string;
}

export interface SiteSettings {
  hero: HeroSettings;
  about: AboutSettings;
  stats: StatsSettings;
  contact: ContactSettings;
  seo: SeoSettings;
}

export type SiteSettingsKey = keyof SiteSettings;

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  nouveau: "Nouveau",
  contacte: "Contacté",
  en_discussion: "En discussion",
  accepte: "Accepté",
  refuse: "Refusé",
  termine: "Terminé",
};
