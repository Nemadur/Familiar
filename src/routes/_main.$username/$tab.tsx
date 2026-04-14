import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { TabContentSkeleton } from "@/components/layout/profile/profile";
import { useUserByUsername } from "@/hooks/use-user";
import type { TUserProfile } from "@/types/user";
import { DefaultProfileTabContent } from "@/routes/_main.$username";
import { ProfilePortfolio } from "@/components/layout/profile/feed/portfolio";
import { ProfileCharacters } from "@/components/layout/profile/feed/characters";
import { ProfileFeed } from "@/components/layout/profile/feed";
import { useProfileContent } from "@/hooks/use-profile-content";
import { EmptyPage } from "@/components/layout/empty-page";
import { OutlineReceipt } from "@/components/icons/icons";

export const Route = createFileRoute("/_main/$username/$tab")({
	component: RouteComponent,
});

function UserFeedContent({ user, tab }: { user: TUserProfile; tab: string }) {
	const { data: content, isPending } = useProfileContent(user.userId, tab);

	if (isPending) {
		return <TabContentSkeleton tab={tab} />;
	}

	switch (tab) {
		case "commissions":
			return <DefaultProfileTabContent username={user.username} />;
		case "portfolio":
			return (
				<ProfilePortfolio
					posts={content?.posts || []}
					folders={content?.folders || []}
				/>
			);
		case "characters":
			return <ProfileCharacters characters={content?.characters || []} />;
		case "shop":
			return (
				<EmptyPage
					icon={OutlineReceipt}
					title="Shop"
					description="Shop feature is coming soon!"
				/>
			);
		case "liked":
		case "saved":
			return <ProfileFeed posts={content?.posts || []} variant="feed" />;
		default:
			return (
				<div className="p-4 text-center text-muted-foreground">
					Tab not found
				</div>
			);
	}
}

function RouteComponent() {
	const { username, tab } = Route.useParams();
	const { user } = useUserByUsername(username);
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
					user && <UserFeedContent user={user as TUserProfile} tab={tab} />
				))}
			<Outlet />
		</>
	);
}
