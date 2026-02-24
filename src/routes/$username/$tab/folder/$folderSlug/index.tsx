import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ProfilePortfolio } from "@/components/layout/profile/feed/portfolio";
import {
	mapCommissionToPostWithAuthor,
	mapFolderToFolderType,
	mapPostToPostWithAuthor,
} from "@/components/layout/profile/utils";
import { useSuspenseProfileContent } from "@/hooks/use-profile-content";
import { useSuspenseUser } from "@/hooks/use-user";

export const Route = createFileRoute("/$username/$tab/folder/$folderSlug/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { username, tab, folderSlug } = Route.useParams();
	const { data: user } = useSuspenseUser(username);

	if (!user) {
		return <div>User not found</div>;
	}

	const { posts, categories, folders } = useSuspenseProfileContent(user.uuid);

	const portfolioPosts = useMemo(
		() => [
			...posts.map((post: any) => mapPostToPostWithAuthor(post, user)),
			...(categories || [])
				.flatMap((cat: any) => cat.items || [])
				.map((comm: any) => mapCommissionToPostWithAuthor(comm, user)),
		],
		[posts, categories, user],
	);

	const portfolioFolders = useMemo(
		() =>
			folders.map((folder: any) => {
				const mappedFolder = mapFolderToFolderType(folder, posts);
				// Calculate subfolders count
				const subfoldersCount = folders.filter(
					(f: any) => f.parentId === mappedFolder.id,
				).length;
				return {
					...mappedFolder,
					count: mappedFolder.count + subfoldersCount,
					hasSubfolders: subfoldersCount > 0,
				};
			}),
		[folders, posts],
	);

	if (tab === "portfolio") {
		// Find folder by slug from mapped folders
		const currentFolder = portfolioFolders.find(
			(f) => f.slug === folderSlug || f.id === folderSlug,
		);

		return (
			<ProfilePortfolio
				posts={portfolioPosts}
				currentFolder={currentFolder}
				folderId={currentFolder?.id}
				username={user.username}
				folders={portfolioFolders}
			/>
		);
	}

	return (
		<div>
			Detail for {tab} - {folderSlug}
		</div>
	);
}
