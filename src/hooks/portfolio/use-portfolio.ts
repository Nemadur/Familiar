import {
	useMutation,
	useQuery,
	useQueryClient,
	queryOptions,
} from "@tanstack/react-query";
import {
	getMyPortfolioPosts,
	getArtistPortfolioPosts,
	getArtistPortfolioPost,
	getPortfolioPost,
	getArtistCatalogPosts,
	createPortfolioPost,
	updatePortfolioPost,
	deletePortfolioPost,
	reorderMyPortfolioPosts,
	uploadPortfolioPostMedia,
	deletePortfolioPostImage,
	reorderPortfolioPostImages,
	addPortfolioPostToCatalog,
	removePortfolioPostFromCatalog,
} from "@/api/portfolio/posts/post";
import {
	getMyCatalogs,
	getArtistCatalogs,
	createCatalog,
	updateCatalog,
	deleteCatalog,
	reorderMyCatalogs,
	assignCatalogCover,
} from "@/api/portfolio/catalogs/catalog";
import type {
	CreatePortfolioPostRequest,
	UpdatePortfolioPostRequest,
	ReorderRequest,
	ReorderPostImagesRequest,
	PostPageableParams,
} from "@/api/portfolio/posts/post-types";
import type {
	CreateCatalogRequest,
	UpdateCatalogRequest,
	AssignCoverRequest,
	ReorderCatalogsRequest,
} from "@/api/portfolio/catalogs/catalog-types";

// ------------------------------------------------------------------
// Portfolio Posts Queries
// ------------------------------------------------------------------

export function myPortfolioPostsQueryOptions(params?: PostPageableParams) {
	return queryOptions({
		queryKey: ["portfolio", "me", "posts", params],
		queryFn: () => getMyPortfolioPosts(params),
	});
}

export function useMyPortfolioPosts(params?: PostPageableParams) {
	return useQuery(myPortfolioPostsQueryOptions(params));
}

export function artistPortfolioPostsQueryOptions(
	username: string,
	params?: PostPageableParams,
) {
	return queryOptions({
		queryKey: ["portfolio", "artist", username, "posts", params],
		queryFn: () => getArtistPortfolioPosts(username, params),
		enabled: !!username,
	});
}

export function useArtistPortfolioPosts(
	username: string,
	params?: PostPageableParams,
) {
	return useQuery(artistPortfolioPostsQueryOptions(username, params));
}

export function artistPortfolioPostQueryOptions(
	username: string,
	postId: string,
) {
	return queryOptions({
		queryKey: ["portfolio", "artist", username, "post", postId],
		queryFn: () => getArtistPortfolioPost(username, postId),
		enabled: !!username && !!postId,
	});
}

export function useArtistPortfolioPost(username: string, postId: string) {
	return useQuery(artistPortfolioPostQueryOptions(username, postId));
}

export function portfolioPostQueryOptions(postId: string) {
	return queryOptions({
		queryKey: ["portfolio", "post", postId],
		queryFn: () => getPortfolioPost(postId),
		enabled: !!postId,
	});
}

export function usePortfolioPost(postId: string) {
	return useQuery(portfolioPostQueryOptions(postId));
}

export function artistCatalogPostsQueryOptions(
	username: string,
	catalogId: string,
	params?: PostPageableParams,
) {
	return queryOptions({
		queryKey: [
			"portfolio",
			"artist",
			username,
			"catalog",
			catalogId,
			"posts",
			params,
		],
		queryFn: () => getArtistCatalogPosts(username, catalogId, params),
		enabled: !!username && !!catalogId,
	});
}

export function useArtistCatalogPosts(
	username: string,
	catalogId: string,
	params?: PostPageableParams,
) {
	return useQuery(artistCatalogPostsQueryOptions(username, catalogId, params));
}

// ------------------------------------------------------------------
// Portfolio Catalogs Queries
// ------------------------------------------------------------------

export function myCatalogsQueryOptions() {
	return queryOptions({
		queryKey: ["portfolio", "me", "catalogs"],
		queryFn: () => getMyCatalogs(),
	});
}

export function useMyCatalogs() {
	return useQuery(myCatalogsQueryOptions());
}

export function artistCatalogsQueryOptions(username: string) {
	return queryOptions({
		queryKey: ["portfolio", "artist", username, "catalogs"],
		queryFn: () => getArtistCatalogs(username),
		enabled: !!username,
	});
}

export function useArtistCatalogs(username: string) {
	return useQuery(artistCatalogsQueryOptions(username));
}

// ------------------------------------------------------------------
// Portfolio Posts Mutations
// ------------------------------------------------------------------

export function useCreatePortfolioPost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreatePortfolioPostRequest) => createPortfolioPost(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["portfolio", "me", "posts"] });
			queryClient.invalidateQueries({ queryKey: ["portfolio", "artist"] });
		},
	});
}

