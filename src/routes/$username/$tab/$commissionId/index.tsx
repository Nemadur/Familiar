import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	useLocation,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { useMemo } from "react";
import { CommissionModal } from "@/components/layout/profile/modals/commission-modal";
import { PortfolioPostModal } from "@/components/layout/profile/modals/portfolio-post-modal";
import {
	mapCommissionToPostWithAuthor,
	mapPostToPostWithAuthor,
} from "@/components/layout/profile/utils";
import { getCommission } from "@/data/commissions";
import { useSuspenseProfileContent } from "@/hooks/use-profile-content";
import { useSuspenseUser } from "@/hooks/use-user";
import type { CommissionItem } from "@/types/commission";

export const Route = createFileRoute("/$username/$tab/$commissionId/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { username, tab, commissionId } = Route.useParams();
	const navigate = useNavigate();
	const router = useRouter();
	const location = useLocation();
	const { data: user } = useSuspenseUser(username);

	// Portfolio Logic
	const isPortfolio = tab === "portfolio";

	if (isPortfolio) {
		return (
			<PortfolioPostRoute
				username={username}
				tab={tab}
				postId={commissionId}
				user={user}
				navigate={navigate}
			/>
		);
	}

	return (
		<CommissionRoute
			username={username}
			tab={tab}
			commissionId={commissionId}
			user={user}
			navigate={navigate}
			location={location}
		/>
	);
}

function PortfolioPostRoute({ username, tab, postId, user, navigate }: any) {
	const { posts, categories } = useSuspenseProfileContent(
		user?.uuid || "",
		tab as "portfolio" | "commissions" | "characters" | "saved" | "liked",
	);

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

	if (!post) return null; // Or 404

	return (
		<PortfolioPostModal
			post={post}
			open={true}
			onOpenChange={(open) => {
				if (!open) {
					navigate({
						to: `/${username}/${tab}`,
						replace: true,
						resetScroll: false,
						search: (old: any) => old,
					});
				}
			}}
		/>
	);
}

function CommissionRoute({
	username,
	tab,
	commissionId,
	user,
	navigate,
	location,
}: any) {
	// Try to get item from state (optimistic UI)
	const stateItem = (location.state as any)?.item as CommissionItem | undefined;

	const {
		data: fetchedItem,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["commission", commissionId],
		queryFn: () => getCommission({ data: { id: commissionId } }),
		enabled: !!commissionId,
	});

	const itemToPass = fetchedItem || stateItem;
	const isDetailsLoading = isLoading && !fetchedItem;

	return (
		<CommissionModal
			key={commissionId}
			commissionId={commissionId}
			item={itemToPass}
			artist={user ?? undefined}
			open={true}
			isLoading={isLoading}
			isDetailsLoading={isDetailsLoading}
			isError={isError}
			error={error}
			onOpenChange={(open) => {
				if (!open) {
					navigate({
						to: `/${username}/${tab}`,
						replace: true,
						resetScroll: false,
						search: (old: any) => old,
					});
				}
			}}
		/>
	);
}
