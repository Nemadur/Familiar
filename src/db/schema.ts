import { relations, sql } from "drizzle-orm";
import {
	boolean,
	doublePrecision,
	integer,
	jsonb,
	pgEnum,
	pgSchema,
	primaryKey,
	smallint,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

/**
 * Familiar database schema for Drizzle ORM (Postgres / Supabase)
 * Source-of-truth: /mnt/data/supabase_schema_familiar_v0_2_7.sql
 *
 * Notes:
 * - We use a custom schema "familiar" (not public).
 * - Enums are defined in "familiar".
 * - All tables belong to "familiar".
 * - We map snake_case columns (DB) to camelCase keys (TS) where possible?
 *   Actually Drizzle defaults to matching names unless specified.
 *   The user rules say "TypeScript-Strict", but Drizzle usually maps db_col -> dbCol?
 *   Let's check the existing code style.
 *   The previous reads showed `commission_listings` (variable `commissionListings`)
 *   and columns like `listingId: uuid("listing_id")`.
 *   So we preserve that style.
 */

// ------------------------------------------------------------------
// Schema
// ------------------------------------------------------------------
export const familiar = pgSchema("familiar");
export const authSchema = pgSchema("auth");

// ------------------------------------------------------------------
// Enums
// ------------------------------------------------------------------
export const visibilityEnum = familiar.enum("visibility", [
	"public",
	"unlisted",
	"private",
]);
export const mediaTypeEnum = familiar.enum("media_type", [
	"image",
	"video",
	"audio",
	"file",
	"other",
]);
export const listingStatusEnum = familiar.enum("listing_status", [
	"open",
	"closed",
	"waitlist",
	"draft",
]);
export const commissionServiceTypeEnum = familiar.enum(
	"commission_service_type",
	["custom_service", "personalized_ych"],
);
export const commissionCommunicationTypeEnum = familiar.enum(
	"commission_communication_type",
	["open_communication", "surprise_me"],
);
export const commissionRequestingProcessEnum = familiar.enum(
	"commission_requesting_process",
	["custom_proposal", "instant_order"],
);
export const licensePricingModeEnum = familiar.enum("license_pricing_mode", [
	"included",
	"fixed_usd",
	"percent",
]);
export const commissionOrderStatusEnum = familiar.enum(
	"commission_order_status",
	[
		"draft",
		"submitted",
		"accepted",
		"in_progress",
		"delivered",
		"cancelled",
		"refunded",
	],
);
export const shopItemTypeEnum = familiar.enum("shop_item_type", [
	"digital",
	"physical",
]);
export const shopOrderStatusEnum = familiar.enum("shop_order_status", [
	"draft",
	"paid",
	"fulfilled",
	"cancelled",
	"refunded",
]);
export const reportTargetTypeEnum = familiar.enum("report_target_type", [
	"user",
	"post",
	"shop_item",
	"commission_listing",
	"sona",
	"message",
]);
export const reportStatusEnum = familiar.enum("report_status", [
	"open",
	"reviewing",
	"resolved",
	"rejected",
]);
export const dmParticipantRoleEnum = familiar.enum("dm_participant_role", [
	"member",
	"owner",
]);
export const languageExperienceEnum = familiar.enum("language_experience", [
	"native",
	"fluent",
	"communicative",
	"learning",
	"basic",
]);
export const followStatusEnum = familiar.enum("follow_status", [
	"pending",
	"accepted",
	"rejected",
	"blocked",
	"cancelled",
]);
export const folderVisibilityEnum = familiar.enum("folder_visibility", [
	"private",
	"public",
	"url_only",
]);
export const banTypeEnum = familiar.enum("ban_type", ["temp", "perm"]);
export const contentWarningEnum = familiar.enum("content_warning", [
	"sexual",
	"nudity",
	"violence",
	"gore",
	"self_harm",
	"drugs",
	"hate",
	"flashing",
	"other",
]);
export const subscriptionIntervalEnum = familiar.enum("subscription_interval", [
	"month",
	"year",
]);
export const subscriptionStatusEnum = familiar.enum("subscription_status", [
	"active",
	"trialing",
	"past_due",
	"canceled",
	"incomplete",
	"paused",
]);

// ------------------------------------------------------------------
// Auth (External)
// ------------------------------------------------------------------
export const authUsers = authSchema.table("users", {
	id: uuid("id").primaryKey(),
	bannedUntil: timestamp("banned_until", { withTimezone: true }),
});

// ------------------------------------------------------------------
// Core Tables
// ------------------------------------------------------------------

export const profiles = familiar.table("profiles", {
	userId: uuid("user_id")
		.primaryKey()
		.references(() => authUsers.id, { onDelete: "cascade" }),
	username: text("username").notNull().unique(), // citext in db
	displayName: text("display_name").notNull(),
	timezone: text("timezone"),
	pronouns: text("pronouns"),
	bio: varchar("bio", { length: 300 }),
	avatarPath: text("avatar_path"),
	coverPath: text("cover_path"),
	accentColor: text("accent_color"),

	isPrivate: boolean("is_private").notNull().default(false),
	isVerified: boolean("is_verified").notNull().default(false),
	isPremium: boolean("is_premium").notNull().default(false),
	premiumUntil: timestamp("premium_until", { withTimezone: true }),

	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const roles = familiar.table("roles", {
	roleKey: text("role_key").primaryKey(),
	label: text("label").notNull(),
	isStaff: boolean("is_staff").notNull().default(false),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const userBans = familiar.table("user_bans", {
	banId: uuid("ban_id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => profiles.userId, { onDelete: "cascade" }),
	banType: banTypeEnum("ban_type").notNull(),
	reason: text("reason").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true }),
	revokedAt: timestamp("revoked_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const userRoles = familiar.table(
	"user_roles",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => profiles.userId, { onDelete: "cascade" }),
		roleKey: text("role_key")
			.notNull()
			.references(() => roles.roleKey, { onDelete: "restrict" }),
		isPublic: boolean("is_public").notNull().default(true),
		grantedAt: timestamp("granted_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		grantedBy: uuid("granted_by").references(() => profiles.userId, {
			onDelete: "set null",
		}),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.roleKey] }),
	}),
);

