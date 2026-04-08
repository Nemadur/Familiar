import { createServerFn } from "@tanstack/react-start";
import { type BackendMeResponse, getApiBaseUrl } from "@/lib/fetch";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import type { SpokenLanguage, User, UserBan } from "@/types/user";

// Helper to choose the right client (prefer admin if available for RLS bypass)
const getClient = () => supabaseAdmin || supabase;

// async function getActiveBan(userId: string): Promise<UserBan | null> {
// 	try {
// 		const now = new Date();
// 		const client = getClient();

// 		// We need to use schema('familiar') if tables are in familiar schema
// 		const { data: ban, error } = await client
// 			.schema("familiar")
// 			.from("user_bans")
// 			.select("*")
// 			.eq("user_id", userId)
// 			.is("revoked_at", null)
// 			.or(`expires_at.is.null,expires_at.gt.${now.toISOString()}`)
// 			.order("created_at", { ascending: false })
// 			.limit(1)
// 			.single();

// 		if (error || !ban) return null;

// 		if (ban.ban_type === "perm") {
// 			return { type: "perm", until: null, reason: ban.reason };
// 		}

// 		return ban.expires_at
// 			? { type: "temp", until: new Date(ban.expires_at), reason: ban.reason }
// 			: { type: "temp", until: new Date(0), reason: ban.reason };
// 	} catch (error) {
// 		console.error(`Error fetching active ban for user ${userId}:`, error);
// 		return null;
// 	}
// }

// async function getUserCounts(userId: string) {
// 	try {
// 		const client = getClient();

// 		// Parallel queries for counts
// 		const [followers, following, works, commissions, characters] =
// 			await Promise.all([
// 				client
// 					.schema("familiar")
// 					.from("follows")
// 					.select("*", { count: "exact", head: true })
// 					.eq("followed_user_id", userId)
// 					.eq("status", "accepted"),
// 				client
// 					.schema("familiar")
// 					.from("follows")
// 					.select("*", { count: "exact", head: true })
// 					.eq("follower_id", userId)
// 					.eq("status", "accepted"),
// 				client
// 					.schema("familiar")
// 					.from("posts")
// 					.select("*", { count: "exact", head: true })
// 					.eq("artist_id", userId)
// 					.neq("visibility", "private"),
// 				client
// 					.schema("familiar")
// 					.from("commission_listings")
// 					.select("*", { count: "exact", head: true })
// 					.eq("artist_id", userId)
// 					.neq("status", "archived"), // Assuming archived shouldn't count? Or just count all?
// 				client
// 					.schema("familiar")
// 					.from("sonas")
// 					.select("*", { count: "exact", head: true })
// 					.eq("owner_id", userId),
// 			]);

// 		return {
// 			followers: followers.count ?? 0,
// 			following: following.count ?? 0,
// 			works: works.count ?? 0,
// 			commissions: commissions.count ?? 0,
// 			characters: characters.count ?? 0,
// 		};
// 	} catch (error) {
// 		console.error(`Error fetching user counts for ${userId}:`, error);
// 		return {
// 			followers: 0,
// 			following: 0,
// 			works: 0,
// 			commissions: 0,
// 			characters: 0,
// 		};
// 	}
// }

// function mapUser(
// 	result: any,
// 	ban: UserBan | null,
// 	counts: {
// 		followers: number;
// 		following: number;
// 		works: number;
// 		commissions: number;
// 		characters: number;
// 	} = {
// 		followers: 0,
// 		following: 0,
// 		works: 0,
// 		commissions: 0,
// 		characters: 0,
// 	},
// ): User {
// 	return {
// 		uuid: result.user_id,
// 		username: result.username,
// 		display_name: result.display_name,
// 		bio: result.bio ?? null,
// 		media: {
// 			avatar: result.avatar_path ?? null,
// 			cover: result.cover_path ?? null,
// 		},
// 		accent_color: result.accent_color ?? null,
// 		is_premium: Boolean(result.is_premium),
// 		is_verified: Boolean(result.is_verified),
// 		is_private: Boolean(result.is_private),
// 		ban,
// 		banned_until: ban?.type === "temp" ? ban.until : null,
// 		created_at: result.created_at ? new Date(result.created_at) : new Date(),
// 		timezone: result.timezone ?? null,
// 		pronouns: result.pronouns ?? null,
// 		followers_count: counts.followers,
// 		following_count: counts.following,
// 		works_count: counts.works,
// 		commissions_count: counts.commissions,
// 		characters_count: counts.characters,
// 		social_links: (result.user_links ?? []).map((l: any) => ({
// 			label: l.label,
// 			url: l.url,
// 		})),
// 		spoken_languages: (result.user_spoken_languages ?? []).map((l: any) => ({
// 			locale: l.locale,
// 			experience: l.experience as SpokenLanguage["experience"],
// 		})),
// 		badges: (result.user_badges ?? []).map((b: any) => ({
// 			uuid: b.badge?.badge_id,
// 			label: b.badge?.label,
// 			description: b.badge?.description ?? "",
// 			color: b.badge?.color ?? "",
// 			icon: b.badge?.icon_path ?? null,
// 			awarded_at: b.awarded_at ? new Date(b.awarded_at) : undefined,
// 		})),
// 		tos: null,
// 		roles: (result.user_roles ?? []).map(
// 			(r: any) => r.role?.role_key || r.role_key,
// 		),
// 	};
// }

/**
 * Fetch a user profile by username.
 */
