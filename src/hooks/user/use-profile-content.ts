import {
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { getPortfolioPostsByUserId } from "@/api/portfolio";
import {
	getArtistCatalogs,
	getMyCatalogs,
} from "@/api/portfolio/catalogs/catalog";
import type {
	CatalogResponse,
	CreateCatalogRequest,
} from "@/api/portfolio/catalogs/catalog-types";
import {
	getArtistPortfolioPosts,
	getMyPortfolioPosts,
} from "@/api/portfolio/posts/post";
import type { PortfolioPostResponse } from "@/api/portfolio/posts/post-types";
import { useCreateCatalog, useCreatePortfolioPost } from "@/hooks/portfolio/use-portfolio";
import { useAuth } from "@/providers/auth";
import type { Character } from "@/types/character";
import type { PostWithAuthor } from "@/types/post";

export type ProfileContent = {
	portfolioPosts: PortfolioPostResponse[];
	feedPosts: PostWithAuthor[];
	folders: CatalogResponse[];
	characters: Character[];
};

function normalizeUsername(value?: string | null) {
	return decodeURIComponent(value ?? "")
		.replace(/^@/, "")
		.trim()
		.toLowerCase();
}

export function useProfileContent(
	username: string,
	userId: string,
	tab: string,
) {
	const queryClient = useQueryClient();
	const { user: authenticatedUser } = useAuth();

	/*
	 * In this application:
	 * undefined = authentication is still loading
	 * null      = unauthenticated
	 * object    = authenticated
	 */
	const isAuthPending = authenticatedUser === undefined;

	const isCurrentUser = Boolean(
		authenticatedUser &&
		(
			authenticatedUser.userId === userId ||
			normalizeUsername(authenticatedUser.username) ===
			normalizeUsername(username)
		),
	);

	const queryKey = [
		"profile-content",
		username,
		userId,
		tab,
		isCurrentUser,
	] as const;

	const createCatalogMutation = useCreateCatalog();
	const createPostMutation = useCreatePortfolioPost();

	const query = useQuery<ProfileContent>({
		queryKey,
		enabled:
			Boolean(username && userId) &&
			!isAuthPending,

		queryFn: async () => {
			if (tab === "portfolio") {
				const [postsResponse, catalogsResponse] =
					await Promise.all([
						isCurrentUser
							? getMyPortfolioPosts({
								page: 0,
								size: 100,
							})
							: getArtistPortfolioPosts(
								username,
								{
									page: 0,
									size: 100,
								},
							),
						isCurrentUser
							? getMyCatalogs()
							: getArtistCatalogs(username),
					]);

				return {
					portfolioPosts: Array.isArray(
						postsResponse.content,
					)
						? postsResponse.content
						: [],
					feedPosts: [],
					folders: Array.isArray(catalogsResponse)
						? catalogsResponse
						: [],
					characters: [],
				};
			}

			if (tab === "liked" || tab === "saved") {
				const feedPosts =
					await getPortfolioPostsByUserId(userId);

				return {
					portfolioPosts: [],
					feedPosts,
					folders: [],
					characters: [],
				};
			}

			return {
				portfolioPosts: [],
				feedPosts: [],
				folders: [],
				characters: [],
			};
		},
	});

	async function createProfileCatalog(
		data: CreateCatalogRequest,
	): Promise<CatalogResponse> {
		if (!isCurrentUser || tab !== "portfolio") {
			throw new Error(
				"You cannot create catalogs for this profile.",
			);
		}

		const createdCatalog =
			await createCatalogMutation.mutateAsync(data);

		queryClient.setQueryData<ProfileContent>(
			queryKey,
			(currentContent) => {
				if (!currentContent) {
					return currentContent;
				}

				const alreadyExists =
					currentContent.folders.some(
						(folder) =>
							folder.id === createdCatalog.id,
					);

				if (alreadyExists) {
					return currentContent;
				}

				return {
					...currentContent,
					folders: [
						...currentContent.folders,
						createdCatalog,
					],
				};
			},
		);

		return createdCatalog;
	}

	async function createProfilePost(
		data: import("@/api/portfolio/posts/post-types").CreatePortfolioPostRequest,
	): Promise<PortfolioPostResponse> {
		if (!isCurrentUser || tab !== "portfolio") {
			throw new Error("You cannot create posts for this profile.");
		}

		const createdPost = await createPostMutation.mutateAsync(data);

		queryClient.setQueryData<ProfileContent>(
			queryKey,
			(currentContent) => {
				if (!currentContent) {
					return currentContent;
				}

				return {
					...currentContent,
					portfolioPosts: [
						createdPost,
						...currentContent.portfolioPosts,
					],
				};
			},
		);

		// Force invalidate to ensure images/fresh data loads if it was altered elsewhere
		queryClient.invalidateQueries({ queryKey: ["portfolio"] });
		queryClient.invalidateQueries({ queryKey });

		return createdPost;
	}

	return {
		...query,

		isPending:
			isAuthPending || query.isPending,

		isCurrentUser,
		createCatalog: createProfileCatalog,
		isCreatingCatalog:
			createCatalogMutation.isPending,
		createCatalogError:
			createCatalogMutation.error,

		createPost: createProfilePost,
		isCreatingPost: createPostMutation.isPending,
		createPostError: createPostMutation.error,
	};
}