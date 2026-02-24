import { createFileRoute } from "@tanstack/react-router";
import { UserFeedContent } from "@/components/layout/profile/feed-content";
import { useSuspenseUser } from "@/hooks/use-user";
import { useAuth } from "@/providers/auth";

export const Route = createFileRoute("/$username/$tab/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { username, tab } = Route.useParams();
	const { data: user } = useSuspenseUser(username);
	const { user: me } = useAuth();
	const isMe = me?.username === user?.username;

	// TODO: Verify if tab is valid/available?
	// If invalid, maybe redirect to default or show 404?
	// For now, assume it's valid or render empty if no content matches.

	return <UserFeedContent user={user!} tab={tab} isMe={isMe} />;
}
