export type TReleaseTag =
	| "Added"
	| "Improved"
	| "Fixed"
	| "Deprecated"
	| "Removed"
	| "Security"
	| "Breaking";

interface Group {
	tag: TReleaseTag;
	items: string[];
}

export type TReleaseVersion = `${number}.${number}.${number}`;

export type TReleaseImage = { src: string; alt: string };

export interface TRelease {
	version: TReleaseVersion;
	date: string;
	highlight: boolean;
	image?: TReleaseImage;
	groups: Group[];
}

export type TReleaseInput = Omit<TRelease, "highlight"> & {
	highlight?: boolean;
};
