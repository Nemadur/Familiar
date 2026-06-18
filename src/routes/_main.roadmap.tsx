import { createFileRoute } from "@tanstack/react-router";
import { Roadmap } from "@/components/layout/roadmap";
import i18n from "@/lib/i18n";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_main/roadmap")({
	head: () => ({
		meta: seo({
			title: i18n.t("seo.roadmap.title", "Roadmap"),
			description: i18n.t(
				"seo.roadmap.description",
				"See what is coming next to Familiar.",
			),
		}),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return <Roadmap />;
}
