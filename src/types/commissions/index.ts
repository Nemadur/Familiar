import type { TPagination } from "../pagable";
import type { TPaymentStatus } from "../payment";
import type { TTermsOfService, TTermsOfServiceAcceptance } from "../user/tos";

export enum TCommissionStatus {
	Draft = "DRAFT",
	Active = "ACTIVE",
	Paused = "PAUSED",
	OnHold = "ONHOLD",
	Archived = "ARCHIVED",
}

export enum TCommissionRequestStatus {
	Pending = "PENDING",
	Accepted = "ACCEPTED",
	In_Progress = "IN_PROGRESS",
	Delivered = "DELIVERED",
	Completed = "COMPLETED",
	Cancelled = "CANCELLED",
}

export type TCreateCommissionRequest = {
	title: string;
	description?: string;
	categoryId: string;
	folderId?: string;
	basePrice: number;
	currencyCode: string;
	tagIds?: string[];
	commissionStatus?: TCommissionStatus;
};

export type TUpdateCommissionRequest = Partial<{
	title: string;
	description: string;
	categoryId: string;
	folderId: string;
	basePrice: number;
	currencyCode: string;
	multimediaIds: string[];
	commissionStatus: TCommissionStatus;
}>;

export type TMediaJobResponse = {
	jobId: string;
	status: string;
	fullSizeId?: string;
	halfSizeId?: string;
	thumbnailId?: string;
	errorMessage?: string;
	createdAt: string;
	updatedAt: string;
};

export type TTagResponse = {
	id: string;
	name: string;
	description?: string;
	hasContentWarning: boolean;
	isAdultOnly: boolean;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};

export type TCommissionCategoryResponse = {
	id: string;
	name: string;
	description?: string;
	parentId?: string | null;
	subcategories?: TCommissionCategoryResponse[];
};

export type TCommissionCategory = {
	id: string;
	name: string;
	parentId?: string | null;
	parentName?: string | null;
};

export type TMultimediaSize = {
	full: string;
	half: string;
	thumbnail: string;
};

export type TMultimediaItem = {
	id: string;
	sizes: TMultimediaSize;
	fileName: string;
	widthPx: number;
	heightPx: number;
};

export enum TMultimediaType {
	Image = "IMAGE",
	Video = "VIDEO",
}

export type TTags = {
	id: string;
	name: string;
	hasContentWarning: boolean;
	isAdultOnly: boolean;
};

export type TCommission = {
	id: string;
	title: string;
	description: string;
	basePrice: number;
	currencyCode: string;
	commissionStatus: TCommissionStatus;
	category: TCommissionCategory;
	multimedia: TMultimediaItem[];
	tags: TTags[];
	artistId: string;
	version: number;
	artistTos: TTermsOfService;
	formTemplateId?: string;
	formTemplateName?: string;
	createdAt: string;
	updatedAt: string;
};

export type TCommissionDetailResponse = TCommission;

export type TCommissionResponse = {
	id: string;
	title: string;
	description?: string;
	categoryId: string;
	folderId?: string;
	basePrice: number;
	currencyCode: string;
	commissionStatus: TCommissionStatus;
	artistId: string;
	version: number;
	createdAt: string;
	updatedAt: string;
};

export type TCommissionPageResponse = TPagination<TCommission>;

export type TCommissionRequestPaymentSummary = {
	paymentStatus: TPaymentStatus;
	updatedAt: string;
};

export type TCommissionRequest = {
	id: string;
	commissionId: string;
	artistId: string;
	clientId: string;
	status: TCommissionRequestStatus;
	description?: string;
	commissionVersion: number;
	tosAcceptance: TTermsOfServiceAcceptance;
	multimedia: TMultimediaItem[];
	calculatedTotalPrice?: number;
	currencyCode?: string;
	formSnapshot?: unknown;
	formResponse?: unknown;
	createdAt: string;
	updatedAt: string;
	payment: TCommissionRequestPaymentSummary;
};

export type TCommissionRequestResponse = TPagination<TCommissionRequest>;
