import { queryOptions, useQuery } from "@tanstack/react-query";
import { getPortfolioPostsByUserId, getPortfolioPostById } from "@/api/portfolio";

export function portfolioPostsByUserIdQueryOptions(userId: string) {
	return queryOptions({
		queryKey: ["portfolio", "user", userId],
		queryFn: () => getPortfolioPostsByUserId(userId),
		staleTime: 60_000,
		enabled: !!userId && typeof window !== "undefined",
	});
}

export function portfolioPostByIdQueryOptions(postId: string) {
	return queryOptions({
		queryKey: ["portfolio", "post", postId],
		queryFn: () => getPortfolioPostById(postId),
		staleTime: 60_000,
		enabled: !!postId && typeof window !== "undefined",
	});
}

export function usePortfolioPostsByUserId(userId: string, enabled = true) {
	const query = useQuery({
		...portfolioPostsByUserIdQueryOptions(userId),
		enabled: enabled && !!userId && typeof window !== "undefined",
	});

	return {
		...query,
		posts: query.data ?? [],
	};
}

export function usePortfolioPostById(postId: string, enabled = true) {
	const query = useQuery({
		...portfolioPostByIdQueryOptions(postId),
		enabled: enabled && !!postId && typeof window !== "undefined",
	});

	return {
		...query,
		post: query.data ?? null,
	};
}
