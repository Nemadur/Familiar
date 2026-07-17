import i18n, {
	defaultLocale,
	getCurrentLocale,
	languages,
	localizePath,
	resolveLocale,
} from "@/lib/i18n";
import type { Meta } from "@/types/seo";

const siteUrl =
	(import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "") ||
	"https://www.familiar.art";

export const getMetaDefaults = (): Meta => ({
	title: i18n.t("seo.defaults.title"),
	description: i18n.t("seo.defaults.description", {
		defaultValue: i18n.t("seo.defaults.description"),
	}),
	keywords: i18n.t("seo.defaults.keywords", {
		defaultValue: i18n.t("seo.defaults.keywords"),
	}),
	image: `https://og-image.vercel.app/${encodeURIComponent(i18n.t("seo.defaults.title"))}.png`,
});

export function getLocalizedUrl(pathname: string, locale?: string) {
	return `${siteUrl}${localizePath(pathname, locale)}`;
}

export function getSeoLinks(pathname: string, locale?: string) {
	const resolvedLocale = resolveLocale(locale);

	return [
		{
			rel: "canonical" as const,
			href: getLocalizedUrl(pathname, resolvedLocale),
		},
		...languages.map((language) => ({
			rel: "alternate" as const,
			hrefLang: language.value === defaultLocale ? "x-default" : language.value,
			href: getLocalizedUrl(pathname, language.value),
		})),
	];
}

function getAlternateLocaleTags(currentLang: string) {
	const tags: Array<{ property: "og:locale:alternate"; content: string }> = [];

	for (const lang of languages) {
		if (lang.value === currentLang) {
			continue;
		}

		tags.push({
			property: "og:locale:alternate",
			content: lang.value,
		});
	}

	return tags;
}

const seo = ({
	title,
	description,
	keywords,
	image,
	url,
	pathname,
	locale,
}: Meta) => {
	const defaults = getMetaDefaults();
	// TODO: do we need  | Familiar?
	// FIXME: on hover, it show Familiar Work
	const mergedTitle =
		title === defaults.title ? title : `${title} | ${defaults.title}`; // | ${defaults.title}
	const mergedImage = image || defaults.image;

	const currentLang = resolveLocale(locale || getCurrentLocale());
	const resolvedDescription = description || defaults.description;
	const resolvedKeywords = keywords || defaults.keywords;
	const resolvedUrl =
		url || (pathname ? getLocalizedUrl(pathname, currentLang) : undefined);

	const tags = [
		{ title: mergedTitle },
		{ name: "description", content: resolvedDescription },
		{ name: "keywords", content: resolvedKeywords },
		{ name: "twitter:title", content: mergedTitle },
		{
			name: "twitter:description",
			content: resolvedDescription,
		},
		{ name: "twitter:creator", content: "@" },
		{ name: "twitter:site", content: "@" },
		{ property: "og:type", content: "website" },
		{ property: "og:title", content: mergedTitle },
		{
			property: "og:description",
			content: resolvedDescription,
		},
		{ property: "og:locale", content: currentLang },
		...getAlternateLocaleTags(currentLang),
		...(mergedImage
			? [
					{ name: "twitter:image", content: mergedImage },
					{ name: "twitter:card", content: "summary_large_image" },
					{ property: "og:image", content: mergedImage },
				]
			: []),
		...(resolvedUrl
			? [
					{ property: "og:url", content: resolvedUrl },
					{ name: "twitter:url", content: resolvedUrl },
				]
			: []),
	];

	return tags;
};

export { seo };
