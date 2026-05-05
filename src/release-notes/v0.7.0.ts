import { dateFormat } from "@/lib/utils";
import type { TReleaseInput } from "@/types/release-notes";

const RELEASE: TReleaseInput = {
	version: "0.7.0",
	date: dateFormat(new Date(2026, 3, 8)),
	groups: [
		{
			tag: "Added",
			items: [
				"You can now send and manage commission requests end to end.",
				"A new My Requests page lets you track the status of everything you have sent.",
			],
		},
	],
};

export default RELEASE;
