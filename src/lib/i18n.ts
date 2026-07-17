import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start-server";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { setCookie } from "@/lib/utils";
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
export const defaultLocale = "en";
const i18nCookieMaxAgeSeconds = 60 * 60 * 24 * 365 * 25;

export function normalizeLocale(locale?: string | null) {
	if (!locale) return undefined;

	return locale.toLowerCase().split("-")[0];
}

export function isSupportedLocale(locale?: string | null) {
	const normalizedLocale = normalizeLocale(locale);

	if (!normalizedLocale) {
		return false;
	}

	return languages.some((language) => language.value === normalizedLocale);
}

export function resolveLocale(locale?: string | null) {
	const normalizedLocale = normalizeLocale(locale);

	if (normalizedLocale && isSupportedLocale(normalizedLocale)) {
		return normalizedLocale;
	}

	return defaultLocale;
}

export function getLocaleParam(locale?: string | null) {
	const resolvedLocale = resolveLocale(locale);
	return resolvedLocale === defaultLocale ? undefined : resolvedLocale;
}

export function detectLocaleFromPathOrParams(
	params?: { locale?: string | null },
	pathname?: string,
) {
	let localeToSet = params?.locale ?? null;
	if (!localeToSet && pathname) {
		const firstSegment = pathname.split("/")[1];
		if (firstSegment && isSupportedLocale(firstSegment)) {
			localeToSet = firstSegment;
		}
	}
	return localeToSet;
}

const isBrowser = typeof window !== "undefined";
const initialLocale = isBrowser
	? resolveLocale(detectLocaleFromPathOrParams({}, window.location.pathname))
	: undefined;

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		fallbackLng: defaultLocale,
		lng: initialLocale, // Force initial language from URL on client to prevent hydration mismatch
		supportedLngs: languages.map((language) => language.value),
		detection: {
			order: ["cookie"],
			lookupCookie: i18nCookieName,
			caches: ["cookie"],
			cookieMinutes: 60 * 25 * 365, // 25 years
		},
		interpolation: { escapeValue: false },
	});

export function stripLocaleFromPathname(pathname: string) {
	const normalizedPathname = pathname.startsWith("/")
		? pathname
		: `/${pathname}`;
	const sortedLocales = languages
		.map((language) => language.value)
		.sort((left, right) => right.length - left.length);

	for (const locale of sortedLocales) {
		if (normalizedPathname === `/${locale}`) {
			return "/";
		}

		if (normalizedPathname.startsWith(`/${locale}/`)) {
			return normalizedPathname.slice(locale.length + 1) || "/";
		}
	}

	return normalizedPathname || "/";
}

export function localizePath(pathname: string, locale?: string | null) {
	const basePathname = stripLocaleFromPathname(pathname);
	const localeParam = getLocaleParam(locale);

	if (!localeParam) {
		return basePathname;
	}

	if (basePathname === "/") {
		return `/${localeParam}`;
	}

	return `/${localeParam}${basePathname}`;
}

export function getCurrentLocale() {
	return resolveLocale(i18n.resolvedLanguage || i18n.language);
}

export async function syncLanguage(locale?: string | null) {
	const resolvedLocale = resolveLocale(locale);

	if (i18n.language !== resolvedLocale) {
		await i18n.changeLanguage(resolvedLocale);
	}

	setCookie(i18nCookieName, resolvedLocale, i18nCookieMaxAgeSeconds);

	return resolvedLocale;
}

export const setSSRLanguage = createIsomorphicFn()
	.client(async (locale?: string | null) => {
		if (locale === undefined) {
			return getCurrentLocale();
		}

		return syncLanguage(locale);
	})
	.server(async (locale?: string | null) => {
		const language = locale === undefined ? getCookie(i18nCookieName) : locale;
		const resolvedLocale = resolveLocale(language);
		await i18n.changeLanguage(resolvedLocale);
		return resolvedLocale;
	});

export default i18n;
