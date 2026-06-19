import { createFileRoute, useNavigate } from "@tanstack/react-router";
// import { PortfolioPostModal } from "@/components/layout/profile/modals/portfolio-post-modal";
import { useUserByUsername } from "@/hooks/use-user";
import type { TUserProfile } from "@/types/user";
import { EmptyPage } from "@/components/layout/empty-page";

export const Route = createFileRoute(
	"/_main/$username/$tab/folder/$folderSlug/$subfolderSlug/$postId",
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
		<EmptyPage title="Post not found" />
		// <PostContent
		// 	user={user}
		// 	tab={tab}
		// 	folderSlug={folderSlug}
		// 	subfolderSlug={subfolderSlug}
		// 	postId={postId}
		// 	navigate={navigate}
		// />
	);
}

// function PostContent({
// 	user,
// 	tab,
// 	folderSlug,
// 	subfolderSlug,
// 	postId,
// 	navigate,
// }: {
// 	user: TUserProfile;
// 	tab: string;
// 	folderSlug: string;
// 	subfolderSlug: string;
// 	postId: string;
// 	navigate: ReturnType<typeof useNavigate>;
// }) {
// 	const post = null;

// 	if (!post) {
// 		return <div>Post not found</div>;
// 	}

// 	return (
// 		<PortfolioPostModal
// 			post={post}
// 			open={true}
// 			onOpenChange={(open) => {
// 				if (!open) {
// 					navigate({
// 						to: "/$username/$tab/folder/$folderSlug",
// 						params: { username: user.username, tab, folderSlug },
// 						replace: true,
// 					});
// 				}
// 			}}
// 		/>
// 	);
// }
