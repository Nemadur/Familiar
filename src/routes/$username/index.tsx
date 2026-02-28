import { createFileRoute } from "@tanstack/react-router";
import { OutlineUser } from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import { UserFeedContent } from "@/components/layout/profile/feed-content";
import { useAvailableFeeds } from "@/hooks/use-available-feeds";
import { useSuspenseUser } from "@/hooks/use-user";
import { useAuth } from "@/providers/auth";

export const Route = createFileRoute("/$username/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { username } = Route.useParams();
	const { data: user } = useSuspenseUser(username);
	const { user: me } = useAuth();

	if (!user) {
		return (
			<div className="flex h-full flex-1 flex-col items-center justify-center">
				<EmptyPage icon={OutlineUser} title="User not found" />
			</div>
		);
	}

	const isMe = me?.username === user.username;

	const availableFeeds = useAvailableFeeds(user, isMe);

	if (availableFeeds.length === 0) {
		return (
			<div className="flex h-full flex-1 flex-col items-center justify-center">
				<EmptyPage
					icon={OutlineUser}
					title="No content yet"
					description="This user hasn't posted anything yet."
				/>
			</div>
		);
	}

	const defaultTab = availableFeeds[0].id;

	return <UserFeedContent user={user!} tab={defaultTab} isMe={isMe} />;
}
