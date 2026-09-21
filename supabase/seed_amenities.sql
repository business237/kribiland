-- Équipements de logement pour le wizard de création/édition.
-- À exécuter une seule fois dans Supabase > SQL Editor.
INSERT INTO public.amenities (slug, label, icon, category)
VALUES
  ('wifi', 'Wi-Fi', 'Wifi', 'general'),
  ('climatisation', 'Climatisation', 'Snowflake', 'general'),
  ('television', 'Télévision', 'Tv', 'general'),
  ('parking', 'Parking', 'Car', 'general'),
  ('piscine', 'Piscine', 'Waves', 'exterieur'),
  ('terrasse', 'Terrasse', 'Sun', 'exterieur'),
  ('jardin', 'Jardin', 'TreePine', 'exterieur'),
  ('vue_mer', 'Vue sur la mer', 'Umbrella', 'exterieur'),
  ('cuisine_equipee', 'Cuisine équipée', 'CookingPot', 'cuisine'),
  ('refrigerateur', 'Réfrigérateur', 'Refrigerator', 'cuisine'),
  ('micro_ondes', 'Micro-ondes', 'Microwave', 'cuisine'),
  ('securite_24h', 'Sécurité 24h/24', 'ShieldCheck', 'securite'),
  ('alarme', 'Alarme', 'AlarmClock', 'securite'),
  ('portail', 'Portail sécurisé', 'DoorOpen', 'securite'),
  ('cloture', 'Logement clôturé', 'Fence', 'securite')
ON CONFLICT (slug) DO UPDATE
SET label = EXCLUDED.label,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category;
