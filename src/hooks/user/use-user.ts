import { queryOptions, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/fetch";
import type {
	TUserProfile,
	TUserResponse,
	UserSocial,
	UserSocials,
} from "@/types/user";

function normalizeUserSocials(
	socials: TUserResponse["socials"] | null | undefined,
): UserSocials {
	if (!Array.isArray(socials)) {
		return [];
	}

	return socials.filter(
		(social): social is UserSocial =>
			typeof social?.platform === "string" &&
			typeof social?.value === "string" &&
			social.value.trim().length > 0,
	);
}

function toUserProfile(user: TUserResponse): TUserProfile {
	return {
		userId: user.userId,
		username: user.username,
		displayName: user.displayName,
		pronouns: user.pronouns ?? null,
		bio: user.bio ?? null,
		avatarPath: user.avatarPath ?? null,
		coverPath: user.coverPath ?? null,
		accentColor: user.accentColor ?? null,
		isVerified: Boolean(user.isVerified),
		isPremium: Boolean(user.isPremium),
		roles: Array.isArray(user.roles) ? user.roles : [],
		socials: normalizeUserSocials(user.socials),
		createdAt: user.createdAt,
	};
}

export async function getUserByUsername(
	username: string,
): Promise<TUserProfile> {
	if (!username) {
		throw new Error("Username is required");
	}

	const user = await apiFetch<TUserResponse>(
		`/users/${encodeURIComponent(username)}`,
	);

	return toUserProfile(user);
}

export async function getUserById(userId: string): Promise<TUserProfile> {
	if (!userId) {
		throw new Error("User ID is required");
	}

	const user = await apiFetch<TUserResponse>(
		`/users/id/${encodeURIComponent(userId)}`,
	);

	return toUserProfile(user);
}

export async function getMyProfile(): Promise<TUserProfile> {
	const user = await apiFetch<TUserResponse>("/users/me");
	return toUserProfile(user);
}

export function userByUsernameQueryOptions(username: string) {
	return queryOptions({
		queryKey: ["users", "username", username],
		queryFn: () => getUserByUsername(username),
		staleTime: 60_000,
		enabled: !!username && typeof window !== "undefined",
	});
}

export function userByIdQueryOptions(userId: string) {
	return queryOptions({
		queryKey: ["users", "id", userId],
		queryFn: () => getUserById(userId),
		staleTime: 60_000,
		enabled: !!userId && typeof window !== "undefined",
	});
}

export function myProfileQueryOptions() {
	return queryOptions({
		queryKey: ["users", "me"],
		queryFn: getMyProfile,
		staleTime: 30_000,
		enabled: typeof window !== "undefined",
	});
}

export function useUserByUsername(username: string, enabled = true) {
	const query = useQuery({
		...userByUsernameQueryOptions(username),
		enabled: enabled && !!username && typeof window !== "undefined",
	});

	return {
		...query,
		user: query.data ?? null,
	};
}

export function useUserById(userId: string, enabled = true) {
	const query = useQuery({
		...userByIdQueryOptions(userId),
		enabled: enabled && !!userId && typeof window !== "undefined",
	});

	return {
		...query,
		user: query.data ?? null,
	};
}

export function useMyProfile(enabled = true) {
	const query = useQuery({
		...myProfileQueryOptions(),
		enabled,
	});

	return {
		...query,
		user: query.data ?? null,
	};
}
