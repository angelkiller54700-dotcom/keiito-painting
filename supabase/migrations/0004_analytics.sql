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
