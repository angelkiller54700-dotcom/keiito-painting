-- ============================================================================
-- Keiito Painting - Installation complete de la base de donnees
-- A coller en une fois dans le SQL Editor de Supabase, puis cliquer sur RUN.
-- Idempotent : peut etre rejoue sans risque.
-- ============================================================================

-- ===========================================================================
-- Keiito Painting - Schéma de base de données
-- ---------------------------------------------------------------------------
-- À exécuter dans le SQL Editor de Supabase (une seule fois).
-- Contient : extensions, tables, fonctions, triggers.
-- Les policies RLS sont dans 0002_rls.sql
-- Les données de démarrage (catégories, tarifs, textes) dans 0003_seed.sql
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles : un enregistrement par utilisateur authentifié.
-- Seul le rôle 'admin' peut administrer le site. Pas d'inscription publique.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         text not null default 'viewer' check (role in ('viewer', 'admin')),
  display_name text,
  created_at   timestamptz not null default now()
);

-- Crée automatiquement un profil à chaque nouvel utilisateur.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Fonction utilitaire : l'utilisateur courant est-il admin ?
-- SECURITY DEFINER pour éviter la récursion des policies sur "profiles".
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  position    integer not null default 0,
  is_public   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- creations
-- ---------------------------------------------------------------------------
create table if not exists public.creations (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  category_id     uuid references public.categories (id) on delete set null,
  excerpt         text,
  body            text,
  techniques      text[] not null default '{}',
  figure_type     text,
  completion_time text,
  realized_on     date,
  cover_path      text,
  status          text not null default 'draft' check (status in ('draft', 'published')),
  featured        boolean not null default false,
  position        integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  published_at    timestamptz
);

create index if not exists creations_status_idx      on public.creations (status);
create index if not exists creations_category_idx    on public.creations (category_id);
create index if not exists creations_featured_idx    on public.creations (featured) where featured;

-- ---------------------------------------------------------------------------
-- creation_images
-- ---------------------------------------------------------------------------
create table if not exists public.creation_images (
  id           uuid primary key default gen_random_uuid(),
  creation_id  uuid not null references public.creations (id) on delete cascade,
  storage_path text not null,
  alt_text     text,
  position     integer not null default 0,
  is_cover     boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists creation_images_creation_idx on public.creation_images (creation_id);

-- ---------------------------------------------------------------------------
-- quote_requests (demandes de devis)
-- Le public peut INSERT mais jamais SELECT. Seul l'admin consulte.
-- ---------------------------------------------------------------------------
create table if not exists public.quote_requests (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  phone         text,
  project_type  text,
  figure_count  text,
  figure_type   text,
  paint_level   text,
  budget        text,
  desired_date  text,
  message       text not null,
  image_paths   text[] not null default '{}',
  status        text not null default 'nouveau'
                check (status in ('nouveau', 'contacte', 'en_discussion', 'accepte', 'refuse', 'termine')),
  created_at    timestamptz not null default now()
);

create index if not exists quote_requests_status_idx on public.quote_requests (status);
create index if not exists quote_requests_created_idx on public.quote_requests (created_at desc);

-- ---------------------------------------------------------------------------
-- pricing_tiers (niveaux de tarifs, montants administrables)
-- ---------------------------------------------------------------------------
create table if not exists public.pricing_tiers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  price_label text,
  features    text[] not null default '{}',
  position    integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- site_settings : contenu éditable (textes "À propos", "Hero", stats, contact...)
-- Stocké en clé / valeur JSON pour rester flexible.
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at automatique
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  if (tg_op = 'UPDATE' and new.status = 'published' and old.status is distinct from 'published') then
    new.published_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists creations_touch on public.creations;
create trigger creations_touch
  before update on public.creations
  for each row execute function public.touch_updated_at();

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Storage : bucket public "creations"
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('creations', 'creations', true)
on conflict (id) do nothing;

-- Bucket PRIVÉ pour les images jointes aux demandes de devis.
-- Le public peut y déposer un fichier, seul l'admin peut les consulter.
insert into storage.buckets (id, name, public)
values ('quote-uploads', 'quote-uploads', false)
on conflict (id) do nothing;


-- ===========================================================================
-- Keiito Painting - Row Level Security
-- À exécuter APRÈS 0001_schema.sql
-- ===========================================================================

alter table public.profiles        enable row level security;
alter table public.categories      enable row level security;
alter table public.creations       enable row level security;
alter table public.creation_images enable row level security;
alter table public.quote_requests  enable row level security;
alter table public.pricing_tiers   enable row level security;
alter table public.site_settings   enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists "profiles: self read"    on public.profiles;
drop policy if exists "profiles: admin read"   on public.profiles;
drop policy if exists "profiles: admin write"  on public.profiles;

create policy "profiles: self read"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "profiles: admin write"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- categories : lecture publique des catégories publiques, écriture admin
-- ---------------------------------------------------------------------------
drop policy if exists "categories: public read" on public.categories;
drop policy if exists "categories: admin all"   on public.categories;

create policy "categories: public read"
  on public.categories for select
  using (is_public or public.is_admin());

create policy "categories: admin all"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- creations : lecture publique des créations publiées, écriture admin
-- ---------------------------------------------------------------------------
drop policy if exists "creations: public read" on public.creations;
drop policy if exists "creations: admin all"   on public.creations;

create policy "creations: public read"
  on public.creations for select
  using (status = 'published' or public.is_admin());

create policy "creations: admin all"
  on public.creations for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- creation_images : visibles si la création parente est visible
-- ---------------------------------------------------------------------------
drop policy if exists "creation_images: public read" on public.creation_images;
drop policy if exists "creation_images: admin all"   on public.creation_images;

create policy "creation_images: public read"
  on public.creation_images for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.creations c
      where c.id = creation_images.creation_id
        and c.status = 'published'
    )
  );

