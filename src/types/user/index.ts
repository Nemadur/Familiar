export interface User {
	uuid: string;
	username: string;
	display_name: string;
	bio?: string | null;
	media: {
		avatar?: string | null;
		cover?: string | null;
	};
	accent_color: string;
	banned_until?: Date | null;
	is_premium: boolean;
	is_verified: boolean;
	created_at: Date;
	badges?: Badges[] | null;
	social_links?: SocialLinks[] | null;
	timezone?: string | null;
	spoken_languages?: SpokenLanguage[] | null;
	tos?: {
		summary: string;
	} | null;
	roles: string[];
	pronouns?: string | null;
}

export interface SpokenLanguage {
	locale: string;
	experience: "native" | "fluent" | "communicative" | "learning";
}

export interface Badges {
	uuid: string;
	label: string;
	description?: string | null;
	color: string;
}

export interface SocialLinks {
	label: string;
	url: string;
}
