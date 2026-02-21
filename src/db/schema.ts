import { relations } from "drizzle-orm";
import {
	boolean,
	doublePrecision,
	integer,
	jsonb,
	pgSchema,
	pgTable,
	primaryKey,
	smallint,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

// --- Schemas ---

const authSchema = pgSchema("auth");

export const authUsers = authSchema.table("users", {
	id: uuid("id").primaryKey(),
	bannedUntil: timestamp("banned_until", { withTimezone: true }),
});

// --- Tables ---

export const badges = pgTable("badges", {
	uuid: uuid("uuid").defaultRandom().primaryKey(),
	label: text("label").notNull(),
	description: text("description"),
	color: text("color").notNull(),
});

export const basketItems = pgTable("basket_items", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => profiles.uuid),
	shopItemId: uuid("shop_item_id")
		.notNull()
		.references(() => shopItems.id),
	quantity: smallint("quantity").default(1).notNull(),
	price: text("price"),
	licenses: text("licenses").array(),
	options: jsonb("options"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const bookmarkedCommissions = pgTable(
	"bookmarked_commissions",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => profiles.uuid),
		commissionId: uuid("commission_id")
			.notNull()
			.references(() => commissions.id),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.commissionId] }),
	}),
);

export const characterReferenceCredits = pgTable(
	"character_reference_credits",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		referenceId: uuid("reference_id")
			.notNull()
			.references(() => characterReferences.id),
		userId: uuid("user_id").references(() => profiles.uuid),
		role: text("role").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	},
);

export const characterReferences = pgTable("character_references", {
	id: uuid("id").defaultRandom().primaryKey(),
	characterId: uuid("character_id")
		.notNull()
		.references(() => characters.id),
	label: text("label"),
	imageUrl: text("image_url").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const characters = pgTable("characters", {
	id: uuid("id").defaultRandom().primaryKey(),
	ownerId: uuid("owner_id")
		.notNull()
		.references(() => profiles.uuid),
	name: text("name").notNull(),
	slug: text("slug").unique(),
	description: text("description"),
	bio: text("bio"),
	species: text("species"),
	gender: text("gender"),
	age: text("age"),
	likes: text("likes").array(),
	avatarUrl: text("avatar_url"),
	coverUrl: text("cover_url"),
	accentColor: text("accent_color"),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	profileId: uuid("profile_id").references(() => profiles.uuid),
});

export const commissions = pgTable("commissions", {
	id: uuid("id").defaultRandom().primaryKey(),
	artistId: uuid("artist_id")
		.notNull()
		.references(() => profiles.uuid),
	title: text("title").notNull(),
	price: doublePrecision("price").notNull(),
	description: text("description"),
	details: text("details").array(),
	imageUrls: text("image_urls").array(),
	status: text("status").notNull().default("OPEN"),
	category: text("category"),
	tags: text("tags").array(),
	discountRate: doublePrecision("discount_rate"),
	artistNote: text("artist_note"),
	licenseOptions: jsonb("license_options"),
	sharingOptions: jsonb("sharing_options"),
	customOptions: jsonb("custom_options"),
	includes: jsonb("includes"),
	isActive: boolean("is_active").default(true),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	slots: integer("slots"),
});

export const dataCollectors = pgTable("data_collectors", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id").references(() => profiles.uuid),
	eventType: text("event_type").notNull(),
	payload: jsonb("payload"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const folders = pgTable("folders", {
	id: uuid("id").defaultRandom().primaryKey(),
	ownerId: uuid("owner_id")
		.notNull()
		.references(() => profiles.uuid),
	name: text("name").notNull(),
	tags: text("tags").array(),
	imageUrls: text("image_urls").array(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const inviteKeys = pgTable("invite_keys", {
	key: text("key").primaryKey(),
	createdBy: uuid("created_by")
		.notNull()
		.references(() => profiles.uuid),
	usedBy: uuid("used_by").references(() => profiles.uuid),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	usedAt: timestamp("used_at", { withTimezone: true }),
});

export const likedCharacters = pgTable(
	"liked_characters",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => profiles.uuid),
		characterId: uuid("character_id")
			.notNull()
			.references(() => characters.id),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.characterId] }),
	}),
);

export const likedPosts = pgTable(
	"liked_posts",
	{
		userId: uuid("user_id")
			.notNull()
			.references(() => profiles.uuid),
		postId: uuid("post_id")
			.notNull()
			.references(() => posts.id),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.postId] }),
	}),
);