create policy "creation_images: admin all"
  on public.creation_images for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- quote_requests : INSERT public autorisé, SELECT/UPDATE réservés à l'admin
-- ---------------------------------------------------------------------------
drop policy if exists "quotes: public insert" on public.quote_requests;
drop policy if exists "quotes: admin read"    on public.quote_requests;
drop policy if exists "quotes: admin update"  on public.quote_requests;
drop policy if exists "quotes: admin delete"  on public.quote_requests;

create policy "quotes: public insert"
  on public.quote_requests for insert
  with check (true);

create policy "quotes: admin read"
  on public.quote_requests for select
  using (public.is_admin());

create policy "quotes: admin update"
  on public.quote_requests for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "quotes: admin delete"
  on public.quote_requests for delete
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- pricing_tiers : lecture publique des niveaux actifs, écriture admin
-- ---------------------------------------------------------------------------
drop policy if exists "pricing: public read" on public.pricing_tiers;
drop policy if exists "pricing: admin all"   on public.pricing_tiers;

create policy "pricing: public read"
  on public.pricing_tiers for select
  using (is_active or public.is_admin());

create policy "pricing: admin all"
  on public.pricing_tiers for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- site_settings : lecture publique, écriture admin
-- ---------------------------------------------------------------------------
drop policy if exists "settings: public read" on public.site_settings;
drop policy if exists "settings: admin all"   on public.site_settings;

create policy "settings: public read"
  on public.site_settings for select
  using (true);

create policy "settings: admin all"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage policies pour le bucket "creations"
-- Lecture publique (bucket public), écriture / suppression réservées à l'admin.
-- ---------------------------------------------------------------------------
drop policy if exists "creations bucket: public read"   on storage.objects;
drop policy if exists "creations bucket: admin insert"  on storage.objects;
drop policy if exists "creations bucket: admin update"  on storage.objects;
drop policy if exists "creations bucket: admin delete"  on storage.objects;

create policy "creations bucket: public read"
  on storage.objects for select
  using (bucket_id = 'creations');

create policy "creations bucket: admin insert"
  on storage.objects for insert
  with check (bucket_id = 'creations' and public.is_admin());

create policy "creations bucket: admin update"
  on storage.objects for update
  using (bucket_id = 'creations' and public.is_admin())
  with check (bucket_id = 'creations' and public.is_admin());

