# Familiar — Database schema (Supabase/Postgres) overview

> This document describes what’s already implemented in the database schema **v0.2.2** and how the data is structured.

---

## High-level goals

- **Auth**: accounts live in `auth.users` (Supabase). familiar app data lives in `familiar.*` tables.
- **Normalized profile**: profile core is small, while optional lists (languages/links/badges/roles) are separate tables.
- **Core discovery via tags**: posts, commissions and shop items support `tags` + fast search with **GIN indexes**.
- **Content safety**: optional `content_warnings[]` (NSFW/sensitive content) for easy filtering.
- **Privacy**: profiles and sonas can be familiar or private; private content is visible to accepted followers.
- **Moderation**: strikes expire, auto-ban at 3 active strikes; invite system penalizes “bad inviters”.
- **Social**: follow requests, saves, likes, blocks, notifications.
- **Media**: unified asset table with dimensions (bento grid support).

---

## Version used by this doc

- **Schema file**: `familiar_supabase_schema_v0_2_2.sql`
- Includes patches:
  - v0.1 → base schema
  - v0.1.1 → media width/height patch (already included in base table)
  - v0.2.0 → privacy + follow requests + notifications + strikes/bans + invite penalties
  - v0.2.1 → verified/premium flags + subscriptions + staff badge sync
  - v0.2.2 → tags/NSFW warnings + account blocking + shop variants

---

## Core entities & relations (mental model)

- **User**
  - `auth.users` (Supabase) → account
  - `familiar.profiles` → familiar profile info (PK = `auth.users.id`)
- **Roles (multi-role)**
  - `roles` defines roles (client/artist/moderator/admin)
  - `user_roles` assigns multiple roles per user
- **Badges**
  - `badges` defines badges (including system badges: verified, premium, staff)
  - `user_badges` grants badges to users (auto-synced from flags/roles)
- **Media**
  - `media_assets` is the central asset catalog (path, mime, **width/height**, etc.)
  - Posts/listings/shop items link via `*_media` tables
- **Posts (portfolio)**
  - `posts` + `post_media` (+ optional `post_featured_review`)
  - stats via `post_likes`, `post_views`, aggregated into `post_metrics`
- **Characters (Sona/OC)**
  - `sonas` + `sona_reference_sheets`
  - `post_sona_refs` links posts to sonas (Sona gallery)
- **Commissions**
  - `commission_listings` + `commission_listing_media`
  - license system: `license_definitions` + `commission_listing_licenses`
  - TOS: `artist_terms` (versioned)
  - forms: `form_templates` + `form_fields`
  - orders: `commission_orders` + `commission_order_attachments`
  - reviews: `reviews` (+ listing aggregates `commission_listing_metrics`)
- **Shop**
  - `shop_items` + `shop_item_media`
  - variants: `shop_item_variants`
  - orders: `shop_orders` + `shop_order_items`
- **Social + Safety**
  - follows: `follows` (supports private follow requests)
  - saves: `saved_posts`, `saved_shop_items`, `saved_commission_listings`
  - blocks: `user_blocks` (bidirectional visibility denial)
  - notifications: `notifications`
  - reports: `reports`
  - DM: `dm_*` tables

---

## Enums / “types” used

- `visibility`: `familiar | unlisted | private`
- `media_type`: `image | video | audio | file | other`
- `listing_status`: `open | closed | waitlist | draft`
- `content_warning`: `sexual | nudity | violence | gore | self_harm | drugs | hate | flashing | other`
- `license_pricing_mode`: `included | fixed_usd | percent`
- `commission_order_status`: `draft | submitted | accepted | in_progress | delivered | cancelled | refunded`
- `shop_item_type`: `digital | physical`
- `shop_order_status`: `draft | paid | fulfilled | cancelled | refunded`
- `follow_status`: `pending | accepted | rejected | blocked | cancelled`
- `ban_type`: `temp | perm`
- `language_experience`: `native | fluent | communicative | learning | basic`
- `report_target_type`: `user | post | shop_item | commission_listing | sona | message`
- `report_status`: `open | reviewing | resolved | rejected`
- `dm_participant_role`: `member | owner`
- subscription enums:
  - `subscription_interval`: `month | year`
  - `subscription_status`: `active | trialing | past_due | canceled | incomplete | paused`

---

# Tables by domain

## 1) Users & profile

### `profiles`
Core familiar profile record.

