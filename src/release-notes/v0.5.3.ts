import { dateFormat } from "@/lib/utils";
import type { TReleaseInput } from "@/types/release-notes";

const RELEASE: TReleaseInput = {
	version: "0.5.3",
	date: dateFormat(new Date(2026, 2, 13)),
	groups: [
		{
			tag: "Improved",
			items: [
				"Calendar, carousel, and multi-step forms are more reliable and easier to use with a keyboard.",
			],
		},
	],
};

export default RELEASE;
