import { apiFetch } from "@/lib/fetch";
import type { TTermsOfServiceResponse } from "@/types/user/tos";

export async function getToSByArtistId(artistId: string) {
	return apiFetch<TTermsOfServiceResponse>(`tos/artist/${artistId}`);
}
