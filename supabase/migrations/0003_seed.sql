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
      'tiktok', 'https://www.tiktok.com/@keiit0_painting',
      'intro', 'Décrivez votre projet le plus précisément possible : je reviens vers vous avec un devis personnalisé.'
  )),
  ('seo', jsonb_build_object(
      'siteName', 'Keiito Painting',
      'defaultTitle', 'Peinture figurines Warhammer | Keiito Painting',
      'defaultDescription', 'Peinture professionnelle de figurines Warhammer 40K, Age of Sigmar et miniatures. Travail soigné, techniques avancées, sur devis.'
  ))
on conflict (key) do nothing;
