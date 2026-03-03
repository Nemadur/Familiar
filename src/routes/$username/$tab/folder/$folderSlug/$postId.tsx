import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { PortfolioPostModal } from "@/components/layout/profile/modals/portfolio-post-modal";
import {
	mapCommissionToPostWithAuthor,
	mapPostToPostWithAuthor,
} from "@/components/layout/profile/utils";
import { useSuspenseProfileContent } from "@/hooks/use-profile-content";
import { useSuspenseUser } from "@/hooks/use-user";

export const Route = createFileRoute(
	"/$username/$tab/folder/$folderSlug/$postId",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { username, tab, folderSlug, postId } = Route.useParams();
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
						to: "/$username/$tab/folder/$folderSlug",
						params: { username, tab, folderSlug },
						replace: true,
					});
				}
			}}
		/>
	);
}
