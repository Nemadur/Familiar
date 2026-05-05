import { dateFormat } from "@/lib/utils";
import type { TReleaseInput } from "@/types/release-notes";

const RELEASE: TReleaseInput = {
	version: "0.3.1",
	date: dateFormat(new Date(2026, 1, 25)),
	groups: [
		{
			tag: "Improved",
			items: [
				"Commission cards look more polished with refined corners and image rounding.",
				"Show and hide content labels are shorter and clearer.",
			],
		},
		{
			tag: "Fixed",
			items: [
				"The hide content button now shows a tooltip so its purpose is clearer.",
			],
		},
	],
};

export default RELEASE;
