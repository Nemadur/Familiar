import { apiFetch } from "@/lib/fetch";
import type {
	TCommissionDetailResponse,
	TCommissionPageResponse,
	TCommissionRequest,
} from "@/types/commissions";

type PaginationParams = {
	page?: number;
	size?: number;
};

export function getCommissionByArtistId(
	artistId: string,
	params: PaginationParams = {},
) {
	const searchParams = new URLSearchParams();

	if (params.page !== undefined) {
		searchParams.set("page", String(params.page));
	}

	if (params.size !== undefined) {
		searchParams.set("size", String(params.size));
	}

	const query = searchParams.toString();
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
