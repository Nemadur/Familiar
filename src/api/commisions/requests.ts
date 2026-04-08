import { apiFetch } from "@/lib/fetch";
import type { TCommissionRequestResponse } from "@/types/commissions";

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
