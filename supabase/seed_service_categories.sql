-- ============================================================
-- seed_service_categories.sql
-- À exécuter UNE SEULE FOIS dans l'éditeur SQL de Supabase
-- Dashboard > SQL Editor > New query > Coller > Run
-- ============================================================

INSERT INTO public.service_categories (slug, label, icon)
VALUES
  ('transport',        'Transport & VTC',          '🚗'),
  ('restauration',     'Restauration & Traiteur',  '🍽️'),
  ('location_vehicule','Location de véhicule',     '🛵'),
  ('guide',            'Guide & Excursions',        '🧭')
ON CONFLICT (slug) DO UPDATE
  SET label = EXCLUDED.label,
      icon  = EXCLUDED.icon;
