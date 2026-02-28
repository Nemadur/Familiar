import { createServerFn } from "@tanstack/react-start";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { SpokenLanguage, User, UserBan } from "@/types/user";

// Helper to choose the right client (prefer admin if available for RLS bypass)
const getClient = () => supabaseAdmin || supabase;

async function getActiveBan(userId: string): Promise<UserBan | null> {
	try {
		const now = new Date();
		const client = getClient();

		// We need to use schema('familiar') if tables are in familiar schema
		const { data: ban, error } = await client
			.schema("familiar")
			.from("user_bans")
			.select("*")
			.eq("user_id", userId)
			.is("revoked_at", null)
			.or(`expires_at.is.null,expires_at.gt.${now.toISOString()}`)
			.order("created_at", { ascending: false })
			.limit(1)
			.single();

		if (error || !ban) return null;

		if (ban.ban_type === "perm") {
			return { type: "perm", until: null, reason: ban.reason };
		}

		return ban.expires_at
			? { type: "temp", until: new Date(ban.expires_at), reason: ban.reason }
			: { type: "temp", until: new Date(0), reason: ban.reason };
	} catch (error) {
		console.error(`Error fetching active ban for user ${userId}:`, error);
		return null;
	}
}

async function getUserCounts(userId: string) {
	try {
		const client = getClient();

		// Parallel queries for counts
		const [followers, following, works, commissions, characters] =
			await Promise.all([
				client
					.schema("familiar")
					.from("follows")
					.select("*", { count: "exact", head: true })
					.eq("followed_user_id", userId)
					.eq("status", "accepted"),
				client
					.schema("familiar")
					.from("follows")
					.select("*", { count: "exact", head: true })
					.eq("follower_id", userId)
					.eq("status", "accepted"),
				client
					.schema("familiar")
					.from("posts")
					.select("*", { count: "exact", head: true })
					.eq("artist_id", userId)
					.neq("visibility", "private"),
				client
					.schema("familiar")
					.from("commission_listings")
					.select("*", { count: "exact", head: true })
					.eq("artist_id", userId)
					.neq("status", "archived"), // Assuming archived shouldn't count? Or just count all?
				client
					.schema("familiar")
					.from("sonas")
					.select("*", { count: "exact", head: true })
					.eq("owner_id", userId),
			]);

		return {
			followers: followers.count ?? 0,
			following: following.count ?? 0,
			works: works.count ?? 0,
			commissions: commissions.count ?? 0,
			characters: characters.count ?? 0,
		};
	} catch (error) {
		console.error(`Error fetching user counts for ${userId}:`, error);
		return {
			followers: 0,
			following: 0,
			works: 0,
			commissions: 0,
			characters: 0,
		};
	}
}

function mapUser(
	result: any,
	ban: UserBan | null,
	counts: {
		followers: number;
		following: number;
		works: number;
		commissions: number;
		characters: number;
	} = {
		followers: 0,
		following: 0,
		works: 0,
		commissions: 0,
		characters: 0,
	},
): User {
	return {
		uuid: result.user_id,
		username: result.username,
		display_name: result.display_name,
		bio: result.bio ?? null,
		media: {
			avatar: result.avatar_path ?? null,
			cover: result.cover_path ?? null,
		},
		accent_color: result.accent_color ?? null,
		is_premium: Boolean(result.is_premium),
		is_verified: Boolean(result.is_verified),
		is_private: Boolean(result.is_private),
		ban,
		banned_until: ban?.type === "temp" ? ban.until : null,
		created_at: result.created_at ? new Date(result.created_at) : new Date(),
		timezone: result.timezone ?? null,
		pronouns: result.pronouns ?? null,
		followers_count: counts.followers,
		following_count: counts.following,
		works_count: counts.works,
		commissions_count: counts.commissions,
		characters_count: counts.characters,
		social_links: (result.user_links ?? []).map((l: any) => ({
			label: l.label,
			url: l.url,
		})),
		spoken_languages: (result.user_spoken_languages ?? []).map((l: any) => ({
			locale: l.locale,
			experience: l.experience as SpokenLanguage["experience"],
		})),
		badges: (result.user_badges ?? []).map((b: any) => ({
			uuid: b.badge?.badge_id,
			label: b.badge?.label,
			description: b.badge?.description ?? "",
			color: b.badge?.color ?? "",
			icon: b.badge?.icon_path ?? null,
			awarded_at: b.awarded_at ? new Date(b.awarded_at) : undefined,
		})),
		tos: null,
		roles: (result.user_roles ?? []).map(
			(r: any) => r.role?.role_key || r.role_key,
		),
	};
}

