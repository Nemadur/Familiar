import {
	createFileRoute,
	useNavigate,
	useLocation,
} from "@tanstack/react-router";
import {
	PortfolioPostPage,
	PortfolioPostModal,
} from "@/components/layout/modal/portfolio-post";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { useUserByUsername } from "@/hooks/user/use-user";
import type { TUserProfile } from "@/types/user";
import { FolderContent } from "./index";

export const Route = createFileRoute(
	"/{-$locale}/_main/user/$username/$tab/folder/$folderSlug/$postId",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { locale, username, tab, folderSlug, postId } = Route.useParams();
	const navigate = useNavigate();
	const { user } = useUserByUsername(username);
	const isMobile = useIsMobile();
	const location = useLocation();

	const isModal = (location.state as any)?.isModal === true;

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
			isMobile={isMobile}
			isModal={isModal}
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
	isMobile,
	isModal,
}: {
	locale?: string;
	user: TUserProfile;
	tab: string;
	folderSlug: string;
	postId: string;
	navigate: ReturnType<typeof useNavigate>;
	isMobile: boolean;
	isModal: boolean;
}) {
	const handleClose = () => {
		navigate({
			to: "/{-$locale}/user/$username/$tab/folder/$folderSlug",
			params: { locale, username: user.username, tab, folderSlug },
			replace: true,
		});
	};

	if (isMobile || !isModal) {
		const content = (
			<>
				<PortfolioPostPage
					postId={postId}
					username={user.username}
					onBack={handleClose}
					onDeleted={handleClose}
				/>
				{!isMobile && (
					<div className="mx-auto w-full max-w-360 md:px-4 lg:px-6 mb-12 border-t pt-8">
						<h2 className="text-xl font-semibold mb-6">
							More from {user.username} in folder
						</h2>
						<FolderContent user={user} tab={tab} folderSlug={folderSlug} />
					</div>
				)}
			</>
		);

		return content;
	}

	return (
		<>
			<FolderContent user={user} tab={tab} folderSlug={folderSlug} />
			<PortfolioPostModal
				postId={postId}
				username={user.username}
				open={true}
				onOpenChange={(open) => {
					if (!open) handleClose();
				}}
			/>
		</>
	);
}
