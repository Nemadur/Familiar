import { useMemo } from "react";
import { useProfileCommisions } from "@/hooks/use-commisions";
import { useSuspenseProfileContent } from "@/hooks/use-profile-content";
import type { TCommission, TCommissionCategory } from "@/types/commissions";
import type { TUserProfile } from "@/types/user";
import { ProfileCharacters } from "./feed/characters";
import { ProfileCommissions } from "./feed/commissions";
import { ProfilePortfolio } from "./feed/portfolio";
import { PrivateContent } from "./private-content";
import {
	mapCommissionToCommissionItem,
	mapPostToPostWithAuthor,
} from "./utils";

export function UserFeedContent({
	user,
	tab,
	isMe,
}: {
	user: TUserProfile;
	tab: string;
	isMe: boolean;
}) {
	// TODO: fetch data from API
	// const { categories, posts, characters, folders } = useSuspenseProfileContent(
	// 	user.uuid,
	// 	tab as "commissions" | "portfolio" | "characters" | "saved" | "liked",
	// );

	// const commissionCategories = useMemo<CommissionCategory[]>(() => {
	// 	console.log(
	// 		`[UserFeedContent] Mapping categories: ${categories?.length || 0}`,
	// 	);
	// 	// Map backend categories to frontend structure
	// 	return (categories || []).map((cat: any) => ({
	// 		id: cat.id,
	// 		title: cat.title,
	// 		status: cat.status || "open",
	// 		items: (cat.items || []).map(mapCommissionToCommissionItem),
	// 	}));
	// }, [categories]);

	// const portfolioPosts = useMemo(
	// 	() => posts.map((post: any) => mapPostToPostWithAuthor(post, user)),
	// 	[posts, user],
	// );

	// const portfolioFolders = useMemo(
	// 	() =>
	// 		folders.map((folder: any) => {
	// 			// Calculate subfolders count
	// 			const subfoldersCount = folders.filter(
	// 				(f: any) => f.parentId === folder.id,
	// 			).length;
	// 			return {
	// 				...folder,
	// 				count: folder.count + subfoldersCount,
	// 				hasSubfolders: subfoldersCount > 0,
	// 			};
	// 		}),
	// 	[folders],
	// );

	// const { categories, isPending, error } = useProfileCommisions(user.userId);

	// const commissionCategories = useMemo<TCommissionCategory[]>(() => {
	// 	// Map backend categories to frontend structure
	// 	return (categories || []).map((cat) => ({
	// 		id: cat.id,
	// 		name: cat.name,
	// 		items: (cat.items || []).map(mapCommissionToCommissionItem),
	// 	}));
	// }, [categories]);

	const { data: commissions } = useProfileCommisions(user.userId);

	console.log(commissions);

	// Permission check for private tabs
	// TODO: user can switch between private/public for each tab
	if ((tab === "saved" || tab === "liked") && !isMe) {
		return <PrivateContent />;
	}

	switch (tab) {
		case "commissions":
			return (
				<ProfileCommissions artist={user} commissions={commissions || []} />
			);
		case "portfolio":
		// return (
		// 	<ProfilePortfolio
		// 		posts={portfolioPosts}
		// 		folderId={undefined}
		// 		username={user.username}
		// 		folders={portfolioFolders}
		// 	/>
		// );
		case "characters":
		// return <ProfileCharacters characters={characters} />;
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
