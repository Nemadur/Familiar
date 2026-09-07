import { createFileRoute, useNavigate, useLocation } from "@tanstack/react-router";
import { CommissionForm } from "@/components/layout/commision/commission-form";
import { CommissionModal } from "@/components/layout/modal/commission";
import {
	PortfolioPostPage,
	PortfolioPostModal,
} from "@/components/layout/modal/portfolio-post";
import { useUserByUsername } from "@/hooks/user/use-user";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { UserFeedContent } from "../$tab";
import type { TUserProfile } from "@/types/user";

export const Route = createFileRoute(
	"/{-$locale}/_main/user/$username/$tab/$postId",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { locale, username, tab, postId } = Route.useParams();
	const location = useLocation();

	const { user } = useUserByUsername(username);
	const navigate = useNavigate();
	const isMobile = useIsMobile();

	const isModal = (location.state as any)?.isModal === true;

	if (tab === "portfolio") {
		const handleBack = () => {
			if (window.history.length > 1) {
				window.history.back();
				return;
			}

			navigate({
				to: "/{-$locale}/user/$username/$tab",
				params: {
					locale,
					username,
					tab: "portfolio",
				},
				replace: true,
			});
		};

		const handleClose = () => {
			navigate({
				to: "/{-$locale}/user/$username/$tab",
				params: {
					locale,
					username,
					tab: "portfolio",
				},
				replace: true,
			});
		};

		if (isMobile || !isModal) {
			const content = (
				<>
					<PortfolioPostPage
						postId={postId}
						username={username}
						onBack={handleBack}
						onDeleted={handleClose}
					/>
					{!isMobile && user && (
						<div className="mx-auto w-full max-w-[1440px] md:px-4 lg:px-6 mb-12 border-t pt-8">
							<h2 className="text-xl font-semibold mb-6">
								More from {user.username}
							</h2>
							<UserFeedContent user={user as TUserProfile} tab={tab} />
						</div>
					)}
				</>
			);

			return content;
		}

		return (
			<PortfolioPostModal
				postId={postId}
				username={username}
				open={true}
				onOpenChange={(open) => {
					if (!open) handleClose();
				}}
			/>
		);
	}

	return (
		<CommissionRoute
			locale={locale}
			username={username}
			tab={tab}
			commissionId={postId}
			user={user}
		/>
	);
}

function CommissionRoute({
	locale,
	username,
	tab,
	commissionId,
	user,
}: {
	locale?: string;
	username: string;
	tab: string;
	commissionId: string;
	user: Awaited<ReturnType<typeof useUserByUsername>>["user"];
}) {
	const navigate = useNavigate();

	const handleClose = () =>
		navigate({
			to: "/{-$locale}/user/$username/$tab",
			params: {
				locale,
				username,
				tab,
			},
			replace: true,
			resetScroll: false,
			search: (old) => old,
		});

	if (commissionId === "new") {
		if (!user?.userId) return null;

		return (
			<CommissionForm
				username={username}
				tab={tab}
				artistId={user.userId}
				onClose={handleClose}
			/>
		);
	}

	return (
		<ExistingCommissionRoute
			commissionId={commissionId}
			onClose={handleClose}
		/>
	);
}

function ExistingCommissionRoute({
	commissionId,
	onClose,
}: {
	commissionId: string;
	onClose: () => void;
}) {
	return (
		<CommissionModal
			key={commissionId}
			commissionId={commissionId}
			open
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		/>
	);
}
