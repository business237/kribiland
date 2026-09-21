-- Migration : Ajout des champs d'information de paiement client sur les réservations
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS payer_phone_number text,
  ADD COLUMN IF NOT EXISTS payer_network text;

-- Si besoin, mettre à jour la valeur par défaut du statut pour les nouvelles réservations (optionnel)
-- ALTER TABLE public.bookings ALTER COLUMN status SET DEFAULT 'pending_payment';
