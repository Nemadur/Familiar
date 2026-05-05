import { dateFormat } from "@/lib/utils";
import type { TReleaseInput } from "@/types/release-notes";

const RELEASE: TReleaseInput = {
	version: "0.5.2",
	date: dateFormat(new Date(2026, 2, 13)),
	groups: [
		{
			tag: "Fixed",
			items: [
				"Reels no longer flicker or get stuck when switching between items.",
				"Profile pictures load correctly even when media is still coming in.",
				"You can only open a commission if it is actually available, not accidentally on closed ones.",
				"Staying logged in across page refreshes is much more reliable now.",
				"The app no longer briefly shows you as logged out when you first open it.",
				"Your chosen theme is applied immediately on load with no flash.",
			],
		},
		{
			tag: "Improved",
			items: [
				"Folder cards now support custom colors and icons.",
				"License selection inside commission modals is clearer and easier to interact with.",
				"Scrollable sections in modals behave more consistently.",
			],
		},
	],
};

export default RELEASE;
