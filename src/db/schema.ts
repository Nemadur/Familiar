import {
	boolean,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	uuid: uuid("uuid").primaryKey().defaultRandom(),
	username: text("username").notNull().unique(),
	display_name: text("display_name").notNull(),
	bio: text("bio"),
	media: jsonb("media")
		.$type<{ avatar?: string | null; cover?: string | null }>()
		.default({})
		.notNull(),
	accent_color: text("accent_color").notNull().default("#000000"),
	banned_until: timestamp("banned_until"),
	is_premium: boolean("is_premium").default(false),
	is_verified: boolean("is_verified").default(false),
	created_at: timestamp("created_at").defaultNow().notNull(),
	badges: jsonb("badges")
		.$type<
			{
				uuid: string;
				label: string;
				description?: string | null;
				color: string;
			}[]
		>()
		.default([])
		.notNull(),
	social_links: jsonb("social_links")
		.$type<{ label: string; url: string }[]>()
		.default([])
		.notNull(),
	timezone: text("timezone"),
	spoken_languages: jsonb("spoken_languages")
		.$type<string[]>()
		.default([])
		.notNull(),
	tos: jsonb("tos")
		.$type<{ summary: string }>()
		.default({ summary: "" })
		.notNull(),
});
