import { createServerFn } from "@tanstack/react-start";
import { and, count, desc, eq, gt, isNull, ne, or } from "drizzle-orm";
import { db } from "@/db";
import { follows, posts, profiles, userBans } from "@/db/schema";
import type { SpokenLanguage, User, UserBan } from "@/types/user";

async function getActiveBan(userId: string): Promise<UserBan | null> {
	const now = new Date();
	const ban = await db.query.userBans.findFirst({
		where: and(
			eq(userBans.userId, userId),
			isNull(userBans.revokedAt),
			or(isNull(userBans.expiresAt), gt(userBans.expiresAt, now)),
		),
		orderBy: [desc(userBans.createdAt)],
	});

	if (!ban) return null;

	if (ban.banType === "perm") {
		return { type: "perm", until: null, reason: ban.reason };
	}

	// temp ban (expiresAt should exist, but we guard anyway)
	return ban.expiresAt
		? { type: "temp", until: ban.expiresAt, reason: ban.reason }
		: { type: "temp", until: new Date(0), reason: ban.reason };
}

async function getUserCounts(userId: string) {
	const [followersResult] = await db
		.select({ count: count() })
		.from(follows)
		.where(
			and(eq(follows.followedUserId, userId), eq(follows.status, "accepted")),
		);

	const [followingResult] = await db
		.select({ count: count() })
		.from(follows)
		.where(and(eq(follows.followerId, userId), eq(follows.status, "accepted")));

	const [worksResult] = await db
		.select({ count: count() })
		.from(posts)
		.where(and(eq(posts.artistId, userId), ne(posts.visibility, "private")));

	return {
		followers: followersResult?.count ?? 0,
		following: followingResult?.count ?? 0,
		works: worksResult?.count ?? 0,
	};
}

function mapUser(
	result: any,
	ban: UserBan | null,
	counts: { followers: number; following: number; works: number } = {
		followers: 0,
		following: 0,
		works: 0,
	},
): User {
	return {
		uuid: result.userId,
		username: result.username,
		display_name: result.displayName,
		bio: result.bio ?? null,
		media: {
			avatar: result.avatarPath ?? null,
			cover: result.coverPath ?? null,
		},
		accent_color: result.accentColor ?? null,
		is_premium: Boolean(result.isPremium),
		is_verified: Boolean(result.isVerified),
		is_private: Boolean(result.isPrivate),
		ban,
		banned_until: ban?.type === "temp" ? ban.until : null,
		created_at: result.createdAt ?? new Date(),
		timezone: result.timezone ?? null,
		pronouns: result.pronouns ?? null,
		followers_count: counts.followers,
		following_count: counts.following,
		works_count: counts.works,
		social_links: (result.userLinks ?? []).map((l: any) => ({
			label: l.label,
			url: l.url,
		})),
		spoken_languages: (result.spokenLanguages ?? []).map((l: any) => ({
			locale: l.locale,
			experience: l.experience as SpokenLanguage["experience"],
		})),
		badges: (result.badges ?? []).map((b: any) => ({
			uuid: b.badge.badgeId,
			label: b.badge.label,
			description: b.badge.description ?? "",
			color: b.badge.color ?? "",
			icon: b.badge.iconPath ?? null,
			awarded_at: b.awardedAt ?? undefined,
		})),
		tos: null,
		roles: (result.userRoles ?? []).map((r: any) => r.roleKey),
	};
}

/**
 * Fetch a user profile by username.
 */
export const getUserByUsername = createServerFn({ method: "GET" })
	.inputValidator((data: { username: string }) => data)
	.handler(async ({ data }) => {
		const result = await db.query.profiles.findFirst({
			where: eq(profiles.username, data.username),
			with: {
				userLinks: true,
				spokenLanguages: true,
				badges: {
					with: {
						badge: true,
					},
				},
				userRoles: {
					with: {
						role: true,
					},
				},
			},
		});

		if (!result) return undefined;

		const ban = await getActiveBan(result.userId);
		const counts = await getUserCounts(result.userId);
		return mapUser(result, ban, counts);
	});

/**
 * Fetch a user profile by UUID.
 */
export const getUserById = createServerFn({ method: "GET" })
	.inputValidator((data: { uuid: string }) => data)
	.handler(async ({ data }) => {
		const result = await db.query.profiles.findFirst({
			where: eq(profiles.userId, data.uuid),
			with: {
				userLinks: true,
				spokenLanguages: true,
				badges: { with: { badge: true } },
				userRoles: { with: { role: true } },
			},
		});

		if (!result) return undefined;

		const ban = await getActiveBan(result.userId);
		const counts = await getUserCounts(result.userId);
		return mapUser(result, ban, counts);
	});

/**
 * Fetch all user profiles.
 */
export const getUsers = createServerFn({ method: "GET" }).handler(async () => {
	const results = await db.query.profiles.findMany({
		with: {
			userLinks: true,
			spokenLanguages: true,
			badges: { with: { badge: true } },
			userRoles: { with: { role: true } },
		},
		orderBy: [desc(profiles.createdAt)],
	});

	const bansById = new Map<string, UserBan | null>();
	await Promise.all(
		results.map(async (p) => {
			bansById.set(p.userId, await getActiveBan(p.userId));
		}),
	);

	return results.map((p) => mapUser(p, bansById.get(p.userId) ?? null));
});