export const userSpokenLanguages = familiar.table(
	"user_spoken_languages",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => profiles.userId, { onDelete: "cascade" }),
		locale: text("locale").notNull(),
		experience: languageExperienceEnum("experience").notNull(),
		sortOrder: integer("sort_order").notNull().default(0),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.locale] }),
	}),
);

export const userLinks = familiar.table("user_links", {
	id: uuid("id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => profiles.userId, { onDelete: "cascade" }),
	label: text("label").notNull(),
	url: text("url").notNull(),
	sortOrder: integer("sort_order").notNull().default(0),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const badges = familiar.table("badges", {
	badgeId: text("badge_id").primaryKey(),
	label: text("label").notNull(),
	description: text("description"),
	color: text("color"),
	iconPath: text("icon_path"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const userBadges = familiar.table(
	"user_badges",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => profiles.userId, { onDelete: "cascade" }),
		badgeId: text("badge_id")
			.notNull()
			.references(() => badges.badgeId, { onDelete: "restrict" }),
		awardedAt: timestamp("awarded_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.badgeId] }),
	}),
);

// ------------------------------------------------------------------
// Invites
// ------------------------------------------------------------------
export const invitePrivileges = familiar.table("invite_privileges", {
	userId: uuid("user_id")
		.primaryKey()
		.references(() => profiles.userId, { onDelete: "cascade" }),
	canGenerate: boolean("can_generate").notNull().default(true),
	disabledUntil: timestamp("disabled_until", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const artistInviteCodes = familiar.table("artist_invite_codes", {
	code: text("code").primaryKey(),
	createdByUserId: uuid("created_by_user_id")
		.notNull()
		.references(() => profiles.userId, { onDelete: "cascade" }),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
	status: text("status").notNull().default("unused"),
	usedByUserId: uuid("used_by_user_id").references(() => profiles.userId, {
		onDelete: "set null",
	}),
	usedAt: timestamp("used_at", { withTimezone: true }),
});

export const inviterPenalties = familiar.table("inviter_penalties", {
	penaltyId: uuid("penalty_id").primaryKey().defaultRandom(),
	inviterId: uuid("inviter_id")
		.notNull()
		.references(() => profiles.userId, { onDelete: "cascade" }),
	invitedUserId: uuid("invited_user_id").references(() => profiles.userId, {
		onDelete: "set null",
	}),
	type: text("type").notNull(),
	details: jsonb("details").notNull().default({}),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// ------------------------------------------------------------------
// Media
// ------------------------------------------------------------------
export const mediaAssets = familiar.table("media_assets", {
	assetId: uuid("asset_id").primaryKey().defaultRandom(),
	ownerUserId: uuid("owner_user_id")
		.notNull()
		.references(() => profiles.userId, { onDelete: "cascade" }),
	type: mediaTypeEnum("type").notNull(),
	mime: text("mime").notNull(),
	path: text("path").notNull(),
	sizeBytes: integer("size_bytes").notNull(), // bigint in db, handled as number/string? drizzle uses bigint mode usually
	width: integer("width"),
	height: integer("height"),
	durationMs: integer("duration_ms"),
	hash: text("hash"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// ------------------------------------------------------------------
// Posts
// ------------------------------------------------------------------
export const posts = familiar.table("posts", {
	postId: uuid("post_id").primaryKey().defaultRandom(),
	artistId: uuid("artist_id")
		.notNull()
		.references(() => profiles.userId, { onDelete: "cascade" }),
	title: text("title"),
	bodyMd: text("body_md"),
	visibility: visibilityEnum("visibility").notNull().default("public"),
	tags: text("tags").array().notNull().default([]),
	contentWarnings: contentWarningEnum("content_warnings")
		.array()
		.notNull()
		.default([]),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const postMedia = familiar.table("post_media", {
	id: uuid("id").primaryKey().defaultRandom(),
	postId: uuid("post_id")
		.notNull()
		.references(() => posts.postId, { onDelete: "cascade" }),
	assetId: uuid("asset_id")
		.notNull()
		.references(() => mediaAssets.assetId, { onDelete: "restrict" }),
	sortOrder: integer("sort_order").notNull().default(0),
});

export const postMetrics = familiar.table("post_metrics", {
	postId: uuid("post_id")
		.primaryKey()
		.references(() => posts.postId, { onDelete: "cascade" }),
	likesCount: integer("likes_count").notNull().default(0),
	viewsCount: integer("views_count").notNull().default(0),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const postLikes = familiar.table(
	"post_likes",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => profiles.userId, { onDelete: "cascade" }),
		postId: uuid("post_id")
			.notNull()
			.references(() => posts.postId, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.postId] }),
	}),
);

// ------------------------------------------------------------------
// Sonas (Characters)
// ------------------------------------------------------------------
export const sonas = familiar.table("sonas", {
	sonaId: uuid("sona_id").primaryKey().defaultRandom(),
	ownerId: uuid("owner_id")
		.notNull()
		.references(() => profiles.userId, { onDelete: "cascade" }),
	slug: text("slug"), // unique constrained in db
	name: text("name").notNull(),
	about: jsonb("about").notNull().default({}),
	privacy: jsonb("privacy"),
	avatarAssetId: uuid("avatar_asset_id").references(() => mediaAssets.assetId, {
		onDelete: "set null",
	}),
	coverAssetId: uuid("cover_asset_id").references(() => mediaAssets.assetId, {
		onDelete: "set null",
	}),
	isPrivate: boolean("is_private").notNull().default(false),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const sonaReferenceSheets = familiar.table("sona_reference_sheets", {
	id: uuid("id").primaryKey().defaultRandom(),
	sonaId: uuid("sona_id")
		.notNull()
		.references(() => sonas.sonaId, { onDelete: "cascade" }),
	assetId: uuid("asset_id")
		.notNull()
		.references(() => mediaAssets.assetId, { onDelete: "restrict" }),
	label: text("label"),
	sortOrder: integer("sort_order").notNull().default(0),
});

export const postSonaRefs = familiar.table(
	"post_sona_refs",
	{
		postId: uuid("post_id")
			.notNull()
			.references(() => posts.postId, { onDelete: "cascade" }),
		sonaId: uuid("sona_id")
			.notNull()
			.references(() => sonas.sonaId, { onDelete: "cascade" }),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.postId, t.sonaId] }),
	}),
);

// ------------------------------------------------------------------
// Commissions
// ------------------------------------------------------------------
export const commissionCategories = familiar.table("commission_categories", {
	categoryId: uuid("category_id").primaryKey().defaultRandom(),
	slug: text("slug").notNull().unique(), // citext
	label: text("label").notNull(),
	icon: text("icon"),
	sortOrder: integer("sort_order").notNull().default(0),
});

export const commissionListings = familiar.table("commission_listings", {
	listingId: uuid("listing_id").primaryKey().defaultRandom(),
	artistId: uuid("artist_id")
		.notNull()
		.references(() => profiles.userId, { onDelete: "cascade" }),
	categoryId: uuid("category_id")
		.notNull()
		.references(() => commissionCategories.categoryId, {
			onDelete: "restrict",
		}),

	title: text("title").notNull(),
	basePriceUsd: doublePrecision("base_price_usd").notNull(),
	discountRate: doublePrecision("discount_rate").notNull().default(0),

	serviceType: commissionServiceTypeEnum("service_type").notNull(),
	communicationType:
		commissionCommunicationTypeEnum("communication_type").notNull(),
	requestingProcess:
		commissionRequestingProcessEnum("requesting_process").notNull(),

	artistNote: text("artist_note"),
	descriptionMd: text("description_md"),
	status: listingStatusEnum("status").notNull().default("draft"),

	tags: text("tags").array().notNull().default([]),
	contentWarnings: contentWarningEnum("content_warnings")
		.array()
		.notNull()
		.default([]),

	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const commissionListingMedia = familiar.table(
	"commission_listing_media",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		listingId: uuid("listing_id")
			.notNull()
			.references(() => commissionListings.listingId, { onDelete: "cascade" }),
		assetId: uuid("asset_id")
			.notNull()
			.references(() => mediaAssets.assetId, { onDelete: "restrict" }),
		sortOrder: integer("sort_order").notNull().default(0),
	},
);

export const commissionListingMetrics = familiar.table(
	"commission_listing_metrics",
	{
		listingId: uuid("listing_id")
			.primaryKey()
			.references(() => commissionListings.listingId, { onDelete: "cascade" }),
		reviewsCount: integer("reviews_count").notNull().default(0),
		ratingAvg: doublePrecision("rating_avg").notNull().default(0),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
);

export const reviews = familiar.table("reviews", {
	reviewId: uuid("review_id").primaryKey().defaultRandom(),
	listingId: uuid("listing_id")
		.notNull()
		.references(() => commissionListings.listingId, { onDelete: "cascade" }),
	authorId: uuid("client_id")
		.notNull()
		.references(() => profiles.userId, { onDelete: "cascade" }),
	artistId: uuid("artist_id")
		.notNull()
		.references(() => profiles.userId, { onDelete: "cascade" }),
	orderId: uuid("order_id"),
	rating: integer("rating").notNull(), // 1-5
	title: text("title"),
	body: text("body"),
	chips: text("chips").array(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// ------------------------------------------------------------------
// Shop
// ------------------------------------------------------------------
export const shopCatalogues = familiar.table("shop_catalogues", {
	catalogueId: uuid("catalogue_id").primaryKey().defaultRandom(),
	slug: text("slug").notNull().unique(), // citext
	label: text("label").notNull(),
	sortOrder: integer("sort_order").notNull().default(0),
});

export const shopItems = familiar.table("shop_items", {
	itemId: uuid("item_id").primaryKey().defaultRandom(),
	sellerId: uuid("seller_id")
		.notNull()
		.references(() => profiles.userId, { onDelete: "cascade" }),
	catalogueId: uuid("catalogue_id")
		.notNull()
		.references(() => shopCatalogues.catalogueId, { onDelete: "restrict" }),
	type: shopItemTypeEnum("type").notNull(),
	slug: text("slug"), // citext
	title: text("title").notNull(),
	description: text("description"),
	priceUsd: doublePrecision("price_usd").notNull(),
	discountRate: doublePrecision("discount_rate").notNull().default(0),
	stock: integer("stock"),
	licenses: text("licenses").array().notNull().default([]),
	options: jsonb("options").notNull().default({}),

	tags: text("tags").array().notNull().default([]),
	contentWarnings: contentWarningEnum("content_warnings")
		.array()
		.notNull()
		.default([]),

	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const shopItemMedia = familiar.table("shop_item_media", {
	id: uuid("id").primaryKey().defaultRandom(),
	itemId: uuid("item_id")
		.notNull()
		.references(() => shopItems.itemId, { onDelete: "cascade" }),
	assetId: uuid("asset_id")
		.notNull()
		.references(() => mediaAssets.assetId, { onDelete: "restrict" }),
	sortOrder: integer("sort_order").notNull().default(0),
});

export const shopItemVariants = familiar.table("shop_item_variants", {
	variantId: uuid("variant_id").primaryKey().defaultRandom(),
	itemId: uuid("item_id")
		.notNull()
		.references(() => shopItems.itemId, { onDelete: "cascade" }),
	key: text("key").notNull(),
	label: text("label").notNull(),
	priceDeltaUsd: doublePrecision("price_delta_usd").notNull().default(0),
	stock: integer("stock"),
	options: jsonb("options").notNull().default({}),
	sortOrder: integer("sort_order").notNull().default(0),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// ------------------------------------------------------------------
// Social
// ------------------------------------------------------------------
export const userBlocks = familiar.table(
	"user_blocks",
	{
		blockerId: uuid("blocker_id")
			.notNull()
			.references(() => profiles.userId, { onDelete: "cascade" }),
		blockedUserId: uuid("blocked_user_id")
			.notNull()
			.references(() => profiles.userId, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.blockerId, t.blockedUserId] }),
	}),
);

export const follows = familiar.table(
	"follows",
	{
		followerId: uuid("follower_id")
			.notNull()
			.references(() => profiles.userId, { onDelete: "cascade" }),
		followedUserId: uuid("followed_user_id")
			.notNull()
			.references(() => profiles.userId, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
		status: followStatusEnum("status").notNull().default("accepted"),
		acceptedAt: timestamp("accepted_at", { withTimezone: true }),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.followerId, t.followedUserId] }),
	}),
);

export const savedPosts = familiar.table(
	"saved_posts",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => profiles.userId, { onDelete: "cascade" }),
		postId: uuid("post_id")
			.notNull()
			.references(() => posts.postId, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.postId] }),
	}),
);

export const savedShopItems = familiar.table(
	"saved_shop_items",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => profiles.userId, { onDelete: "cascade" }),
		itemId: uuid("item_id")
			.notNull()
			.references(() => shopItems.itemId, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.itemId] }),
	}),
);

export const savedCommissionListings = familiar.table(
	"saved_commission_listings",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => profiles.userId, { onDelete: "cascade" }),
		listingId: uuid("listing_id")
			.notNull()
			.references(() => commissionListings.listingId, { onDelete: "cascade" }),
		createdAt: timestamp("created_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.listingId] }),
	}),
);