export function useUpdatePortfolioPost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			postId,
			data,
		}: {
			postId: string;
			data: UpdatePortfolioPostRequest;
		}) => updatePortfolioPost(postId, data),
		onSuccess: (_, { postId }) => {
			queryClient.invalidateQueries({ queryKey: ["portfolio", "me", "posts"] });
			queryClient.invalidateQueries({ queryKey: ["portfolio", "artist"] });
			queryClient.invalidateQueries({
				queryKey: ["portfolio", "post", postId],
			});
		},
	});
}

export function useDeletePortfolioPost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (postId: string) => deletePortfolioPost(postId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["portfolio", "me", "posts"] });
			queryClient.invalidateQueries({ queryKey: ["portfolio", "artist"] });
		},
	});
}

export function useReorderMyPortfolioPosts() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: ReorderRequest) => reorderMyPortfolioPosts(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["portfolio", "me", "posts"] });
		},
	});
}

export function useUploadPortfolioPostMedia() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ postId, file }: { postId: string; file: File }) =>
			uploadPortfolioPostMedia(postId, file),
		onSuccess: (_, { postId }) => {
			queryClient.invalidateQueries({ queryKey: ["portfolio", "me", "posts"] });
			queryClient.invalidateQueries({
				queryKey: ["portfolio", "post", postId],
			});
		},
	});
}

export function useDeletePortfolioPostImage() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ postId, imageId }: { postId: string; imageId: string }) =>
			deletePortfolioPostImage(postId, imageId),
		onSuccess: (_, { postId }) => {
			queryClient.invalidateQueries({ queryKey: ["portfolio", "me", "posts"] });
			queryClient.invalidateQueries({
				queryKey: ["portfolio", "post", postId],
			});
		},
	});
}

export function useReorderPortfolioPostImages() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			postId,
			data,
		}: {
			postId: string;
			data: ReorderPostImagesRequest;
		}) => reorderPortfolioPostImages(postId, data),
		onSuccess: (_, { postId }) => {
			queryClient.invalidateQueries({ queryKey: ["portfolio", "me", "posts"] });
			queryClient.invalidateQueries({
				queryKey: ["portfolio", "post", postId],
			});
		},
	});
}

export function useAddPortfolioPostToCatalog() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			postId,
			catalogId,
		}: {
			postId: string;
			catalogId: string;
		}) => addPortfolioPostToCatalog(postId, catalogId),
		onSuccess: (_, { postId, catalogId }) => {
			queryClient.invalidateQueries({ queryKey: ["portfolio", "me", "posts"] });
			queryClient.invalidateQueries({
				queryKey: ["portfolio", "post", postId],
			});
			queryClient.invalidateQueries({
				queryKey: ["portfolio", "artist", "catalog", catalogId],
			});
		},
	});
}

export function useRemovePortfolioPostFromCatalog() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			postId,
			catalogId,
		}: {
			postId: string;
			catalogId: string;
		}) => removePortfolioPostFromCatalog(postId, catalogId),
		onSuccess: (_, { postId, catalogId }) => {
			queryClient.invalidateQueries({ queryKey: ["portfolio", "me", "posts"] });
			queryClient.invalidateQueries({
				queryKey: ["portfolio", "post", postId],
			});
			queryClient.invalidateQueries({
				queryKey: ["portfolio", "artist", "catalog", catalogId],
			});
		},
	});
}

// ------------------------------------------------------------------
// Portfolio Catalogs Mutations
// ------------------------------------------------------------------

export function useCreateCatalog() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateCatalogRequest) => createCatalog(data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["portfolio", "me", "catalogs"],
			});
			queryClient.invalidateQueries({ queryKey: ["portfolio", "artist"] });
		},
	});
}

export function useUpdateCatalog() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			catalogId,
			data,
		}: {
			catalogId: string;
			data: UpdateCatalogRequest;
		}) => updateCatalog(catalogId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["portfolio", "me", "catalogs"],
			});
			queryClient.invalidateQueries({ queryKey: ["portfolio", "artist"] });
		},
	});
}

export function useDeleteCatalog() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (catalogId: string) => deleteCatalog(catalogId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["portfolio", "me", "catalogs"],
			});
			queryClient.invalidateQueries({ queryKey: ["portfolio", "artist"] });
		},
	});
}

export function useReorderMyCatalogs() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: ReorderCatalogsRequest) => reorderMyCatalogs(data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["portfolio", "me", "catalogs"],
			});
		},
	});
}

export function useAssignCatalogCover() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			catalogId,
			data,
		}: {
			catalogId: string;
			data: AssignCoverRequest;
		}) => assignCatalogCover(catalogId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["portfolio", "me", "catalogs"],
			});
			queryClient.invalidateQueries({ queryKey: ["portfolio", "artist"] });
		},
	});
}
