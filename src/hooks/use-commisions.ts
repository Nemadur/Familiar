import { useQuery } from "@tanstack/react-query";
import { getCommissionByArtistId, getCommissionById } from "@/api/commisions";
import {
	getIncomingCommissionRequests,
	getMyCommissionRequests,
} from "@/api/commisions/requests";
import type {
	TCommissionDetailResponse,
	TCommissionPageResponse,
	TCommissionRequestResponse,
} from "@/types/commissions";

export function useProfileCommissionsPage(
	artistId: string,
	page = 0,
	size = 24,
) {
	return useQuery<TCommissionPageResponse, Error>({
		queryKey: ["commissions", "artist", artistId, page, size],
		queryFn: () => {
			if (!artistId) {
				throw new Error("Artist userId is required");
			}

			return getCommissionByArtistId(artistId, { page, size });
		},
		enabled: Boolean(artistId),
	});
}

export function useProfileCommissions(artistId: string, page = 0, size = 24) {
	const query = useProfileCommissionsPage(artistId, page, size);

	return {
		...query,
		commissions: query.data?.content ?? [],
	};
}

// alias, żeby stary import się nie wysypał
export const useProfileCommisions = useProfileCommissions;

export function useCommission(commissionId: string) {
	return useQuery<TCommissionDetailResponse, Error>({
		queryKey: ["commissions", commissionId],
		queryFn: () => {
			if (!commissionId) throw new Error("Commission ID is required");
			return getCommissionById(commissionId);
		},
		enabled: !!commissionId,
	});
}

export function useMyCommissionRequests(page = 0, size = 10) {
	return useQuery<TCommissionRequestResponse, Error>({
		queryKey: ["commissions", "requests", "my", page, size],
		queryFn: () => getMyCommissionRequests({ page, size }),
		enabled: typeof window !== "undefined",
	});
}

export function useIncomingCommissionRequests(page = 0, size = 10) {
	return useQuery<TCommissionRequestResponse, Error>({
		queryKey: ["commissions", "requests", "incoming", page, size],
		queryFn: () => getIncomingCommissionRequests({ page, size }),
		enabled: typeof window !== "undefined",
	});
}
