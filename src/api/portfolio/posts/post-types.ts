export type PortfolioVisibility = "PUBLIC" | "PRIVATE";

export interface MultimediaDto {
	id: string; // UUID
	path: string;
}

export interface PortfolioPostImageResponse {
	id: string; // UUID
	mediaType: "IMAGE" | "VIDEO";
	thumbnail?: MultimediaDto;
	fullSize?: MultimediaDto;
	position?: number;
}

export interface PortfolioPostResponse {
	id?: string; // UUID
	userId?: string; // UUID
	title?: string;
	description?: string;
	visibility?: PortfolioVisibility;
	tags?: string[];
	contentWarnings?: string[];
	images?: PortfolioPostImageResponse[];
	catalogIds?: string[]; // UUIDs
	likeCount?: number;
	viewCount?: number;
	likedByCurrentUser?: boolean;
	bookmarkedByCurrentUser?: boolean;
	createdAt?: string; // date-time
	updatedAt?: string; // date-time
}

export interface PagePortfolioPostResponse {
	totalElements?: number;
	totalPages?: number;
	size?: number;
	content?: PortfolioPostResponse[];
	number?: number;
	numberOfElements?: number;
	pageable?: any;
	sort?: any;
	first?: boolean;
	last?: boolean;
	empty?: boolean;
}

export interface CreatePortfolioPostRequest {
	title: string;
	description?: string;
	visibility?: PortfolioVisibility;
	tags?: string[];
	contentWarnings?: string[];
	catalogIds?: string[];
}

export interface UpdatePortfolioPostRequest {
	title?: string;
	description?: string;
	visibility?: PortfolioVisibility;
	tags?: string[];
	contentWarnings?: string[];
}

export interface ReorderRequest {
	orderedIds: string[];
}

export interface ReorderPostImagesRequest {
	orderedImageIds: string[];
}

export interface MediaJobResponse {
	jobId?: string; // UUID
	status?: string;
	fullSizeId?: string; // UUID
	halfSizeId?: string; // UUID
	thumbnailId?: string; // UUID
	errorMessage?: string;
	createdAt?: string; // date-time
	updatedAt?: string; // date-time
}

export interface PostPageableParams {
	page?: number;
	size?: number;
	sort?: string[];
}
