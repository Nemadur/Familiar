import { dateFormat } from "@/lib/utils";
import type { TReleaseInput } from "@/types/release-notes";

const RELEASE: TReleaseInput = {
	version: "0.7.1",
	date: dateFormat(new Date(2026, 3, 11)),
	groups: [
		{
			tag: "Improved",
			items: [
				"Commission requests now have dedicated actions: submit, accept, reject, cancel, and attach media.",
				"The request details page got a full redesign with clearer status cards and a hold-to-confirm button for sensitive actions.",
				"Artists now see a dashboard shortcut right in the header.",
				"Filters now support grouped and nested options for easier browsing.",
			],
		},
	],
};

export default RELEASE;
