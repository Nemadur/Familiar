import { useQuery } from "@tanstack/react-query";
import { getMyRoles } from "@/api/roles";
import { getUserById, getUserByUsername, getUsersByFilter } from "@/api/users";
import { useAuth } from "@/providers/auth";
import type { TUserProfile, TUserResponse } from "@/types/user";
import type { TRoles } from "@/types/user/roles";

type UseUserProfileResult = {
	user: TUserProfile | null;
	error: Error | null;
	isPending: boolean;
	isFetching: boolean;
};

export function useUserByUsername(
	username: string | undefined,
): UseUserProfileResult {
	const userQuery = useQuery<TUserResponse, Error>({
		queryKey: ["user", username],
		queryFn: () => {
			if (!username) throw new Error("username is required");
			return getUserByUsername({ username });
		},
		enabled: !!username,
	});

	const user: TUserProfile | null = userQuery.data
		? {
				...userQuery.data,
				stats: {
					followersCount: 0,
					followingCount: 0,
					worksCount: 0,
					commissionsCount: 0,
					charactersCount: 0,
				},
			}
		: null;

	return {
		user,
		error: userQuery.error,
		isPending: userQuery.isPending,
		isFetching: userQuery.isFetching,
	};
}

// export function useUserStats(userId: string | undefined) {
// 	const { data, error, isPending } = useQuery({
// 		queryKey: ["user-stats", userId],
// 		queryFn: async () => {
// 			if (!userId) return null;
// 			const stats = await getUserStats({ userId });
// 			return stats || null;
// 		},
// 		enabled: !!userId,
// 	});

// 	return {
// 		stats: data,
// 		error,
// 		isPending,
// 	};
// }

export function useCurrentUser() {
	const { user, pending } = useAuth();

	// We can also use useQuery here if we want to fetch fresh data,
	// but AuthProvider already manages the session and user data.
	// For consistency with other hooks, we return a similar structure.
	return {
		data: user,
		isLoading: pending,
		isError: false,
		error: null,
	};
}

export function useUserById(userId: string | undefined) {
	const { data, error, isPending } = useQuery<TUserResponse, Error>({
		queryKey: ["user-by-id", userId],
		queryFn: async () => {
			if (!userId) throw new Error("userId is required");
			const user = await getUserById({ userId });
			return user || null;
		},
		enabled: !!userId,
	});

	return {
		user: data,
		error,
		isPending,
	};
}

export function useUserByFilter({
	page,
	pageSize,
}: {
	page: number;
	pageSize: number;
}) {
	const { data, error, isPending } = useQuery<TUserResponse[], Error>({
		queryKey: ["users", page, pageSize],
		queryFn: () =>
			getUsersByFilter({
				page,
				pageSize,
			}),
		enabled: !!page && !!pageSize,
	});

	return {
		users: data || [],
		error,
		isPending,
	};
}
