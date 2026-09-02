# Migrations Supabase

Exécuter dans le **SQL Editor** du dashboard Supabase, dans cet ordre :

| Ordre | Fichier | Contenu |
|------|---------|---------|
| 1 | `migrations/0001_schema.sql` | Extensions, tables, fonctions, triggers, buckets Storage |
| 2 | `migrations/0002_rls.sql` | Row Level Security + policies (tables & Storage) |
| 3 | `migrations/0003_seed.sql` | Catégories, niveaux de tarifs (sans prix définitifs), textes par défaut |
| 4 | `migrations/0004_analytics.sql` | Table `page_views` (mesure d'audience sans cookie) + RLS |

Les fichiers sont **idempotents** (`if not exists`, `on conflict do nothing`,
`drop policy if exists`) : on peut les rejouer sans casser les données.

## Modèle de données

- **profiles** — 1 ligne / utilisateur. `role` = `viewer` | `admin`. Créée
  automatiquement par trigger sur `auth.users`.
- **categories** — nom, slug, description, position, `is_public`.
- **creations** — titre, slug, `category_id`, excerpt, body, `techniques[]`,
  `figure_type`, `completion_time`, `realized_on`, `cover_path`, `status`
  (`draft` | `published`), `featured`, `position`.
- **creation_images** — `creation_id`, `storage_path`, `alt_text`, `position`,
  `is_cover`.
- **quote_requests** — coordonnées + détails projet + `image_paths[]` + `status`.
- **pricing_tiers** — `name`, `slug`, `description`, `price_label`, `features[]`,
  `position`, `is_active`.
- **site_settings** — `key` / `value` JSON (hero, about, stats, contact, seo).

## Sécurité (RLS)

| Rôle | Lecture | Écriture |
|------|---------|----------|
| Public (anon) | créations `published`, catégories `is_public`, tarifs `is_active`, `site_settings` | **INSERT uniquement** sur `quote_requests` |
| Admin | tout | tout |

Storage :
- `creations` (public) : lecture pour tous, écriture/suppression admin.
- `quote-uploads` (privé) : INSERT public dans le dossier `quotes/`, lecture/suppression admin uniquement.
