import { TimelinesReleaseNotes } from "@/components/layout/timelines-changelog";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_main/release-notes")({
	component: RouteComponent,
});

function RouteComponent() {
	return <TimelinesReleaseNotes />;
}
