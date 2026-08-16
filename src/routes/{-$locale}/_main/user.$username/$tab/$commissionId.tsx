import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CommissionForm } from "@/components/layout/commision/commission-form";
import { CommissionModal } from "@/components/layout/modal/commission";
import { PortfolioPostModal } from "@/components/layout/modal/portfolio-post";
import { useUserByUsername } from "@/hooks/user/use-user";

export const Route = createFileRoute("/{-$locale}/_main/user/$username/$tab/$commissionId")({
	component: RouteComponent,
});

function RouteComponent() {
	const { username, tab, commissionId } = Route.useParams();
	const { user } = useUserByUsername(username);

	if (tab === "portfolio") {
		return (
			<PortfolioPostRoute
				username={username}
				tab={tab}
				postId={commissionId}
				user={user}
			/>
		);
	}

	return (
		<CommissionRoute
			username={username}
			tab={tab}
			commissionId={commissionId}
			user={user}
		/>
	);
}

function PortfolioPostRoute({
	username,
	tab,
	postId,
	user,
}: {
	username: string;
	tab: string;
	postId: string;
	user: Awaited<ReturnType<typeof useUserByUsername>>["user"];
}) {
	const navigate = useNavigate();
	const { locale } = Route.useParams();

	const handleClose = () => {
		navigate({
			to: "/{-$locale}/user/$username/$tab",
			params: { locale, username, tab },
			replace: true,
			resetScroll: false,
		});
	};

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

function CommissionRoute({
	username,
	tab,
	commissionId,
	user,
}: {
	username: string;
	tab: string;
	commissionId: string;
	user: Awaited<ReturnType<typeof useUserByUsername>>["user"];
}) {
	const navigate = useNavigate();

	const handleClose = () =>
		navigate({
			to: `/user/${username}/${tab}`,
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
			user={user}
			onClose={handleClose}
		/>
	);
}

function ExistingCommissionRoute({
	commissionId,
	onClose,
}: {
	commissionId: string;
	user: Awaited<ReturnType<typeof useUserByUsername>>["user"];
	onClose: () => void;
}) {
	return (
		<CommissionModal
			key={commissionId}
			commissionId={commissionId}
			open={true}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		/>
	);
}
