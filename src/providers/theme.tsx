import { ScriptOnce } from "@tanstack/react-router";
import { createClientOnlyFn, createIsomorphicFn } from "@tanstack/react-start";
import { createContext, use, useEffect, useState } from "react";
import { UserThemeSchema } from "@/schemas/theme";
import type {
	AppTheme,
	ThemeContextProps,
	ThemeProviderProps,
	UserTheme,
} from "@/types/theme";

const themeStorageKey = "familiar-theme";

const getStoredUserTheme = createIsomorphicFn()
	.server((): UserTheme => "system")
	.client((): UserTheme => {
		const stored = localStorage.getItem(themeStorageKey);
		return UserThemeSchema.parse(stored);
	});

const setStoredTheme = createClientOnlyFn((theme: UserTheme) => {
	const validatedTheme = UserThemeSchema.parse(theme);
	localStorage.setItem(themeStorageKey, validatedTheme);
});

const getSystemTheme = createIsomorphicFn()
	.server((): AppTheme => "light")
	.client((): AppTheme => {
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	});

/**
 *
 */
const handleThemeChange = createClientOnlyFn((userTheme: UserTheme) => {
	const validatedTheme = UserThemeSchema.parse(userTheme);

	const root = document.documentElement;
	root.classList.remove("light", "dark", "oled", "system");

	if (validatedTheme === "system") {
		const systemTheme = getSystemTheme();
		root.classList.add(systemTheme, "system");
	} else if (validatedTheme === "oled") {
		root.classList.add("dark", "oled");
	} else {
		root.classList.add(validatedTheme);
	}
});

/**
 * Set up a listener to handle changes in the system theme preference.
 * When the system theme changes, update the user theme to "system".
 */
const setupPreferredListener = createClientOnlyFn(() => {
	const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
	const handler = () => handleThemeChange("system");
	mediaQuery.addEventListener("change", handler);
	return () => mediaQuery.removeEventListener("change", handler);
});

const themeScript = (() => {
	function themeFn() {
		try {
			const storedTheme = localStorage.getItem("familiar-theme") || "system";
			const validTheme = ["light", "dark", "oled", "system"].includes(
				storedTheme,
			)
				? storedTheme
				: "system";

			if (validTheme === "system") {
				const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
					.matches
					? "dark"
					: "light";
				document.documentElement.classList.add(systemTheme, "system");
			} else if (validTheme === "oled") {
				document.documentElement.classList.add("dark", "oled");
			} else {
				document.documentElement.classList.add(validTheme);
			}
		} catch {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
				.matches
				? "dark"
				: "light";
			document.documentElement.classList.add(systemTheme, "system");
		}
	}
	return `(${themeFn.toString()})();`;
})();

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: ThemeProviderProps) {
	const [userTheme, setUserTheme] = useState<UserTheme>(getStoredUserTheme);

	useEffect(() => {
		// Ensure theme is correctly applied on mount
		handleThemeChange(userTheme);

		if (userTheme !== "system") return;
		return setupPreferredListener();
	}, [userTheme]);

	const appTheme = userTheme === "system" ? getSystemTheme() : userTheme;

	const setTheme = (newUserTheme: UserTheme) => {
		const validatedTheme = UserThemeSchema.parse(newUserTheme);
		setUserTheme(validatedTheme);
		setStoredTheme(validatedTheme);
		handleThemeChange(validatedTheme);
	};

	return (
		<ThemeContext value={{ userTheme, appTheme, setTheme }}>
			<ScriptOnce>{themeScript}</ScriptOnce>
			{children}
		</ThemeContext>
	);
}

export const useTheme = () => {
	const context = use(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};
