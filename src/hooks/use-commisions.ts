import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createCommission,
	deleteCommission,
	getCommissionByArtistId,
	getCommissionById,
	getCommissionCategories,
	getMyCommissions,
	getTags,
	publishCommission,
	uploadCommissionMedia,
} from "@/api/commisions";
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

export function useCommission(commissionId: string) {
	return useQuery<TCommissionDetailResponse, Error>({
		queryKey: ["commissions", commissionId],
		queryFn: () => {
			if (!commissionId) throw new Error("Commission ID is required");
			return getCommissionById(commissionId);
		},
		enabled: Boolean(commissionId),
	});
}

export function useMyCommissions(page = 0, size = 10) {
	return useQuery<TCommissionPageResponse, Error>({
		queryKey: ["commissions", "me", page, size],
		queryFn: () => getMyCommissions({ page, size }),
		enabled: typeof window !== "undefined",
	});
}

export function useCreateCommission() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createCommission,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["commissions", "me"] });
			queryClient.invalidateQueries({ queryKey: ["commissions", "artist"] });
		},
	});
}

export function usePublishCommission() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (commissionId: string) => publishCommission(commissionId),
		onSuccess: (data, commissionId) => {
			queryClient.invalidateQueries({ queryKey: ["commissions", "me"] });
			queryClient.invalidateQueries({ queryKey: ["commissions", "artist"] });
			queryClient.invalidateQueries({
				queryKey: ["commissions", commissionId],
			});
			queryClient.invalidateQueries({ queryKey: ["commissions", data.id] });
		},
	});
}

export function useUploadCommissionMedia() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: uploadCommissionMedia,
		onSuccess: (_, { commissionId }) => {
			queryClient.invalidateQueries({
				queryKey: ["commissions", commissionId],
			});
			queryClient.invalidateQueries({
				queryKey: ["commissions", commissionId, "media-jobs"],
			});
			queryClient.invalidateQueries({
				queryKey: ["commissions", commissionId, "media-jobs", "active"],
			});
		},
	});
}

export function useDeleteCommission() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (commissionId: string) => deleteCommission(commissionId),
		onSuccess: (_, commissionId) => {
			queryClient.invalidateQueries({ queryKey: ["commissions", "me"] });
			queryClient.invalidateQueries({ queryKey: ["commissions", "artist"] });
			queryClient.removeQueries({ queryKey: ["commissions", commissionId] });
		},
	});
}

export function useCommissionCategories(parentId?: string) {
	return useQuery({
		queryKey: ["commission-categories", parentId],
		queryFn: () => getCommissionCategories(parentId),
	});
}

export function useTags(includeAdult = false) {
	return useQuery({
		queryKey: ["tags", includeAdult],
		queryFn: () => getTags(includeAdult),
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