// ------------------------------------------------------------------
// Folders
// ------------------------------------------------------------------
export const folders = familiar.table("folders", {
	folderId: uuid("folder_id").primaryKey().defaultRandom(),
	ownerId: uuid("owner_id")
		.notNull()
		.references(() => profiles.userId, { onDelete: "cascade" }),
	parentId: uuid("parent_id"), // self-ref, define relation later
	name: text("name").notNull(),
	description: text("description"),
	sortOrder: integer("sort_order").notNull().default(0),
	isArchived: boolean("is_archived").notNull().default(false),
	visibility: folderVisibilityEnum("visibility").notNull().default("private"),
	shareToken: text("share_token"),
	shareExpiresAt: timestamp("share_expires_at", { withTimezone: true }),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const folderPosts = familiar.table(
	"folder_posts",
	{
		folderId: uuid("folder_id")
			.notNull()
			.references(() => folders.folderId, { onDelete: "cascade" }),
		postId: uuid("post_id")
			.notNull()
			.references(() => posts.postId, { onDelete: "cascade" }),
		addedAt: timestamp("added_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.folderId, t.postId] }),
	}),
);

export const folderCommissionListings = familiar.table(
	"folder_commission_listings",
	{
		folderId: uuid("folder_id")
			.notNull()
			.references(() => folders.folderId, { onDelete: "cascade" }),
		listingId: uuid("listing_id")
			.notNull()
			.references(() => commissionListings.listingId, { onDelete: "cascade" }),
		addedAt: timestamp("added_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.folderId, t.listingId] }),
	}),
);

export const folderShopItems = familiar.table(
	"folder_shop_items",
	{
		folderId: uuid("folder_id")
			.notNull()
			.references(() => folders.folderId, { onDelete: "cascade" }),
		itemId: uuid("item_id")
			.notNull()
			.references(() => shopItems.itemId, { onDelete: "cascade" }),
		addedAt: timestamp("added_at", { withTimezone: true })
			.notNull()
			.defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.folderId, t.itemId] }),
	}),
);

