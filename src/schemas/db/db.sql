-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE familiar.artist_invite_codes (
  code text NOT NULL CHECK (code ~ '^FAM-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{3}$'::text),
  created_by_user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'unused'::text CHECK (status = ANY (ARRAY['unused'::text, 'used'::text, 'revoked'::text, 'expired'::text])),
  used_by_user_id uuid,
  used_at timestamp with time zone,
  CONSTRAINT artist_invite_codes_pkey PRIMARY KEY (code),
  CONSTRAINT artist_invite_codes_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT artist_invite_codes_used_by_user_id_fkey FOREIGN KEY (used_by_user_id) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.artist_similarity (
  artist_id uuid NOT NULL,
  similar_artist_id uuid NOT NULL,
  score numeric NOT NULL CHECK (score >= 0::numeric AND score <= 1::numeric),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT artist_similarity_pkey PRIMARY KEY (artist_id, similar_artist_id),
  CONSTRAINT artist_similarity_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT artist_similarity_similar_artist_id_fkey FOREIGN KEY (similar_artist_id) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.artist_terms (
  terms_id uuid NOT NULL DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL,
  version integer NOT NULL,
  tos_md character varying NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT artist_terms_pkey PRIMARY KEY (terms_id),
  CONSTRAINT artist_terms_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.badges (
  badge_id text NOT NULL,
  label text NOT NULL,
  icon_path text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  description text,
  color text CHECK (color IS NULL OR color ~ '^#[A-Fa-f0-9]{6}$'::text),
  CONSTRAINT badges_pkey PRIMARY KEY (badge_id)
);
CREATE TABLE familiar.commission_categories (
  category_id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug USER-DEFINED NOT NULL UNIQUE,
  label text NOT NULL,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT commission_categories_pkey PRIMARY KEY (category_id)
);
CREATE TABLE familiar.commission_listing_licenses (
  listing_id uuid NOT NULL,
  license_id uuid NOT NULL,
  visible boolean NOT NULL DEFAULT true,
  included boolean NOT NULL DEFAULT false,
  pricing_mode USER-DEFINED NOT NULL DEFAULT 'included'::familiar.license_pricing_mode,
  add_fixed_usd numeric CHECK (add_fixed_usd IS NULL OR add_fixed_usd >= 0::numeric),
  add_percent numeric CHECK (add_percent IS NULL OR add_percent >= 0::numeric AND add_percent <= 10::numeric),
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT commission_listing_licenses_pkey PRIMARY KEY (listing_id, license_id),
  CONSTRAINT commission_listing_licenses_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES familiar.commission_listings(listing_id),
  CONSTRAINT commission_listing_licenses_license_id_fkey FOREIGN KEY (license_id) REFERENCES familiar.license_definitions(license_id)
);
CREATE TABLE familiar.commission_listing_media (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT commission_listing_media_pkey PRIMARY KEY (id),
  CONSTRAINT commission_listing_media_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES familiar.commission_listings(listing_id),
  CONSTRAINT commission_listing_media_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES familiar.media_assets(asset_id)
);
CREATE TABLE familiar.commission_listing_metrics (
  listing_id uuid NOT NULL,
  reviews_count integer NOT NULL DEFAULT 0,
  rating_avg numeric NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT commission_listing_metrics_pkey PRIMARY KEY (listing_id),
  CONSTRAINT commission_listing_metrics_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES familiar.commission_listings(listing_id)
);
CREATE TABLE familiar.commission_listings (
  listing_id uuid NOT NULL DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL,
  category_id uuid NOT NULL,
  slug USER-DEFINED,
  title text NOT NULL,
  base_price_usd numeric NOT NULL CHECK (base_price_usd >= 0::numeric),
  discount_rate numeric NOT NULL DEFAULT 0 CHECK (discount_rate >= 0::numeric AND discount_rate <= 1::numeric),
  status USER-DEFINED NOT NULL DEFAULT 'open'::familiar.listing_status,
  service_type USER-DEFINED,
  communication_type USER-DEFINED,
  requesting_process USER-DEFINED,
  artist_note text,
  description_md text,
  tags ARRAY NOT NULL DEFAULT '{}'::text[],
  content_warnings ARRAY NOT NULL DEFAULT '{}'::familiar.content_warning[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT commission_listings_pkey PRIMARY KEY (listing_id),
  CONSTRAINT commission_listings_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT commission_listings_category_id_fkey FOREIGN KEY (category_id) REFERENCES familiar.commission_categories(category_id)
);
CREATE TABLE familiar.commission_order_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  label text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT commission_order_attachments_pkey PRIMARY KEY (id),
  CONSTRAINT commission_order_attachments_order_id_fkey FOREIGN KEY (order_id) REFERENCES familiar.commission_orders(order_id),
  CONSTRAINT commission_order_attachments_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES familiar.media_assets(asset_id)
);
CREATE TABLE familiar.commission_orders (
  order_id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  artist_id uuid NOT NULL,
  listing_id uuid NOT NULL,
  sona_id uuid,
  status USER-DEFINED NOT NULL DEFAULT 'draft'::familiar.commission_order_status,
  selected_license_ids ARRAY NOT NULL DEFAULT '{}'::uuid[],
  price_snapshot_usd numeric,
  discount_snapshot_rate numeric,
  licenses_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  terms_id_accepted uuid,
  terms_version_accepted integer,
  form_answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT commission_orders_pkey PRIMARY KEY (order_id),
  CONSTRAINT commission_orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT commission_orders_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT commission_orders_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES familiar.commission_listings(listing_id),
  CONSTRAINT commission_orders_sona_id_fkey FOREIGN KEY (sona_id) REFERENCES familiar.sonas(sona_id),
  CONSTRAINT commission_orders_terms_id_accepted_fkey FOREIGN KEY (terms_id_accepted) REFERENCES familiar.artist_terms(terms_id)
);
CREATE TABLE familiar.currencies (
  code text NOT NULL,
  symbol text NOT NULL,
  decimals integer NOT NULL DEFAULT 2,
  CONSTRAINT currencies_pkey PRIMARY KEY (code)
);
CREATE TABLE familiar.dm_conversations (
  conversation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_message_at timestamp with time zone,
  CONSTRAINT dm_conversations_pkey PRIMARY KEY (conversation_id)
);
CREATE TABLE familiar.dm_messages (
  message_id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  body text NOT NULL,
  attachments jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT dm_messages_pkey PRIMARY KEY (message_id),
  CONSTRAINT dm_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES familiar.dm_conversations(conversation_id),
  CONSTRAINT dm_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.dm_participants (
  conversation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role USER-DEFINED NOT NULL DEFAULT 'member'::familiar.dm_participant_role,
  CONSTRAINT dm_participants_pkey PRIMARY KEY (conversation_id, user_id),
  CONSTRAINT dm_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES familiar.dm_conversations(conversation_id),
  CONSTRAINT dm_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.folder_commission_listings (
  folder_id uuid NOT NULL,
  listing_id uuid NOT NULL,
  added_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT folder_commission_listings_pkey PRIMARY KEY (folder_id, listing_id),
  CONSTRAINT folder_commission_listings_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES familiar.folders(folder_id),
  CONSTRAINT folder_commission_listings_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES familiar.commission_listings(listing_id)
);
CREATE TABLE familiar.folder_posts (
  folder_id uuid NOT NULL,
  post_id uuid NOT NULL,
  added_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT folder_posts_pkey PRIMARY KEY (folder_id, post_id),
  CONSTRAINT folder_posts_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES familiar.folders(folder_id),
  CONSTRAINT folder_posts_post_id_fkey FOREIGN KEY (post_id) REFERENCES familiar.posts(post_id)
);
CREATE TABLE familiar.folder_shop_items (
  folder_id uuid NOT NULL,
  item_id uuid NOT NULL,
  added_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT folder_shop_items_pkey PRIMARY KEY (folder_id, item_id),
  CONSTRAINT folder_shop_items_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES familiar.folders(folder_id),
  CONSTRAINT folder_shop_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES familiar.shop_items(item_id)
);
CREATE TABLE familiar.folders (
  folder_id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  parent_id uuid,
  name text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_archived boolean NOT NULL DEFAULT false,
  visibility USER-DEFINED NOT NULL DEFAULT 'private'::familiar.folder_visibility,
  share_token text UNIQUE,
  share_expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT folders_pkey PRIMARY KEY (folder_id),
  CONSTRAINT folders_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT folders_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES familiar.folders(folder_id)
);
CREATE TABLE familiar.follows (
  follower_id uuid NOT NULL,
  followed_user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  status USER-DEFINED NOT NULL DEFAULT 'accepted'::familiar.follow_status,
  accepted_at timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT follows_pkey PRIMARY KEY (follower_id, followed_user_id),
  CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT follows_followed_user_id_fkey FOREIGN KEY (followed_user_id) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.form_fields (
  field_id uuid NOT NULL DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL,
  type text NOT NULL,
  key text NOT NULL,
  label text NOT NULL,
  description text,
  required boolean NOT NULL DEFAULT false,
  included boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  validation jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT form_fields_pkey PRIMARY KEY (field_id),
  CONSTRAINT form_fields_template_id_fkey FOREIGN KEY (template_id) REFERENCES familiar.form_templates(template_id)
);
CREATE TABLE familiar.form_templates (
  template_id uuid NOT NULL DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL,
  scope text NOT NULL CHECK (scope = ANY (ARRAY['profile_default'::text, 'listing_specific'::text])),
  listing_id uuid,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT form_templates_pkey PRIMARY KEY (template_id),
  CONSTRAINT form_templates_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT form_templates_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES familiar.commission_listings(listing_id)
);
CREATE TABLE familiar.fx_rates (
  base text NOT NULL DEFAULT 'USD'::text,
  quote text NOT NULL,
  as_of timestamp with time zone NOT NULL,
  rate numeric NOT NULL CHECK (rate > 0::numeric),
  CONSTRAINT fx_rates_pkey PRIMARY KEY (base, quote, as_of),
  CONSTRAINT fx_rates_quote_fkey FOREIGN KEY (quote) REFERENCES familiar.currencies(code)
);
CREATE TABLE familiar.invite_privileges (
  user_id uuid NOT NULL,
  can_generate boolean NOT NULL DEFAULT true,
  disabled_until timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT invite_privileges_pkey PRIMARY KEY (user_id),
  CONSTRAINT invite_privileges_user_id_fkey FOREIGN KEY (user_id) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.inviter_penalties (
  penalty_id uuid NOT NULL DEFAULT gen_random_uuid(),
  inviter_id uuid NOT NULL,
  invited_user_id uuid,
  type text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT inviter_penalties_pkey PRIMARY KEY (penalty_id),
  CONSTRAINT inviter_penalties_inviter_id_fkey FOREIGN KEY (inviter_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT inviter_penalties_invited_user_id_fkey FOREIGN KEY (invited_user_id) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.license_definitions (
  license_id uuid NOT NULL DEFAULT gen_random_uuid(),
  key USER-DEFINED NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  created_by_artist_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT license_definitions_pkey PRIMARY KEY (license_id),
  CONSTRAINT license_definitions_created_by_artist_id_fkey FOREIGN KEY (created_by_artist_id) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.media_assets (
  asset_id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL,
  type USER-DEFINED NOT NULL,
  mime text NOT NULL,
  path text NOT NULL,
  size_bytes bigint NOT NULL,
  width integer CHECK (width IS NULL OR width >= 0),
  height integer CHECK (height IS NULL OR height >= 0),
  duration_ms integer,
  hash text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT media_assets_pkey PRIMARY KEY (asset_id),
  CONSTRAINT media_assets_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.moderation_strikes (
  strike_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  issued_by uuid,
  reason text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  CONSTRAINT moderation_strikes_pkey PRIMARY KEY (strike_id),
  CONSTRAINT moderation_strikes_user_id_fkey FOREIGN KEY (user_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT moderation_strikes_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.notifications (
  notification_id uuid NOT NULL DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL,
  actor_id uuid,
  type text NOT NULL,
  entity_type text,
  entity_id uuid,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  read_at timestamp with time zone,
  CONSTRAINT notifications_pkey PRIMARY KEY (notification_id),
  CONSTRAINT notifications_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT notifications_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.post_featured_review (
  post_id uuid NOT NULL,
  review_id uuid NOT NULL,
  attached_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT post_featured_review_pkey PRIMARY KEY (post_id),
  CONSTRAINT post_featured_review_post_id_fkey FOREIGN KEY (post_id) REFERENCES familiar.posts(post_id),
  CONSTRAINT post_featured_review_review_id_fkey FOREIGN KEY (review_id) REFERENCES familiar.reviews(review_id)
);
CREATE TABLE familiar.post_likes (
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT post_likes_pkey PRIMARY KEY (user_id, post_id),
  CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES familiar.posts(post_id)
);
CREATE TABLE familiar.post_media (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT post_media_pkey PRIMARY KEY (id),
  CONSTRAINT post_media_post_id_fkey FOREIGN KEY (post_id) REFERENCES familiar.posts(post_id),
  CONSTRAINT post_media_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES familiar.media_assets(asset_id)
);
CREATE TABLE familiar.post_metrics (
  post_id uuid NOT NULL,
  likes_count integer NOT NULL DEFAULT 0,
  views_count integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT post_metrics_pkey PRIMARY KEY (post_id),
  CONSTRAINT post_metrics_post_id_fkey FOREIGN KEY (post_id) REFERENCES familiar.posts(post_id)
);
CREATE TABLE familiar.post_sona_refs (
  post_id uuid NOT NULL,
  sona_id uuid NOT NULL,
  added_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT post_sona_refs_pkey PRIMARY KEY (post_id, sona_id),
  CONSTRAINT post_sona_refs_post_id_fkey FOREIGN KEY (post_id) REFERENCES familiar.posts(post_id),
  CONSTRAINT post_sona_refs_sona_id_fkey FOREIGN KEY (sona_id) REFERENCES familiar.sonas(sona_id)
);
CREATE TABLE familiar.post_views (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL,
  viewer_user_id uuid,
  viewer_fingerprint text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT post_views_pkey PRIMARY KEY (id),
  CONSTRAINT post_views_post_id_fkey FOREIGN KEY (post_id) REFERENCES familiar.posts(post_id),
  CONSTRAINT post_views_viewer_user_id_fkey FOREIGN KEY (viewer_user_id) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.posts (
  post_id uuid NOT NULL DEFAULT gen_random_uuid(),
  artist_id uuid NOT NULL,
  title text,
  body_md text,
  visibility USER-DEFINED NOT NULL DEFAULT 'public'::familiar.visibility,
  tags ARRAY NOT NULL DEFAULT '{}'::text[],
  content_warnings ARRAY NOT NULL DEFAULT '{}'::familiar.content_warning[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (post_id),
  CONSTRAINT posts_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.profiles (
  user_id uuid NOT NULL,
  username USER-DEFINED NOT NULL UNIQUE,
  display_name text NOT NULL,
  timezone text,
  pronouns text,
  bio character varying,
  avatar_path text,
  cover_path text,
  is_private boolean NOT NULL DEFAULT false,
  is_verified boolean NOT NULL DEFAULT false,
  is_premium boolean NOT NULL DEFAULT false,
  premium_until timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  accent_color text CHECK (accent_color IS NULL OR accent_color ~ '^#[A-Fa-f0-9]{6}$'::text),
  CONSTRAINT profiles_pkey PRIMARY KEY (user_id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE familiar.reports (
  report_id uuid NOT NULL DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  target_type USER-DEFINED NOT NULL,
  target_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status USER-DEFINED NOT NULL DEFAULT 'open'::familiar.report_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reports_pkey PRIMARY KEY (report_id),
  CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.reviews (
  review_id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE,
  listing_id uuid NOT NULL,
  artist_id uuid NOT NULL,
  client_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  chips ARRAY NOT NULL DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (review_id),
  CONSTRAINT reviews_order_id_fkey FOREIGN KEY (order_id) REFERENCES familiar.commission_orders(order_id),
  CONSTRAINT reviews_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES familiar.commission_listings(listing_id),
  CONSTRAINT reviews_artist_id_fkey FOREIGN KEY (artist_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT reviews_client_id_fkey FOREIGN KEY (client_id) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.roles (
  role_key text NOT NULL,
  label text NOT NULL,
  is_staff boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT roles_pkey PRIMARY KEY (role_key)
);
CREATE TABLE familiar.saved_commission_listings (
  user_id uuid NOT NULL,
  listing_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT saved_commission_listings_pkey PRIMARY KEY (user_id, listing_id),
  CONSTRAINT saved_commission_listings_user_id_fkey FOREIGN KEY (user_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT saved_commission_listings_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES familiar.commission_listings(listing_id)
);
CREATE TABLE familiar.saved_posts (
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT saved_posts_pkey PRIMARY KEY (user_id, post_id),
  CONSTRAINT saved_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT saved_posts_post_id_fkey FOREIGN KEY (post_id) REFERENCES familiar.posts(post_id)
);
CREATE TABLE familiar.saved_shop_items (
  user_id uuid NOT NULL,
  item_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT saved_shop_items_pkey PRIMARY KEY (user_id, item_id),
  CONSTRAINT saved_shop_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT saved_shop_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES familiar.shop_items(item_id)
);
CREATE TABLE familiar.shop_catalogues (
  catalogue_id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug USER-DEFINED NOT NULL UNIQUE,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT shop_catalogues_pkey PRIMARY KEY (catalogue_id)
);
CREATE TABLE familiar.shop_item_media (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT shop_item_media_pkey PRIMARY KEY (id),
  CONSTRAINT shop_item_media_item_id_fkey FOREIGN KEY (item_id) REFERENCES familiar.shop_items(item_id),
  CONSTRAINT shop_item_media_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES familiar.media_assets(asset_id)
);
CREATE TABLE familiar.shop_item_variants (
  variant_id uuid NOT NULL DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  key text NOT NULL,
  label text NOT NULL,
  price_delta_usd numeric NOT NULL DEFAULT 0,
  stock integer CHECK (stock IS NULL OR stock >= 0),
  options jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT shop_item_variants_pkey PRIMARY KEY (variant_id),
  CONSTRAINT shop_item_variants_item_id_fkey FOREIGN KEY (item_id) REFERENCES familiar.shop_items(item_id)
);
CREATE TABLE familiar.shop_items (
  item_id uuid NOT NULL DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL,
  catalogue_id uuid NOT NULL,
  type USER-DEFINED NOT NULL,
  slug USER-DEFINED,
  title text NOT NULL,
  description text,
  price_usd numeric NOT NULL CHECK (price_usd >= 0::numeric),
  discount_rate numeric NOT NULL DEFAULT 0 CHECK (discount_rate >= 0::numeric AND discount_rate <= 1::numeric),
  stock integer CHECK (stock IS NULL OR stock >= 0),
  licenses ARRAY NOT NULL DEFAULT '{}'::text[],
  options jsonb NOT NULL DEFAULT '{}'::jsonb,
  tags ARRAY NOT NULL DEFAULT '{}'::text[],
  content_warnings ARRAY NOT NULL DEFAULT '{}'::familiar.content_warning[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT shop_items_pkey PRIMARY KEY (item_id),
  CONSTRAINT shop_items_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT shop_items_catalogue_id_fkey FOREIGN KEY (catalogue_id) REFERENCES familiar.shop_catalogues(catalogue_id)
);
CREATE TABLE familiar.shop_order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  item_id uuid NOT NULL,
  variant_id uuid,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_snapshot_usd numeric NOT NULL CHECK (price_snapshot_usd >= 0::numeric),
  options_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  variant_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT shop_order_items_pkey PRIMARY KEY (id),
  CONSTRAINT shop_order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES familiar.shop_item_variants(variant_id),
  CONSTRAINT shop_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES familiar.shop_orders(order_id),
  CONSTRAINT shop_order_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES familiar.shop_items(item_id)
);
CREATE TABLE familiar.shop_orders (
  order_id uuid NOT NULL DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'draft'::familiar.shop_order_status,
  total_usd numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT shop_orders_pkey PRIMARY KEY (order_id),
  CONSTRAINT shop_orders_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.sona_reference_sheets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sona_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  label text,
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT sona_reference_sheets_pkey PRIMARY KEY (id),
  CONSTRAINT sona_reference_sheets_sona_id_fkey FOREIGN KEY (sona_id) REFERENCES familiar.sonas(sona_id),
  CONSTRAINT sona_reference_sheets_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES familiar.media_assets(asset_id)
);
CREATE TABLE familiar.sonas (
  sona_id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  slug USER-DEFINED NOT NULL UNIQUE,
  name text NOT NULL,
  about jsonb NOT NULL DEFAULT '{}'::jsonb,
  privacy jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_private boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  avatar_asset_id uuid,
  cover_asset_id uuid,
  CONSTRAINT sonas_pkey PRIMARY KEY (sona_id),
  CONSTRAINT sonas_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT sonas_avatar_asset_fk FOREIGN KEY (avatar_asset_id) REFERENCES familiar.media_assets(asset_id),
  CONSTRAINT sonas_cover_asset_fk FOREIGN KEY (cover_asset_id) REFERENCES familiar.media_assets(asset_id)
);
CREATE TABLE familiar.subscription_plans (
  plan_key text NOT NULL,
  label text NOT NULL,
  interval USER-DEFINED NOT NULL,
  price_usd numeric NOT NULL CHECK (price_usd >= 0::numeric),
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subscription_plans_pkey PRIMARY KEY (plan_key)
);
CREATE TABLE familiar.user_badges (
  user_id uuid NOT NULL,
  badge_id text NOT NULL,
  awarded_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_badges_pkey PRIMARY KEY (user_id, badge_id),
  CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES familiar.badges(badge_id)
);
CREATE TABLE familiar.user_bans (
  ban_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ban_type USER-DEFINED NOT NULL,
  reason text NOT NULL,
  issued_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  revoked_at timestamp with time zone,
  CONSTRAINT user_bans_pkey PRIMARY KEY (ban_id),
  CONSTRAINT user_bans_user_id_fkey FOREIGN KEY (user_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT user_bans_issued_by_fkey FOREIGN KEY (issued_by) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.user_blocks (
  blocker_id uuid NOT NULL,
  blocked_user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_blocks_pkey PRIMARY KEY (blocker_id, blocked_user_id),
  CONSTRAINT user_blocks_blocker_id_fkey FOREIGN KEY (blocker_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT user_blocks_blocked_user_id_fkey FOREIGN KEY (blocked_user_id) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.user_currency_pref (
  user_id uuid NOT NULL,
  currency text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_currency_pref_pkey PRIMARY KEY (user_id),
  CONSTRAINT user_currency_pref_user_id_fkey FOREIGN KEY (user_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT user_currency_pref_currency_fkey FOREIGN KEY (currency) REFERENCES familiar.currencies(code)
);
CREATE TABLE familiar.user_links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL,
  url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_links_pkey PRIMARY KEY (id),
  CONSTRAINT user_links_user_id_fkey FOREIGN KEY (user_id) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.user_roles (
  user_id uuid NOT NULL,
  role_key text NOT NULL,
  is_public boolean NOT NULL DEFAULT true,
  granted_at timestamp with time zone NOT NULL DEFAULT now(),
  granted_by uuid,
  CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_key),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT user_roles_role_key_fkey FOREIGN KEY (role_key) REFERENCES familiar.roles(role_key),
  CONSTRAINT user_roles_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.user_spoken_languages (
  user_id uuid NOT NULL,
  locale text NOT NULL,
  experience USER-DEFINED NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT user_spoken_languages_pkey PRIMARY KEY (user_id, locale),
  CONSTRAINT user_spoken_languages_user_id_fkey FOREIGN KEY (user_id) REFERENCES familiar.profiles(user_id)
);
CREATE TABLE familiar.user_subscriptions (
  subscription_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_key text NOT NULL,
  provider text NOT NULL DEFAULT 'stripe'::text,
  provider_subscription_id text,
  status USER-DEFINED NOT NULL DEFAULT 'active'::familiar.subscription_status,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  canceled_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_subscriptions_pkey PRIMARY KEY (subscription_id),
  CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES familiar.profiles(user_id),
  CONSTRAINT user_subscriptions_plan_key_fkey FOREIGN KEY (plan_key) REFERENCES familiar.subscription_plans(plan_key)
);