- **PK**: `user_id` (uuid, references `auth.users.id`)
- **Key fields**:
  - `username` (citext, unique)
  - `display_name`, `timezone`, `pronouns`, `bio`
  - `avatar_path`, `cover_path`
  - privacy: `is_private`
  - premium/verified: `is_verified`, `is_premium`, `premium_until`
- **Bio rule**:
  - non-premium: max 150
  - premium: max 300 (enforced by constraint)

### `roles`, `user_roles`
Multi-role support (artist + moderator etc.).

- `roles(role_key, label, is_staff)`
- `user_roles(user_id, role_key, is_familiar, granted_by, granted_at)`
- Staff roles automatically grant **staff badge** (`user_badges.staff`).

### `user_spoken_languages`, `user_links`
- languages: `{ locale, experience, sort_order }`
- links: `{ label, url, sort_order }`

### `badges`, `user_badges`
- system badges seeded: `verified`, `premium`, `staff`
- user badges can include additional custom ones later.

### Subscriptions
- `subscription_plans`: plans/feature set (monthly/yearly)
- `user_subscriptions`: current subscription state per user
- Premium state is derived automatically via trigger → updates `profiles.is_premium/premium_until`.

---

## 2) Media

### `media_assets`
Unified media store metadata used across posts/listings/shop/attachments.

- **Key fields**:
  - owner: `owner_user_id`
  - `type`, `mime`, `path`, `size_bytes`
  - **dimensions**: `width`, `height`
  - `duration_ms` (for video/audio), optional `hash`
- Used by:
  - `post_media.asset_id`
  - `commission_listing_media.asset_id`
  - `shop_item_media.asset_id`
  - `sona_reference_sheets.asset_id`
  - `commission_order_attachments.asset_id`

---

## 3) Posts (portfolio)

### `posts`
- **Fields**:
  - `artist_id`, `title`, `body_md`, `visibility`
  - `tags text[]` (**GIN index**)
  - `content_warnings content_warning[]` (**GIN index**)

### `post_media`
Ordered list of media assets: `{ post_id, asset_id, sort_order }`

### Engagement metrics
- `post_likes(user_id, post_id)` → triggers update counts
- `post_views(post_id, viewer_user_id?, viewer_fingerprint?)` → triggers update counts
- `post_metrics(post_id, likes_count, views_count)` aggregated counters

### Optional featured review on post
- `post_featured_review(post_id, review_id)`

### Artist similarity (precomputed)
- `artist_similarity(artist_id, similar_artist_id, score)`

---

## 4) Sonas (OC / character)

### `sonas`
- `owner_id`, `slug` (citext unique), `name`
- `about jsonb`, `privacy jsonb` (app-level flags)
- **plus** hard privacy flag: `is_private`
- `avatar_path`, `cover_path`

### `sona_reference_sheets`
Ordered reference assets.

### Sona gallery
- `post_sona_refs(post_id, sona_id)`
- Gallery is generated by joining `post_sona_refs → posts → post_media`.

---

## 5) Commissions

### `commission_categories`
- `{ slug, label, icon, sort_order }`

### `commission_listings`
- **Status**: `open | waitlist | closed | draft`
- Pricing:
  - `base_price_usd`
  - `discount_rate` (0..1)
- “Premade sections”:
  - `service_type` (`custom_service` / `personalized_ych`)
  - `communication_type` (`open_communication` / `surprise_me`)
  - `requesting_process` (`custom_proposal` / `instant_order`)
- Tags & safety:
  - `tags text[]` (**GIN index**)
  - `content_warnings[]` (**GIN index**)
- Text:
  - `artist_note`, `description_md`

### `license_definitions` + `commission_listing_licenses`
Supports system & custom licenses, pricing by fixed USD or percent, or included.

- `license_definitions`: `{ key, label, description, is_system, created_by_artist_id }`
- `commission_listing_licenses` per listing:
  - visibility: `visible`
  - included: `included`
  - pricing: `pricing_mode`, `add_fixed_usd`, `add_percent`

### `artist_terms`
Versioned TOS markdown (`tos_md` max 4000), one active version per artist recommended.

### Forms builder
- `form_templates`: `scope = profile_default | listing_specific`
- `form_fields`: typed blocks + `options jsonb` + `validation jsonb`

### Orders
- `commission_orders` snapshots accepted terms, selected licenses and pricing in USD, and stores `form_answers jsonb`
- `commission_order_attachments` (files/assets)

