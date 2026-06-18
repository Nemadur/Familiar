export type TReleaseTag =
	| "Added"
	| "Improved"
	| "Fixed"
	| "Deprecated"
	| "Removed"
	| "Security"
	| "Breaking";

export type TReleaseVersion = `${number}.${number}.${number}`;

export type TReleaseImage = {
	src: string;
	alt?: string;
	altKey?: string;
};

export interface TRelease {
	version: TReleaseVersion;
	date: string;
	highlight: boolean;
	image?: TReleaseImage;
	groups: TReleaseTag[];
}

export type TReleaseInput = Omit<TRelease, "highlight"> & {
	highlight?: boolean;
};
