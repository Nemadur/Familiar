import {
	createFileRoute,
	useLocation,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { useMemo } from "react";
import { PortfolioPostModal } from "@/components/layout/profile/modals/portfolio-post-modal";
import {
	mapCommissionToPostWithAuthor,
	mapFolderToFolderType,
	mapPostToPostWithAuthor,
} from "@/components/layout/profile/utils";
import { useSuspenseProfileContent } from "@/hooks/use-profile-content";
import { useSuspenseUser } from "@/hooks/use-user";

export const Route = createFileRoute(
	"/$username/$tab/folder/$folderSlug/$subfolderSlug/$postId",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { username, tab, folderSlug, subfolderSlug, postId } =
		Route.useParams();
	const navigate = useNavigate();
	const { data: user } = useSuspenseUser(username);

	if (!user) {
		return <div>User not found</div>;
	}

	const { posts, categories } = useSuspenseProfileContent(user.uuid);

	const portfolioPosts = useMemo(
		() => [
			...posts.map((post: any) => mapPostToPostWithAuthor(post, user)),
			...(categories || [])
				.flatMap((cat: any) => cat.items || [])
				.map((comm: any) => mapCommissionToPostWithAuthor(comm, user)),
		],
		[posts, categories, user],
	);

	const post = portfolioPosts.find((p) => p.id === postId);

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
						to: "/$username/$tab/folder/$folderSlug/$subfolderSlug",
						params: { username, tab, folderSlug, subfolderSlug },
						replace: true,
					});
				}
			}}
		/>
	);
}
