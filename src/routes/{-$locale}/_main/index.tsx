import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { OutlineHome } from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import i18n from "@/lib/i18n";
import { getSeoLinks, seo } from "@/lib/seo";

export const Route = createFileRoute("/{-$locale}/_main/")({
	head: ({ params }) => ({
		meta: seo({
			title: i18n.t("seo.home.title"),
			description: i18n.t("seo.home.description"),
			image: `https://og-image.vercel.app/${encodeURIComponent(i18n.t(`seo.home.title`))}.png`,
			pathname: "/",
			locale: params.locale,
		}),
		links: getSeoLinks("/", params.locale),
	}),
	component: App,
});

function App() {
	const { t } = useTranslation();

	return (
		<EmptyPage
			icon={OutlineHome}
			title={t("pages.home.title")}
			description={t("pages.home.description")}
		/>
	);
}
