import { dateFormat } from "@/lib/utils";
import type { TReleaseInput } from "@/types/release-notes";

const RELEASE: TReleaseInput = {
	version: "0.7.3",
	date: dateFormat(new Date(2026, 4, 4)),
	groups: [
		{
			tag: "Added",
			items: [
				"Release notes, you can be updated on the latest features and improvements.",
			],
		},
	],
};

export default RELEASE;
