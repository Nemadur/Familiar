import type { Badge, UserBadge, UUID } from "./badge";

export type SpokenLanguageExperience =
	| "native"
	| "fluent"
	| "communicative"
	| "learning"
	| "basic";

export type SpokenLanguage = {
	locale: string;
	experience: SpokenLanguageExperience;
};

export type SocialLink = {
	label: string;
	url: string;
};

export type UserMedia = {
	avatar: string | null;
	cover: string | null;
};

export type UserBan =
	| {
			type: "temp";
			until: Date; // expires_at
			reason?: string;
	  }
	| {
			type: "perm";
			until: null;
			reason?: string;
	  };

export type User = {
	uuid: UUID;
	username: string;
	display_name: string;
	bio: string | null;
	media: UserMedia;
	accent_color: string | null;
	is_premium: boolean;
	is_verified: boolean;
	is_private: boolean;
	ban: UserBan | null;
	banned_until: Date | null; // kept for backward-compat (temp ban only)
	created_at: Date;
	timezone: string | null;
	pronouns: string | null;

	followers_count: number;
	following_count: number;
	works_count: number;
	commissions_count: number;
	characters_count: number;

	social_links: SocialLink[];
	spoken_languages: SpokenLanguage[];
	badges: UserBadge[];

	roles: string[];
	// no longer in schema (kept for older UI)
	tos: null;
};

export type UserSummary = Pick<
	User,
	| "uuid"
	| "username"
	| "display_name"
	| "media"
	| "is_verified"
	| "is_premium"
	| "accent_color"
	| "badges"
>;

export type UserPublicProfile = Pick<
	User,
	| "uuid"
	| "username"
	| "display_name"
	| "bio"
	| "media"
	| "accent_color"
	| "is_premium"
	| "is_verified"
	| "created_at"
	| "timezone"
	| "pronouns"
	| "social_links"
	| "spoken_languages"
	| "badges"
	| "roles"
>;

export type { Badge, UserBadge, UUID };
