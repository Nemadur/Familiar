import {
	createFileRoute,
	Outlet,
	useLocation,
} from "@tanstack/react-router";
import { OutlineReceipt } from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import { ProfileCharacters } from "@/components/layout/profile/feed/characters";
import { ProfilePortfolio } from "@/components/layout/profile/feed/portfolio";
import { ProfileFeed } from "@/components/layout/profile/feed/profile-feed";
import { TabContentSkeleton } from "@/components/layout/profile/profile";
import { useProfileContent } from "@/hooks/user/use-profile-content";
import { useUserByUsername } from "@/hooks/user/use-user";
import type { TUserProfile } from "@/types/user";
import { DefaultProfileTabContent } from "../user.$username";

export const Route = createFileRoute(
	"/{-$locale}/_main/user/$username/$tab",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { username, tab } = Route.useParams();
	const location = useLocation();
	const { user } = useUserByUsername(username);

	const isFolderRoute =
		location.pathname.includes("/folder/");

	/*
	 * The nested folder route renders its own ProfilePortfolio.
	 * Do not render the main portfolio underneath it.
	 */
	if (isFolderRoute) {
		return <Outlet />;
	}

	if (!user) {
		return <TabContentSkeleton tab={tab} />;
	}

	return (
		<>
			<UserFeedContent
				user={user as TUserProfile}
				tab={tab}
			/>

			<Outlet />
		</>
	);
}

function UserFeedContent({
	user,
	tab,
}: {
	user: TUserProfile;
	tab: string;
}) {
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
	} = useProfileContent(
		user.username,
		user.userId,
		tab,
	);

	if (isPending) {
		return <TabContentSkeleton tab={tab} />;
	}

	if (isError) {
		return (
			<div className="flex min-h-64 flex-col items-center justify-center gap-2 p-6 text-center">
				<h2 className="font-semibold">
					Could not load profile content
				</h2>

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
			return (
				<DefaultProfileTabContent
					username={user.username}
				/>
			);

		case "portfolio":
			return (
				<ProfilePortfolio
					posts={
						content?.portfolioPosts ?? []
					}
					folders={content?.folders ?? []}
					username={user.username}
					canManageCatalogs={isCurrentUser}
					onCreateCatalog={createCatalog}
					isCreatingCatalog={
						isCreatingCatalog
					}
					onCreatePost={createPost}
					isCreatingPost={isCreatingPost}
				/>
			);

		case "characters":
			return (
				<ProfileCharacters
					characters={
						content?.characters ?? []
					}
				/>
			);

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
			return (
				<ProfileFeed
					posts={content?.feedPosts ?? []}
					variant="feed"
				/>
			);

		default:
			return (
				<div className="p-4 text-center text-muted-foreground">
					Tab not found
				</div>
			);
	}
}