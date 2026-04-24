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

export type TCommissionCategory = {
	id: string;
	name: string;
	parentId: string;
	parentName: string;
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

export type TCommissionDetailResponse = {
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

export type TCommissionResponse = {
	id: string;
	title: string;
	description: string;
	categoryId: string;
	folderId: string;
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
	createdAt: string;
	updatedAt: string;
	payment: TCommissionRequestPaymentSummary;
};

export type TCommissionRequestResponse = TPagination<TCommissionRequest>;
