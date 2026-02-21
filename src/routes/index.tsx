import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { OutlineHome } from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import i18n from "@/lib/i18n";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
	head: () => ({
		meta: seo({
			title: i18n.t("seo.home.title"),
			description: i18n.t("seo.home.description"),
			image: `https://og-image.vercel.app/${encodeURIComponent(i18n.t("seo.home.title"))}.png`,
		}),
	}),
	component: App,
});

function App() {
	const { t } = useTranslation();

	return <EmptyPage icon={OutlineHome} title={t("pages.home.title")} />;
}
