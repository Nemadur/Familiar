import type { PostWithAuthor } from "@/types/post";

/**
 * Fake API call to get portfolio posts by user ID
 * Once the backend is ready, this will be replaced with:
 * return apiFetch<PostWithAuthor[]>(`/users/id/${userId}/portfolio`);
 * or a paginated version.
 */
export async function getPortfolioPostsByUserId(
	userId: string,
): Promise<PostWithAuthor[]> {
	if (!userId) {
		throw new Error("User ID is required");
	}

	// Dynamic import of mock data to keep bundle size small when not used
	const { MOCK_PORTFOLIO_POSTS } = await import("../../mock/portfolio");

	// Simulate network latency
	return new Promise((resolve) => {
		setTimeout(() => {
			const userPosts = MOCK_PORTFOLIO_POSTS.filter(
				(post) => post.authorId === userId,
			);

			// If we didn't find any posts and it's an unknown ID, let's map the 'draconek_mock_id' posts
			// to this user ID so we have some fallback data for testing
			if (userPosts.length === 0 && userId !== "u1" && userId !== "u2") {
				const fallbackPosts = MOCK_PORTFOLIO_POSTS.filter(
					(post) => post.authorId === "draconek_mock_id",
				).map((post) => ({
					...post,
					authorId: userId,
					author: {
						...post.author,
						userId: userId,
					},
				}));
				resolve(fallbackPosts);
				return;
			}

			resolve(userPosts);
		}, 600);
	});
}

/**
 * Fake API call to get a single portfolio post by ID
 * Once the backend is ready, this will be replaced with:
 * return apiFetch<PostWithAuthor>(`/portfolio/${postId}`);
 */
export async function getPortfolioPostById(
	postId: string,
): Promise<PostWithAuthor> {
	if (!postId) {
		throw new Error("Post ID is required");
	}

	const { MOCK_PORTFOLIO_POSTS } = await import("../../mock/portfolio");

	return new Promise((resolve, reject) => {
		setTimeout(() => {
			const post = MOCK_PORTFOLIO_POSTS.find((p) => p.id === postId);
			if (post) {
				resolve(post);
			} else {
				reject(new Error("Post not found"));
			}
		}, 400);
	});
}