export const orders = pgTable("orders", {
	id: uuid("id").defaultRandom().primaryKey(),
	commissionId: uuid("commission_id")
		.notNull()
		.references(() => commissions.id),
	clientId: uuid("client_id")
		.notNull()
		.references(() => profiles.uuid),
	artistId: uuid("artist_id")
		.notNull()
		.references(() => profiles.uuid),
	status: text("status").notNull().default("PENDING"),
	postId: uuid("post_id").references(() => posts.id),
	completedAt: timestamp("completed_at", { withTimezone: true }),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const posts = pgTable("posts", {
	id: uuid("id").defaultRandom().primaryKey(),
	authorId: uuid("author_id")
		.notNull()
		.references(() => profiles.uuid),
	title: text("title").notNull(),
	content: text("content"),
	category: text("category"),
	tags: text("tags").array(),
	published: boolean("published").default(false),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	imageUrls: text("image_urls").array(),
	media: jsonb("media"),
	characterId: uuid("character_id").references(() => characters.id),
	publishedAt: timestamp("published_at", { withTimezone: true }),
});

export const profileBadges = pgTable(
	"profile_badges",
	{
		profileUuid: uuid("profile_uuid")
			.notNull()
			.references(() => profiles.uuid),
		badgeUuid: uuid("badge_uuid")
			.notNull()
			.references(() => badges.uuid),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.profileUuid, t.badgeUuid] }),
	}),
);

export const profileSocialLinks = pgTable("profile_social_links", {
	id: uuid("id").defaultRandom().primaryKey(),
	profileUuid: uuid("profile_uuid")
		.notNull()
		.references(() => profiles.uuid),
	label: text("label").notNull(),
	url: text("url").notNull(),
});

export const profileSpokenLanguages = pgTable("profile_spoken_languages", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => profiles.uuid),
	locale: text("locale").notNull(),
	experience: text("experience").notNull().default("communicative"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const profiles = pgTable("profiles", {
	uuid: uuid("uuid").primaryKey(),
	username: text("username").notNull().unique(),
	displayName: text("display_name").notNull(),
	bio: text("bio"),
	accentColor: text("accent_color"),
	roles: text("roles").array().notNull().default(["client"]),
	isPremium: boolean("is_premium").default(false),
	isVerified: boolean("is_verified").default(false),
	timezone: text("timezone"),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	pronouns: text("pronouns"),
	avatar: text("avatar"),
	cover: text("cover"),
	tosSummary: text("tos_summary"),
});

export const reviews = pgTable("reviews", {
	id: uuid("id").defaultRandom().primaryKey(),
	orderId: uuid("order_id")
		.notNull()
		.references(() => orders.id),
	authorId: uuid("author_id")
		.notNull()
		.references(() => profiles.uuid),
	rating: smallint("rating").notNull(),
	comment: text("comment"),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const shopItems = pgTable("shop_items", {
	id: uuid("id").defaultRandom().primaryKey(),
	artistId: uuid("artist_id")
		.notNull()
		.references(() => profiles.uuid),
	title: text("title").notNull(),
	description: text("description"),
	price: text("price").notNull(),
	type: text("type").notNull(),
	category: text("category"),
	tags: text("tags").array(),
	soldCount: smallint("sold_count").notNull().default(0),
	imageUrls: text("image_urls").array(),
	fileUrl: text("file_url"),
	licenseOptions: jsonb("license_options"),
	customOptions: jsonb("custom_options"),
	includes: jsonb("includes"),
	isActive: boolean("is_active").default(true),
	updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
	discountRate: doublePrecision("discount_rate"),
});

export const transactions = pgTable("transactions", {
	id: uuid("id").defaultRandom().primaryKey(),
	stripePaymentId: text("stripe_payment_id").unique(),
	orderId: uuid("order_id").references(() => orders.id),
	amount: text("amount").notNull(),
	currency: text("currency").notNull().default("USD"),
	status: text("status").notNull().default("PENDING"),
	payerId: uuid("payer_id").references(() => profiles.uuid),
	recipientId: uuid("recipient_id").references(() => profiles.uuid),
	createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// --- Relations ---

export const profilesRelations = relations(profiles, ({ one, many }) => ({
	authData: one(authUsers, {
		fields: [profiles.uuid],
		references: [authUsers.id],
	}),
	socialLinks: many(profileSocialLinks),
	spokenLanguages: many(profileSpokenLanguages),
	badges: many(profileBadges),
	characters: many(characters),
	commissions: many(commissions),
	posts: many(posts),
	ordersAsClient: many(orders, { relationName: "clientOrders" }),
	ordersAsArtist: many(orders, { relationName: "artistOrders" }),
}));

export const profileBadgesRelations = relations(profileBadges, ({ one }) => ({
	profile: one(profiles, {
		fields: [profileBadges.profileUuid],
		references: [profiles.uuid],
	}),
	badge: one(badges, {
		fields: [profileBadges.badgeUuid],
		references: [badges.uuid],
	}),
}));

export const profileSocialLinksRelations = relations(
	profileSocialLinks,
	({ one }) => ({
		profile: one(profiles, {
			fields: [profileSocialLinks.profileUuid],
			references: [profiles.uuid],
		}),
	}),
);

export const profileSpokenLanguagesRelations = relations(
	profileSpokenLanguages,
	({ one }) => ({
		user: one(profiles, {
			fields: [profileSpokenLanguages.userId],
			references: [profiles.uuid],
		}),
	}),
);

export const charactersRelations = relations(characters, ({ one }) => ({
	owner: one(profiles, {
		fields: [characters.ownerId],
		references: [profiles.uuid],
	}),
}));

export const postsRelations = relations(posts, ({ one }) => ({
	author: one(profiles, {
		fields: [posts.authorId],
		references: [profiles.uuid],
	}),
}));

// Export alias
export const user = profiles;
