import { dateFormat } from "@/lib/utils";
import type { TReleaseInput } from "@/types/release-notes";

const RELEASE: TReleaseInput = {
	version: "0.1.0",
	date: dateFormat(new Date(2026, 1, 1)),
	groups: [
		{
			tag: "Added",
			items: ["Initial release of the Filiar platform."],
		},
	],
};

export default RELEASE;
