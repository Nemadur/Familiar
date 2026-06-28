import i18n, { languages } from "@/lib/i18n";
import type { Meta } from "@/types/seo";

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

const seo = ({ title, description, keywords, image, url }: Meta) => {
	const defaults = getMetaDefaults();
	// TODO: do we need  | Familiar?
	// FIXME: on hover, it show Familiar Work
	const mergedTitle =
		title === defaults.title ? title : `${title} | ${defaults.title}`; // | ${defaults.title}
	const mergedImage = image || defaults.image;

	const currentLang = i18n.language || "en";
	const resolvedDescription = description || defaults.description;
	const resolvedKeywords = keywords || defaults.keywords;

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
		...(url
			? [
					{ property: "og:url", content: url },
					{ name: "twitter:url", content: url },
				]
			: []),
	];

	return tags;
};

export { seo };
