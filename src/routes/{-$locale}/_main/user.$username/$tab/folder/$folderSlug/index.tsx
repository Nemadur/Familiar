import { createFileRoute } from "@tanstack/react-router";
import { ProfilePortfolio } from "@/components/layout/profile/feed/portfolio";
import { TabContentSkeleton } from "@/components/layout/profile/profile";
import { useProfileContent } from "@/hooks/user/use-profile-content";
import { useUserByUsername } from "@/hooks/user/use-user";
import type { TUserProfile } from "@/types/user";

export const Route = createFileRoute(
	"/{-$locale}/_main/user/$username/$tab/folder/$folderSlug/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { username, tab, folderSlug } = Route.useParams();
	const { user } = useUserByUsername(username);

	if (!user) {
		return <div>User not found</div>;
	}

	return (
		<FolderContent
			user={user as TUserProfile}
			tab={tab}
			folderSlug={folderSlug}
		/>
	);
}

function FolderContent({
	user,
	tab,
	folderSlug,
}: {
	user: TUserProfile;
	tab: string;
	folderSlug: string;
}) {
	const { data: content, isPending, isCurrentUser } = useProfileContent(
		user.username,
		user.userId,
		tab,
	);

	if (isPending) {
		return <TabContentSkeleton tab={tab} />;
	}

	if (tab !== "portfolio") {
		return (
			<div className="p-4 text-center text-muted-foreground">
				Folder not found for tab {tab}
			</div>
		);
	}

	const posts = content?.portfolioPosts ?? [];
	const folders = content?.folders ?? [];

	// The link currently passes folder.id as folderSlug.
	const currentFolder = folders.find(
		(folder) => folder.id === folderSlug,
	);

	if (!currentFolder) {
		return (
			<div className="p-4 text-center text-muted-foreground">
				Portfolio folder not found
			</div>
		);
	}

	return (
		<ProfilePortfolio
			posts={posts}
			currentFolder={currentFolder}
			folderId={currentFolder.id}
			username={user.username}
			folders={folders}
			canManageCatalogs={isCurrentUser}
		/>
	);
}