import { createFileRoute } from "@tanstack/react-router";
import { Roadmap } from "@/components/layout/roadmap";
import i18n from "@/lib/i18n";
import { getSeoLinks, seo } from "@/lib/seo";

export const Route = createFileRoute("/{-$locale}/_main/roadmap")({
	head: ({ params }) => ({
		meta: seo({
			title: i18n.t("seo.roadmap.title", "Roadmap"),
			description: i18n.t(
				"seo.roadmap.description",
				"See what is coming next to Familiar.",
			),
			pathname: "/roadmap",
			locale: params.locale,
		}),
		links: getSeoLinks("/roadmap", params.locale),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return <Roadmap />;
}
