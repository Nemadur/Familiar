import z from "zod";

import { REGISTRATION_SOCIAL_PLATFORMS } from "@/api/auth/auth-types";
import { accountTypes } from "@/types/auth/schema/accounts";
import { email } from ".";

const password = z.string().min(6, "Password must be at least 6 characters.");

// .regex(
//     /[a-z]/,
//     "Password must contain at least one lowercase letter.",
// )
// .regex(
//     /[A-Z]/,
//     "Password must contain at least one uppercase letter.",
// )
// .regex(
//     /[0-9]/,
//     "Password must contain at least one number.",
// )
// .regex(
//     /[!@#$%^&*(),.?":{}|<>]/,
//     "Password must contain at least one special character.",
// );

const inviteKey = z
	.string()
	.regex(/^FAM-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{3}$/, "Invalid invite key.")
	.or(z.literal(""));

const username = z
	.string()
	.trim()
	.refine(
		(value) => value.length === 0 || /^[a-zA-Z0-9_]{3,32}$/.test(value),
		"Username must be 3-32 characters and contain only letters, numbers, and underscores.",
	);

const displayName = z
	.string()
	.trim()
	.max(100, "Display name must be at most 100 characters.");

const bio = z.string().trim().max(150, "Bio must be at most 150 characters.");

const socialValue = z.string().trim().min(1, "Social link is required.");

const socials = z
	.record(z.string(), socialValue)
	.refine(
		(value) =>
			Object.keys(value).every((platform) =>
				REGISTRATION_SOCIAL_PLATFORMS.includes(
					platform as (typeof REGISTRATION_SOCIAL_PLATFORMS)[number],
				),
			),
		{ message: "Unsupported social platform." },
	)
	.default({});

const imageFile = z
	.custom<File>(
		(value) => typeof File !== "undefined" && value instanceof File,
		"Please select a valid image file.",
	)
	.nullable()
	.optional();

const registerBase = z.object({
	account_type: accountTypes,
	email,
	password,
	invite_key: inviteKey,
	username,
	display_name: displayName,
	bio,
	socials,
	avatar: imageFile,
	cover: imageFile,
});

const register = registerBase.superRefine((data, ctx) => {
	if (!data.invite_key) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Invite key is required.",
			path: ["invite_key"],
		});
	}
});

export { register };

export type RegisterData = z.infer<typeof register>;
