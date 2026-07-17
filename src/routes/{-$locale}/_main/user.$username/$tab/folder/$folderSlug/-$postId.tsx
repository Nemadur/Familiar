// import { createFileRoute, useNavigate } from "@tanstack/react-router";
// // import { PortfolioPostModal } from "@/components/layout/profile/modals/portfolio-post-modal";
// import { useUserByUsername } from "@/hooks/use-user";
// import type { TUserProfile } from "@/types/user";

// export const Route = createFileRoute(
// 	"/{-$locale}/_main/user/$username/$tab/folder/$folderSlug/$postId",
// )({
// 	component: RouteComponent,
// });

// function RouteComponent() {
// 	const { username, tab, folderSlug, postId } = Route.useParams();
// 	const navigate = useNavigate();
// 	const { user } = useUserByUsername(username);

// 	if (!user) {
// 		return <div>User not found</div>;
// 	}

// 	return (
// 		<PostContent
// 			user={user}
// 			tab={tab}
// 			folderSlug={folderSlug}
// 			postId={postId}
// 			navigate={navigate}
// 		/>
// 	);
// }

// function PostContent({
// 	user,
// 	tab,
// 	folderSlug,
// 	postId,
// 	navigate,
// }: {
// 	user: TUserProfile;
// 	tab: string;
// 	folderSlug: string;
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
// 						to: "/user/$username/$tab/folder/$folderSlug",
// 						params: { username: user.username, tab, folderSlug },
// 						replace: true,
// 					});
// 				}
// 			}}
// 		/>
// 	);
// }
