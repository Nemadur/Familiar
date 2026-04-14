import z from "zod";
import { accountTypes } from "@/types/auth/schema/accounts";
import { email } from ".";

const password = z
	.string()
	.min(8, "Password must be at least 8 characters.")
	.regex(/[a-z]/, "Password must contain at least one lowercase letter.")
	.regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
	.regex(/[0-9]/, "Password must contain at least one number.")
	.regex(
		/[!@#$%^&*(),.?":{}|<>]/,
		"Password must contain at least one special character.",
	);

const displayName = z
	.string()
	.min(2, "Display name must be at least 2 characters.")
	.max(50, "Display name must be less than 50 characters.");

const username = z
	.string()
	.min(3, "Username must be at least 3 characters.")
	.max(30, "Username must be less than 30 characters.")
	.regex(
		/^[a-zA-Z0-9_]+$/,
		"Username can only contain letters, numbers, and underscores",
	);

const inviteKey = z
	.string()
	.regex(/^FAM-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{3}$/, "Invalid invite key.")
	.or(z.literal(""));

const bio = z
	.string()
	.max(160, "Bio must be less than 160 characters.")
	.optional();

const socialLink = z.object({
	platform: z.string(),
	url: z.union([z.literal(""), z.string().trim().url("Invalid URL")]),
});

const socials = z.array(socialLink).optional();

const registerBase = z.object({
	account_type: accountTypes,
	email: email,
	password: password,
	display_name: displayName,
	username: username,
	invite_key: inviteKey,
	avatar_url: z.string().optional(),
	cover_url: z.string().optional(),
	bio: bio,
	socials: socials,
});

const register = registerBase.superRefine((data, ctx) => {
	if (data.account_type === "artist" && !data.invite_key) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Invite key is required for artists.",
			path: ["invite_key"],
		});
	}
});

const registerStep0 = z.object({
	account_type: accountTypes,
	email: email,
});

const registerStep1 = z.object({
	password: password,
	invite_key: inviteKey,
});

const registerStep2 = z.object({
	username: username,
	display_name: displayName,
	avatar_url: z.string().optional(),
	cover_url: z.string().optional(),
});

const registerStep3 = z.object({
	bio: bio,
});

const registerStep4 = z.object({
	socials: socials,
});

export {
	register,
	registerStep0,
	registerStep1,
	registerStep2,
	registerStep3,
	registerStep4,
};