// ------------------------------------------------------------------
// Notifications
// ------------------------------------------------------------------
export const notifications = familiar.table("notifications", {
	notificationId: uuid("notification_id").primaryKey().defaultRandom(),
	recipientId: uuid("recipient_id")
		.notNull()
		.references(() => profiles.userId, { onDelete: "cascade" }),
	actorId: uuid("actor_id").references(() => profiles.userId, {
		onDelete: "set null",
	}),
	type: text("type").notNull(),
	entityType: text("entity_type"),
	entityId: uuid("entity_id"),
	data: jsonb("data").notNull().default({}),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	readAt: timestamp("read_at", { withTimezone: true }),
});

// ------------------------------------------------------------------
// Reports
// ------------------------------------------------------------------
export const reports = familiar.table("reports", {
	reportId: uuid("report_id").primaryKey().defaultRandom(),
	reporterId: uuid("reporter_id")
		.notNull()
		.references(() => profiles.userId, { onDelete: "cascade" }),
	targetType: reportTargetTypeEnum("target_type").notNull(),
	targetId: uuid("target_id").notNull(),
	reason: text("reason").notNull(),
	details: text("details"),
	status: reportStatusEnum("status").notNull().default("open"),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// ------------------------------------------------------------------
// DM
// ------------------------------------------------------------------
export const dmConversations = familiar.table("dm_conversations", {
	conversationId: uuid("conversation_id").primaryKey().defaultRandom(),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
});

export const dmParticipants = familiar.table(
	"dm_participants",
	{
		conversationId: uuid("conversation_id")
			.notNull()
			.references(() => dmConversations.conversationId, {
				onDelete: "cascade",
			}),
		userId: uuid("user_id")
			.notNull()
			.references(() => profiles.userId, { onDelete: "cascade" }),
		role: dmParticipantRoleEnum("role").notNull().default("member"),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.conversationId, t.userId] }),
	}),
);

