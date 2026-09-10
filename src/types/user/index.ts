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

export type UserSocial = {
	platform: string;
	value: string;
};

export type UserSocials = UserSocial[];

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
	pronouns: string | null;
	bio: string | null;
	avatarPath: string | null;
	coverPath: string | null;
	accentColor: string | null;
	isVerified: boolean;
	isPremium: boolean;
	roles: TRoles[];
	socials: UserSocials;
	createdAt: string;
};

export type TUserProfile = TUserResponse;

export type UserIdentity = Pick<TUserResponse, "displayName" | "username"> &
	Partial<Pick<TUserResponse, "accentColor" | "avatarPath" | "userId">>;

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

// 	spoken_languages: SpokenLanguage[];
// 	badges: UserBadge[];

// 	roles: string[];
// 	// no longer in schema (kept for older UI)
// 	tos: null;
// };

export type { Badge, UserBadge, UUID };
