import { createFileRoute } from "@tanstack/react-router";
import { TimelinesReleaseNotes } from "@/components/layout/timelines-changelog";
import i18n from "@/lib/i18n";
import { getSeoLinks, seo } from "@/lib/seo";

export const Route = createFileRoute("/{-$locale}/_main/release-notes")({
	head: ({ params }) => ({
		meta: seo({
			title: i18n.t("seo.release-notes.title", "Release Notes"),
			description: i18n.t(
				"seo.release-notes.description",
				"View the latest release notes for Familiar",
			),
			pathname: "/release-notes",
			locale: params.locale,
		}),
		links: getSeoLinks("/release-notes", params.locale),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return <TimelinesReleaseNotes />;
}
