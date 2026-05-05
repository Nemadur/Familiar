import { dateFormat } from "@/lib/utils";
import type { TReleaseInput } from "@/types/release-notes";

const RELEASE: TReleaseInput = {
	version: "0.5.4",
	date: dateFormat(new Date(2026, 2, 14)),
	groups: [
		{
			tag: "Improved",
			items: [
				"Reels play more smoothly and pause correctly when you scroll away.",
				"The app feels snappier overall thanks to some under the hood performance work.",
			],
		},
		{
			tag: "Fixed",
			items: [
				"Sign up flow no longer gets stuck on the continue button in certain situations.",
			],
		},
	],
};

export default RELEASE;
