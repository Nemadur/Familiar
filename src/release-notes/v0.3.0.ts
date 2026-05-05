import { dateFormat } from "@/lib/utils";
import type { TReleaseInput } from "@/types/release-notes";

const RELEASE: TReleaseInput = {
	version: "0.3.0",
	date: dateFormat(new Date(2026, 1, 24)),
	groups: [
		{
			tag: "Added",
			items: [
				"You can now browse and request commissions directly from artist profiles.",
				"Content permissions are now handled behind the scenes based on your account type.",
			],
		},
	],
};

export default RELEASE;