### Reviews
- `reviews` are tied to `commission_orders` (1 per order)
- `commission_listing_metrics` stores aggregates: average + count

---

## 6) Shop

### `shop_catalogues`
- `{ slug, label, sort_order }`

### `shop_items`
- `type`: `digital|physical`
- price: `price_usd`, `discount_rate`
- selection:
  - `options jsonb` (generic config)
  - **variants** in separate table (see below)
- Tags & safety:
  - `tags text[]` (**GIN index**)
  - `content_warnings[]` (**GIN index**)

### `shop_item_variants`
Variants with their own deltas and stock.

- `{ item_id, key, label, price_delta_usd, stock?, options jsonb, sort_order }`
- `shop_order_items` can reference `variant_id` and stores `variant_snapshot`.

### Orders
- `shop_orders` (buyer, total_usd, currency)
- `shop_order_items` (quantity, price_snapshot_usd, options_snapshot, variant_id, variant_snapshot)

---

## 7) Social, safety, moderation

### Follows (requests)
- `follows(follower_id, followed_user_id)` plus:
  - `status` (`pending|accepted|...`)
  - `accepted_at`, `updated_at`
- Inserts auto-set status:
  - if target profile is private → `pending`
  - else → `accepted`
- Updates enforce who can change status:
  - followed user accepts/rejects/blocks
  - follower can cancel

### Saved lists
Split tables to keep strong FK integrity:
- `saved_posts`
- `saved_shop_items`
- `saved_commission_listings`

### Blocking
- `user_blocks(blocker_id, blocked_user_id)`
- `can_view_user()` denies visibility if blocked either direction.
- DM insertion is also blocked if any participant is blocked with sender.

### Notifications
- `notifications(recipient_id, actor_id?, type, entity_type?, entity_id?, data jsonb)`
- A `notify()` SECURITY DEFINER function is provided.
- Auto notifications exist for follow requests and acceptances.

### Reports
- `reports(reporter_id, target_type, target_id, reason, status, ...)`

### DMs
- `dm_conversations`
- `dm_participants`
- `dm_messages` (with attachments jsonb)
- conversation `last_message_at` auto-updated via trigger.

### Moderation: strikes & bans
- `moderation_strikes(user_id, expires_at)` default expiry 90 days
- `user_bans(user_id, ban_type)` auto-permaban when 3 active strikes are added
- When a user is permabanned, the inviter can be penalized and have invite generation disabled temporarily.

---

## Currency & FX (USD base)

- `currencies`
- `user_currency_pref`
- `fx_rates` (USD→quote time series)

> Prices in commissions and shop are stored as **USD base**, and displayed/charged using FX conversion in app/backend.

---

# RLS (Row Level Security) summary

- **profiles**: familiar viewable if:
  - profile is familiar, or viewer is accepted follower, or viewer is the owner
  - AND there is no mutual block
- **sonas**: viewable if owner OR (owner is viewable AND sona is not private) OR accepted follower
- **posts/listings/shop items**: viewable if creator profile is viewable (privacy-aware) and visibility/status allows it
- **notifications**: only recipient can read/mark read (insert via `notify()`)
- **subscriptions**: user can read their own; writes are disabled (intended via service role / webhooks)
- **moderation tables**: currently select is disabled (intended via admin/service role)

---

# Typical “frontend shapes” (what you usually join)

## Post card (bento grid)
- `posts` + `profiles` + `user_badges/badges` + `post_media → media_assets` + `post_metrics`
- Use `media_assets.width/height` for layout.

## Commission listing card
- `commission_listings` + `profiles` + `commission_listing_media → media_assets`
- `commission_listing_licenses` + `license_definitions` (for license selector UI)
- `commission_listing_metrics` (rating + count)

## Sona page
- `sonas` + `sona_reference_sheets → media_assets`
- `post_sona_refs → posts → post_media → media_assets` for gallery

## Shop item
- `shop_items` + `shop_item_media → media_assets`
- `shop_item_variants` for selection

---

# Notes / next steps (optional)

- If you want tags as a controlled taxonomy (autocomplete + synonyms), add:
  - `tags` table + `tag_aliases` + join tables (instead of `text[]`).
- If you want NSFW filtering more granular, extend `content_warning` enum.
- If you want “familiar sona but private owner”, you can decouple sona visibility from owner visibility (currently it follows owner privacy + own flag).
- For moderation/admin UI, add policies using `user_roles` (moderator/admin) or manage via `service_role`.
