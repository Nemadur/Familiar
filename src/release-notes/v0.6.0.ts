import { dateFormat } from "@/lib/utils";
import type { TReleaseInput } from "@/types/release-notes";

const RELEASE: TReleaseInput = {
	version: "0.6.0",
	date: dateFormat(new Date(2026, 2, 14)),
	groups: [
		{
			tag: "Added",
			items: [
				"New filtering system lets you narrow down lists by date, text, number, or multiple options at once.",
				"Filters work great on mobile too.",
			],
		},
	],
};

export default RELEASE;
