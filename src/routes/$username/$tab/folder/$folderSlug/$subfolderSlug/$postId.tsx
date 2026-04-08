import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { PortfolioPostModal } from "@/components/layout/profile/modals/portfolio-post-modal";
import {
	mapCommissionToPostWithAuthor,
	mapPostToPostWithAuthor,
} from "@/components/layout/profile/utils";
import { useSuspenseProfileContent } from "@/hooks/use-profile-content";
import { useUserByUsername } from "@/hooks/use-user";
import type { TUserProfile } from "@/types/user";

export const Route = createFileRoute(
	"/$username/$tab/folder/$folderSlug/$subfolderSlug/$postId",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { username, tab, folderSlug, subfolderSlug, postId } =
		Route.useParams();
	const navigate = useNavigate();
	const { user } = useUserByUsername(username);

	if (!user) {
		return <div>User not found</div>;
	}

	return (
		<PostContent
			user={user}
			tab={tab}
			folderSlug={folderSlug}
			subfolderSlug={subfolderSlug}
			postId={postId}
			navigate={navigate}
		/>
	);
}

function PostContent({
	user,
	tab,
	folderSlug,
	subfolderSlug,
	postId,
	navigate,
}: {
	user: TUserProfile;
	tab: string;
	folderSlug: string;
	subfolderSlug: string;
	postId: string;
	navigate: ReturnType<typeof useNavigate>;
}) {
	// TODO: fetch post from API
	// const { posts, categories } = useSuspenseProfileContent(user.uuid);

	// const portfolioPosts = useMemo(
	// 	() => [
	// 		...posts.map((post: any) => mapPostToPostWithAuthor(post, user)),
	// 		...(categories || [])
	// 			.flatMap((cat: any) => cat.items || [])
	// 			.map((comm: any) => mapCommissionToPostWithAuthor(comm, user)),
	// 	],
	// 	[posts, categories, user],
	// );

	// const post = portfolioPosts.find((p) => p.id === postId);
	const post = null;

	if (!post) {
		return <div>Post not found</div>;
	}

	return (
		<PortfolioPostModal
			post={post}
			open={true}
			onOpenChange={(open) => {
				if (!open) {
					navigate({
						to: "/$username/$tab/folder/$folderSlug",
						params: { username: user.username, tab, folderSlug },
						replace: true,
					});
				}
			}}
		/>
	);
}
