import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "boneyard-js/react";
import { useMemo, useReducer } from "react";
import {
	FilterBar,
	type FilterValue,
	type ManagedFilterValue,
} from "@/components/layout/filter-bar";
import { RequestDetailsModal } from "@/components/layout/modal/my-requests";
import {
	ITEMS_PER_PAGE,
	type RequestItem,
} from "@/components/layout/requests/my/helpers";
import { useFilteredMyRequests } from "@/components/layout/requests/my/use-filtered-requests";
import {
	INITIAL_PAGE_STATE,
	myRequestsPageReducer,
} from "@/components/layout/requests/my/page-state";
import { useMyRequestFilterGroups } from "@/components/layout/requests/my/page-filters";
import { RequestList } from "@/components/layout/requests/my/list";
import { useMyCommissionRequests } from "@/hooks/use-commisions";

export const Route = createFileRoute("/_main/my-requests")({
	component: RouteComponent,
});

function RouteComponent() {
	const [state, dispatch] = useReducer(
		myRequestsPageReducer,
		INITIAL_PAGE_STATE,
	);

	const { page, selectedRequestId, detailsOpen, searchQuery, filterState } =
		state;

	const {
		data: pageData,
		isFetching,
		isError,
		error,
	} = useMyCommissionRequests(page - 1, ITEMS_PER_PAGE);

	const requests = useMemo<RequestItem[]>(
		() => pageData?.content ?? [],
		[pageData],
	);

	const showSkeleton = !pageData && !isError;
	const filterGroups = useMyRequestFilterGroups();

	const filterValues = useMemo<Record<string, ManagedFilterValue>>(
		() => ({
			status: filterState.status,
			payment: filterState.payment,
			timeline: filterState.timeline,
			submittedDate: filterState.submittedDate,
		}),
		[filterState],
	);

	const filteredRequests = useFilteredMyRequests({
		requests,
		searchQuery,
		filterState,
	});

	const totalPages = Math.max(1, pageData?.totalPages ?? 1);
	const totalItems = pageData?.totalElements ?? 0;
	const currentPage = (pageData?.number ?? page - 1) + 1;
	const startItem =
		totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
	const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

	const selectedRequest =
		requests.find((request) => request.id === selectedRequestId) ?? null;

	const isDetailsOpen = detailsOpen && selectedRequest !== null;

	function openDetails(requestId: string) {
		dispatch({ type: "openDetails", requestId });
	}

	function setDetailsOpen(nextOpen: boolean) {
		dispatch({ type: "setDetailsOpen", open: nextOpen });
	}

	function setPage(nextPage: number) {
		dispatch({ type: "setPage", page: nextPage });
	}

	function setSearchQuery(nextSearchQuery: string) {
		dispatch({ type: "setSearchQuery", searchQuery: nextSearchQuery });
	}

	function handleFilterChange(
		groupId: string,
		value: FilterValue,
		operator?: ManagedFilterValue["operator"],
	) {
		dispatch({
			type: "setFilter",
			groupId,
			value,
			operator,
		});
	}

	function clearAllFilters() {
		dispatch({ type: "clearAllFilters" });
	}

	if (isError) {
		return (
			<div className="border-b pb-4">
				<p className="text-sm font-medium text-destructive">
					Could not load your requests
				</p>
				<p className="mt-1 text-xs text-muted-foreground">{error?.message}</p>
			</div>
		);
	}

	return (
		<Skeleton
			name="my-requests"
			loading={showSkeleton}
			// initialBones={desktopBones}
		>
			<div className="space-y-6">
				<FilterBar
					data={requests}
					groups={filterGroups}
					values={filterValues}
					onFilterChange={handleFilterChange}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					searchPlaceholder="Search by description, commission ID, request ID..."
					onClearAll={clearAllFilters}
				/>

				<RequestList
					requests={filteredRequests}
					onRequestClick={openDetails}
					isPending={isFetching}
					totalCount={totalItems}
					currentPage={currentPage}
					totalPages={totalPages}
					startItem={startItem}
					endItem={endItem}
					isRefreshing={isFetching && !showSkeleton}
					onPageChange={setPage}
				/>
			</div>

			<RequestDetailsModal
				request={selectedRequest}
				open={isDetailsOpen}
				onOpenChange={setDetailsOpen}
				viewType="client"
			/>
		</Skeleton>
	);
}
