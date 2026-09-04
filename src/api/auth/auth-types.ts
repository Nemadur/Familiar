export const AUTH_ROLES = ["CLIENT", "ARTIST", "MODERATOR", "ADMIN"] as const;

export const REGISTRATION_SOCIAL_PLATFORMS = [
	"twitter",
	"instagram",
	"facebook",
	"website_1",
	"website_2",
] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export type RegistrationSocialPlatform =
	(typeof REGISTRATION_SOCIAL_PLATFORMS)[number];

export type RegistrationSocials = Partial<
	Record<RegistrationSocialPlatform, string>
>;

export interface RegisterRequest {
	email: string;
	password: string;
	roleKey: AuthRole;
	inviteKey?: string;
	username?: string;
	displayName?: string;
	bio?: string;
	socials?: RegistrationSocials;
}

export interface RegisterAccountInput {
	request: RegisterRequest;
	avatar?: File | null;
	cover?: File | null;
}

export interface AuthUserInfo {
	id: string;
	aud: string | null;
	role: string | null;
	email: string | null;
	email_confirmed_at: string | null;
	phone: string | null;
	created_at: string;
	updated_at: string | null;
	last_sign_in_at: string | null;
}

export interface AuthResponse {
	access_token: string | null;
	token_type: string | null;
	expires_in: number | null;
	expires_at: number | null;
	refresh_token: string | null;
	user: AuthUserInfo;
}
