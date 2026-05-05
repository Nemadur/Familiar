import { dateFormat } from "@/lib/utils";
import type { TReleaseInput } from "@/types/release-notes";

const RELEASE: TReleaseInput = {
	version: "0.2.0",
	date: dateFormat(new Date(2026, 1, 21)),
	groups: [
		{
			tag: "Added",
			items: [
				"Full profile pages are live with avatars, bios, cover images, and feed tabs.",
				"You can now sign in and out with a real account backed by Supabase.",
				"Profiles support spoken language badges and SEO-friendly URLs.",
			],
		},
	],
};

export default RELEASE;
