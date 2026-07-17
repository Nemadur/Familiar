// import { createFileRoute, useNavigate } from "@tanstack/react-router";
// // import { PortfolioPostModal } from "@/components/layout/profile/modals/portfolio-post-modal";
// import { useUserByUsername } from "@/hooks/use-user";
// import { EmptyPage } from "@/components/layout/empty-page";

// export const Route = createFileRoute(
// 	"/{-$locale}/_main/user/$username/$tab/folder/$folderSlug/$subfolderSlug/-$postId",
// )({
// 	component: RouteComponent,
// });

// function RouteComponent() {
// 	const { username, tab, folderSlug, subfolderSlug, postId } =
// 		Route.useParams();
// 	const navigate = useNavigate();
// 	const { user } = useUserByUsername(username);

// 	if (!user) {
// 		return <div>User not found</div>;
// 	}

// 	return (
// 		<EmptyPage title="Portfolio Post" description={`Post ID: ${postId}`} />
// 	);
// }
