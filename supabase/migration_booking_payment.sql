-- =============================================================================
-- Migration : Flux de paiement manuel Mobile Money (KribiLand v1)
-- À exécuter dans le SQL Editor de Supabase (une seule fois)
-- =============================================================================

-- 1. Numéro Mobile Money de l'hôte (optionnel, stocké sur profiles)
--    Format attendu par l'application : "+237XXXXXXXXX" ou "237XXXXXXXXX"
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mobile_money_number text;

COMMENT ON COLUMN public.profiles.mobile_money_number IS
  'Numéro Mobile Money (Orange Money, MTN MoMo…) de l''hôte, affiché au client après confirmation de réservation. Optionnel.';

-- 2. Nouveau statut "completed" pour signaler qu'un paiement a été confirmé
--    par l'hôte. Vient s'ajouter aux valeurs existantes de order_status :
--    pending | accepted | rejected → + completed
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'completed';

-- 3. Flag posé par le CLIENT pour indiquer qu'il a effectué le virement
--    (avant confirmation réelle par l'hôte). Pas de webhook, pas d'API
--    de paiement — flux 100 % manuel.
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_confirmed_by_client boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.bookings.payment_confirmed_by_client IS
  'true quand le client a cliqué "J''ai payé". L''hôte doit ensuite confirmer la réception avant que le statut passe à completed.';

-- =============================================================================
-- ROLLBACK (si besoin d'annuler) :
--
-- ALTER TABLE public.bookings DROP COLUMN IF EXISTS payment_confirmed_by_client;
-- ALTER TABLE public.profiles  DROP COLUMN IF EXISTS mobile_money_number;
-- -- NB : supprimer une valeur d'enum est complexe sous Postgres.
-- --      Pour rollback complet, recréer l'enum sans 'completed' n'est pas trivial.
-- --      Solution de contournement : ne plus écrire 'completed' dans le code.
-- =============================================================================
