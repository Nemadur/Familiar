import z from "zod";

export const UserThemeSchema = z
	.enum(["light", "dark", "system"])
	.catch("system");
export const AppThemeSchema = z.enum(["light", "dark"]).catch("light");
