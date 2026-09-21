-- Hotel inventory and atomic booking availability.
ALTER TYPE property_type ADD VALUE IF NOT EXISTS 'appartement_studio';
ALTER TYPE property_type ADD VALUE IF NOT EXISTS 'maison';
ALTER TYPE property_type ADD VALUE IF NOT EXISTS 'villa';
ALTER TYPE property_type ADD VALUE IF NOT EXISTS 'autre';
ALTER TYPE property_type ADD VALUE IF NOT EXISTS 'hotel';

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS hotel_name text,
  ADD COLUMN IF NOT EXISTS room_type_label text,
  ADD COLUMN IF NOT EXISTS room_units_count integer NOT NULL DEFAULT 1;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'properties_room_units_count_check') THEN
    ALTER TABLE public.properties ADD CONSTRAINT properties_room_units_count_check CHECK (room_units_count > 0);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_booking_if_available(
  p_property_id uuid,
  p_client_id uuid,
  p_check_in date,
  p_check_out date,
  p_guests integer,
  p_total_price integer,
  p_booking_type text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_units integer;
  v_booked integer;
  v_booking_id uuid;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_client_id THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(p_property_id::text, 0));
  SELECT room_units_count INTO v_units FROM public.properties WHERE id = p_property_id;
  IF v_units IS NULL THEN RAISE EXCEPTION 'property_not_found'; END IF;

  SELECT count(*) INTO v_booked
  FROM public.bookings
  WHERE property_id = p_property_id
    AND status NOT IN ('rejected', 'cancelled', 'refunded')
    AND check_in < p_check_out AND check_out > p_check_in;

  IF v_booked >= v_units THEN RAISE EXCEPTION 'property_unavailable'; END IF;

  INSERT INTO public.bookings (property_id, client_id, check_in, check_out, guests, total_price, status, booking_type)
  VALUES (p_property_id, p_client_id, p_check_in, p_check_out, p_guests, p_total_price, 'pending', p_booking_type)
  RETURNING id INTO v_booking_id;
  RETURN v_booking_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_booking_if_available(uuid, uuid, date, date, integer, integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_booking_if_available(uuid, uuid, date, date, integer, integer, text) TO authenticated;