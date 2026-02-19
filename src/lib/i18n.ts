import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start-server";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import type { Locale } from "@/types/i18n";

// Dynamically import all ts files from the i18n directory
const localeModules = import.meta.glob<Locale>("../i18n/*.ts", {
	eager: true,
	import: "default",
});

export const languages: {
	value: string;
	label: string;
	flag: string;
	currency: Locale["meta"]["currency"];
}[] = [];

const resources: Record<string, { translation: Locale }> = {};
const currencyMap = new Map<string, Locale["meta"]["currency"]>();

for (const path in localeModules) {
	// Extract locale code from filename (e.g., "en" from "../i18n/en.ts")
	const locale = path.match(/([a-z]{2})\.ts$/)?.[1];
	const content = localeModules[path];

	if (locale && content) {
		resources[locale] = { translation: content };
		languages.push({ value: locale, ...content.meta });

		if (content.meta.currency) {
			currencyMap.set(content.meta.currency.value, content.meta.currency);
		}
	}
}

export const currencies = Array.from(currencyMap.values());

export const i18nCookieName = "familiar-langauge";

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: "en",
		supportedLngs: languages.map((language) => language.value),
		detection: {
			order: ["cookie"],
			lookupCookie: i18nCookieName,
			caches: ["cookie"],
			cookieMinutes: 60 * 25 * 365, // 25 years
		},
		interpolation: { escapeValue: false },
	});

export const setSSRLanguage = createIsomorphicFn()
	.client(async () => {
		// Client-side language detection is handled by i18next-browser-languagedetector
	})
	.server(async () => {
		const language = getCookie(i18nCookieName);
		await i18n.changeLanguage(language || "en");
	});

export default i18n;
