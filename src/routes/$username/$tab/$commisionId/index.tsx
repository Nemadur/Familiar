import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	useLocation,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { CommissionModal } from "@/components/layout/profile/modals/commission-modal";
import { getCommission } from "@/data/commissions";
import { useSuspenseUser } from "@/hooks/use-user";
import type { CommissionItem } from "@/types/commission";

export const Route = createFileRoute("/$username/$tab/$commisionId/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { username, tab, commisionId } = Route.useParams();
	const navigate = useNavigate();
	const router = useRouter();
	const location = useLocation();
	const { data: user } = useSuspenseUser(username);

	// Try to get item from state (optimistic UI)
	const stateItem = (location.state as any)?.item as CommissionItem | undefined;

	const {
		data: fetchedItem,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["commission", commisionId],
		queryFn: () => getCommission({ data: { id: commisionId } }),
		enabled: !!commisionId,
	});

	const itemToPass = fetchedItem || stateItem;
	const isDetailsLoading = isLoading && !fetchedItem;

	return (
		<CommissionModal
			commissionId={commisionId}
			item={itemToPass}
			artist={user!}
			open={true}
			isLoading={isLoading}
			isDetailsLoading={isDetailsLoading}
			isError={isError}
			error={error}
			onOpenChange={(open) => {
				if (!open) {
					// Use history.back() if possible to effectively close the modal
					// and remove it from history stack
					if (window.history.length > 1) {
						window.history.back();
					} else {
						// Fallback for direct links
						navigate({
							to: `/${username}/${tab}`,
							replace: true,
							resetScroll: false,
							search: (old) => old,
						});
					}
				}
			}}
		/>
	);
}
