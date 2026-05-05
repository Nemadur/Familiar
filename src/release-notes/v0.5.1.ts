import { dateFormat } from "@/lib/utils";
import type { TReleaseInput } from "@/types/release-notes";

const RELEASE: TReleaseInput = {
	version: "0.5.1",
	date: dateFormat(new Date(2026, 2, 12)),
	groups: [
		{
			tag: "Improved",
			items: [
				"Reels feel more stable with better progress tracking and smoother transitions.",
				"Links inside posts now show a preview tooltip when you hover over them.",
				"Commission request forms have a cleaner step by step layout.",
			],
		},
		{
			tag: "Added",
			items: ["New filter icon available across the app."],
		},
	],
};

export default RELEASE;
