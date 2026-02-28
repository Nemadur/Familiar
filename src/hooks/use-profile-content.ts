import { useSuspenseQuery } from "@tanstack/react-query";
import { getProfileContent } from "@/data/user/content";

export function useSuspenseProfileContent(
	userId: string,
	type?: "commissions" | "portfolio" | "characters",
) {
	const { data } = useSuspenseQuery({
		queryKey: ["profile-content", userId, type],
		queryFn: () => getProfileContent({ data: { userId, type } }),
	});

	return data as Awaited<ReturnType<typeof getProfileContent>>;
}
