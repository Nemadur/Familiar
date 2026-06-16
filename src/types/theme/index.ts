import type { ReactNode } from "react";
import type z from "zod";
import type { AppThemeSchema, UserThemeSchema } from "@/schemas/theme";

type UserTheme = z.infer<typeof UserThemeSchema>;
type AppTheme = z.infer<typeof AppThemeSchema>;

type ThemeContextProps = {
	userTheme: UserTheme;
	appTheme: AppTheme;
	setTheme: (theme: UserTheme) => void;
	isDark: boolean;
};

type ThemeProviderProps = {
	children: ReactNode;
};

export type { ThemeContextProps, ThemeProviderProps, UserTheme, AppTheme };
