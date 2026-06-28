import { queryOptions, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/fetch";
import type { TUserProfile, TUserResponse, UserStats } from "@/types/user";

const EMPTY_USER_STATS: UserStats = {
	followersCount: 0,
	followingCount: 0,
	worksCount: 0,
	commissionsCount: 0,
	charactersCount: 0,
};

function toUserProfile(user: TUserResponse): TUserProfile {
	return {
		...user,
		stats: user.stats ?? EMPTY_USER_STATS,
		badges: user.badges ?? [],
		timezone: user.timezone ?? null,
		spokenLanguages: user.spokenLanguages ?? [],
		socialLinks: user.socialLinks ?? [],
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
