-- ===========================================================================
-- Keiito Painting - Correctif : trigger updated_at de site_settings
-- ---------------------------------------------------------------------------
-- Bug : le trigger de site_settings utilisait la même fonction que celui de
-- `creations`, qui référence `new.status` / `new.published_at`. Or ces colonnes
-- n'existent pas sur `site_settings` -> toute MISE À JOUR d'un réglage échouait
-- avec « record "new" has no field "status" ».
-- Correctif : une fonction dédiée qui ne touche qu'à `updated_at`.
-- ===========================================================================

create or replace function public.touch_updated_at_only()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch
  before update on public.site_settings
  for each row execute function public.touch_updated_at_only();
