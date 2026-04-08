import { useQuery } from "@tanstack/react-query";
import { getCommissionByArtistId, getCommissionById } from "@/api/commisions";
import {
	getIncomingCommissionRequests,
	getMyCommissionRequests,
} from "@/api/commisions/requests";
import type {
	TCommission,
	TCommissionRequestResponse,
} from "@/types/commissions";

export function useProfileCommisions(artistId: string) {
	return useQuery<TCommission[], Error>({
		queryKey: ["commissions", "artist", artistId],
		queryFn: () => {
			if (!artistId) throw new Error("Artist ID is required");
			return getCommissionByArtistId(artistId);
		},
		enabled: !!artistId,
	});
}

export function useCommission(commissionId: string) {
	return useQuery<TCommission, Error>({
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
	});
}

// TODO: handle errors (for example missing token, etc)
export function useIncomingCommissionRequests(page = 0, size = 10) {
	return useQuery<TCommissionRequestResponse, Error>({
		queryKey: ["commissions", "requests", "incoming", page, size],
		queryFn: () => getIncomingCommissionRequests({ page, size }),
	});
}
