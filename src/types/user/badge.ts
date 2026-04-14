export type UUID = string;

export type Badge = {
	uuid: string; // maps from `badge_id` (text)
	label: string;
	description: string;
	color: string;
	icon: string | null;
};

export type UserBadge = Badge & {
	awarded_at?: Date;
};
