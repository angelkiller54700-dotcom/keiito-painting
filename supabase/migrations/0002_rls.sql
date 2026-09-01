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
