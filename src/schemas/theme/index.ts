import z from "zod";

export const UserThemeSchema = z
	.enum(["light", "dark", "oled", "system"])
	.catch("system");
export const AppThemeSchema = z.enum(["light", "dark", "oled"]).catch("light");
