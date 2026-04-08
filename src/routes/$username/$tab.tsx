import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Suspense } from "react";
import { UserFeedContent } from "@/components/layout/profile/feed-content";
import { TabContentSkeleton } from "@/components/layout/profile/profile";
import { useUserByUsername } from "@/hooks/use-user";
import { useAuth } from "@/providers/auth";

export const Route = createFileRoute("/$username/$tab")({
	component: RouteComponent,
});

function RouteComponent() {
	const { username, tab } = Route.useParams();
	const { user } = useUserByUsername(username);
	const { user: me } = useAuth();
	const isMe = me?.username === user?.username;
	const location = useLocation();

	const isFolderRoute = location.pathname.includes("/folder/");
	const isDebugLoading =
		new URLSearchParams(location.searchStr).get("loading") === "true";

	return (
		<>
			{!isFolderRoute &&
				(isDebugLoading ? (
					<TabContentSkeleton tab={tab} />
				) : (
					<Suspense fallback={<TabContentSkeleton tab={tab} />}>
						<UserFeedContent user={user} tab={tab} isMe={isMe} />
					</Suspense>
				))}
			<Outlet />
		</>
	);
}
