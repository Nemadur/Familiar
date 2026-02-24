
-- ============================================================
-- Familiar (Supabase/Postgres)
-- Schema: familiar
-- Version: v0.2.7
-- ============================================================

-- -------------------------
-- Extensions (db-wide)
-- -------------------------
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- -------------------------
-- Schema
-- -------------------------
create schema if not exists familiar;
grant usage on schema familiar to anon, authenticated;

-- Use familiar by default for objects created below
set search_path = familiar, public, auth;

-- -------------------------
-- Enums / Types
-- -------------------------
do $$ begin
  create type familiar.visibility as enum ('public','unlisted','private');
exception when duplicate_object then null; end $$;

do $$ begin
  create type familiar.media_type as enum ('image','video','audio','file','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type familiar.listing_status as enum ('open','closed','waitlist','draft');
exception when duplicate_object then null; end $$;

do $$ begin
  create type familiar.commission_service_type as enum ('custom_service','personalized_ych');
exception when duplicate_object then null; end $$;

do $$ begin
  create type familiar.commission_communication_type as enum ('open_communication','surprise_me');
exception when duplicate_object then null; end $$;

do $$ begin
  create type familiar.commission_requesting_process as enum ('custom_proposal','instant_order');
exception when duplicate_object then null; end $$;

do $$ begin
  create type familiar.license_pricing_mode as enum ('included','fixed_usd','percent');
exception when duplicate_object then null; end $$;

do $$ begin
  create type familiar.commission_order_status as enum ('draft','submitted','accepted','in_progress','delivered','cancelled','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type familiar.shop_item_type as enum ('digital','physical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type familiar.shop_order_status as enum ('draft','paid','fulfilled','cancelled','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type familiar.report_target_type as enum ('user','post','shop_item','commission_listing','sona','message');
exception when duplicate_object then null; end $$;

do $$ begin
  create type familiar.report_status as enum ('open','reviewing','resolved','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type familiar.dm_participant_role as enum ('member','owner');
exception when duplicate_object then null; end $$;

do $$ begin
  create type familiar.language_experience as enum ('native','fluent','communicative','learning','basic');
exception when duplicate_object then null; end $$;

do $$ begin
  create type familiar.follow_status as enum ('pending','accepted','rejected','blocked','cancelled');
exception when duplicate_object then null; end $$;


do $$ begin
  create type familiar.folder_visibility as enum ('private','public','url_only');
exception when duplicate_object then null; end $$;

do $$ begin
  create type familiar.ban_type as enum ('temp','perm');
exception when duplicate_object then null; end $$;

do $$ begin
  create type familiar.content_warning as enum (
    'sexual','nudity','violence','gore','self_harm','drugs','hate','flashing','other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type familiar.subscription_interval as enum ('month','year');
exception when duplicate_object then null; end $$;

do $$ begin
  create type familiar.subscription_status as enum ('active','trialing','past_due','canceled','incomplete','paused');
exception when duplicate_object then null; end $$;

-- -------------------------
-- Utility functions
-- -------------------------
create or replace function familiar.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end $$;

create or replace function familiar.jwt_role()
returns text
language sql
stable
as $$
  select current_setting('request.jwt.claim.role', true)
$$;

-- -------------------------
-- Core: Profiles / Roles / Badges
-- -------------------------
create table if not exists familiar.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username citext not null unique,
  display_name text not null,
  timezone text,
  pronouns text,
  bio varchar(300),
  avatar_path text,
  cover_path text,
  accent_color text, -- hex like #RRGGBB


  -- privacy
  is_private boolean not null default false,

  -- flags (also represented as badges)
  is_verified boolean not null default false,
  is_premium boolean not null default false,
  premium_until timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_bio_len_chk check (
    bio is null
    or (is_premium = true and length(bio) <= 300)
    or (is_premium = false and length(bio) <= 150)
  )
);

create index if not exists profiles_username_idx on familiar.profiles(username);
create index if not exists profiles_is_private_idx on familiar.profiles(is_private);
create index if not exists profiles_is_verified_idx on familiar.profiles(is_verified);
create index if not exists profiles_is_premium_idx on familiar.profiles(is_premium);
do $$ begin
  alter table familiar.profiles
    add constraint profiles_accent_color_hex_chk check (
      accent_color is null or accent_color ~ '^#[A-Fa-f0-9]{6}$'
    );
exception when duplicate_object then null; end $$;


drop trigger if exists trg_profiles_updated_at on familiar.profiles;
create trigger trg_profiles_updated_at
before update on familiar.profiles
for each row execute function familiar.set_updated_at();

create table if not exists familiar.roles (
  role_key text primary key,  -- client|artist|moderator|admin|...
  label text not null,
  is_staff boolean not null default false,
  created_at timestamptz not null default now()
);

insert into familiar.roles(role_key,label,is_staff) values
  ('client','Client',false),
  ('artist','Artist',false),
  ('moderator','Moderator',true),
  ('admin','Admin',true)
on conflict (role_key) do update set
  label = excluded.label,
  is_staff = excluded.is_staff;

create table if not exists familiar.user_roles (
  user_id uuid not null references familiar.profiles(user_id) on delete cascade,
  role_key text not null references familiar.roles(role_key) on delete restrict,
  is_public boolean not null default true,
  granted_at timestamptz not null default now(),
  granted_by uuid references familiar.profiles(user_id) on delete set null,
  primary key (user_id, role_key)
);

create index if not exists user_roles_user_idx on familiar.user_roles(user_id);
create index if not exists user_roles_role_idx on familiar.user_roles(role_key);

create table if not exists familiar.user_spoken_languages (
  user_id uuid not null references familiar.profiles(user_id) on delete cascade,
  locale text not null,
  experience familiar.language_experience not null,
  sort_order int not null default 0,
  primary key (user_id, locale)
);

create index if not exists user_spoken_languages_user_idx on familiar.user_spoken_languages(user_id);

create table if not exists familiar.user_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references familiar.profiles(user_id) on delete cascade,
  label text not null,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists user_links_user_idx on familiar.user_links(user_id);

create table if not exists familiar.badges (
  badge_id text primary key,
  label text not null,
  description text,
  color text, -- hex #RRGGBB
  icon_path text,
  created_at timestamptz not null default now()
);

do $$ begin
  alter table familiar.badges
    add constraint badges_color_hex_chk
    check (color is null or color ~ '^#[A-Fa-f0-9]{6}$');
exception when duplicate_object then null; end $$;

-- system badges
insert into familiar.badges(badge_id, label, icon_path) values
  ('verified','Verified',null),
  ('premium','Premium',null),
  ('staff','Staff',null)
on conflict (badge_id) do update set label = excluded.label;

create table if not exists familiar.user_badges (
  user_id uuid not null references familiar.profiles(user_id) on delete cascade,
  badge_id text not null references familiar.badges(badge_id) on delete restrict,
  awarded_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create index if not exists user_badges_user_idx on familiar.user_badges(user_id);

-- Staff-role check
create or replace function familiar.has_staff_role(p_user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from familiar.user_roles ur
    join familiar.roles r on r.role_key = ur.role_key
    where ur.user_id = p_user_id
      and r.is_staff = true
  )
$$;

-- Security definer helpers to manage locked tables safely under RLS
create or replace function familiar.assign_role(
  p_user_id uuid,
  p_role_key text,
  p_is_public boolean default true,
  p_granted_by uuid default null
)
returns void
language plpgsql
security definer
set search_path = familiar, public, auth, pg_temp
as $$
begin
  insert into familiar.user_roles(user_id, role_key, is_public, granted_by)
  values (p_user_id, p_role_key, p_is_public, p_granted_by)
  on conflict (user_id, role_key) do nothing;
end $$;

revoke all on function familiar.assign_role(uuid,text,boolean,uuid) from public;
grant execute on function familiar.assign_role(uuid,text,boolean,uuid) to authenticated;

create or replace function familiar.set_badge(
  p_user_id uuid,
  p_badge_id text,
  p_present boolean
)
returns void
language plpgsql
security definer
set search_path = familiar, public, auth, pg_temp
as $$
begin
  if p_present then
    insert into familiar.user_badges(user_id, badge_id)
    values (p_user_id, p_badge_id)
    on conflict (user_id, badge_id) do nothing;
  else
    delete from familiar.user_badges
    where user_id = p_user_id and badge_id = p_badge_id;
  end if;
end $$;

revoke all on function familiar.set_badge(uuid,text,boolean) from public;
grant execute on function familiar.set_badge(uuid,text,boolean) to authenticated;

-- Default client role on profile creation
create or replace function familiar.ensure_default_client_role()
returns trigger
language plpgsql
as $$
begin
  perform familiar.assign_role(new.user_id, 'client', true, new.user_id);
  return new;
end $$;

drop trigger if exists trg_profiles_default_role on familiar.profiles;
create trigger trg_profiles_default_role
after insert on familiar.profiles
for each row execute function familiar.ensure_default_client_role();

-- Guard: prevent self-updating verified/premium flags (allow service_role, staff, or internal context)
create or replace function familiar.profiles_guard_sensitive_flags()
returns trigger
language plpgsql
as $$
declare
  role text;
  is_staff boolean;
begin
  role := familiar.jwt_role();
  is_staff := familiar.has_staff_role(auth.uid());

  -- Allow internal updates (no request context)
  if role is null and auth.uid() is null then
    return new;
  end if;

  if (new.is_verified is distinct from old.is_verified)
     or (new.is_premium is distinct from old.is_premium)
     or (new.premium_until is distinct from old.premium_until) then

    if role <> 'service_role' and not is_staff then
      raise exception 'Not allowed to modify verified/premium flags';
    end if;
  end if;

  return new;
end $$;

drop trigger if exists trg_profiles_guard_flags on familiar.profiles;
create trigger trg_profiles_guard_flags
before update on familiar.profiles
for each row execute function familiar.profiles_guard_sensitive_flags();

-- Sync profile flags to badges
create or replace function familiar.sync_profile_flag_badges()
returns trigger
language plpgsql
as $$
begin
  perform familiar.set_badge(new.user_id, 'verified', new.is_verified);
  perform familiar.set_badge(new.user_id, 'premium', new.is_premium);
  return new;
end $$;

drop trigger if exists trg_profiles_sync_flag_badges on familiar.profiles;
create trigger trg_profiles_sync_flag_badges
after insert or update of is_verified, is_premium on familiar.profiles
for each row execute function familiar.sync_profile_flag_badges();

-- Sync staff badge derived from staff roles
create or replace function familiar.sync_staff_badge_for_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = familiar, public, auth, pg_temp
as $$
begin
  perform familiar.set_badge(p_user_id, 'staff', familiar.has_staff_role(p_user_id));
end $$;

revoke all on function familiar.sync_staff_badge_for_user(uuid) from public;
grant execute on function familiar.sync_staff_badge_for_user(uuid) to authenticated;

create or replace function familiar.user_roles_staff_badge_trigger()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform familiar.sync_staff_badge_for_user(old.user_id);
    return old;
  else
    perform familiar.sync_staff_badge_for_user(new.user_id);
    return new;
  end if;
end $$;

drop trigger if exists trg_user_roles_staff_badge on familiar.user_roles;
create trigger trg_user_roles_staff_badge
after insert or update or delete on familiar.user_roles
for each row execute function familiar.user_roles_staff_badge_trigger();

-- -------------------------
-- Invites: privileges, codes, penalties
-- -------------------------
create table if not exists familiar.invite_privileges (
  user_id uuid primary key references familiar.profiles(user_id) on delete cascade,
  can_generate boolean not null default true,
  disabled_until timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists familiar.artist_invite_codes (
  code text primary key,
  created_by_user_id uuid not null references familiar.profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  status text not null default 'unused',  -- unused|used|revoked|expired
  used_by_user_id uuid references familiar.profiles(user_id) on delete set null,
  used_at timestamptz,
  constraint invite_code_format_chk check (code ~ '^FAM-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{3}$'),
  constraint invite_status_chk check (status in ('unused','used','revoked','expired'))
);

create index if not exists artist_invite_codes_creator_idx on familiar.artist_invite_codes(created_by_user_id);
create index if not exists artist_invite_codes_status_idx on familiar.artist_invite_codes(status);
create index if not exists artist_invite_codes_expires_idx on familiar.artist_invite_codes(expires_at);

create table if not exists familiar.inviter_penalties (
  penalty_id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references familiar.profiles(user_id) on delete cascade,
  invited_user_id uuid references familiar.profiles(user_id) on delete set null,
  type text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists inviter_penalties_inviter_idx on familiar.inviter_penalties(inviter_id, created_at desc);

create or replace function familiar.invite_codes_enforce_limit()
returns trigger
language plpgsql
as $$
declare
  cnt int;
  restricted boolean;
begin
  -- Must be an artist to generate invite codes
  if not exists (
    select 1 from familiar.user_roles ur
    where ur.user_id = new.created_by_user_id
      and ur.role_key = 'artist'
  ) then
    raise exception 'Only artists can generate invite codes';
  end if;

  -- Check restriction
  select (not ip.can_generate) and (ip.disabled_until is null or ip.disabled_until > now())
    into restricted
  from familiar.invite_privileges ip
  where ip.user_id = new.created_by_user_id;

  if coalesce(restricted,false) then
    raise exception 'Invite generation is temporarily disabled for this artist';
  end if;

  -- Max 2 unused
  if new.status = 'unused' then
    select count(*) into cnt
    from familiar.artist_invite_codes
    where created_by_user_id = new.created_by_user_id
      and status = 'unused'
      and code <> new.code;

    if cnt >= 2 then
      raise exception 'Invite code limit reached: max 2 unused codes per artist';
    end if;
  end if;

  return new;
end $$;

drop trigger if exists trg_invite_codes_limit on familiar.artist_invite_codes;
create trigger trg_invite_codes_limit
before insert or update of status on familiar.artist_invite_codes
for each row execute function familiar.invite_codes_enforce_limit();

-- Validate invite code (callable by anon/authenticated)
create or replace function familiar.validate_artist_invite_code(p_code text)
returns boolean
language sql
security definer
set search_path = familiar, public, auth, pg_temp
as $$
  select exists (
    select 1 from familiar.artist_invite_codes c
    where c.code = p_code
      and c.status = 'unused'
      and c.expires_at > now()
  )
$$;

revoke all on function familiar.validate_artist_invite_code(text) from public;
grant execute on function familiar.validate_artist_invite_code(text) to anon, authenticated;

-- Consume invite code (for the logged-in user) + grant artist role
create or replace function familiar.consume_artist_invite_code(p_code text, p_new_user_id uuid)
returns void
language plpgsql
security definer
set search_path = familiar, public, auth, pg_temp
as $$
declare
  c record;
begin
  if auth.uid() is distinct from p_new_user_id then
    raise exception 'You can only consume an invite code for your own user';
  end if;

  select * into c
  from familiar.artist_invite_codes
  where code = p_code
  for update;

  if not found then
    raise exception 'Invalid invite code';
  end if;

  if c.status <> 'unused' then
    raise exception 'Invite code is not available';
  end if;

  if c.expires_at <= now() then
    raise exception 'Invite code expired';
  end if;

  update familiar.artist_invite_codes
     set status = 'used',
         used_by_user_id = p_new_user_id,
         used_at = now()
   where code = p_code;

  perform familiar.assign_role(p_new_user_id, 'artist', true, c.created_by_user_id);
end $$;

revoke all on function familiar.consume_artist_invite_code(text,uuid) from public;
grant execute on function familiar.consume_artist_invite_code(text,uuid) to authenticated;

-- -------------------------
-- Media assets (unified)
-- -------------------------
create table if not exists familiar.media_assets (
  asset_id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references familiar.profiles(user_id) on delete cascade,
  type familiar.media_type not null,
  mime text not null,
  path text not null,
  size_bytes bigint not null,
  width int,
  height int,
  duration_ms int,
  hash text,
  created_at timestamptz not null default now(),
  constraint media_assets_width_nonneg_chk check (width is null or width >= 0),
  constraint media_assets_height_nonneg_chk check (height is null or height >= 0)
);

create index if not exists media_assets_owner_idx on familiar.media_assets(owner_user_id);
create index if not exists media_assets_type_idx on familiar.media_assets(type);

-- -------------------------
-- Posts (portfolio)
-- -------------------------
-- TODO: add slug (from title)
create table if not exists familiar.posts (
  post_id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references familiar.profiles(user_id) on delete cascade,
  title text,
  body_md text,
  visibility familiar.visibility not null default 'public',
  tags text[] not null default '{}'::text[],
  content_warnings familiar.content_warning[] not null default '{}'::familiar.content_warning[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_artist_idx on familiar.posts(artist_id);
create index if not exists posts_visibility_idx on familiar.posts(visibility);
create index if not exists posts_created_idx on familiar.posts(created_at desc);
create index if not exists posts_tags_gin on familiar.posts using gin(tags);
create index if not exists posts_content_warnings_gin on familiar.posts using gin(content_warnings);

drop trigger if exists trg_posts_updated_at on familiar.posts;
create trigger trg_posts_updated_at
before update on familiar.posts
for each row execute function familiar.set_updated_at();

create table if not exists familiar.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references familiar.posts(post_id) on delete cascade,
  asset_id uuid not null references familiar.media_assets(asset_id) on delete restrict,
  sort_order int not null default 0
);

create index if not exists post_media_post_idx on familiar.post_media(post_id, sort_order);

create table if not exists familiar.post_likes (
  user_id uuid not null references familiar.profiles(user_id) on delete cascade,
  post_id uuid not null references familiar.posts(post_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

create index if not exists post_likes_post_idx on familiar.post_likes(post_id, created_at desc);

create table if not exists familiar.post_views (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references familiar.posts(post_id) on delete cascade,
  viewer_user_id uuid references familiar.profiles(user_id) on delete set null,
  viewer_fingerprint text,
  created_at timestamptz not null default now()
);

create index if not exists post_views_post_idx on familiar.post_views(post_id, created_at desc);

create table if not exists familiar.post_metrics (
  post_id uuid primary key references familiar.posts(post_id) on delete cascade,
  likes_count int not null default 0,
  views_count int not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function familiar.post_metrics_inc_likes()
returns trigger
language plpgsql
as $$
begin
  insert into familiar.post_metrics(post_id, likes_count, views_count)
  values (new.post_id, 1, 0)
  on conflict (post_id) do update
    set likes_count = familiar.post_metrics.likes_count + 1,
        updated_at = now();
  return new;
end $$;

create or replace function familiar.post_metrics_dec_likes()
returns trigger
language plpgsql
as $$
begin
  update familiar.post_metrics
     set likes_count = greatest(likes_count - 1, 0),
         updated_at = now()
   where post_id = old.post_id;
  return old;
end $$;

create or replace function familiar.post_metrics_inc_views()
returns trigger
language plpgsql
as $$
begin
  insert into familiar.post_metrics(post_id, likes_count, views_count)
  values (new.post_id, 0, 1)
  on conflict (post_id) do update
    set views_count = familiar.post_metrics.views_count + 1,
        updated_at = now();
  return new;
end $$;

drop trigger if exists trg_post_like_inc on familiar.post_likes;
create trigger trg_post_like_inc
after insert on familiar.post_likes
for each row execute function familiar.post_metrics_inc_likes();

drop trigger if exists trg_post_like_dec on familiar.post_likes;
create trigger trg_post_like_dec
after delete on familiar.post_likes
for each row execute function familiar.post_metrics_dec_likes();

drop trigger if exists trg_post_view_inc on familiar.post_views;
create trigger trg_post_view_inc
after insert on familiar.post_views
for each row execute function familiar.post_metrics_inc_views();

create table if not exists familiar.artist_similarity (
  artist_id uuid not null references familiar.profiles(user_id) on delete cascade,
  similar_artist_id uuid not null references familiar.profiles(user_id) on delete cascade,
  score numeric not null,
  updated_at timestamptz not null default now(),
  primary key (artist_id, similar_artist_id),
  constraint similarity_score_chk check (score >= 0 and score <= 1)
);

create index if not exists artist_similarity_artist_idx on familiar.artist_similarity(artist_id, score desc);

-- -------------------------
-- Sonas (OC / characters)
-- -------------------------
create table if not exists familiar.sonas (
  sona_id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references familiar.profiles(user_id) on delete cascade,
  slug citext not null unique,
  name text not null,
  avatar_asset_id uuid references familiar.media_assets(asset_id) on delete set null,
  cover_asset_id uuid references familiar.media_assets(asset_id) on delete set null,
  about jsonb not null default '{}'::jsonb,
  privacy jsonb not null default '{}'::jsonb,
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sonas_owner_idx on familiar.sonas(owner_id);
create index if not exists sonas_slug_idx on familiar.sonas(slug);
create index if not exists sonas_avatar_asset_idx on familiar.sonas(avatar_asset_id);
create index if not exists sonas_cover_asset_idx on familiar.sonas(cover_asset_id);
create index if not exists sonas_is_private_idx on familiar.sonas(is_private);

drop trigger if exists trg_sonas_updated_at on familiar.sonas;
create trigger trg_sonas_updated_at
before update on familiar.sonas
for each row execute function familiar.set_updated_at();

create table if not exists familiar.sona_reference_sheets (
  id uuid primary key default gen_random_uuid(),
  sona_id uuid not null references familiar.sonas(sona_id) on delete cascade,
  asset_id uuid not null references familiar.media_assets(asset_id) on delete restrict,
  label text,
  sort_order int not null default 0
);

create index if not exists sona_reference_sheets_sona_idx on familiar.sona_reference_sheets(sona_id, sort_order);

create table if not exists familiar.post_sona_refs (
  post_id uuid not null references familiar.posts(post_id) on delete cascade,
  sona_id uuid not null references familiar.sonas(sona_id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (post_id, sona_id)
);

create index if not exists post_sona_refs_sona_idx on familiar.post_sona_refs(sona_id);

-- -------------------------
-- Commissions
-- -------------------------
create table if not exists familiar.commission_categories (
  category_id uuid primary key default gen_random_uuid(),
  slug citext not null unique,
  label text not null,
  icon text,
  sort_order int not null default 0
);

create table if not exists familiar.commission_listings (
  listing_id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references familiar.profiles(user_id) on delete cascade,
  category_id uuid not null references familiar.commission_categories(category_id) on delete restrict,
  slug citext,
  title text not null,

  base_price_usd numeric not null,
  discount_rate numeric not null default 0,
  status familiar.listing_status not null default 'open',

  service_type familiar.commission_service_type,
  communication_type familiar.commission_communication_type,
  requesting_process familiar.commission_requesting_process,

  artist_note text,
  description_md text,

  tags text[] not null default '{}'::text[],
  content_warnings familiar.content_warning[] not null default '{}'::familiar.content_warning[],

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint commission_discount_rate_chk check (discount_rate >= 0 and discount_rate <= 1),
  constraint commission_base_price_chk check (base_price_usd >= 0)
);

create index if not exists commission_listings_artist_idx on familiar.commission_listings(artist_id);
create index if not exists commission_listings_category_idx on familiar.commission_listings(category_id);
create index if not exists commission_listings_status_idx on familiar.commission_listings(status);
create index if not exists commission_listings_created_idx on familiar.commission_listings(created_at desc);
create index if not exists commission_listings_tags_gin on familiar.commission_listings using gin(tags);
create index if not exists commission_listings_content_warnings_gin on familiar.commission_listings using gin(content_warnings);

drop trigger if exists trg_commission_listings_updated_at on familiar.commission_listings;
create trigger trg_commission_listings_updated_at
before update on familiar.commission_listings
for each row execute function familiar.set_updated_at();

create table if not exists familiar.commission_listing_media (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references familiar.commission_listings(listing_id) on delete cascade,
  asset_id uuid not null references familiar.media_assets(asset_id) on delete restrict,
  sort_order int not null default 0
);

create index if not exists commission_listing_media_idx on familiar.commission_listing_media(listing_id, sort_order);

create table if not exists familiar.license_definitions (
  license_id uuid primary key default gen_random_uuid(),
  key citext not null unique,
  label text not null,
  description text,
  is_system boolean not null default false,
  created_by_artist_id uuid references familiar.profiles(user_id) on delete set null,
  created_at timestamptz not null default now()
);

insert into familiar.license_definitions(key,label,description,is_system) values
  ('personal','Personal','Personal use license',true),
  ('monetized','Monetized content','Monetized content license',true),
  ('commercial','Commercial merchandising','Commercial merch license',true)
on conflict (key) do nothing;

create table if not exists familiar.commission_listing_licenses (
  listing_id uuid not null references familiar.commission_listings(listing_id) on delete cascade,
  license_id uuid not null references familiar.license_definitions(license_id) on delete restrict,

  visible boolean not null default true,
  included boolean not null default false,

  pricing_mode familiar.license_pricing_mode not null default 'included',
  add_fixed_usd numeric,
  add_percent numeric,

  sort_order int not null default 0,

  primary key (listing_id, license_id),

  constraint commission_license_percent_chk check (add_percent is null or (add_percent >= 0 and add_percent <= 10)),
  constraint commission_license_fixed_chk check (add_fixed_usd is null or add_fixed_usd >= 0)
);

create index if not exists commission_listing_licenses_listing_idx on familiar.commission_listing_licenses(listing_id, visible, sort_order);

-- FIXME: fixed/percent -> included true (works) but included true -> false do not, it says it's need
create or replace function familiar.commission_license_validate()
returns trigger
language plpgsql
as $$
begin
  -- If included, force pricing_mode=included and clear add-ons
  if new.included is true then
    new.pricing_mode := 'included';
    new.add_fixed_usd := null;
    new.add_percent := null;
    return new;
  end if;

  -- included = false:
  -- Supabase UI often updates a single column, so pricing_mode may still be 'included'.
  -- Auto-switch to a sane non-included mode instead of throwing.
  if new.pricing_mode = 'included' then
    if new.add_percent is not null then
      new.pricing_mode := 'percent';
    else
      new.pricing_mode := 'fixed_usd';
    end if;
  end if;

  -- Normalize by pricing_mode
  if new.pricing_mode = 'fixed_usd' then
    -- allow stepwise editing: default to 0 instead of raising
    if new.add_fixed_usd is null then
      new.add_fixed_usd := 0;
    end if;
    new.add_percent := null;
    return new;

  elsif new.pricing_mode = 'percent' then
    -- allow stepwise editing: default to 0 instead of raising
    if new.add_percent is null then
      new.add_percent := 0;
    end if;
    new.add_fixed_usd := null;
    return new;

  else
    raise exception 'invalid pricing_mode: %', new.pricing_mode;
  end if;
end $$;

drop trigger if exists trg_commission_license_validate on familiar.commission_listing_licenses;
create trigger trg_commission_license_validate
before insert or update on familiar.commission_listing_licenses
for each row execute function familiar.commission_license_validate();

create table if not exists familiar.artist_terms (
  terms_id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references familiar.profiles(user_id) on delete cascade,
  version int not null,
  tos_md varchar(4000) not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (artist_id, version)
);

create index if not exists artist_terms_active_idx on familiar.artist_terms(artist_id, is_active);

create table if not exists familiar.form_templates (
  template_id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references familiar.profiles(user_id) on delete cascade,
  scope text not null, -- profile_default|listing_specific
  listing_id uuid references familiar.commission_listings(listing_id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint form_templates_scope_chk check (scope in ('profile_default','listing_specific'))
);

create index if not exists form_templates_artist_idx on familiar.form_templates(artist_id, scope);
create index if not exists form_templates_listing_idx on familiar.form_templates(listing_id);

drop trigger if exists trg_form_templates_updated_at on familiar.form_templates;
create trigger trg_form_templates_updated_at
before update on familiar.form_templates
for each row execute function familiar.set_updated_at();

create table if not exists familiar.form_fields (
  field_id uuid primary key default gen_random_uuid(),
  template_id uuid not null references familiar.form_templates(template_id) on delete cascade,
  type text not null,
  key text not null,
  label text not null,
  description text,
  required boolean not null default false,
  included boolean not null default true,
  sort_order int not null default 0,
  options jsonb not null default '[]'::jsonb,
  validation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (template_id, key)
);

create index if not exists form_fields_template_idx on familiar.form_fields(template_id, sort_order);

create table if not exists familiar.commission_orders (
  order_id uuid primary key default gen_random_uuid(),
  client_id uuid not null references familiar.profiles(user_id) on delete cascade,
  artist_id uuid not null references familiar.profiles(user_id) on delete cascade,
  listing_id uuid not null references familiar.commission_listings(listing_id) on delete restrict,
  sona_id uuid references familiar.sonas(sona_id) on delete set null,

  status familiar.commission_order_status not null default 'draft',

  selected_license_ids uuid[] not null default '{}'::uuid[],
  price_snapshot_usd numeric,
  discount_snapshot_rate numeric,
  licenses_snapshot jsonb not null default '{}'::jsonb,

  terms_id_accepted uuid references familiar.artist_terms(terms_id) on delete set null,
  terms_version_accepted int,

  form_answers jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists commission_orders_client_idx on familiar.commission_orders(client_id, created_at desc);
create index if not exists commission_orders_artist_idx on familiar.commission_orders(artist_id, created_at desc);
create index if not exists commission_orders_listing_idx on familiar.commission_orders(listing_id);
create index if not exists commission_orders_status_idx on familiar.commission_orders(status);

drop trigger if exists trg_commission_orders_updated_at on familiar.commission_orders;
create trigger trg_commission_orders_updated_at
before update on familiar.commission_orders
for each row execute function familiar.set_updated_at();

create table if not exists familiar.commission_order_attachments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references familiar.commission_orders(order_id) on delete cascade,
  asset_id uuid not null references familiar.media_assets(asset_id) on delete restrict,
  label text,
  created_at timestamptz not null default now()
);

create index if not exists commission_order_attachments_idx on familiar.commission_order_attachments(order_id);

create table if not exists familiar.reviews (
  review_id uuid primary key default gen_random_uuid(),
  order_id uuid not null references familiar.commission_orders(order_id) on delete cascade,
  listing_id uuid not null references familiar.commission_listings(listing_id) on delete cascade,
  artist_id uuid not null references familiar.profiles(user_id) on delete cascade,
  client_id uuid not null references familiar.profiles(user_id) on delete cascade,
  rating int not null,
  title text,
  body text,
  chips text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  constraint review_rating_chk check (rating between 1 and 5),
  unique (order_id)
);

create index if not exists reviews_listing_idx on familiar.reviews(listing_id, created_at desc);
create index if not exists reviews_artist_idx on familiar.reviews(artist_id, created_at desc);

create table if not exists familiar.post_featured_review (
  post_id uuid primary key references familiar.posts(post_id) on delete cascade,
  review_id uuid not null references familiar.reviews(review_id) on delete restrict,
  attached_at timestamptz not null default now()
);

create table if not exists familiar.commission_listing_metrics (
  listing_id uuid primary key references familiar.commission_listings(listing_id) on delete cascade,
  reviews_count int not null default 0,
  rating_avg numeric not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function familiar.recompute_listing_metrics(p_listing_id uuid)
returns void
language plpgsql
as $$
declare
  cnt int;
  avg_rating numeric;
begin
  select count(*), coalesce(avg(rating),0)
    into cnt, avg_rating
  from familiar.reviews
  where listing_id = p_listing_id;

  insert into familiar.commission_listing_metrics(listing_id, reviews_count, rating_avg, updated_at)
  values (p_listing_id, cnt, avg_rating, now())
  on conflict (listing_id) do update
    set reviews_count = excluded.reviews_count,
        rating_avg = excluded.rating_avg,
        updated_at = now();
end $$;

create or replace function familiar.reviews_metrics_trigger()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    perform familiar.recompute_listing_metrics(new.listing_id);
    return new;
  elsif tg_op = 'DELETE' then
    perform familiar.recompute_listing_metrics(old.listing_id);
    return old;
  else
    perform familiar.recompute_listing_metrics(new.listing_id);
    return new;
  end if;
end $$;

drop trigger if exists trg_reviews_metrics_ins on familiar.reviews;
create trigger trg_reviews_metrics_ins
after insert on familiar.reviews
for each row execute function familiar.reviews_metrics_trigger();

drop trigger if exists trg_reviews_metrics_del on familiar.reviews;
create trigger trg_reviews_metrics_del
after delete on familiar.reviews
for each row execute function familiar.reviews_metrics_trigger();

-- -------------------------
-- Shop
-- -------------------------
create table if not exists familiar.shop_catalogues (
  catalogue_id uuid primary key default gen_random_uuid(),
  slug citext not null unique,
  label text not null,
  sort_order int not null default 0
);

create table if not exists familiar.shop_items (
  item_id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references familiar.profiles(user_id) on delete cascade,
  catalogue_id uuid not null references familiar.shop_catalogues(catalogue_id) on delete restrict,
  type familiar.shop_item_type not null,
  slug citext,
  title text not null,
  description text,
  price_usd numeric not null,
  discount_rate numeric not null default 0,
  stock int,
  licenses text[] not null default '{}'::text[],
  options jsonb not null default '{}'::jsonb,

  tags text[] not null default '{}'::text[],
  content_warnings familiar.content_warning[] not null default '{}'::familiar.content_warning[],

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint shop_discount_rate_chk check (discount_rate >= 0 and discount_rate <= 1),
  constraint shop_price_chk check (price_usd >= 0),
  constraint shop_stock_chk check (stock is null or stock >= 0)
);

create index if not exists shop_items_seller_idx on familiar.shop_items(seller_id, created_at desc);
create index if not exists shop_items_catalogue_idx on familiar.shop_items(catalogue_id);
create index if not exists shop_items_type_idx on familiar.shop_items(type);
create index if not exists shop_items_tags_gin on familiar.shop_items using gin(tags);
create index if not exists shop_items_content_warnings_gin on familiar.shop_items using gin(content_warnings);

drop trigger if exists trg_shop_items_updated_at on familiar.shop_items;
create trigger trg_shop_items_updated_at
before update on familiar.shop_items
for each row execute function familiar.set_updated_at();

create table if not exists familiar.shop_item_media (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references familiar.shop_items(item_id) on delete cascade,
  asset_id uuid not null references familiar.media_assets(asset_id) on delete restrict,
  sort_order int not null default 0
);

create index if not exists shop_item_media_idx on familiar.shop_item_media(item_id, sort_order);

create table if not exists familiar.shop_item_variants (
  variant_id uuid primary key default gen_random_uuid(),
  item_id uuid not null references familiar.shop_items(item_id) on delete cascade,
  key text not null,
  label text not null,
  price_delta_usd numeric not null default 0,
  stock int,
  options jsonb not null default '{}'::jsonb,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint shop_item_variants_key_unique unique (item_id, key),
  constraint shop_item_variants_stock_chk check (stock is null or stock >= 0)
);

create index if not exists shop_item_variants_item_idx on familiar.shop_item_variants(item_id, sort_order);

create table if not exists familiar.shop_orders (
  order_id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references familiar.profiles(user_id) on delete cascade,
  status familiar.shop_order_status not null default 'draft',
  total_usd numeric not null default 0,
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

create index if not exists shop_orders_buyer_idx on familiar.shop_orders(buyer_id, created_at desc);
create index if not exists shop_orders_status_idx on familiar.shop_orders(status);

create table if not exists familiar.shop_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references familiar.shop_orders(order_id) on delete cascade,
  item_id uuid not null references familiar.shop_items(item_id) on delete restrict,
  variant_id uuid references familiar.shop_item_variants(variant_id) on delete set null,
  quantity int not null default 1,
  price_snapshot_usd numeric not null,
  options_snapshot jsonb not null default '{}'::jsonb,
  variant_snapshot jsonb not null default '{}'::jsonb,
  constraint shop_order_items_qty_chk check (quantity > 0),
  constraint shop_order_items_price_chk check (price_snapshot_usd >= 0)
);

create index if not exists shop_order_items_order_idx on familiar.shop_order_items(order_id);

-- -------------------------
-- Social: blocks + follows + saved
-- -------------------------
create table if not exists familiar.user_blocks (
  blocker_id uuid not null references familiar.profiles(user_id) on delete cascade,
  blocked_user_id uuid not null references familiar.profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_user_id),
  constraint user_blocks_not_self_chk check (blocker_id <> blocked_user_id)
);

create index if not exists user_blocks_blocked_idx on familiar.user_blocks(blocked_user_id, created_at desc);

create table if not exists familiar.follows (
  follower_id uuid not null references familiar.profiles(user_id) on delete cascade,
  followed_user_id uuid not null references familiar.profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  status familiar.follow_status not null default 'accepted',
  accepted_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (follower_id, followed_user_id),
  constraint follows_not_self_chk check (follower_id <> followed_user_id)
);

create index if not exists follows_followed_idx on familiar.follows(followed_user_id, created_at desc);
create index if not exists follows_lookup_idx on familiar.follows(follower_id, followed_user_id, status);

-- Privacy-aware visibility helper (also denies if blocked either direction)
create or replace function familiar.can_view_user(target_user_id uuid)
returns boolean
language sql
stable
as $$
  with viewer as (
    select auth.uid() as uid
  ),
  blocked as (
    select 1
    from viewer v
    join familiar.user_blocks b
      on (
        (v.uid is not null and b.blocker_id = v.uid and b.blocked_user_id = target_user_id)
        or
        (v.uid is not null and b.blocker_id = target_user_id and b.blocked_user_id = v.uid)
      )
    limit 1
  )
  select
    not exists (select 1 from blocked)
    and (
      -- Owner can always view
      ((select uid from viewer) is not null and (select uid from viewer) = target_user_id)

      or
      -- Public profile
      exists (
        select 1 from familiar.profiles p
        where p.user_id = target_user_id
          and p.is_private = false
      )

      or
      -- Accepted follower for private profile
      exists (
        select 1 from familiar.follows f
        where f.follower_id = (select uid from viewer)
          and f.followed_user_id = target_user_id
          and f.status = 'accepted'
      )
    )
$$;

-- Follow request: set pending if target is private, else accepted
create or replace function familiar.follows_prepare_insert()
returns trigger
language plpgsql
as $$
declare
  target_private boolean;
begin
  select is_private into target_private
  from familiar.profiles
  where user_id = new.followed_user_id;

  if target_private is null then
    raise exception 'Target profile does not exist';
  end if;

  if target_private then
    new.status := 'pending';
    new.accepted_at := null;
  else
    new.status := 'accepted';
    new.accepted_at := coalesce(new.accepted_at, now());
  end if;

  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_follows_prepare_insert on familiar.follows;
create trigger trg_follows_prepare_insert
before insert on familiar.follows
for each row execute function familiar.follows_prepare_insert();

-- Follow status transitions
create or replace function familiar.follows_validate_update()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();

  if new.status is distinct from old.status then
    if new.status in ('accepted','rejected','blocked') and auth.uid() <> old.followed_user_id then
      raise exception 'Only the followed user can accept/reject/block follow requests';
    end if;

    if new.status = 'cancelled' and auth.uid() <> old.follower_id then
      raise exception 'Only the follower can cancel a follow request';
    end if;

    if new.status = 'accepted' then
      new.accepted_at := coalesce(new.accepted_at, now());
    else
      new.accepted_at := null;
    end if;
  end if;

  return new;
end $$;

drop trigger if exists trg_follows_validate_update on familiar.follows;
create trigger trg_follows_validate_update
before update on familiar.follows
for each row execute function familiar.follows_validate_update();

create table if not exists familiar.saved_posts (
  user_id uuid not null references familiar.profiles(user_id) on delete cascade,
  post_id uuid not null references familiar.posts(post_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
create index if not exists saved_posts_user_idx on familiar.saved_posts(user_id, created_at desc);

create table if not exists familiar.saved_shop_items (
  user_id uuid not null references familiar.profiles(user_id) on delete cascade,
  item_id uuid not null references familiar.shop_items(item_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);
create index if not exists saved_shop_items_user_idx on familiar.saved_shop_items(user_id, created_at desc);

create table if not exists familiar.saved_commission_listings (
  user_id uuid not null references familiar.profiles(user_id) on delete cascade,
  listing_id uuid not null references familiar.commission_listings(listing_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);
create index if not exists saved_commission_listings_user_idx on familiar.saved_commission_listings(user_id, created_at desc);

-- -------------------------
-- App Folders (Collections): posts / commission listings / shop items
-- -------------------------
-- TODO: add max 30 limit for non parents folder [root folders] (for subfolder, max 3)
-- up to 60 for verified artists and up to 12 subfolders
-- TODO: add color available only for premium users (default none)
-- TODO: add icon available only for premium users (default none)
create table if not exists familiar.folders (
  folder_id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references familiar.profiles(user_id) on delete cascade,
  parent_id uuid references familiar.folders(folder_id) on delete cascade,

  name text not null,
  description text,
  sort_order int not null default 0,
  is_archived boolean not null default false,

  visibility familiar.folder_visibility not null default 'private',
  share_token text,
  share_expires_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (owner_id, parent_id, name)
);

create index if not exists folders_owner_idx on familiar.folders(owner_id, parent_id, sort_order);
create index if not exists folders_visibility_idx on familiar.folders(visibility);
create index if not exists folders_share_token_idx on familiar.folders(share_token);

do $$ begin
  alter table familiar.folders
    add constraint folders_share_token_unique unique (share_token);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table familiar.folders
    add constraint folders_share_token_chk check (
      (visibility <> 'url_only' and share_token is null and share_expires_at is null)
      or
      (visibility = 'url_only' and share_token is not null)
    );
exception when duplicate_object then null; end $$;

drop trigger if exists trg_folders_updated_at on familiar.folders;
create trigger trg_folders_updated_at
before update on familiar.folders
for each row execute function familiar.set_updated_at();

create or replace function familiar.folders_cleanup_share_token()
returns trigger
language plpgsql
as $$
begin
  if new.visibility <> 'url_only' then
    new.share_token := null;
    new.share_expires_at := null;
  end if;
  return new;
end $$;

drop trigger if exists trg_folders_cleanup_share_token on familiar.folders;
create trigger trg_folders_cleanup_share_token
before insert or update of visibility on familiar.folders
for each row execute function familiar.folders_cleanup_share_token();

-- Typed join tables (strong FKs)

create table if not exists familiar.folder_posts (
  folder_id uuid not null references familiar.folders(folder_id) on delete cascade,
  post_id uuid not null references familiar.posts(post_id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (folder_id, post_id)
);
create index if not exists folder_posts_post_idx on familiar.folder_posts(post_id);

create table if not exists familiar.folder_commission_listings (
  folder_id uuid not null references familiar.folders(folder_id) on delete cascade,
  listing_id uuid not null references familiar.commission_listings(listing_id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (folder_id, listing_id)
);
create index if not exists folder_commission_listings_listing_idx on familiar.folder_commission_listings(listing_id);

create table if not exists familiar.folder_shop_items (
  folder_id uuid not null references familiar.folders(folder_id) on delete cascade,
  item_id uuid not null references familiar.shop_items(item_id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (folder_id, item_id)
);
create index if not exists folder_shop_items_item_idx on familiar.folder_shop_items(item_id);



-- -------------------------
-- Notifications
-- -------------------------
create table if not exists familiar.notifications (
  notification_id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references familiar.profiles(user_id) on delete cascade,
  actor_id uuid references familiar.profiles(user_id) on delete set null,
  type text not null,
  entity_type text,
  entity_id uuid,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists notifications_recipient_idx on familiar.notifications(recipient_id, created_at desc);
create index if not exists notifications_unread_idx on familiar.notifications(recipient_id) where read_at is null;

create or replace function familiar.notify(
  p_recipient_id uuid,
  p_type text,
  p_actor_id uuid default null,
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_data jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = familiar, public, auth, pg_temp
as $$
begin
  insert into familiar.notifications(recipient_id, actor_id, type, entity_type, entity_id, data)
  values (p_recipient_id, p_actor_id, p_type, p_entity_type, p_entity_id, coalesce(p_data,'{}'::jsonb));
end $$;

revoke all on function familiar.notify(uuid,text,uuid,text,uuid,jsonb) from public;
grant execute on function familiar.notify(uuid,text,uuid,text,uuid,jsonb) to authenticated;

create or replace function familiar.follows_notify()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'pending' then
      perform familiar.notify(new.followed_user_id, 'follow_request', new.follower_id, 'user', new.follower_id,
        jsonb_build_object('status', new.status));
    elsif new.status = 'accepted' then
      perform familiar.notify(new.followed_user_id, 'new_follower', new.follower_id, 'user', new.follower_id,
        jsonb_build_object('status', new.status));
    end if;
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if old.status = 'pending' and new.status = 'accepted' then
      perform familiar.notify(new.follower_id, 'follow_accepted', new.followed_user_id, 'user', new.followed_user_id,
        jsonb_build_object('status', new.status));
    end if;
    return new;
  end if;

  return new;
end $$;

drop trigger if exists trg_follows_notify on familiar.follows;
create trigger trg_follows_notify
after insert or update of status on familiar.follows
for each row execute function familiar.follows_notify();

-- -------------------------
-- Reports
-- -------------------------
create table if not exists familiar.reports (
  report_id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references familiar.profiles(user_id) on delete cascade,
  target_type familiar.report_target_type not null,
  target_id uuid not null,
  reason text not null,
  details text,
  status familiar.report_status not null default 'open',
  created_at timestamptz not null default now()
);

create index if not exists reports_target_idx on familiar.reports(target_type, target_id);
create index if not exists reports_status_idx on familiar.reports(status, created_at desc);

-- -------------------------
-- DM (minimal)
-- -------------------------
create table if not exists familiar.dm_conversations (
  conversation_id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  last_message_at timestamptz
);

create table if not exists familiar.dm_participants (
  conversation_id uuid not null references familiar.dm_conversations(conversation_id) on delete cascade,
  user_id uuid not null references familiar.profiles(user_id) on delete cascade,
  role familiar.dm_participant_role not null default 'member',
  primary key (conversation_id, user_id)
);

create index if not exists dm_participants_user_idx on familiar.dm_participants(user_id);

create table if not exists familiar.dm_messages (
  message_id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references familiar.dm_conversations(conversation_id) on delete cascade,
  sender_id uuid not null references familiar.profiles(user_id) on delete cascade,
  body text not null,
  attachments jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists dm_messages_conv_idx on familiar.dm_messages(conversation_id, created_at desc);

create or replace function familiar.dm_touch_conversation()
returns trigger
language plpgsql
as $$
begin
  update familiar.dm_conversations
     set last_message_at = new.created_at
   where conversation_id = new.conversation_id;
  return new;
end $$;

drop trigger if exists trg_dm_touch_conv on familiar.dm_messages;
create trigger trg_dm_touch_conv
after insert on familiar.dm_messages
for each row execute function familiar.dm_touch_conversation();

-- -------------------------
-- Currency & FX (USD base)
-- -------------------------
create table if not exists familiar.currencies (
  code text primary key,
  symbol text not null,
  decimals int not null default 2
);

insert into familiar.currencies(code,symbol,decimals) values
  ('USD','$',2),
  ('PLN','zł',2),
  ('EUR','€',2),
  ('GBP','£',2)
on conflict (code) do nothing;

create table if not exists familiar.user_currency_pref (
  user_id uuid primary key references familiar.profiles(user_id) on delete cascade,
  currency text not null references familiar.currencies(code) on delete restrict,
  updated_at timestamptz not null default now()
);

create table if not exists familiar.fx_rates (
  base text not null default 'USD',
  quote text not null references familiar.currencies(code) on delete restrict,
  as_of timestamptz not null,
  rate numeric not null,
  primary key (base, quote, as_of),
  constraint fx_rate_positive_chk check (rate > 0)
);

create index if not exists fx_rates_quote_idx on familiar.fx_rates(quote, as_of desc);

-- -------------------------
-- Subscriptions (Premium)
-- -------------------------
create table if not exists familiar.subscription_plans (
  plan_key text primary key,
  label text not null,
  interval familiar.subscription_interval not null,
  price_usd numeric not null,
  features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint subscription_price_chk check (price_usd >= 0)
);

insert into familiar.subscription_plans(plan_key,label,interval,price_usd,features) values
  ('premium_monthly','Premium (Monthly)','month',9.99, jsonb_build_object('animated_avatar', true, 'bio_max', 300)),
  ('premium_yearly','Premium (Yearly)','year',99.99, jsonb_build_object('animated_avatar', true, 'bio_max', 300))
on conflict (plan_key) do update set
  label = excluded.label,
  interval = excluded.interval,
  price_usd = excluded.price_usd,
  features = excluded.features;

create table if not exists familiar.user_subscriptions (
  subscription_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references familiar.profiles(user_id) on delete cascade,
  plan_key text not null references familiar.subscription_plans(plan_key) on delete restrict,
  provider text not null default 'stripe',
  provider_subscription_id text,
  status familiar.subscription_status not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_subscriptions_user_idx on familiar.user_subscriptions(user_id, status);
create index if not exists user_subscriptions_period_end_idx on familiar.user_subscriptions(current_period_end desc);

drop trigger if exists trg_user_subscriptions_updated_at on familiar.user_subscriptions;
create trigger trg_user_subscriptions_updated_at
before update on familiar.user_subscriptions
for each row execute function familiar.set_updated_at();

create or replace function familiar.refresh_user_premium(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = familiar, public, auth, pg_temp
as $$
declare
  until_ts timestamptz;
begin
  select max(coalesce(current_period_end, now()))
    into until_ts
  from familiar.user_subscriptions s
  where s.user_id = p_user_id
    and s.status in ('active','trialing','past_due')
    and (s.current_period_end is null or s.current_period_end > now());

  if until_ts is null then
    update familiar.profiles
       set is_premium = false,
           premium_until = null
     where user_id = p_user_id;
  else
    update familiar.profiles
       set is_premium = true,
           premium_until = until_ts
     where user_id = p_user_id;
  end if;
end $$;

create or replace function familiar.user_subscriptions_refresh_trigger()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    perform familiar.refresh_user_premium(old.user_id);
    return old;
  else
    perform familiar.refresh_user_premium(new.user_id);
    return new;
  end if;
end $$;

drop trigger if exists trg_user_subscriptions_refresh on familiar.user_subscriptions;
create trigger trg_user_subscriptions_refresh
after insert or update or delete on familiar.user_subscriptions
for each row execute function familiar.user_subscriptions_refresh_trigger();

-- -------------------------
-- Moderation: strikes & bans (with inviter penalty)
-- -------------------------
create table if not exists familiar.moderation_strikes (
  strike_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references familiar.profiles(user_id) on delete cascade,
  issued_by uuid references familiar.profiles(user_id) on delete set null,
  reason text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists moderation_strikes_user_idx on familiar.moderation_strikes(user_id, expires_at desc);

create or replace function familiar.strikes_default_expiry()
returns trigger
language plpgsql
as $$
begin
  if new.expires_at is null then
    new.expires_at := now() + interval '90 days';
  end if;
  return new;
end $$;

drop trigger if exists trg_strikes_default_expiry on familiar.moderation_strikes;
create trigger trg_strikes_default_expiry
before insert on familiar.moderation_strikes
for each row execute function familiar.strikes_default_expiry();

create table if not exists familiar.user_bans (
  ban_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references familiar.profiles(user_id) on delete cascade,
  ban_type familiar.ban_type not null,
  reason text not null,
  issued_by uuid references familiar.profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz
);

create index if not exists user_bans_user_idx on familiar.user_bans(user_id, created_at desc);

create or replace function familiar.strikes_auto_ban()
returns trigger
language plpgsql
security definer
set search_path = familiar, public, auth, pg_temp
as $$
declare
  active_cnt int;
  already_banned boolean;
begin
  select count(*) into active_cnt
  from familiar.moderation_strikes s
  where s.user_id = new.user_id
    and s.expires_at > now();

  select exists (
    select 1 from familiar.user_bans b
    where b.user_id = new.user_id
      and b.ban_type = 'perm'
      and b.revoked_at is null
  ) into already_banned;

  if active_cnt >= 3 and not already_banned then
    insert into familiar.user_bans(user_id, ban_type, reason, issued_by)
    values (new.user_id, 'perm', 'Auto-ban: 3 active strikes', new.issued_by);

    perform familiar.notify(new.user_id, 'ban_applied', new.issued_by, 'user', new.user_id,
      jsonb_build_object('ban_type','perm','reason','Auto-ban: 3 active strikes'));
  else
    perform familiar.notify(new.user_id, 'strike_added', new.issued_by, 'user', new.user_id,
      jsonb_build_object('active_strikes', active_cnt, 'expires_at', new.expires_at));
  end if;

  return new;
end $$;

drop trigger if exists trg_strikes_auto_ban on familiar.moderation_strikes;
create trigger trg_strikes_auto_ban
after insert on familiar.moderation_strikes
for each row execute function familiar.strikes_auto_ban();

create or replace function familiar.permaban_penalize_inviter()
returns trigger
language plpgsql
security definer
set search_path = familiar, public, auth, pg_temp
as $$
declare
  inviter uuid;
  penalty_cnt int;
begin
  if new.ban_type <> 'perm' or new.revoked_at is not null then
    return new;
  end if;

  select c.created_by_user_id
    into inviter
  from familiar.artist_invite_codes c
  where c.used_by_user_id = new.user_id
    and c.status = 'used'
  order by c.used_at desc nulls last
  limit 1;

  if inviter is null then
    return new;
  end if;

  insert into familiar.inviter_penalties(inviter_id, invited_user_id, type, details)
  values (
    inviter,
    new.user_id,
    'invitee_permabanned',
    jsonb_build_object('ban_reason', new.reason, 'ban_created_at', new.created_at)
  );

  select count(*) into penalty_cnt
  from familiar.inviter_penalties p
  where p.inviter_id = inviter
    and p.type = 'invitee_permabanned'
    and p.created_at > now() - interval '365 days';

  if penalty_cnt >= 2 then
    insert into familiar.invite_privileges(user_id, can_generate, disabled_until, updated_at)
    values (inviter, false, now() + interval '180 days', now())
    on conflict (user_id) do update
      set can_generate = false,
          disabled_until = greatest(coalesce(invite_privileges.disabled_until, now()), now() + interval '180 days'),
          updated_at = now();

    perform familiar.notify(inviter, 'invite_privileges_restricted', null, 'user', inviter,
      jsonb_build_object('disabled_until', (now() + interval '180 days'), 'reason', 'Repeated invitee permabans'));
  else
    perform familiar.notify(inviter, 'inviter_penalized', null, 'user', inviter,
      jsonb_build_object('reason', 'Invitee permabanned', 'invitee_id', new.user_id, 'count_365d', penalty_cnt));
  end if;

  return new;
end $$;

drop trigger if exists trg_permaban_penalize_inviter on familiar.user_bans;
create trigger trg_permaban_penalize_inviter
after insert on familiar.user_bans
for each row execute function familiar.permaban_penalize_inviter();

-- -------------------------
-- Grants (API access) - RLS still applies
-- -------------------------
grant select on all tables in schema familiar to anon, authenticated;
grant insert, update, delete on all tables in schema familiar to authenticated;

-- -------------------------
-- RLS (Row Level Security) policies
-- -------------------------

-- Profiles
alter table familiar.profiles enable row level security;

drop policy if exists profiles_select_public on familiar.profiles;
create policy profiles_select_public
on familiar.profiles for select
using (familiar.can_view_user(user_id));

drop policy if exists profiles_insert_self on familiar.profiles;
create policy profiles_insert_self
on familiar.profiles for insert
with check (auth.uid() = user_id);

drop policy if exists profiles_update_self on familiar.profiles;
create policy profiles_update_self
on familiar.profiles for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Roles (public read)
alter table familiar.roles enable row level security;
drop policy if exists roles_select_public on familiar.roles;
create policy roles_select_public on familiar.roles for select using (true);

-- User roles (readable if you can view user; writes are blocked by policy)
alter table familiar.user_roles enable row level security;

drop policy if exists user_roles_select_viewable on familiar.user_roles;
create policy user_roles_select_viewable
on familiar.user_roles for select
using (familiar.can_view_user(user_id) and (is_public = true or auth.uid() = user_id));

drop policy if exists user_roles_write_none on familiar.user_roles;
create policy user_roles_write_none
on familiar.user_roles for all
using (false) with check (false);

-- Languages & links (public read, self write)
alter table familiar.user_spoken_languages enable row level security;
drop policy if exists user_spoken_languages_select_public on familiar.user_spoken_languages;
create policy user_spoken_languages_select_public on familiar.user_spoken_languages for select using (true);
drop policy if exists user_spoken_languages_write_self on familiar.user_spoken_languages;
create policy user_spoken_languages_write_self
on familiar.user_spoken_languages for all
using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table familiar.user_links enable row level security;
drop policy if exists user_links_select_public on familiar.user_links;
create policy user_links_select_public on familiar.user_links for select using (true);
drop policy if exists user_links_write_self on familiar.user_links;
create policy user_links_write_self
on familiar.user_links for all
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Badges (public read), user_badges public read (writes locked; handled by security definer)
alter table familiar.badges enable row level security;
drop policy if exists badges_select_public on familiar.badges;
create policy badges_select_public on familiar.badges for select using (true);

alter table familiar.user_badges enable row level security;
drop policy if exists user_badges_select_public on familiar.user_badges;
create policy user_badges_select_public on familiar.user_badges for select using (true);
drop policy if exists user_badges_write_none on familiar.user_badges;
create policy user_badges_write_none on familiar.user_badges for all using (false) with check (false);

-- Invite privileges/penalties (self read only)
alter table familiar.invite_privileges enable row level security;
drop policy if exists invite_privileges_select_self on familiar.invite_privileges;
create policy invite_privileges_select_self on familiar.invite_privileges for select using (auth.uid() = user_id);
drop policy if exists invite_privileges_write_none on familiar.invite_privileges;
create policy invite_privileges_write_none on familiar.invite_privileges for all using (false) with check (false);

alter table familiar.inviter_penalties enable row level security;
drop policy if exists inviter_penalties_select_self on familiar.inviter_penalties;
create policy inviter_penalties_select_self on familiar.inviter_penalties for select using (auth.uid() = inviter_id);
drop policy if exists inviter_penalties_write_none on familiar.inviter_penalties;
create policy inviter_penalties_write_none on familiar.inviter_penalties for all using (false) with check (false);

-- Invite codes (creator read/write)
alter table familiar.artist_invite_codes enable row level security;
drop policy if exists invite_codes_select_creator on familiar.artist_invite_codes;
create policy invite_codes_select_creator on familiar.artist_invite_codes for select using (auth.uid() = created_by_user_id);
drop policy if exists invite_codes_write_creator on familiar.artist_invite_codes;
create policy invite_codes_write_creator
on familiar.artist_invite_codes for all
using (auth.uid() = created_by_user_id)
with check (auth.uid() = created_by_user_id);

-- Media assets (public read metadata; owner write)
alter table familiar.media_assets enable row level security;
drop policy if exists media_assets_select_public on familiar.media_assets;
create policy media_assets_select_public on familiar.media_assets for select using (true);
drop policy if exists media_assets_write_owner on familiar.media_assets;
create policy media_assets_write_owner
on familiar.media_assets for all
using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

-- Posts (public if artist viewable + not private visibility; artist write)
alter table familiar.posts enable row level security;
drop policy if exists posts_select_viewable on familiar.posts;
create policy posts_select_viewable
on familiar.posts for select
using (visibility <> 'private' and familiar.can_view_user(artist_id));

drop policy if exists posts_write_artist on familiar.posts;
create policy posts_write_artist
on familiar.posts for all
using (auth.uid() = artist_id) with check (auth.uid() = artist_id);

-- Post media readable if post viewable; artist write
alter table familiar.post_media enable row level security;
drop policy if exists post_media_select_viewable on familiar.post_media;
create policy post_media_select_viewable
on familiar.post_media for select
using (
  exists (
    select 1 from familiar.posts p
    where p.post_id = post_media.post_id
      and p.visibility <> 'private'
      and familiar.can_view_user(p.artist_id)
  )
);

drop policy if exists post_media_write_artist on familiar.post_media;
create policy post_media_write_artist
on familiar.post_media for all
using (exists (select 1 from familiar.posts p where p.post_id = post_media.post_id and p.artist_id = auth.uid()))
with check (exists (select 1 from familiar.posts p where p.post_id = post_media.post_id and p.artist_id = auth.uid()));

-- Post metrics public read
alter table familiar.post_metrics enable row level security;
drop policy if exists post_metrics_select_public on familiar.post_metrics;
create policy post_metrics_select_public on familiar.post_metrics for select using (true);

-- Likes: self list + self write
alter table familiar.post_likes enable row level security;
drop policy if exists post_likes_select_self on familiar.post_likes;
create policy post_likes_select_self on familiar.post_likes for select using (auth.uid() = user_id);
drop policy if exists post_likes_insert_self on familiar.post_likes;
create policy post_likes_insert_self on familiar.post_likes for insert with check (auth.uid() = user_id);
drop policy if exists post_likes_delete_self on familiar.post_likes;
create policy post_likes_delete_self on familiar.post_likes for delete using (auth.uid() = user_id);

-- Views: anyone can insert; select disabled
alter table familiar.post_views enable row level security;
drop policy if exists post_views_insert_anyone on familiar.post_views;
create policy post_views_insert_anyone on familiar.post_views for insert with check (true);
drop policy if exists post_views_select_none on familiar.post_views;
create policy post_views_select_none on familiar.post_views for select using (false);

-- Sonas: public if owner viewable AND sona not private; accepted followers can view private sonas
alter table familiar.sonas enable row level security;
drop policy if exists sonas_select_viewable on familiar.sonas;
create policy sonas_select_viewable
on familiar.sonas for select
using (
  auth.uid() = owner_id
  or (
    familiar.can_view_user(owner_id)
    and (
      is_private = false
      or exists (
        select 1 from familiar.follows f
        where f.follower_id = auth.uid()
          and f.followed_user_id = owner_id
          and f.status = 'accepted'
      )
    )
  )
);

drop policy if exists sonas_write_owner on familiar.sonas;
create policy sonas_write_owner on familiar.sonas for all
using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Sona reference sheets: readable/writable by sona owner
alter table familiar.sona_reference_sheets enable row level security;
drop policy if exists sona_ref_select_owner on familiar.sona_reference_sheets;
create policy sona_ref_select_owner
on familiar.sona_reference_sheets for select
using (exists (select 1 from familiar.sonas s where s.sona_id = sona_reference_sheets.sona_id and s.owner_id = auth.uid()));

drop policy if exists sona_ref_write_owner on familiar.sona_reference_sheets;
create policy sona_ref_write_owner
on familiar.sona_reference_sheets for all
using (exists (select 1 from familiar.sonas s where s.sona_id = sona_reference_sheets.sona_id and s.owner_id = auth.uid()))
with check (exists (select 1 from familiar.sonas s where s.sona_id = sona_reference_sheets.sona_id and s.owner_id = auth.uid()));

-- Post <-> Sona refs: readable if both are viewable; artist write for their post
alter table familiar.post_sona_refs enable row level security;
drop policy if exists post_sona_refs_select_viewable on familiar.post_sona_refs;
create policy post_sona_refs_select_viewable
on familiar.post_sona_refs for select
using (
  exists (
    select 1 from familiar.sonas s
    where s.sona_id = post_sona_refs.sona_id
      and (
        auth.uid() = s.owner_id
        or (familiar.can_view_user(s.owner_id) and s.is_private = false)
        or exists (
          select 1 from familiar.follows f
          where f.follower_id = auth.uid()
            and f.followed_user_id = s.owner_id
            and f.status = 'accepted'
        )
      )
  )
  and exists (
    select 1 from familiar.posts p
    where p.post_id = post_sona_refs.post_id
      and p.visibility <> 'private'
      and familiar.can_view_user(p.artist_id)
  )
);

drop policy if exists post_sona_refs_write_artist on familiar.post_sona_refs;
create policy post_sona_refs_write_artist
on familiar.post_sona_refs for all
using (exists (select 1 from familiar.posts p where p.post_id = post_sona_refs.post_id and p.artist_id = auth.uid()))
with check (exists (select 1 from familiar.posts p where p.post_id = post_sona_refs.post_id and p.artist_id = auth.uid()));

-- Commission listings: public if status != draft and artist viewable; artist write
alter table familiar.commission_listings enable row level security;
drop policy if exists commission_listings_select_viewable on familiar.commission_listings;
create policy commission_listings_select_viewable
on familiar.commission_listings for select
using (status <> 'draft' and familiar.can_view_user(artist_id));

drop policy if exists commission_listings_write_artist on familiar.commission_listings;
create policy commission_listings_write_artist
on familiar.commission_listings for all
using (auth.uid() = artist_id) with check (auth.uid() = artist_id);

alter table familiar.commission_listing_media enable row level security;
drop policy if exists commission_listing_media_select_viewable on familiar.commission_listing_media;
create policy commission_listing_media_select_viewable
on familiar.commission_listing_media for select
using (
  exists (
    select 1 from familiar.commission_listings l
    where l.listing_id = commission_listing_media.listing_id
      and l.status <> 'draft'
      and familiar.can_view_user(l.artist_id)
  )
);

drop policy if exists commission_listing_media_write_artist on familiar.commission_listing_media;
create policy commission_listing_media_write_artist
on familiar.commission_listing_media for all
using (exists (select 1 from familiar.commission_listings l where l.listing_id = commission_listing_media.listing_id and l.artist_id = auth.uid()))
with check (exists (select 1 from familiar.commission_listings l where l.listing_id = commission_listing_media.listing_id and l.artist_id = auth.uid()));

-- License defs public read; custom defs writable by creator
alter table familiar.license_definitions enable row level security;
drop policy if exists license_definitions_select_public on familiar.license_definitions;
create policy license_definitions_select_public on familiar.license_definitions for select using (true);

drop policy if exists license_definitions_write_creator on familiar.license_definitions;
create policy license_definitions_write_creator
on familiar.license_definitions for all
using (auth.uid() = created_by_artist_id) with check (auth.uid() = created_by_artist_id);

alter table familiar.commission_listing_licenses enable row level security;
drop policy if exists commission_listing_licenses_select_public on familiar.commission_listing_licenses;
create policy commission_listing_licenses_select_public on familiar.commission_listing_licenses for select using (true);

drop policy if exists commission_listing_licenses_write_artist on familiar.commission_listing_licenses;
create policy commission_listing_licenses_write_artist
on familiar.commission_listing_licenses for all
using (exists (select 1 from familiar.commission_listings l where l.listing_id = commission_listing_licenses.listing_id and l.artist_id = auth.uid()))
with check (exists (select 1 from familiar.commission_listings l where l.listing_id = commission_listing_licenses.listing_id and l.artist_id = auth.uid()));

-- Artist terms: public read, artist write
alter table familiar.artist_terms enable row level security;
drop policy if exists artist_terms_select_public on familiar.artist_terms;
create policy artist_terms_select_public on familiar.artist_terms for select using (true);
drop policy if exists artist_terms_write_artist on familiar.artist_terms;
create policy artist_terms_write_artist
on familiar.artist_terms for all
using (auth.uid() = artist_id) with check (auth.uid() = artist_id);

-- Forms: artist only
alter table familiar.form_templates enable row level security;
drop policy if exists form_templates_select_artist on familiar.form_templates;
create policy form_templates_select_artist on familiar.form_templates for select using (auth.uid() = artist_id);
drop policy if exists form_templates_write_artist on familiar.form_templates;
create policy form_templates_write_artist on familiar.form_templates for all using (auth.uid() = artist_id) with check (auth.uid() = artist_id);

alter table familiar.form_fields enable row level security;
drop policy if exists form_fields_select_artist on familiar.form_fields;
create policy form_fields_select_artist
on familiar.form_fields for select
using (exists (select 1 from familiar.form_templates t where t.template_id = form_fields.template_id and t.artist_id = auth.uid()));

drop policy if exists form_fields_write_artist on familiar.form_fields;
create policy form_fields_write_artist
on familiar.form_fields for all
using (exists (select 1 from familiar.form_templates t where t.template_id = form_fields.template_id and t.artist_id = auth.uid()))
with check (exists (select 1 from familiar.form_templates t where t.template_id = form_fields.template_id and t.artist_id = auth.uid()));

-- Orders: participants only
alter table familiar.commission_orders enable row level security;
drop policy if exists commission_orders_select_participants on familiar.commission_orders;
create policy commission_orders_select_participants
on familiar.commission_orders for select
using (auth.uid() = client_id or auth.uid() = artist_id);

drop policy if exists commission_orders_write_participants on familiar.commission_orders;
create policy commission_orders_write_participants
on familiar.commission_orders for all
using (auth.uid() = client_id or auth.uid() = artist_id)
with check (auth.uid() = client_id or auth.uid() = artist_id);

alter table familiar.commission_order_attachments enable row level security;
drop policy if exists commission_order_attachments_select_participants on familiar.commission_order_attachments;
create policy commission_order_attachments_select_participants
on familiar.commission_order_attachments for select
using (
  exists (select 1 from familiar.commission_orders o
          where o.order_id = commission_order_attachments.order_id
            and (o.client_id = auth.uid() or o.artist_id = auth.uid()))
);

drop policy if exists commission_order_attachments_write_participants on familiar.commission_order_attachments;
create policy commission_order_attachments_write_participants
on familiar.commission_order_attachments for all
using (
  exists (select 1 from familiar.commission_orders o
          where o.order_id = commission_order_attachments.order_id
            and (o.client_id = auth.uid() or o.artist_id = auth.uid()))
)
with check (
  exists (select 1 from familiar.commission_orders o
          where o.order_id = commission_order_attachments.order_id
            and (o.client_id = auth.uid() or o.artist_id = auth.uid()))
);

-- Reviews: public read; client write
alter table familiar.reviews enable row level security;
drop policy if exists reviews_select_public on familiar.reviews;
create policy reviews_select_public on familiar.reviews for select using (true);
drop policy if exists reviews_insert_client on familiar.reviews;
create policy reviews_insert_client on familiar.reviews for insert with check (auth.uid() = client_id);
drop policy if exists reviews_update_client on familiar.reviews;
create policy reviews_update_client on familiar.reviews for update using (auth.uid() = client_id) with check (auth.uid() = client_id);

alter table familiar.post_featured_review enable row level security;
drop policy if exists post_featured_review_select_public on familiar.post_featured_review;
create policy post_featured_review_select_public on familiar.post_featured_review for select using (true);
drop policy if exists post_featured_review_write_artist on familiar.post_featured_review;
create policy post_featured_review_write_artist
on familiar.post_featured_review for all
using (exists (select 1 from familiar.posts p where p.post_id = post_featured_review.post_id and p.artist_id = auth.uid()))
with check (exists (select 1 from familiar.posts p where p.post_id = post_featured_review.post_id and p.artist_id = auth.uid()));

alter table familiar.commission_listing_metrics enable row level security;
drop policy if exists commission_listing_metrics_select_public on familiar.commission_listing_metrics;
create policy commission_listing_metrics_select_public on familiar.commission_listing_metrics for select using (true);

-- Shop: items public if seller viewable; seller write
alter table familiar.shop_items enable row level security;
drop policy if exists shop_items_select_viewable on familiar.shop_items;
create policy shop_items_select_viewable on familiar.shop_items for select using (familiar.can_view_user(seller_id));
drop policy if exists shop_items_write_seller on familiar.shop_items;
create policy shop_items_write_seller
on familiar.shop_items for all
using (auth.uid() = seller_id) with check (auth.uid() = seller_id);

alter table familiar.shop_item_media enable row level security;
drop policy if exists shop_item_media_select_viewable on familiar.shop_item_media;
create policy shop_item_media_select_viewable
on familiar.shop_item_media for select
using (exists (select 1 from familiar.shop_items i where i.item_id = shop_item_media.item_id and familiar.can_view_user(i.seller_id)));

drop policy if exists shop_item_media_write_seller on familiar.shop_item_media;
create policy shop_item_media_write_seller
on familiar.shop_item_media for all
using (exists (select 1 from familiar.shop_items i where i.item_id = shop_item_media.item_id and i.seller_id = auth.uid()))
with check (exists (select 1 from familiar.shop_items i where i.item_id = shop_item_media.item_id and i.seller_id = auth.uid()));

alter table familiar.shop_item_variants enable row level security;
drop policy if exists shop_item_variants_select_viewable on familiar.shop_item_variants;
create policy shop_item_variants_select_viewable
on familiar.shop_item_variants for select
using (exists (select 1 from familiar.shop_items i where i.item_id = shop_item_variants.item_id and familiar.can_view_user(i.seller_id)));

drop policy if exists shop_item_variants_write_seller on familiar.shop_item_variants;
create policy shop_item_variants_write_seller
on familiar.shop_item_variants for all
using (exists (select 1 from familiar.shop_items i where i.item_id = shop_item_variants.item_id and i.seller_id = auth.uid()))
with check (exists (select 1 from familiar.shop_items i where i.item_id = shop_item_variants.item_id and i.seller_id = auth.uid()));

-- Shop orders: buyer only
alter table familiar.shop_orders enable row level security;
drop policy if exists shop_orders_select_buyer on familiar.shop_orders;
create policy shop_orders_select_buyer on familiar.shop_orders for select using (auth.uid() = buyer_id);
drop policy if exists shop_orders_write_buyer on familiar.shop_orders;
create policy shop_orders_write_buyer on familiar.shop_orders for all using (auth.uid() = buyer_id) with check (auth.uid() = buyer_id);

alter table familiar.shop_order_items enable row level security;
drop policy if exists shop_order_items_select_buyer on familiar.shop_order_items;
create policy shop_order_items_select_buyer
on familiar.shop_order_items for select
using (exists (select 1 from familiar.shop_orders o where o.order_id = shop_order_items.order_id and o.buyer_id = auth.uid()));

drop policy if exists shop_order_items_write_buyer on familiar.shop_order_items;
create policy shop_order_items_write_buyer
on familiar.shop_order_items for all
using (exists (select 1 from familiar.shop_orders o where o.order_id = shop_order_items.order_id and o.buyer_id = auth.uid()))
with check (exists (select 1 from familiar.shop_orders o where o.order_id = shop_order_items.order_id and o.buyer_id = auth.uid()));

-- Blocks: self manage
alter table familiar.user_blocks enable row level security;
drop policy if exists user_blocks_select_self on familiar.user_blocks;
create policy user_blocks_select_self on familiar.user_blocks for select using (auth.uid() = blocker_id);
drop policy if exists user_blocks_write_self on familiar.user_blocks;
create policy user_blocks_write_self
on familiar.user_blocks for all
using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

-- Follows: participants only
alter table familiar.follows enable row level security;
drop policy if exists follows_select_participants on familiar.follows;
create policy follows_select_participants on familiar.follows for select using (auth.uid() = follower_id or auth.uid() = followed_user_id);

drop policy if exists follows_insert_self on familiar.follows;
create policy follows_insert_self on familiar.follows for insert with check (auth.uid() = follower_id);

drop policy if exists follows_update_participants on familiar.follows;
create policy follows_update_participants on familiar.follows for update
using (auth.uid() = follower_id or auth.uid() = followed_user_id)
with check (auth.uid() = follower_id or auth.uid() = followed_user_id);

drop policy if exists follows_delete_participants on familiar.follows;
create policy follows_delete_participants on familiar.follows for delete using (auth.uid() = follower_id or auth.uid() = followed_user_id);

-- Saved: self only
alter table familiar.saved_posts enable row level security;
drop policy if exists saved_posts_select_self on familiar.saved_posts;
create policy saved_posts_select_self on familiar.saved_posts for select using (auth.uid() = user_id);
drop policy if exists saved_posts_write_self on familiar.saved_posts;
create policy saved_posts_write_self on familiar.saved_posts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table familiar.saved_shop_items enable row level security;
drop policy if exists saved_shop_items_select_self on familiar.saved_shop_items;
create policy saved_shop_items_select_self on familiar.saved_shop_items for select using (auth.uid() = user_id);
drop policy if exists saved_shop_items_write_self on familiar.saved_shop_items;
create policy saved_shop_items_write_self on familiar.saved_shop_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table familiar.saved_commission_listings enable row level security;
drop policy if exists saved_commission_listings_select_self on familiar.saved_commission_listings;
create policy saved_commission_listings_select_self on familiar.saved_commission_listings for select using (auth.uid() = user_id);
drop policy if exists saved_commission_listings_write_self on familiar.saved_commission_listings;
create policy saved_commission_listings_write_self on familiar.saved_commission_listings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Notifications: self read + self mark read
alter table familiar.notifications enable row level security;
drop policy if exists notifications_select_self on familiar.notifications;
create policy notifications_select_self on familiar.notifications for select using (auth.uid() = recipient_id);
drop policy if exists notifications_update_self on familiar.notifications;
create policy notifications_update_self on familiar.notifications for update using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);
drop policy if exists notifications_insert_none on familiar.notifications;
create policy notifications_insert_none on familiar.notifications for insert with check (false);

-- Reports: insert by reporter; select none (handled by moderation)
alter table familiar.reports enable row level security;
drop policy if exists reports_insert_self on familiar.reports;
create policy reports_insert_self on familiar.reports for insert with check (auth.uid() = reporter_id);
drop policy if exists reports_select_none on familiar.reports;
create policy reports_select_none on familiar.reports for select using (false);

-- DM: select for participants; insert message only if participant and not blocked with other participants
alter table familiar.dm_conversations enable row level security;
drop policy if exists dm_conversations_select_participant on familiar.dm_conversations;
create policy dm_conversations_select_participant
on familiar.dm_conversations for select
using (exists (select 1 from familiar.dm_participants p where p.conversation_id = dm_conversations.conversation_id and p.user_id = auth.uid()));

alter table familiar.dm_participants enable row level security;
drop policy if exists dm_participants_select_participant on familiar.dm_participants;
create policy dm_participants_select_participant
on familiar.dm_participants for select
using (exists (select 1 from familiar.dm_participants p where p.conversation_id = dm_participants.conversation_id and p.user_id = auth.uid()));

alter table familiar.dm_messages enable row level security;
drop policy if exists dm_messages_select_participant on familiar.dm_messages;
create policy dm_messages_select_participant
on familiar.dm_messages for select
using (exists (select 1 from familiar.dm_participants p where p.conversation_id = dm_messages.conversation_id and p.user_id = auth.uid()));

drop policy if exists dm_messages_insert_participant on familiar.dm_messages;
create policy dm_messages_insert_participant
on familiar.dm_messages for insert
with check (
  auth.uid() = sender_id
  and exists (select 1 from familiar.dm_participants p where p.conversation_id = dm_messages.conversation_id and p.user_id = auth.uid())
  and not exists (
    select 1
    from familiar.dm_participants p
    join familiar.user_blocks b
      on (
        (b.blocker_id = dm_messages.sender_id and b.blocked_user_id = p.user_id)
        or
        (b.blocker_id = p.user_id and b.blocked_user_id = dm_messages.sender_id)
      )
    where p.conversation_id = dm_messages.conversation_id
      and p.user_id <> dm_messages.sender_id
  )
);

-- Currency preferences: self only
alter table familiar.user_currency_pref enable row level security;
drop policy if exists user_currency_pref_select_self on familiar.user_currency_pref;
create policy user_currency_pref_select_self on familiar.user_currency_pref for select using (auth.uid() = user_id);
drop policy if exists user_currency_pref_write_self on familiar.user_currency_pref;
create policy user_currency_pref_write_self on familiar.user_currency_pref for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table familiar.fx_rates enable row level security;
drop policy if exists fx_rates_select_public on familiar.fx_rates;
create policy fx_rates_select_public on familiar.fx_rates for select using (true);

-- Subscriptions: user can read their own; writes blocked (expected via service_role/webhooks)
alter table familiar.user_subscriptions enable row level security;
drop policy if exists user_subscriptions_select_self on familiar.user_subscriptions;
create policy user_subscriptions_select_self on familiar.user_subscriptions for select using (auth.uid() = user_id);
drop policy if exists user_subscriptions_write_none on familiar.user_subscriptions;
create policy user_subscriptions_write_none on familiar.user_subscriptions for all using (false) with check (false);

alter table familiar.subscription_plans enable row level security;
drop policy if exists subscription_plans_select_public on familiar.subscription_plans;
create policy subscription_plans_select_public on familiar.subscription_plans for select using (true);

-- Moderation: hidden by default (admin/service role)
alter table familiar.moderation_strikes enable row level security;
drop policy if exists moderation_strikes_select_none on familiar.moderation_strikes;
create policy moderation_strikes_select_none on familiar.moderation_strikes for select using (false);

alter table familiar.user_bans enable row level security;
drop policy if exists user_bans_select_none on familiar.user_bans;
create policy user_bans_select_none on familiar.user_bans for select using (false);



-- ============================================================
-- RLS: App folders
-- ============================================================
alter table familiar.folders enable row level security;

drop policy if exists folders_select on familiar.folders;
create policy folders_select
on familiar.folders for select
using (
  auth.uid() = owner_id
  or (
    visibility = 'public'
    and familiar.can_view_user(owner_id)   -- respects profile privacy + blocks
  )
);

drop policy if exists folders_write_owner on familiar.folders;
create policy folders_write_owner
on familiar.folders for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

-- Folder -> posts
alter table familiar.folder_posts enable row level security;

drop policy if exists folder_posts_select on familiar.folder_posts;
create policy folder_posts_select
on familiar.folder_posts for select
using (
  -- owner can see their own
  exists (select 1 from familiar.folders f where f.folder_id = folder_posts.folder_id and f.owner_id = auth.uid())
  or
  -- public folder viewers can only see posts that are themselves viewable
  exists (
    select 1
    from familiar.folders f
    join familiar.posts p on p.post_id = folder_posts.post_id
    where f.folder_id = folder_posts.folder_id
      and f.visibility = 'public'
      and familiar.can_view_user(f.owner_id)
      and p.visibility <> 'private'
      and familiar.can_view_user(p.artist_id)
  )
);

drop policy if exists folder_posts_write_owner on familiar.folder_posts;
create policy folder_posts_write_owner
on familiar.folder_posts for all
using (
  exists (select 1 from familiar.folders f where f.folder_id = folder_posts.folder_id and f.owner_id = auth.uid())
)
with check (
  exists (select 1 from familiar.folders f where f.folder_id = folder_posts.folder_id and f.owner_id = auth.uid())
  and exists (select 1 from familiar.posts p where p.post_id = folder_posts.post_id and p.artist_id = auth.uid())
);

-- Folder -> commission listings
alter table familiar.folder_commission_listings enable row level security;

drop policy if exists folder_commission_listings_select on familiar.folder_commission_listings;
create policy folder_commission_listings_select
on familiar.folder_commission_listings for select
using (
  exists (select 1 from familiar.folders f where f.folder_id = folder_commission_listings.folder_id and f.owner_id = auth.uid())
  or
  exists (
    select 1
    from familiar.folders f
    join familiar.commission_listings l on l.listing_id = folder_commission_listings.listing_id
    where f.folder_id = folder_commission_listings.folder_id
      and f.visibility = 'public'
      and familiar.can_view_user(f.owner_id)
      and l.status <> 'draft'
      and familiar.can_view_user(l.artist_id)
  )
);

drop policy if exists folder_commission_listings_write_owner on familiar.folder_commission_listings;
create policy folder_commission_listings_write_owner
on familiar.folder_commission_listings for all
using (
  exists (select 1 from familiar.folders f where f.folder_id = folder_commission_listings.folder_id and f.owner_id = auth.uid())
)
with check (
  exists (select 1 from familiar.folders f where f.folder_id = folder_commission_listings.folder_id and f.owner_id = auth.uid())
  and exists (select 1 from familiar.commission_listings l where l.listing_id = folder_commission_listings.listing_id and l.artist_id = auth.uid())
);

-- Folder -> shop items
alter table familiar.folder_shop_items enable row level security;

drop policy if exists folder_shop_items_select on familiar.folder_shop_items;
create policy folder_shop_items_select
on familiar.folder_shop_items for select
using (
  exists (select 1 from familiar.folders f where f.folder_id = folder_shop_items.folder_id and f.owner_id = auth.uid())
  or
  exists (
    select 1
    from familiar.folders f
    join familiar.shop_items i on i.item_id = folder_shop_items.item_id
    where f.folder_id = folder_shop_items.folder_id
      and f.visibility = 'public'
      and familiar.can_view_user(f.owner_id)
      and familiar.can_view_user(i.seller_id)
  )
);

drop policy if exists folder_shop_items_write_owner on familiar.folder_shop_items;
create policy folder_shop_items_write_owner
on familiar.folder_shop_items for all
using (
  exists (select 1 from familiar.folders f where f.folder_id = folder_shop_items.folder_id and f.owner_id = auth.uid())
)
with check (
  exists (select 1 from familiar.folders f where f.folder_id = folder_shop_items.folder_id and f.owner_id = auth.uid())
  and exists (select 1 from familiar.shop_items i where i.item_id = folder_shop_items.item_id and i.seller_id = auth.uid())
);

-- ============================================================
-- URL-only sharing (RPC)
-- ============================================================

create or replace function familiar.get_folder_by_token(p_token text)
returns table (
  folder_id uuid,
  owner_id uuid,
  parent_id uuid,
  name text,
  description text,
  created_at timestamptz
)
language sql
security definer
set search_path = familiar, public, auth, pg_temp
as $$
  select f.folder_id, f.owner_id, f.parent_id, f.name, f.description, f.created_at
  from familiar.folders f
  where f.visibility = 'url_only'
    and f.share_token = p_token
    and (f.share_expires_at is null or f.share_expires_at > now());
$$;

revoke all on function familiar.get_folder_by_token(text) from public;
grant execute on function familiar.get_folder_by_token(text) to anon, authenticated;

create or replace function familiar.get_folder_items_by_token(p_token text)
returns table (
  item_type text,
  item_id uuid,
  added_at timestamptz
)
language sql
security definer
set search_path = familiar, public, auth, pg_temp
as $$
  with f as (
    select folder_id
    from familiar.folders
    where visibility = 'url_only'
      and share_token = p_token
      and (share_expires_at is null or share_expires_at > now())
    limit 1
  )
  select 'post'::text, fp.post_id, fp.added_at
  from f join familiar.folder_posts fp on fp.folder_id = f.folder_id
  union all
  select 'commission_listing'::text, fl.listing_id, fl.added_at
  from f join familiar.folder_commission_listings fl on fl.folder_id = f.folder_id
  union all
  select 'shop_item'::text, fs.item_id, fs.added_at
  from f join familiar.folder_shop_items fs on fs.folder_id = f.folder_id
  order by added_at desc;
$$;

revoke all on function familiar.get_folder_items_by_token(text) from public;
grant execute on function familiar.get_folder_items_by_token(text) to anon, authenticated;

create or replace function familiar.rotate_folder_token(
  p_folder_id uuid,
  p_expires_at timestamptz default null
)
returns text
language plpgsql
security definer
set search_path = familiar, public, auth, pg_temp
as $$
declare
  v_token text;
begin
  if not exists (select 1 from familiar.folders f where f.folder_id = p_folder_id and f.owner_id = auth.uid()) then
    raise exception 'Not allowed';
  end if;

  v_token := encode(gen_random_bytes(16), 'hex');

  update familiar.folders
  set visibility = 'url_only',
      share_token = v_token,
      share_expires_at = p_expires_at,
      updated_at = now()
  where folder_id = p_folder_id;

  return v_token;
end $$;

revoke all on function familiar.rotate_folder_token(uuid,timestamptz) from public;
grant execute on function familiar.rotate_folder_token(uuid,timestamptz) to authenticated;


-- -------------------------
-- Important Supabase note:
-- To access schema "familiar" via the Supabase API,
-- add it to "API Settings" -> "Exposed schemas".
-- -------------------------
