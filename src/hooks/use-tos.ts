import { useQuery } from "@tanstack/react-query";
import { getToSByArtistId } from "@/api/tos";
import type { TTermsOfServiceResponse } from "@/types/user/tos";

export function useProfileTermsOfService(artistId: string) {
	const {
		data: tosData,
		isPending: isTosPending,
		error: tosError,
	} = useQuery<TTermsOfServiceResponse, Error>({
		queryKey: ["tos", "artist", artistId],
		queryFn: () => {
			if (!artistId) throw new Error("Artist ID is required");
			return getToSByArtistId(artistId);
		},
		enabled: !!artistId,
	});

	return {
		tosData,
		isTosPending,
		tosError,
	};
}
