import { dateFormat } from "@/lib/utils";
import type { TReleaseInput } from "@/types/release-notes";

const RELEASE: TReleaseInput = {
	version: "0.7.2",
	date: dateFormat(new Date(2026, 3, 12)),
	groups: [
		{
			tag: "Improved",
			items: [
				"Commission previews now load faster and look sharper.",
				"Archived commissions are filtered out more reliably from your list.",
			],
		},
		{
			tag: "Removed",
			items: [
				"Cleaned up some old placeholder data that was no longer needed.",
				"Portfolio post view is temporarily hidden while we rework it.",
			],
		},
	],
};

export default RELEASE;
