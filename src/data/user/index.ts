import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import type { User } from "@/types/user";

/**
 * Fetch a user profile by username.
 */
export const getUserByUsername = createServerFn({
	method: "GET",
})
	.inputValidator((data: { username: string }) => data)
	.handler(async ({ data }) => {
		const result = await db.query.profiles.findFirst({
			where: eq(profiles.username, data.username),
			with: {
				socialLinks: true,
				spokenLanguages: true,
				badges: {
					with: {
						badge: true,
					},
				},
				authData: true,
			},
		});

		if (!result) return undefined;

		const user: User = {
			uuid: result.uuid,
			username: result.username,
			display_name: result.displayName,
			bio: result.bio,
			media: {
				avatar: result.avatar,
				cover: result.cover,
			},
			accent_color: result.accentColor || "#000000",
			is_premium: result.isPremium || false,
			is_verified: result.isVerified || false,
			banned_until: result.authData?.bannedUntil || null,
			created_at: result.createdAt || new Date(),
			timezone: result.timezone,
			social_links: result.socialLinks.map((l) => ({
				label: l.label,
				url: l.url,
			})),
			spoken_languages: result.spokenLanguages.map((l) => ({
				locale: l.locale,
				experience: l.experience as
					| "native"
					| "fluent"
					| "communicative"
					| "learning",
			})),
			badges: result.badges.map((b) => ({
				uuid: b.badge.uuid,
				label: b.badge.label,
				description: b.badge.description,
				color: b.badge.color,
			})),
			tos: result.tosSummary ? { summary: result.tosSummary } : null,
			roles: result.roles,
			pronouns: result.pronouns,
		};

		return user;
	});

/**
 * Fetch a user profile by UUID.
 */
export const getUserById = createServerFn({
	method: "GET",
})
	.inputValidator((data: { uuid: string }) => data)
	.handler(async ({ data }) => {
		console.log(`[getUserById] Fetching profile for UUID: ${data.uuid}`);
		try {
			const result = await db.query.profiles.findFirst({
				where: eq(profiles.uuid, data.uuid),
				with: {
					socialLinks: true,
					spokenLanguages: true,
					badges: {
						with: {
							badge: true,
						},
					},
					authData: true,
				},
			});
			console.log(
				`[getUserById] Result for ${data.uuid}:`,
				result ? "Found" : "Not Found",
			);

			if (!result) return undefined;

			const user: User = {
				uuid: result.uuid,
				username: result.username,
				display_name: result.displayName,
				bio: result.bio,
				media: {
					avatar: result.avatar,
					cover: result.cover,
				},
				accent_color: result.accentColor || "#000000",
				is_premium: result.isPremium || false,
				is_verified: result.isVerified || false,
				banned_until: result.authData?.bannedUntil || null,
				created_at: result.createdAt || new Date(),
				timezone: result.timezone,
				social_links: result.socialLinks.map((l) => ({
					label: l.label,
					url: l.url,
				})),
				spoken_languages: result.spokenLanguages.map((l) => ({
					locale: l.locale,
					experience: l.experience as
						| "native"
						| "fluent"
						| "communicative"
						| "learning",
				})),
				badges: result.badges.map((b) => ({
					uuid: b.badge.uuid,
					label: b.badge.label,
					description: b.badge.description,
					color: b.badge.color,
				})),
				tos: result.tosSummary ? { summary: result.tosSummary } : null,
				roles: result.roles,
				pronouns: result.pronouns,
			};

			return user;
		} catch (error) {
			console.error(
				`[getUserById] Error fetching profile for ${data.uuid}:`,
				error,
			);
			throw error;
		}
	});

// createUser is currently disabled as per user instruction "DO NOT MAKE REGISTER".
// If needed in future, it should insert into 'profiles' table.
/*
export const createUser = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: { uuid: string; username: string; display_name: string }) => data,
	)
	.handler(async ({ data }) => {
        // ... implementation for profiles table ...
	});
*/

/**
 * Fetch all user profiles.
 */
export const getUsers = createServerFn({
	method: "GET",
}).handler(async () => {
	const results = await db.query.profiles.findMany({
		with: {
			socialLinks: true,
			spokenLanguages: true,
			badges: {
				with: {
					badge: true,
				},
			},
			authData: true,
		},
	});

	return results.map((result) => ({
		uuid: result.uuid,
		username: result.username,
		display_name: result.displayName,
		bio: result.bio,
		media: {
			avatar: result.avatar,
			cover: result.cover,
		},
		accent_color: result.accentColor || "#000000",
		is_premium: result.isPremium,
		is_verified: result.isVerified,
		banned_until: result.authData?.bannedUntil || null,
		created_at: result.createdAt,
		timezone: result.timezone,
		social_links: result.socialLinks.map((l) => ({
			label: l.label,
			url: l.url,
		})),
		spoken_languages: result.spokenLanguages.map((l) => ({
			locale: l.locale,
			experience: l.experience as
				| "native"
				| "fluent"
				| "communicative"
				| "learning",
		})),
		badges: result.badges.map((b) => ({
			uuid: b.badge.uuid,
			label: b.badge.label,
			description: b.badge.description,
			color: b.badge.color,
		})),
		tos: result.tosSummary ? { summary: result.tosSummary } : null,
		roles: result.roles,
		pronouns: result.pronouns,
	})) as User[];
});
