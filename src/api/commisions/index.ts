import { apiFetch } from "@/lib/fetch";
import type { TCommission } from "@/types/commissions";

/**
 * Get commissions by artist ID
 * @param artistId
 * @returns TCommission[]
 */
export function getCommissionByArtistId(artistId: string) {
	return apiFetch<TCommission[]>(`commissions/by-artist/${artistId}`);
}

/**
 * Get commission by ID
 * @param commissionId
 * @returns TCommission
 */
export function getCommissionById(commissionId: string) {
	return apiFetch<TCommission>(`commissions/${commissionId}`);
}
