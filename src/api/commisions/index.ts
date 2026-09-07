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
		? `commissions/by-artist/${encodedArtistId}?${query}`
		: `commissions/by-artist/${encodedArtistId}`;

	return apiFetch<TCommissionPageResponse>(url);
}

export function getCommissionById(commissionId: string) {
	return apiFetch<TCommissionDetailResponse>(
		`commissions/${encodeURIComponent(commissionId)}`,
	);
}

export function getMyCommissions(params: PaginationParams = {}) {
	const query = paginationQuery(params);
	const url = query ? `commissions/me?${query}` : `commissions/me`;

	return apiFetch<TCommissionPageResponse>(url);
}

export function createCommission(data: TCreateCommissionRequest) {
	return apiFetch<TCommissionResponse>(`commissions`, {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export function updateCommission(
	commissionId: string,
	data: TUpdateCommissionRequest,
) {
	return apiFetch<TCommissionResponse>(
		`commissions/${encodeURIComponent(commissionId)}`,
		{
			method: "PATCH",
			body: JSON.stringify(data),
		},
	);
}

export function publishCommission(commissionId: string) {
	return apiFetch<TCommissionResponse>(
		`commissions/${encodeURIComponent(commissionId)}/publish`,
		{
			method: "POST",
		},
	);
}

export function deleteCommission(commissionId: string) {
	return apiFetch<void>(`commissions/${encodeURIComponent(commissionId)}`, {
		method: "DELETE",
	});
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
		`commissions/${encodeURIComponent(commissionId)}/media`,
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
		`commissions/${encodeURIComponent(commissionId)}/requests`,
		{
			method: "POST",
			body: JSON.stringify(data),
		},
	);
}

export function getCommissionCategories(parentId?: string) {
	const url = parentId
		? `commission-categories?parentId=${encodeURIComponent(parentId)}`
		: `commission-categories`;

	return apiFetch<TCommissionCategoryResponse[]>(url);
}

export function getTags(includeAdult = false) {
	const url = includeAdult ? `tags?includeAdult=true` : `tags`;
	return apiFetch<TTagResponse[]>(url);
}
