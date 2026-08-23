import { apiFetch } from "@/lib/fetch";
import type {
	TCommissionRequest,
	TCommissionRequestResponse,
} from "@/types/commissions";

export type TPaginatedCommissionRequestParams = {
	page?: number;
	size?: number;
};

function buildPaginationQuery(params?: TPaginatedCommissionRequestParams) {
	const searchParams = new URLSearchParams();

	if (typeof params?.page === "number") {
		searchParams.set("page", String(params.page));
	}

	if (typeof params?.size === "number") {
		searchParams.set("size", String(params.size));
	}

	const query = searchParams.toString();
	return query ? `?${query}` : "";
}

/**
 * Get my commission requests
 * Returns paginated response from backend.
 */
export async function getMyCommissionRequests(
	params?: TPaginatedCommissionRequestParams,
) {
	return apiFetch<TCommissionRequestResponse>(
		`commissions/requests/my${buildPaginationQuery(params)}`,
	);
}

/**
 * Get incoming commission requests
 * Returns paginated response from backend.
 */
export async function getIncomingCommissionRequests(
	params?: TPaginatedCommissionRequestParams,
) {
	return apiFetch<TCommissionRequestResponse>(
		`commission-requests/incoming${buildPaginationQuery(params)}`,
	);
}

/**
 * Accept a commission request (Artist only)
 */
export async function acceptCommissionRequest(requestId: string) {
	return apiFetch<TCommissionRequest>(
		`commission-requests/${requestId}/accept`,
		{
			method: "PATCH",
		},
	);
}

/**
 * Reject a commission request (Artist only)
 */
export async function rejectCommissionRequest(requestId: string) {
	return apiFetch<TCommissionRequest>(
		`commission-requests/${requestId}/reject`,
		{
			method: "PATCH",
		},
	);
}

/**
 * Cancel a commission request (Client only)
 */
export async function cancelCommissionRequest(requestId: string) {
	return apiFetch<TCommissionRequest>(
		`commissions/requests/${requestId}/cancel`,
		{
			method: "PATCH",
		},
	);
}

/**
 * Update multimedia attachments on a commission request
 */
export async function updateCommissionRequestMultimedia(
	requestId: string,
	multimediaIds: string[],
) {
	return apiFetch<TCommissionRequest>(
		`commissions/requests/${requestId}/multimedia`,
		{
			method: "PATCH",
			body: JSON.stringify({ multimediaIds }),
		},
	);
}
