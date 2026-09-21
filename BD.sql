-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.spatial_ref_sys (
  srid integer NOT NULL CHECK (srid > 0 AND srid <= 998999),
  auth_name character varying,
  auth_srid integer,
  srtext character varying,
  proj4text character varying,
  CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'client'::user_role,
  full_name text NOT NULL,
  phone text UNIQUE,
  email text UNIQUE,
  avatar_url text,
  business_name text,
  id_document_url text,
  verification_status USER-DEFINED NOT NULL DEFAULT 'verified'::verification_status,
  verification_note text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  mobile_money_number text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.properties (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  host_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  type USER-DEFINED NOT NULL,
  quartier text NOT NULL,
  address text,
  location USER-DEFINED,
  price_per_night integer CHECK (price_per_night IS NULL OR price_per_night > 0),
  capacity integer NOT NULL CHECK (capacity > 0),
  bedrooms integer DEFAULT 1,
  check_in_time time without time zone DEFAULT '14:00:00'::time without time zone,
  check_out_time time without time zone DEFAULT '11:00:00'::time without time zone,
  min_nights integer NOT NULL DEFAULT 1 CHECK (min_nights > 0),
  max_nights integer,
  house_rules ARRAY,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::listing_status,
  rejection_reason text,
  average_rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  rental_mode USER-DEFINED NOT NULL DEFAULT 'courte_duree'::rental_mode,
  price_per_month integer CHECK (price_per_month IS NULL OR price_per_month > 0),
  min_months integer DEFAULT 1 CHECK (min_months > 0),
  latitude double precision,
  longitude double precision,
  bathrooms integer DEFAULT 1 CHECK (bathrooms >= 0),
  living_rooms integer DEFAULT 1 CHECK (living_rooms >= 0),
  deposit_amount integer CHECK (deposit_amount IS NULL OR deposit_amount >= 0),
  advance_months integer CHECK (advance_months IS NULL OR advance_months >= 0),
  electricity_type USER-DEFINED,
  water_source USER-DEFINED,
  is_fenced boolean,
  has_gate boolean,
  road_access USER-DEFINED,
  is_furnished boolean,
  shower_type USER-DEFINED DEFAULT 'interne'::shower_type,
  hotel_name text,
  room_type_label text,
  room_units_count integer NOT NULL DEFAULT 1 CHECK (room_units_count >= 1),
  private_bathroom boolean DEFAULT true,
  CONSTRAINT properties_pkey PRIMARY KEY (id),
  CONSTRAINT properties_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.property_images (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL,
  url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT property_images_pkey PRIMARY KEY (id),
  CONSTRAINT property_images_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id)
);
CREATE TABLE public.amenities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  icon text,
  category text DEFAULT 'general'::text,
  CONSTRAINT amenities_pkey PRIMARY KEY (id)
);
CREATE TABLE public.property_amenities (
  property_id uuid NOT NULL,
  amenity_id uuid NOT NULL,
  CONSTRAINT property_amenities_pkey PRIMARY KEY (property_id, amenity_id),
  CONSTRAINT property_amenities_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
  CONSTRAINT property_amenities_amenity_id_fkey FOREIGN KEY (amenity_id) REFERENCES public.amenities(id)
);
CREATE TABLE public.property_availability (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL,
  date date NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  CONSTRAINT property_availability_pkey PRIMARY KEY (id),
  CONSTRAINT property_availability_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id)
);
CREATE TABLE public.activities (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  location USER-DEFINED,
  quartier text,
  indicative_price text,
  contact_phone text,
  status USER-DEFINED NOT NULL DEFAULT 'published'::listing_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  latitude double precision,
  longitude double precision,
  CONSTRAINT activities_pkey PRIMARY KEY (id)
);
CREATE TABLE public.activity_images (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  activity_id uuid NOT NULL,
  url text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  CONSTRAINT activity_images_pkey PRIMARY KEY (id),
  CONSTRAINT activity_images_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id)
);
CREATE TABLE public.service_categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  slug USER-DEFINED NOT NULL UNIQUE,
  label text NOT NULL,
  icon text,
  CONSTRAINT service_categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  provider_id uuid NOT NULL,
  category_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  quartier text,
  location USER-DEFINED,
  price text,
  contact_phone text,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::listing_status,
  rejection_reason text,
  average_rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  latitude double precision,
  longitude double precision,
  price_amount integer CHECK (price_amount IS NULL OR price_amount >= 0),
  CONSTRAINT services_pkey PRIMARY KEY (id),
  CONSTRAINT services_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.profiles(id),
  CONSTRAINT services_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id)
);
CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL,
  client_id uuid NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  guests integer NOT NULL CHECK (guests > 0),
  total_price integer NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::order_status,
  rejection_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  payment_confirmed_by_client boolean NOT NULL DEFAULT false,
  booking_type text NOT NULL DEFAULT 'courte_duree'::text CHECK (booking_type = ANY (ARRAY['courte_duree'::text, 'longue_duree'::text])),
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
  CONSTRAINT bookings_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.service_orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  service_id uuid NOT NULL,
  client_id uuid NOT NULL,
  requested_at timestamp with time zone NOT NULL,
  details text,
  price integer,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::order_status,
  rejection_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT service_orders_pkey PRIMARY KEY (id),
  CONSTRAINT service_orders_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id),
  CONSTRAINT service_orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  booking_id uuid,
  service_order_id uuid,
  payer_id uuid NOT NULL,
  amount integer NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'XAF'::text,
  method USER-DEFINED NOT NULL,
  provider text,
  provider_transaction_ref text,
  payment_attempt integer NOT NULL DEFAULT 1,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::payment_status,
  failure_reason text,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT payments_service_order_id_fkey FOREIGN KEY (service_order_id) REFERENCES public.service_orders(id),
  CONSTRAINT payments_payer_id_fkey FOREIGN KEY (payer_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.payment_events (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  payment_id uuid NOT NULL,
  event_type text NOT NULL,
  raw_payload jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payment_events_pkey PRIMARY KEY (id),
  CONSTRAINT payment_events_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id)
);
CREATE TABLE public.commissions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  payment_id uuid NOT NULL,
  rate numeric NOT NULL,
  amount integer NOT NULL,
  beneficiary_id uuid NOT NULL,
  net_amount integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT commissions_pkey PRIMARY KEY (id),
  CONSTRAINT commissions_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id),
  CONSTRAINT commissions_beneficiary_id_fkey FOREIGN KEY (beneficiary_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.payouts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  beneficiary_id uuid NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  amount integer NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'not_started'::text,
  method USER-DEFINED,
  provider_transaction_ref text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  processed_at timestamp with time zone,
  CONSTRAINT payouts_pkey PRIMARY KEY (id),
  CONSTRAINT payouts_beneficiary_id_fkey FOREIGN KEY (beneficiary_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  author_id uuid NOT NULL,
  target_type USER-DEFINED NOT NULL,
  property_id uuid,
  service_id uuid,
  activity_id uuid,
  booking_id uuid,
  service_order_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id),
  CONSTRAINT reviews_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
  CONSTRAINT reviews_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id),
  CONSTRAINT reviews_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id),
  CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id),
  CONSTRAINT reviews_service_order_id_fkey FOREIGN KEY (service_order_id) REFERENCES public.service_orders(id)
);
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  client_id uuid NOT NULL,
  partner_id uuid NOT NULL,
  property_id uuid,
  service_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_message_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT conversations_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.profiles(id),
  CONSTRAINT conversations_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
  CONSTRAINT conversations_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  type USER-DEFINED NOT NULL,
  title text NOT NULL,
  body text,
  is_read boolean NOT NULL DEFAULT false,
  related_booking_id uuid,
  related_service_order_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT notifications_related_booking_id_fkey FOREIGN KEY (related_booking_id) REFERENCES public.bookings(id),
  CONSTRAINT notifications_related_service_order_id_fkey FOREIGN KEY (related_service_order_id) REFERENCES public.service_orders(id)
);
CREATE TABLE public.favorites (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  property_id uuid,
  activity_id uuid,
  service_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT favorites_pkey PRIMARY KEY (id),
  CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT favorites_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
  CONSTRAINT favorites_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id),
  CONSTRAINT favorites_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.support_tickets (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  related_booking_id uuid,
  related_service_order_id uuid,
  status text NOT NULL DEFAULT 'open'::text,
  admin_note text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT support_tickets_pkey PRIMARY KEY (id),
  CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT support_tickets_related_booking_id_fkey FOREIGN KEY (related_booking_id) REFERENCES public.bookings(id),
  CONSTRAINT support_tickets_related_service_order_id_fkey FOREIGN KEY (related_service_order_id) REFERENCES public.service_orders(id)
);