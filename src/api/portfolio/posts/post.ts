import { apiFetch } from "@/lib/fetch";
import type {
	CreatePortfolioPostRequest,
	MediaJobResponse,
	PagePortfolioPostResponse,
	PortfolioPostResponse,
	PostPageableParams,
	ReorderPostImagesRequest,
	ReorderRequest,
	UpdatePortfolioPostRequest,
} from "./post-types";

// Helper for generating query strings
function buildQueryString(params?: PostPageableParams): string {
	if (!params) return "";
	const query = new URLSearchParams();
	if (params.page !== undefined) query.append("page", params.page.toString());
	if (params.size !== undefined) query.append("size", params.size.toString());
	if (params.sort) {
		for (const s of params.sort) {
			query.append("sort", s);
		}
	}
	const q = query.toString();
	return q ? `?${q}` : "";
}

// ------------------------------------------------------------------
// Me Endpoints (Authenticated Artist)
// ------------------------------------------------------------------

export async function getMyPortfolioPosts(params?: PostPageableParams) {
	return apiFetch<PagePortfolioPostResponse>(
		`portfolio/me/posts${buildQueryString(params)}`,
	);
}

export async function createPortfolioPost(data: CreatePortfolioPostRequest) {
	return apiFetch<PortfolioPostResponse>("portfolio/me/posts", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export async function updatePortfolioPost(
	postId: string,
	data: UpdatePortfolioPostRequest,
) {
	return apiFetch<PortfolioPostResponse>(`portfolio/me/posts/${postId}`, {
		method: "PATCH",
		body: JSON.stringify(data),
	});
}

export async function deletePortfolioPost(postId: string) {
	return apiFetch<void>(`portfolio/me/posts/${postId}`, {
		method: "DELETE",
	});
}

export async function reorderMyPortfolioPosts(data: ReorderRequest) {
	return apiFetch<void>("portfolio/me/posts/order", {
		method: "PUT",
		body: JSON.stringify(data),
	});
}

export async function uploadPortfolioPostMedia(postId: string, file: File) {
	const formData = new FormData();
	formData.append("file", file);

	return apiFetch<MediaJobResponse>(`portfolio/me/posts/${postId}/media`, {
		method: "POST",
		body: formData,
	});
}

export async function deletePortfolioPostImage(
	postId: string,
	imageId: string,
) {
	return apiFetch<void>(`portfolio/me/posts/${postId}/images/${imageId}`, {
		method: "DELETE",
	});
}

export async function reorderPortfolioPostImages(
	postId: string,
	data: ReorderPostImagesRequest,
) {
	return apiFetch<void>(`portfolio/me/posts/${postId}/images/order`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
}

export async function addPortfolioPostToCatalog(
	postId: string,
	catalogId: string,
) {
	return apiFetch<void>(`portfolio/me/posts/${postId}/catalogs/${catalogId}`, {
		method: "POST",
	});
}

export async function removePortfolioPostFromCatalog(
	postId: string,
	catalogId: string,
) {
	return apiFetch<void>(`portfolio/me/posts/${postId}/catalogs/${catalogId}`, {
		method: "DELETE",
	});
}

// ------------------------------------------------------------------
// Public / Artist Endpoints
// ------------------------------------------------------------------

export async function getArtistPortfolioPosts(
	username: string,
	params?: PostPageableParams,
) {
	return apiFetch<PagePortfolioPostResponse>(
		`portfolio/artists/${encodeURIComponent(username)}/posts${buildQueryString(
			params,
		)}`,
	);
}

export async function getPortfolioPost(postId: string) {
	return apiFetch<PortfolioPostResponse>(`portfolio/posts/${postId}`);
}

export async function getArtistPortfolioPost(username: string, postId: string) {
	return apiFetch<PortfolioPostResponse>(
		`portfolio/artists/${encodeURIComponent(username)}/posts/${postId}`,
	);
}

export async function getArtistCatalogPosts(
	username: string,
	catalogId: string,
	params?: PostPageableParams,
) {
	return apiFetch<PagePortfolioPostResponse>(
		`portfolio/artists/${encodeURIComponent(
			username,
		)}/catalogs/${catalogId}/posts${buildQueryString(params)}`,
	);
}
