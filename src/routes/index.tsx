import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { OutlineHome } from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";

export const Route = createFileRoute("/")({
	component: App,
	staticData: {
		title: "Home",
		description: "Welcome to Familiar - Your art station",
		image: "/logo512.png",
	},
});

function App() {
	const { t } = useTranslation();

	return <EmptyPage icon={OutlineHome} title={t("pages.home.title")} />;
}
