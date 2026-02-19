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
	is_premium?: boolean | null;
	is_verified?: boolean | null;
	created_at: Date;
	badges?: Badges[] | null;
	social_links?: SocialLinks[] | null;
	timezone?: string | null;
	spoken_languages?: string[] | null;
	tos?: {
		summary: string;
	} | null;
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
