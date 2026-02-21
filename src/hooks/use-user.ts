import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { getUserById, getUserByUsername } from "@/data/user";
import { useAuth } from "@/providers/auth";

export function useUserByUsername(username: string | undefined) {
	return useQuery({
		queryKey: ["user", username],
		queryFn: async () => {
			if (!username) return null;
			const user = await getUserByUsername({ data: { username } });
			return user || null;
		},
		enabled: !!username,
	});
}

export function useSuspenseUser(username: string) {
	return useSuspenseQuery({
		queryKey: ["user", username],
		queryFn: async () => {
			const user = await getUserByUsername({ data: { username } });
			return user || null;
		},
	});
}

export function useUserStats(userId: string | undefined) {
	return useQuery({
		queryKey: ["user-stats", userId],
		queryFn: async () => {
			if (!userId) return null;
		},
		enabled: !!userId,
	});
}

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
	return useQuery({
		queryKey: ["user-by-id", userId],
		queryFn: async () => {
			if (!userId) return null;
			const user = await getUserById({ data: { uuid: userId } });
			return user || null;
		},
		enabled: !!userId,
	});
}
