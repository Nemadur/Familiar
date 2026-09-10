import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { OutlineReceipt } from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import { ProfileCharacters } from "@/components/layout/profile/feed/characters";
import { ProfilePortfolio } from "@/components/layout/profile/feed/portfolio";
import {
	hasArtistPortfolio,
	PortfolioUnavailable,
} from "@/components/layout/profile/feed/portfolio-unavailable";
import { ProfileFeed } from "@/components/layout/profile/feed/profile-feed";
import { TabContentSkeleton } from "@/components/layout/profile/profile";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { useProfileContent } from "@/hooks/user/use-profile-content";
import { useUserByUsername } from "@/hooks/user/use-user";
import type { TUserProfile } from "@/types/user";
import { DefaultProfileTabContent } from "../user.$username";

export const Route = createFileRoute("/{-$locale}/_main/user/$username/$tab")({
	component: RouteComponent,
});

function RouteComponent() {
	const { username, tab } = Route.useParams();
	const location = useLocation();
	const { user } = useUserByUsername(username);
	const isMobile = useIsMobile();

	const isFolderRoute = location.pathname.includes("/folder/");

	// Determine if we are currently viewing a post directly under the portfolio tab
	const pathParts = location.pathname.split("/").filter(Boolean);
	const isPostRoute =
		tab === "portfolio" && pathParts[pathParts.length - 2] === "portfolio";

	const isModal =
		(location.state as { isModal?: boolean } | undefined)?.isModal === true;

	/**
	 * The nested folder route renders its own ProfilePortfolio.
	 * Do not render the main portfolio underneath it.
	 * Also hide the portfolio grid if we are viewing a specific post page directly (not via modal), or on mobile.
	 */
	if (isFolderRoute || (isPostRoute && (!isModal || isMobile))) {
		return <Outlet />;
	}

	if (!user) {
		return <TabContentSkeleton tab={tab} />;
	}

	return (
		<>
			<UserFeedContent user={user as TUserProfile} tab={tab} />
			<Outlet />
		</>
	);
}

export function UserFeedContent({
	user,
	tab,
}: {
	user: TUserProfile;
	tab: string;
}) {
	const portfolioUnavailable = tab === "portfolio" && !hasArtistPortfolio(user);
	const {
		data: content,
		isPending,
		isError,
		error,
		isCurrentUser,
		createCatalog,
		isCreatingCatalog,
		createPost,
		isCreatingPost,
	} = useProfileContent(user.username, user.userId, tab, !portfolioUnavailable);

	if (portfolioUnavailable) {
		return <PortfolioUnavailable />;
	}

	if (isPending) {
		return <TabContentSkeleton tab={tab} />;
	}

	if (tab === "portfolio" && content?.hasPortfolio === false) {
		return <PortfolioUnavailable />;
	}

	if (isError) {
		return (
			<div className="flex min-h-64 flex-col items-center justify-center gap-2 p-6 text-center">
				<h2 className="font-semibold">Could not load profile content</h2>
				<p className="max-w-md text-sm text-muted-foreground">
					{error instanceof Error
						? error.message
						: "An unknown error occurred."}
				</p>
			</div>
		);
	}

	switch (tab) {
		case "commissions":
			return <DefaultProfileTabContent username={user.username} />;

		case "portfolio":
			return (
				<ProfilePortfolio
					posts={content?.portfolioPosts ?? []}
					folders={content?.folders ?? []}
					username={user.username}
					canManageCatalogs={isCurrentUser}
					canCreatePosts={isCurrentUser}
					onCreateCatalog={createCatalog}
					isCreatingCatalog={isCreatingCatalog}
					onCreatePost={createPost}
					isCreatingPost={isCreatingPost}
				/>
			);

		case "characters":
			return <ProfileCharacters characters={content?.characters ?? []} />;

		case "shop":
			return (
				<div className="flex h-full flex-1 flex-col items-center justify-center">
					<EmptyPage
						icon={OutlineReceipt}
						title="Shop"
						description="Shop feature is coming soon!"
					/>
				</div>
			);

		case "liked":
		case "saved":
			return <ProfileFeed posts={content?.feedPosts ?? []} variant="feed" />;

		default:
			return (
				<div className="p-4 text-center text-muted-foreground">
					Tab not found
				</div>
			);
	}
}
