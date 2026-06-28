import { apiFetch } from "@/lib/fetch";
import type {
	TCommissionCategoryResponse,
	TCommissionDetailResponse,
	TCommissionPageResponse,
	TCommissionRequest,
	TCommissionResponse,
	TCreateCommissionRequest,
	TMediaJobResponse,
	TTagResponse,
	TUpdateCommissionRequest,
} from "@/types/commissions";

export type PaginationParams = {
	page?: number;
	size?: number;
};

export type UploadCommissionMediaInput = {
	commissionId: string;
	files: File[];
};

function paginationQuery(params: PaginationParams = {}) {
	const searchParams = new URLSearchParams();

	if (params.page !== undefined) {
		searchParams.set("page", String(params.page));
	}

	if (params.size !== undefined) {
		searchParams.set("size", String(params.size));
	}

	return searchParams.toString();
}

export function getCommissionByArtistId(
	artistId: string,
	params: PaginationParams = {},
) {
	const query = paginationQuery(params);
	const encodedArtistId = encodeURIComponent(artistId);

	const url = query
		? `/api/commissions/by-artist/${encodedArtistId}?${query}`
		: `/api/commissions/by-artist/${encodedArtistId}`;

	return apiFetch<TCommissionPageResponse>(url);
}

export function getCommissionById(commissionId: string) {
	return apiFetch<TCommissionDetailResponse>(
		`/api/commissions/${encodeURIComponent(commissionId)}`,
	);
}

export function getMyCommissions(params: PaginationParams = {}) {
	const query = paginationQuery(params);
	const url = query ? `/api/commissions/me?${query}` : `/api/commissions/me`;

	return apiFetch<TCommissionPageResponse>(url);
}

export function createCommission(data: TCreateCommissionRequest) {
	return apiFetch<TCommissionResponse>(`/api/commissions`, {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export function updateCommission(
	commissionId: string,
	data: TUpdateCommissionRequest,
) {
	return apiFetch<TCommissionResponse>(
		`/api/commissions/${encodeURIComponent(commissionId)}`,
		{
			method: "PATCH",
			body: JSON.stringify(data),
		},
	);
}

export function publishCommission(commissionId: string) {
	return apiFetch<TCommissionResponse>(
		`/api/commissions/${encodeURIComponent(commissionId)}/publish`,
		{
			method: "POST",
		},
	);
}

export function deleteCommission(commissionId: string) {
	return apiFetch<void>(
		`/api/commissions/${encodeURIComponent(commissionId)}`,
		{
			method: "DELETE",
		},
	);
}

export function uploadCommissionMedia({
	commissionId,
	files,
}: UploadCommissionMediaInput) {
	const formData = new FormData();

	for (const file of files) {
		formData.append("multimedia", file);
	}

	return apiFetch<TMediaJobResponse[]>(
		`/api/commissions/${encodeURIComponent(commissionId)}/media`,
		{
			method: "POST",
			body: formData,
		},
	);
}

export function submitCommissionRequest(
	commissionId: string,
	data: {
		commissionVersion: number;
		description?: string;
		tosVersion?: number;
		multimediaIds?: string[];
	},
) {
	return apiFetch<TCommissionRequest>(
		`/api/commissions/${encodeURIComponent(commissionId)}/requests`,
		{
			method: "POST",
			body: JSON.stringify(data),
		},
	);
}

export function getCommissionCategories(parentId?: string) {
	const url = parentId
		? `/api/commission-categories?parentId=${encodeURIComponent(parentId)}`
		: `/api/commission-categories`;

	return apiFetch<TCommissionCategoryResponse[]>(url);
}

export function getTags(includeAdult = false) {
	const url = includeAdult ? `/api/tags?includeAdult=true` : `/api/tags`;
	return apiFetch<TTagResponse[]>(url);
}