export const getUserByUsername = createServerFn({ method: "GET" })
	.inputValidator((data: { username: string }) => data)
	.handler(async ({ data }) => {
		try {
			if (!data?.username) return undefined;

			const client = getClient();

			const { data: userRow, error: userError } = await client
				.schema("familiar")
				.from("users")
				.select("*")
				.eq("username", data.username)
				.maybeSingle();

			if (userError) {
				console.error(
					`Error fetching base user by username ${data.username}:`,
					userError,
				);
				throw userError;
			}

			if (!userRow) {
				console.warn(`User (${data.username}) not found`);
				return undefined;
			}

			const userId = userRow.user_id;

			const [linksRes, languagesRes, badgesRes, rolesRes, ban, counts] =
				await Promise.all([
					client
						.schema("familiar")
						.from("user_links")
						.select("*")
						.eq("user_id", userId),

					client
						.schema("familiar")
						.from("user_spoken_languages")
						.select("*")
						.eq("user_id", userId),

					client
						.schema("familiar")
						.from("user_badges")
						.select(`
						*,
						badge:badges (*)
					`)
						.eq("user_id", userId),

					client
						.schema("familiar")
						.from("user_roles")
						.select(`
						*,
						role:roles (*)
					`)
						.eq("user_id", userId),

					getActiveBan(userId),
					getUserCounts(userId),
				]);

			const result = {
				...userRow,
				user_links: linksRes.data ?? [],
				user_spoken_languages: languagesRes.data ?? [],
				user_badges: badgesRes.data ?? [],
				user_roles: rolesRes.data ?? [],
			};

			return mapUser(result, ban, counts);
		} catch (error) {
			console.error(`Error fetching user by username ${data.username}:`, error);
			throw error;
		}
	});

/**
 * Fetch the current user profile.
 */
export async function getMe(accessToken: string): Promise<BackendMeResponse> {
	const baseUrl = getApiBaseUrl();
	const response = await fetch(`${baseUrl}/api/users/me`, {
		method: "GET",
		headers: {
			Accept: "application/json",
			Authorization: `Bearer ${accessToken}`,
		},
	});

	const contentType = response.headers.get("content-type") ?? "";
	const isJson = contentType.includes("application/json");
	const payload = isJson
		? ((await response.json()) as unknown)
		: await response.text();

	if (!response.ok) {
		if (typeof payload === "object" && payload !== null) {
			const err = payload as Record<string, unknown>;
			throw new Error(
				String(err.message ?? err.error ?? "Failed to fetch current user."),
			);
		}

		throw new Error(
			typeof payload === "string" && payload.trim().length > 0
				? payload
				: "Failed to fetch current user.",
		);
	}

	return payload as BackendMeResponse;
}

// export const getUserById = createServerFn({ method: "GET" })
// 	.inputValidator((data: { uuid: string }) => data)
// 	.handler(async ({ data }) => {
// 		try {
// 			if (!data?.uuid) {
// 				console.error("getUserById called with invalid data:", data);
// 				return undefined;
// 			}

// 			const client = getClient();

// 			const { data: result, error } = await client
// 				.schema("familiar")
// 				.from("users")
// 				.select(`
// 					*,
// 					user_links (*),
// 					user_spoken_languages (*),
// 					user_badges (
// 						*,
// 						badge:badges (*)
// 					),
// 					user_roles!user_roles_user_id_fkey (
// 						*,
// 						role:roles (*)
// 					)
// 				`)
// 				.eq("user_id", data.uuid)
// 				.single();

// 			if (error) console.error(`User (${data?.uuid}) not found`);
// 			// console.log(data);

// 			if (error || !result) return undefined;

// 			const ban = await getActiveBan(result.user_id);
// 			const counts = await getUserCounts(result.user_id);
// 			return mapUser(result, ban, counts);
// 		} catch (error) {
// 			console.error(`Error fetching user by id ${data?.uuid}:`, error);
// 			throw error;
// 		}
// 	});

async function getActiveBan(userId: string): Promise<UserBan | null> {
	try {
		const now = new Date();
		const client = getClient();

		const { data: ban, error } = await client
			.schema("familiar")
			.from("user_bans")
			.select("*")
			.eq("user_id", userId)
			.is("revoked_at", null)
			.or(`expires_at.is.null,expires_at.gt.${now.toISOString()}`)
			.order("created_at", { ascending: false })
			.limit(1)
			.maybeSingle();

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
					.neq("status", "archived"),
				client
					.schema("familiar")
					.from("sonas")
					.select("*", { count: "exact", head: true })
					.eq("owner_id", userId),
			]);

		return {
			followers: followers?.count ?? 0,
			following: following?.count ?? 0,
			works: works?.count ?? 0,
			commissions: commissions?.count ?? 0,
			characters: characters?.count ?? 0,
		};
	} catch (error) {
		console.error(`Error fetching user counts for user ${userId}:`, error);
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

export const getUsers = createServerFn({ method: "GET" })
	.inputValidator((data?: { page?: number; pageSize?: number }) => ({
		page: Math.max(1, Number(data?.page ?? 1)),
		pageSize: Math.min(100, Math.max(1, Number(data?.pageSize ?? 20))),
	}))
	.handler(async ({ data }) => {
		const client = getClient();

		const page = data.page;
		const pageSize = data.pageSize;
		const from = (page - 1) * pageSize;
		const to = from + pageSize - 1;

		const {
			data: results,
			error,
			count,
		} = await client
			.schema("familiar")
			.from("users")
			.select("*", { count: "exact" })
			.order("created_at", { ascending: false })
			.range(from, to);

		if (error) {
			console.error("Base users query failed:", error);
			throw error;
		}

		return {
			items: results ?? [],
			page,
			pageSize,
			total: count ?? 0,
			pageCount: count ? Math.ceil(count / pageSize) : 0,
			hasNextPage: count ? page < Math.ceil(count / pageSize) : false,
			hasPreviousPage: page > 1,
		};
	});
