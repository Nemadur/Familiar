-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.badges (
  uuid uuid NOT NULL DEFAULT gen_random_uuid(),
  label text NOT NULL,
  description text,
  color text NOT NULL,
  CONSTRAINT badges_pkey PRIMARY KEY (uuid)
);
CREATE TABLE public.basket_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  shop_item_id uuid NOT NULL,
  quantity smallint NOT NULL DEFAULT 1,
  price text,
  licenses ARRAY,
  options jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT basket_items_pkey PRIMARY KEY (id),
  CONSTRAINT basket_items_user_id_profiles_id_fk FOREIGN KEY (user_id) REFERENCES public.profiles(uuid),
  CONSTRAINT basket_items_shop_item_id_shop_items_id_fk FOREIGN KEY (shop_item_id) REFERENCES public.shop_items(id)
);
CREATE TABLE public.bookmarked_commissions (
  user_id uuid NOT NULL,
  commission_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bookmarked_commissions_pkey PRIMARY KEY (user_id, commission_id),
  CONSTRAINT bookmarked_commissions_user_id_profiles_id_fk FOREIGN KEY (user_id) REFERENCES public.profiles(uuid),
  CONSTRAINT bookmarked_commissions_commission_id_commissions_id_fk FOREIGN KEY (commission_id) REFERENCES public.commissions(id)
);
CREATE TABLE public.character_reference_credits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reference_id uuid NOT NULL,
  user_id uuid,
  role text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT character_reference_credits_pkey PRIMARY KEY (id),
  CONSTRAINT character_reference_credits_reference_id_character_references_i FOREIGN KEY (reference_id) REFERENCES public.character_references(id),
  CONSTRAINT character_reference_credits_user_id_profiles_id_fk FOREIGN KEY (user_id) REFERENCES public.profiles(uuid)
);
CREATE TABLE public.character_references (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL,
  label text,
  image_url text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT character_references_pkey PRIMARY KEY (id),
  CONSTRAINT character_references_character_id_characters_id_fk FOREIGN KEY (character_id) REFERENCES public.characters(id)
);
CREATE TABLE public.characters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  slug text UNIQUE,
  description text,
  bio text,
  species text,
  gender text,
  age text,
  likes ARRAY,
  avatar_url text,
  cover_url text,
  accent_color text,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  profile_id uuid,
  CONSTRAINT characters_pkey PRIMARY KEY (id),
  CONSTRAINT characters_owner_id_profiles_id_fk FOREIGN KEY (owner_id) REFERENCES public.profiles(uuid),
  CONSTRAINT fk_characters_profile_id FOREIGN KEY (profile_id) REFERENCES public.profiles(uuid)
);
CREATE TABLE public.commissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL,
  title text NOT NULL,
  price double precision NOT NULL,
  description text,
  details ARRAY,
  image_urls ARRAY,
  status USER-DEFINED NOT NULL DEFAULT 'OPEN'::commission_status,
  category text,
  tags ARRAY,
  discount_rate double precision,
  artist_note text,
  license_options jsonb,
  sharing_options jsonb,
  custom_options jsonb,
  includes jsonb,
  is_active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  slots integer,
  CONSTRAINT commissions_pkey PRIMARY KEY (id),
  CONSTRAINT commissions_artist_id_profiles_id_fk FOREIGN KEY (artist_id) REFERENCES public.profiles(uuid)
);
CREATE TABLE public.data_collectors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  event_type text NOT NULL,
  payload jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT data_collectors_pkey PRIMARY KEY (id),
  CONSTRAINT data_collectors_user_id_profiles_id_fk FOREIGN KEY (user_id) REFERENCES public.profiles(uuid)
);
CREATE TABLE public.folders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  tags ARRAY,
  image_urls ARRAY,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT folders_pkey PRIMARY KEY (id),
  CONSTRAINT folders_owner_id_profiles_id_fk FOREIGN KEY (owner_id) REFERENCES public.profiles(uuid)
);
CREATE TABLE public.invite_keys (
  key text NOT NULL,
  created_by uuid NOT NULL,
  used_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  used_at timestamp with time zone,
  CONSTRAINT invite_keys_pkey PRIMARY KEY (key),
  CONSTRAINT invite_keys_created_by_profiles_id_fk FOREIGN KEY (created_by) REFERENCES public.profiles(uuid),
  CONSTRAINT invite_keys_used_by_profiles_id_fk FOREIGN KEY (used_by) REFERENCES public.profiles(uuid)
);
CREATE TABLE public.liked_characters (
  user_id uuid NOT NULL,
  character_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT liked_characters_pkey PRIMARY KEY (user_id, character_id),
  CONSTRAINT liked_characters_user_id_profiles_id_fk FOREIGN KEY (user_id) REFERENCES public.profiles(uuid),
  CONSTRAINT liked_characters_character_id_characters_id_fk FOREIGN KEY (character_id) REFERENCES public.characters(id)
);
CREATE TABLE public.liked_posts (
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT liked_posts_pkey PRIMARY KEY (user_id, post_id),
  CONSTRAINT liked_posts_user_id_profiles_id_fk FOREIGN KEY (user_id) REFERENCES public.profiles(uuid),
  CONSTRAINT liked_posts_post_id_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  commission_id uuid NOT NULL,
  client_id uuid NOT NULL,
  artist_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'PENDING'::order_status,
  post_id uuid,
  completed_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_commission_id_commissions_id_fk FOREIGN KEY (commission_id) REFERENCES public.commissions(id),
  CONSTRAINT orders_post_id_posts_id_fk FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT orders_client_id_profiles_id_fk FOREIGN KEY (client_id) REFERENCES public.profiles(uuid),
  CONSTRAINT orders_artist_id_profiles_id_fk FOREIGN KEY (artist_id) REFERENCES public.profiles(uuid)
);
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  content text,
  category text,
  tags ARRAY,
  published boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  image_urls ARRAY,
  media jsonb,
  character_id uuid,
  published_at timestamp with time zone,
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_author_id_profiles_id_fk FOREIGN KEY (author_id) REFERENCES public.profiles(uuid),
  CONSTRAINT posts_character_id_characters_id_fk FOREIGN KEY (character_id) REFERENCES public.characters(id)
);
CREATE TABLE public.profile_badges (
  profile_uuid uuid NOT NULL,
  badge_uuid uuid NOT NULL,
  CONSTRAINT profile_badges_pkey PRIMARY KEY (profile_uuid, badge_uuid),
  CONSTRAINT profile_badges_profile_uuid_fkey FOREIGN KEY (profile_uuid) REFERENCES public.profiles(uuid),
  CONSTRAINT profile_badges_badge_uuid_fkey FOREIGN KEY (badge_uuid) REFERENCES public.badges(uuid)
);
CREATE TABLE public.profile_social_links (
  profile_uuid uuid NOT NULL,
  label text NOT NULL,
  url text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT profile_social_links_pkey PRIMARY KEY (id),
  CONSTRAINT profile_social_links_profile_uuid_fkey FOREIGN KEY (profile_uuid) REFERENCES public.profiles(uuid)
);
CREATE TABLE public.profile_spoken_languages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  code text NOT NULL,
  experience USER-DEFINED NOT NULL DEFAULT 'communicative'::spoken_experience,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profile_spoken_languages_pkey PRIMARY KEY (id),
  CONSTRAINT profile_spoken_languages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(uuid)
);
CREATE TABLE public.profiles (
  uuid uuid NOT NULL DEFAULT auth.uid(),
  username text NOT NULL UNIQUE,
  display_name text NOT NULL,
  bio text,
  accent_color text,
  roles ARRAY NOT NULL DEFAULT ARRAY['client'::text],
  is_premium boolean DEFAULT false,
  is_verified boolean DEFAULT false,
  timezone text,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  pronouns text,
  avatar text,
  cover text,
  tos_summary text,
  CONSTRAINT profiles_pkey PRIMARY KEY (uuid),
  CONSTRAINT profiles_uuid_fkey FOREIGN KEY (uuid) REFERENCES auth.users(id)
);
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  author_id uuid NOT NULL,
  rating smallint NOT NULL,
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT reviews_author_id_profiles_id_fk FOREIGN KEY (author_id) REFERENCES public.profiles(uuid)
);
CREATE TABLE public.shop_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  price text NOT NULL,
  type USER-DEFINED NOT NULL,
  category text,
  tags ARRAY,
  sold_count smallint NOT NULL DEFAULT 0,
  image_urls ARRAY,
  file_url text,
  license_options jsonb,
  custom_options jsonb,
  includes jsonb,
  is_active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  discount_rate double precision,
  CONSTRAINT shop_items_pkey PRIMARY KEY (id),
  CONSTRAINT shop_items_artist_id_profiles_id_fk FOREIGN KEY (artist_id) REFERENCES public.profiles(uuid)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  stripe_payment_id text UNIQUE,
  order_id uuid,
  amount text NOT NULL,
  currency text NOT NULL DEFAULT 'USD'::text,
  status USER-DEFINED NOT NULL DEFAULT 'PENDING'::transaction_status,
  payer_id uuid,
  recipient_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_order_id_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT transactions_recipient_id_profiles_id_fk FOREIGN KEY (recipient_id) REFERENCES public.profiles(uuid),
  CONSTRAINT transactions_payer_id_profiles_id_fk FOREIGN KEY (payer_id) REFERENCES public.profiles(uuid)
);
