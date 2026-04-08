import { createFileRoute } from "@tanstack/react-router";
import { useUserByUsername } from "@/hooks/use-user";
import type { TUserProfile } from "@/types/user";

export const Route = createFileRoute("/$username/$tab/folder/$folderSlug/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { username, tab, folderSlug } = Route.useParams();
	const { user } = useUserByUsername(username);

	if (!user) {
		return <div>User not found</div>;
	}

	return <FolderContent user={user} tab={tab} folderSlug={folderSlug} />;
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
	// TODO: fetch post from API
	// const { posts, categories, folders } = useSuspenseProfileContent(
	// 	user.uuid,
	// 	"portfolio",
	// );

	// const portfolioPosts = useMemo(
	// 	() => [
	// 		...posts.map((post: any) => mapPostToPostWithAuthor(post, user)),
	// 		...(categories || [])
	// 			.flatMap((cat: any) => cat.items || [])
	// 			.map((comm: any) => mapCommissionToPostWithAuthor(comm, user)),
	// 	],
	// 	[posts, categories, user],
	// );

	// const portfolioFolders = useMemo(
	// 	() =>
	// 		folders.map((folder: any) => {
	// 			const mappedFolder = mapFolderToFolderType(folder, posts);
	// 			// Calculate subfolders count
	// 			const subfoldersCount = folders.filter(
	// 				(f: any) => f.parentId === mappedFolder.id,
	// 			).length;
	// 			return {
	// 				...mappedFolder,
	// 				count: mappedFolder.count + subfoldersCount,
	// 				hasSubfolders: subfoldersCount > 0,
	// 			};
	// 		}),
	// 	[folders, posts],
	// );

	// if (tab === "portfolio") {
	// 	// Find folder by slug from mapped folders
	// 	const currentFolder = portfolioFolders.find(
	// 		(f) => f.slug === folderSlug || f.id === folderSlug,
	// 	);

	// 	return (
	// 		<ProfilePortfolio
	// 			posts={portfolioPosts}
	// 			currentFolder={currentFolder}
	// 			folderId={currentFolder?.id}
	// 			username={user.username}
	// 			folders={portfolioFolders}
	// 		/>
	// 	);
	// }

	return (
		<div>
			Detail for {tab} - {folderSlug}
		</div>
	);
}
