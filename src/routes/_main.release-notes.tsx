import { TimelinesReleaseNotes } from "@/components/layout/timelines-changelog";
import i18n from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/release-notes")({
	head: () => ({
		meta: seo({
			title: i18n.t("seo.release-notes.title", "Release Notes"),
			description: i18n.t(
				"seo.release-notes.description",
				"View the latest release notes for Familiar",
			),
		}),
	}),
	component: RouteComponent,
});

function RouteComponent() {
	return <TimelinesReleaseNotes />;
}
