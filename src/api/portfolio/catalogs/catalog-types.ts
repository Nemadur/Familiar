import type { MultimediaDto } from "../posts/post-types";

export interface CatalogResponse {
	id: string; // UUID
	name: string;
	description?: string;
	thumbnail?: MultimediaDto;
	fullSize?: MultimediaDto;
	createdAt?: string; // date-time
	updatedAt?: string; // date-time
}

export interface CreateCatalogRequest {
	name: string;
	description?: string;
}

export interface UpdateCatalogRequest {
	name: string;
	description?: string;
}

export interface AssignCoverRequest {
	thumbnailId: string; // UUID
	fullSizeId: string; // UUID
}

export interface ReorderCatalogsRequest {
	orderedIds: string[]; // UUIDs
}
