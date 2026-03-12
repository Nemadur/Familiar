import { useSuspenseQuery } from "@tanstack/react-query";
import { getProfileContent } from "@/data/user/content";
import { supabase } from "@/lib/supabase";

export function useSuspenseProfileContent(
	userId: string,
	type?: "commissions" | "portfolio" | "characters" | "saved" | "liked",
) {
	const { data } = useSuspenseQuery({
		queryKey: ["profile-content", userId, type],
		queryFn: async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			return getProfileContent({
				data: { userId, type, token: session?.access_token },
			});
		},
	});

	return data as Awaited<ReturnType<typeof getProfileContent>>;
}