export const dmMessages = familiar.table("dm_messages", {
	messageId: uuid("message_id").primaryKey().defaultRandom(),
	conversationId: uuid("conversation_id")
		.notNull()
		.references(() => dmConversations.conversationId, { onDelete: "cascade" }),
	senderId: uuid("sender_id")
		.notNull()
		.references(() => profiles.userId, { onDelete: "cascade" }),
	body: text("body").notNull(),
	attachments: jsonb("attachments").notNull().default({}),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// ------------------------------------------------------------------
// Currencies & Subscriptions
// ------------------------------------------------------------------
export const currencies = familiar.table("currencies", {
	code: text("code").primaryKey(),
	symbol: text("symbol").notNull(),
	decimals: integer("decimals").notNull().default(2),
});

export const subscriptionPlans = familiar.table("subscription_plans", {
	planId: uuid("plan_id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	description: text("description"),
	price: doublePrecision("price").notNull(),
	interval: subscriptionIntervalEnum("interval").notNull(),
	currency: text("currency")
		.notNull()
		.references(() => currencies.code, { onDelete: "restrict" }),
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

export const userSubscriptions = familiar.table("user_subscriptions", {
	subscriptionId: uuid("subscription_id").primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => profiles.userId, { onDelete: "cascade" }),
	planId: uuid("plan_id")
		.notNull()
		.references(() => subscriptionPlans.planId),
	status: subscriptionStatusEnum("status").notNull(),
	currentPeriodStart: timestamp("current_period_start", {
		withTimezone: true,
	}).notNull(),
	currentPeriodEnd: timestamp("current_period_end", {
		withTimezone: true,
	}).notNull(),
	cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
	createdAt: timestamp("created_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.notNull()
		.defaultNow(),
});

// ------------------------------------------------------------------
// Relations
// ------------------------------------------------------------------

export const commissionListingsRelations = relations(
	commissionListings,
	({ one, many }) => ({
		category: one(commissionCategories, {
			fields: [commissionListings.categoryId],
			references: [commissionCategories.categoryId],
		}),
		media: many(commissionListingMedia),
		reviews: many(reviews),
	}),
);

export const commissionCategoriesRelations = relations(
	commissionCategories,
	({ many }) => ({
		listings: many(commissionListings),
	}),
);

export const commissionListingMediaRelations = relations(
	commissionListingMedia,
	({ one }) => ({
		listing: one(commissionListings, {
			fields: [commissionListingMedia.listingId],
			references: [commissionListings.listingId],
		}),
		asset: one(mediaAssets, {
			fields: [commissionListingMedia.assetId],
			references: [mediaAssets.assetId],
		}),
	}),
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
	listing: one(commissionListings, {
		fields: [reviews.listingId],
		references: [commissionListings.listingId],
	}),
	author: one(profiles, {
		fields: [reviews.authorId],
		references: [profiles.userId],
	}),
}));

export const postsRelations = relations(posts, ({ many }) => ({
	media: many(postMedia),
	folders: many(folderPosts),
}));

export const postMediaRelations = relations(postMedia, ({ one }) => ({
	post: one(posts, {
		fields: [postMedia.postId],
		references: [posts.postId],
	}),
	asset: one(mediaAssets, {
		fields: [postMedia.assetId],
		references: [mediaAssets.assetId],
	}),
}));

export const sonasRelations = relations(sonas, ({ one }) => ({
	avatar: one(mediaAssets, {
		fields: [sonas.avatarAssetId],
		references: [mediaAssets.assetId],
	}),
	cover: one(mediaAssets, {
		fields: [sonas.coverAssetId],
		references: [mediaAssets.assetId],
	}),
}));

export const foldersRelations = relations(folders, ({ one, many }) => ({
	parent: one(folders, {
		fields: [folders.parentId],
		references: [folders.folderId],
		relationName: "parent_child",
	}),
	children: many(folders, { relationName: "parent_child" }),
	posts: many(folderPosts),
	commissionListings: many(folderCommissionListings),
	shopItems: many(folderShopItems),
}));

export const folderPostsRelations = relations(folderPosts, ({ one }) => ({
	folder: one(folders, {
		fields: [folderPosts.folderId],
		references: [folders.folderId],
	}),
	post: one(posts, {
		fields: [folderPosts.postId],
		references: [posts.postId],
	}),
}));

export const profilesRelations = relations(profiles, ({ many }) => ({
	userLinks: many(userLinks),
	spokenLanguages: many(userSpokenLanguages),
	badges: many(userBadges),
	userRoles: many(userRoles),
}));

export const userLinksRelations = relations(userLinks, ({ one }) => ({
	user: one(profiles, {
		fields: [userLinks.userId],
		references: [profiles.userId],
	}),
}));

export const userSpokenLanguagesRelations = relations(
	userSpokenLanguages,
	({ one }) => ({
		user: one(profiles, {
			fields: [userSpokenLanguages.userId],
			references: [profiles.userId],
		}),
	}),
);

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
	user: one(profiles, {
		fields: [userBadges.userId],
		references: [profiles.userId],
	}),
	badge: one(badges, {
		fields: [userBadges.badgeId],
		references: [badges.badgeId],
	}),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
	user: one(profiles, {
		fields: [userRoles.userId],
		references: [profiles.userId],
	}),
	role: one(roles, {
		fields: [userRoles.roleKey],
		references: [roles.roleKey],
	}),
}));
