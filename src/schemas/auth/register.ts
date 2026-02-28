import { accountTypes } from "@/types/auth/schema/accounts";
import z from "zod";
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
	.regex(/^FAM-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{3}$/, "Invalid invite key.")
	.or(z.literal(""));

const registerBase = z.object({
	account_type: accountTypes,
	email: email,
	password: password,
	display_name: displayName,
	username: username,
	invite_key: inviteKey,
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
	display_name: displayName,
	username: username,
	password: password,
	invite_key: inviteKey,
});

export { register, registerStep0, registerStep1 };
