import type { Badge, UserBadge, UUID } from "./badge";
import type { TRoles } from "./roles";

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

export type TUserResponse = {
	userId: string;
	username: string;
	displayName: string;
	pronouns?: string | null;
	bio?: string | null;
	avatarPath?: string | null;
	// coverPath?: string | null;
	accentColor?: string | null;
	isVerified?: boolean;
	isPremium?: boolean;
	// isPrivate?: boolean;
	createdAt: string;
	roles: TRoles[];
};

export type TUserProfile = TUserResponse & {
	badges?: UserBadge[];
	timezone?: string | null;
	stats: UserStats;
	spokenLanguages?: SpokenLanguage[];
	socialLinks?: SocialLink[];
};

export type UserStats = {
	followersCount: number;
	followingCount: number;
	worksCount: number;
	commissionsCount: number;
	charactersCount: number;
};

// export type User = {
// 	uuid: UUID;
// 	username: string;
// 	display_name: string;
// 	bio: string | null;
// 	media: UserMedia;
// 	accent_color: string | null;
// 	is_premium: boolean;
// 	is_verified: boolean;
// 	is_private: boolean;
// 	ban: UserBan | null;
// 	banned_until: Date | null; // kept for backward-compat (temp ban only)
// 	created_at: Date;
// 	timezone: string | null;
// 	pronouns: string | null;

// 	followers_count: number;
// 	following_count: number;
// 	works_count: number;
// 	commissions_count: number;
// 	characters_count: number;

// 	social_links: SocialLink[];
// 	spoken_languages: SpokenLanguage[];
// 	badges: UserBadge[];

// 	roles: string[];
// 	// no longer in schema (kept for older UI)
// 	tos: null;
// };

export type { Badge, UserBadge, UUID };
