import { dateFormat } from "@/lib/utils";
import type { TReleaseInput } from "@/types/release-notes";

const RELEASE: TReleaseInput = {
	version: "0.4.0",
	date: dateFormat(new Date(2026, 1, 28)),
	groups: [
		{
			tag: "Added",
			items: [
				"New profile modals for info selection, terms of service, and reviews.",
				"Commission detail pages are now reachable directly from your profile.",
			],
		},
		{
			tag: "Improved",
			items: ["Sign in and sign up flows are more stable and consistent."],
		},
	],
};

export default RELEASE;
