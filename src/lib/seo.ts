import i18n, { languages } from "@/lib/i18n";
import type { Meta } from "@/types/seo";

export const getMetaDefaults = (): Meta => ({
	title: i18n.t("seo.defaults.title"),
	description: i18n.t("seo.defaults.description", {
		defaultValue: "Your art station",
	}),
	keywords: i18n.t("seo.defaults.keywords", {
		defaultValue: "art, familiar, commission",
	}),
	image: `https://og-image.vercel.app/${encodeURIComponent(i18n.t("seo.defaults.title"))}.png`,
});

const seo = ({ title, description, keywords, image, url }: Meta) => {
	const defaults = getMetaDefaults();
	const mergedTitle =
		title === defaults.title ? title : `${title} | ${defaults.title}`;
	const mergedImage = image || defaults.image;

	const currentLang = i18n.language || "en";

	const tags = [
		{ title: mergedTitle },
		{ name: "description", content: description || defaults.description },
		{ name: "keywords", content: keywords || defaults.keywords },
		{ name: "twitter:title", content: mergedTitle },
		{
			name: "twitter:description",
			content: description || defaults.description,
		},
		{ name: "twitter:creator", content: "@" },
		{ name: "twitter:site", content: "@" },
		{ property: "og:type", content: "website" },
		{ property: "og:title", content: mergedTitle },
		{
			property: "og:description",
			content: description || defaults.description,
		},
		{ property: "og:locale", content: currentLang },
		...languages
			.filter((lang) => lang.value !== currentLang)
			.map((lang) => ({
				property: "og:locale:alternate",
				content: lang.value,
			})),
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
