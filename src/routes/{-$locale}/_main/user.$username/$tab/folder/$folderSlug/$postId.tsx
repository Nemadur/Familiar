import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PortfolioPostModal } from "@/components/layout/modal/portfolio-post";
import { useUserByUsername } from "@/hooks/user/use-user";
import type { TUserProfile } from "@/types/user";

export const Route = createFileRoute(
	"/{-$locale}/_main/user/$username/$tab/folder/$folderSlug/$postId",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { locale, username, tab, folderSlug, postId } = Route.useParams();
	const navigate = useNavigate();
	const { user } = useUserByUsername(username);

	if (!user) {
		return null;
	}

	return (
		<PostContent
			locale={locale}
			user={user}
			tab={tab}
			folderSlug={folderSlug}
			postId={postId}
			navigate={navigate}
		/>
	);
}

function PostContent({
	locale,
	user,
	tab,
	folderSlug,
	postId,
	navigate,
}: {
	locale?: string;
	user: TUserProfile;
	tab: string;
	folderSlug: string;
	postId: string;
	navigate: ReturnType<typeof useNavigate>;
}) {
	return (
		<PortfolioPostModal
			postId={postId}
			username={user.username}
			open={true}
			onOpenChange={(open) => {
				if (!open) {
					navigate({
						to: "/{-$locale}/user/$username/$tab/folder/$folderSlug",
						params: { locale, username: user.username, tab, folderSlug },
						replace: true,
					});
				}
			}}
		/>
	);
}
