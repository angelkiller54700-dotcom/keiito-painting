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
