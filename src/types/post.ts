import type { User } from "./user";

export type PostVisibility = "public" | "unlisted" | "private";
export type ContentWarning =
	| "sexual"
	| "nudity"
	| "violence"
	| "gore"
	| "self_harm"
	| "drugs"
	| "hate"
	| "flashing"
	| "other";
export type MediaType = "image" | "video" | "audio" | "file" | "other";

export interface PostImage {
	id: string;
	assetId: string;
	path: string;
	width: number;
	height: number;
	alt?: string;
	type: MediaType;
	mime: string;
}

export interface Post {
	id: string;
	authorId: string;
	title: string;
	description?: string; // body_md

	images: PostImage[];

	likeCount: number;
	viewCount: number;

	// Interaction
	isLiked: boolean;
	isBookmarked: boolean;

	createdAt: Date | string;
	updatedAt: Date | string;

	// Metadata
	visibility: PostVisibility;
	tags: string[];
	contentWarnings: ContentWarning[];

	// Legacy support / Helpers
	isCommission?: boolean;

	// Optional counts not yet in DB or handled differently
	repostCount?: number;
	commentCount?: number;
	bookmarkCount?: number;
	isReposted?: boolean;
	isCommented?: boolean;

	folderIds?: string[];

	// Featured content
	linkedCharacters?: {
		id: string;
		name: string;
		slug: string;
		avatarUrl?: string;
	}[];
	featuredReview?: {
		id: string;
		rating: number;
		comment?: string;
		createdAt: Date | string;
		highlights?: string[];
	};
}

export interface PostWithAuthor extends Post {
	author: User;
}

export interface Tile {
	id: string;
	widthUnit: 1 | 2;
	heightUnit: 1 | 2;
	cover: {
		path: string;
		width: number;
		height: number;
		alt?: string;
	};
}
