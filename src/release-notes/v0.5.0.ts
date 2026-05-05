import { dateFormat } from "@/lib/utils";
import type { TReleaseInput } from "@/types/release-notes";

const RELEASE: TReleaseInput = {
	version: "0.5.0",
	date: dateFormat(new Date(2026, 2, 3)),
	groups: [
		{
			tag: "Added",
			items: [
				"The app now works great on mobile with a new slide out navigation menu.",
				"Portfolio posts can be linked directly and shared with a URL.",
				"Sensitive content is blurred by default with a one tap option to reveal it.",
			],
		},
		{
			tag: "Improved",
			items: [
				"The user menu adapts to your device, showing a dropdown on desktop and a drawer on mobile.",
				"Images in the feed autoplay on mobile when you scroll past them.",
				"Your FAM code is cleaned up automatically when you type or paste it.",
			],
		},
	],
};

export default RELEASE;
