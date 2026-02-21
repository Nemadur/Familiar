import { useSuspenseQuery } from "@tanstack/react-query";
import { getProfileContent } from "@/data/user/content";

export function useSuspenseProfileContent(userId: string) {
	const { data } = useSuspenseQuery({
		queryKey: ["profile-content", userId],
		queryFn: () => getProfileContent({ data: { userId } }),
	});

	return data as Awaited<ReturnType<typeof getProfileContent>>;
}
