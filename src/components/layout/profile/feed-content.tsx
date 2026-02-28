import { useMemo } from "react";
import { useSuspenseProfileContent } from "@/hooks/use-profile-content";
import type { CommissionCategory } from "@/types/commission";
import type { User } from "@/types/user";
import { ProfileCharacters } from "./feed/characters";
import { ProfileCommissions } from "./feed/commissions";
import { ProfilePortfolio } from "./feed/portfolio";
import { PrivateContent } from "./private-content";
import {
	mapCommissionToCommissionItem,
	mapFolderToFolderType,
	mapPostToPostWithAuthor,
} from "./utils";

export function UserFeedContent({
	user,
	tab,
	isMe,
}: {
	user: User;
	tab: string;
	isMe: boolean;
}) {
	const { categories, posts, characters, folders } = useSuspenseProfileContent(
		user.uuid,
	);

	const commissionCategories = useMemo<CommissionCategory[]>(() => {
		console.log(`[UserFeedContent] Mapping categories: ${categories?.length || 0}`);
		// Map backend categories to frontend structure
		return (categories || []).map((cat: any) => ({
			id: cat.id,
			title: cat.title,
			status: cat.status || "open",
			items: (cat.items || []).map(mapCommissionToCommissionItem),
		}));
	}, [categories]);

	const portfolioPosts = useMemo(
		() => posts.map((post: any) => mapPostToPostWithAuthor(post, user)),
		[posts, user],
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

	// Permission check for private tabs
	// TODO: user can switch between private/public for each tab
	if ((tab === "saved" || tab === "liked") && !isMe) {
		return <PrivateContent />;
	}

	switch (tab) {
		case "commissions":
			return (
				<ProfileCommissions categories={commissionCategories} artist={user} />
			);
		case "portfolio":
			return (
				<ProfilePortfolio
					posts={portfolioPosts}
					folderId={undefined}
					username={user.username}
					folders={portfolioFolders}
				/>
			);
		case "characters":
			return <ProfileCharacters characters={characters} />;
		case "saved":
			// TODO: Implement saved feed
			return <div>Saved</div>;
		case "liked":
			// TODO: Implement liked feed
			return <div>Liked</div>;
		default:
			return null;
	}
}