/**
 * Fetch a user profile by username.
 */
export const getUserByUsername = createServerFn({ method: "GET" })
	.inputValidator((data: { username: string }) => data)
	.handler(async ({ data }) => {
		try {
			if (!data?.username) {
				return undefined;
			}
			const client = getClient();
			const { data: result, error } = await client
				.schema("familiar")
				.from("profiles")
				.select(`
					*,
					user_links (*),
					user_spoken_languages (*),
					user_badges (
						*,
						badge:badges (*)
					),
					user_roles!user_roles_user_id_fkey (
						*,
						role:roles (*)
					)
				`)
				.eq("username", data.username)
				.single();

			if (error || !result) return undefined;

			const ban = await getActiveBan(result.user_id);
			const counts = await getUserCounts(result.user_id);
			return mapUser(result, ban, counts);
		} catch (error) {
			console.error(`Error fetching user by username ${data.username}:`, error);
			throw error;
		}
	});

/**
 * Fetch a user profile by UUID.
 */
export const getUserById = createServerFn({ method: "GET" })
	.inputValidator((data: { uuid: string }) => data)
	.handler(async ({ data }) => {
		try {
			if (!data?.uuid) {
				console.error("getUserById called with invalid data:", data);
				return undefined;
			}

			const client = getClient();

			const { data: result, error } = await client
				.schema("familiar")
				.from("profiles")
				.select(`
					*,
					user_links (*),
					user_spoken_languages (*),
					user_badges (
						*,
						badge:badges (*)
					),
					user_roles!user_roles_user_id_fkey (
						*,
						role:roles (*)
					)
				`)
				.eq("user_id", data.uuid)
				.single();

			if (error) console.log(error);
			console.log(data);

			if (error || !result) return undefined;

			const ban = await getActiveBan(result.user_id);
			const counts = await getUserCounts(result.user_id);
			return mapUser(result, ban, counts);
		} catch (error) {
			console.error(`Error fetching user by id ${data?.uuid}:`, error);
			throw error;
		}
	});

/**
 * Fetch all user profiles.
 */
export const getUsers = createServerFn({ method: "GET" }).handler(async () => {
	try {
		const client = getClient();
		const { data: results, error } = await client
			.schema("familiar")
			.from("profiles")
			.select(`
				*,
				user_links (*),
				user_spoken_languages (*),
				user_badges (
						*,
						badge:badges (*)
					),
					user_roles!user_roles_user_id_fkey (
						*,
						role:roles (*)
					)
				`)
			.order("created_at", { ascending: false });

		if (error || !results) return [];

		const bansById = new Map<string, UserBan | null>();
		await Promise.all(
			results.map(async (p) => {
				bansById.set(p.user_id, await getActiveBan(p.user_id));
			}),
		);

		return results.map((p) => mapUser(p, bansById.get(p.user_id) ?? null));
	} catch (error) {
		console.error("Error fetching users:", error);
		throw error;
	}
});

/**
 * Ensure a user profile exists, creating it if necessary.
 */
export const ensureUserProfile = createServerFn({ method: "POST" })
	.inputValidator(
		(data: { uuid: string; username: string; display_name: string }) => data,
	)
	.handler(async ({ data }) => {
		try {
			const client = getClient();
			// Check if exists
			const { data: existing } = await client
				.schema("familiar")
				.from("profiles")
				.select("user_id")
				.eq("user_id", data.uuid)
				.single();

			if (existing) return;

			// Create
			const { error } = await client
				.schema("familiar")
				.from("profiles")
				.insert({
					user_id: data.uuid,
					username: data.username,
					display_name: data.display_name,
				});

			if (error) {
				console.error("Failed to create user profile:", error);
				throw error;
			}
		} catch (error) {
			console.error("Error ensuring user profile:", error);
			throw error;
		}
	});