create policy "creations bucket: admin delete"
  on storage.objects for delete
  using (bucket_id = 'creations' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage policies pour le bucket privé "quote-uploads"
-- INSERT public autorisé (pièces jointes du formulaire), lecture/suppression admin.
-- ---------------------------------------------------------------------------
drop policy if exists "quote-uploads: public insert" on storage.objects;
drop policy if exists "quote-uploads: admin read"    on storage.objects;
drop policy if exists "quote-uploads: admin delete"  on storage.objects;

create policy "quote-uploads: public insert"
  on storage.objects for insert
  with check (bucket_id = 'quote-uploads' and (storage.foldername(name))[1] = 'quotes');

create policy "quote-uploads: admin read"
  on storage.objects for select
  using (bucket_id = 'quote-uploads' and public.is_admin());

create policy "quote-uploads: admin delete"
  on storage.objects for delete
  using (bucket_id = 'quote-uploads' and public.is_admin());


-- ===========================================================================
-- Keiito Painting - Données de démarrage
-- À exécuter APRÈS 0001_schema.sql et 0002_rls.sql
-- ---------------------------------------------------------------------------
-- Ne crée AUCUNE fausse réalisation ni faux avis. Uniquement des catégories,
-- des niveaux de tarifs (sans prix définitifs) et des textes modifiables.
-- Tout est ensuite éditable depuis l'administration.
-- ===========================================================================

-- --- Catégories -------------------------------------------------------------
insert into public.categories (name, slug, description, position, is_public) values
  ('Space Marines',   'space-marines',   'Puissance et honneur',        1, true),
  ('Xenos',           'xenos',           'Étrange et terrifiant',       2, true),
  ('Orcs & Chaos',    'orcs-chaos',      'Brutal et imprévisible',      3, true),
  ('Age of Sigmar',   'age-of-sigmar',   'Fantasy et haute fantaisie',  4, true),
  ('Décors & Socles', 'decors-socles',   'Des bases qui claquent',      5, true),
  ('Autres',          'autres',          'Projets divers',              6, true)
on conflict (slug) do nothing;

-- --- Niveaux de tarifs (PRIX NON DÉFINITIFS - à renseigner dans l'admin) ----
insert into public.pricing_tiers (name, slug, description, price_label, features, position, is_active) values
  ('Tabletop', 'tabletop',
   'Pour jouer avec une armée propre et cohérente.',
   'Sur devis',
   array['Sous-couche soignée', 'Couleurs de base + lavis', 'Highlights simples', 'Socle standard'],
   1, true),
  ('Tabletop +', 'tabletop-plus',
   'Davantage de détails, contrastes et finitions.',
   'Sur devis',
   array['Tout le niveau Tabletop', 'Éclaircissements multiples', 'Contrastes marqués', 'Détails soignés', 'Socle texturé'],
   2, true),
  ('Premium', 'premium',
   'Travail avancé pour personnages et unités importantes.',
   'Sur devis',
   array['Dégradés fins (blending)', 'NMM ou métaux True Metal', 'Effets OSL', 'Freehands légers', 'Socle personnalisé'],
   3, true),
  ('Display', 'display',
   'Pièce d''exposition avec techniques avancées.',
   'Sur devis',
   array['Niveau concours / vitrine', 'Blending poussé, glacis', 'OSL, SENMM, effets spéciaux', 'Freehands avancés', 'Socle diorama sur-mesure'],
   4, true)
on conflict (slug) do nothing;

-- --- Contenu éditable du site ---------------------------------------------
insert into public.site_settings (key, value) values
  ('hero', jsonb_build_object(
      'eyebrow', 'Peinture sur figurines',
      'title', 'WARHAMMER',
      'brush', 'Donne vie à tes armées',
      'description', 'Peinture sur figurines Warhammer 40K, Age of Sigmar et plus encore. Qualité, passion et détails au rendez-vous.',
      'perks', jsonb_build_array(
        jsonb_build_object('title', 'Travail soigné',        'text', 'Haute qualité'),
        jsonb_build_object('title', 'Délais respectés',      'text', 'Suivi personnalisé'),
        jsonb_build_object('title', 'Passion & expérience',  'text', 'Peintre passionné')
      )
  )),
  ('about', jsonb_build_object(
      'title', 'La passion du détail',
      'body', E'Peintre passionné par l''univers Warhammer, je mets tout mon savoir-faire au service de vos figurines. Chaque projet est réalisé avec soin, patience et exigence pour un résultat à la hauteur de vos attentes.',
      'points', jsonb_build_array(
        jsonb_build_object('title', 'Techniques avancées',    'text', 'Dégradés, NMM, OSL, effets spéciaux...'),
        jsonb_build_object('title', 'Matériel professionnel', 'text', 'Peintures et outils de qualité'),
        jsonb_build_object('title', 'À l''écoute',             'text', 'Conseils et suivi personnalisé')
      )
  )),
  -- Stats désactivées par défaut : aucun chiffre inventé. Activez-les et
  -- renseignez de vraies valeurs depuis /admin/parametres.
  ('stats', jsonb_build_object(
      'enabled', false,
      'items', jsonb_build_array(
        jsonb_build_object('value', '', 'label', 'Figurines peintes'),
        jsonb_build_object('value', '', 'label', 'Clients satisfaits'),
        jsonb_build_object('value', '', 'label', 'Respect des délais'),
        jsonb_build_object('value', '', 'label', 'Passion')
      )
  )),
  ('contact', jsonb_build_object(
      'email', '',
      'instagram', 'https://instagram.com/keiit0_painting',
      'facebook', '',
      'tiktok', '',
      'intro', 'Décrivez votre projet le plus précisément possible : je reviens vers vous avec un devis personnalisé.'
  )),
  ('seo', jsonb_build_object(
      'siteName', 'Keiito Painting',
      'defaultTitle', 'Peinture figurines Warhammer | Keiito Painting',
      'defaultDescription', 'Peinture professionnelle de figurines Warhammer 40K, Age of Sigmar et miniatures. Travail soigné, techniques avancées, sur devis.'
  ))
on conflict (key) do nothing;


-- ===========================================================================
-- Keiito Painting - Mesure d'audience intégrée (sans cookies)
-- À exécuter APRÈS 0001/0002/0003.
-- ---------------------------------------------------------------------------
-- Une ligne = une page vue. Aucune donnée personnelle : pas d'IP, pas de
-- cookie. `session_id` est un identifiant aléatoire stocké en sessionStorage
-- (effacé à la fermeture de l'onglet) qui sert seulement à estimer le nombre
-- de visites / visiteurs uniques par jour.
-- ===========================================================================

create table if not exists public.page_views (
  id            bigint generated always as identity primary key,
  path          text not null,
  creation_slug text,
  referrer      text,               -- hôte du référent ("instagram.com", "google"...) ou null
  source        text,               -- libellé normalisé ("Instagram", "Google", "Direct"...)
  device        text check (device in ('mobile', 'desktop', 'tablet') or device is null),
  session_id    text not null,
  viewed_at     timestamptz not null default now()
);

create index if not exists page_views_viewed_at_idx on public.page_views (viewed_at desc);
create index if not exists page_views_path_idx      on public.page_views (path);
create index if not exists page_views_session_idx   on public.page_views (session_id);
create index if not exists page_views_creation_idx  on public.page_views (creation_slug) where creation_slug is not null;

alter table public.page_views enable row level security;

drop policy if exists "page_views: public insert" on public.page_views;
drop policy if exists "page_views: admin read"    on public.page_views;
drop policy if exists "page_views: admin delete"  on public.page_views;

-- Le public peut enregistrer une vue, mais jamais lire les statistiques.
create policy "page_views: public insert"
  on public.page_views for insert
  with check (
    length(path) between 1 and 300
    and length(session_id) between 6 and 64
    and (creation_slug is null or length(creation_slug) <= 120)
    and (source is null or length(source) <= 60)
  );

create policy "page_views: admin read"
  on public.page_views for select
  using (public.is_admin());

create policy "page_views: admin delete"
  on public.page_views for delete
  using (public.is_admin());
