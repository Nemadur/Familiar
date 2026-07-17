import { createFileRoute } from "@tanstack/react-router";
import { CalendarIcon, CreditCard, Flag, ListFilterIcon } from "lucide-react";
import { useCallback, useMemo, useReducer } from "react";
import type { DateFilterOperator } from "@/components/data-table-filter/core/types";
import { CommissionForm } from "@/components/layout/commision/commission-form";
import { DashboardHeader } from "@/components/layout/dashboard/header";
import {
	type DateRangeValue,
	FilterBar,
	type FilterGroup,
	type FilterValue,
	type ManagedFilterValue,
} from "@/components/layout/filter-bar";
import { RequestDetailsModal } from "@/components/layout/modal/my-requests";
import {
	getPaymentFilterValue,
	getPaymentStatus,
	getRequestTimelineFilterValue,
	ITEMS_PER_PAGE,
	matchSingleOrMulti,
	type RequestItem,
	stageLabel,
} from "@/components/layout/requests/my/helpers";
import { RequestList } from "@/components/layout/requests/my/list";
import {
	OutlineCheck,
	OutlineClock03,
	OutlineClose,
	OutlinePlus,
} from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import { useIncomingCommissionRequests } from "@/hooks/use-commisions";
import { useAuth } from "@/providers/auth";
import { TCommissionRequestStatus } from "@/types/commissions";
import { TPaymentStatus } from "@/types/payment";

export const Route = createFileRoute("/{-$locale}/dashboard/commissions_requests")({
	component: DashboardCommissionsRequests,
});

type ManagedFilterEntry = ManagedFilterValue;
type ManagedFiltersState = Record<string, ManagedFilterEntry>;

interface DashboardRequestsState {
	page: number;
	selectedRequestId: string | null;
	detailsOpen: boolean;
	searchQuery: string;
	filterState: ManagedFiltersState;
	isCreateModalOpen: boolean;
}

type DashboardRequestsAction =
	| {
			type: "setPage";
			page: number;
	  }
	| {
			type: "setSearchQuery";
			searchQuery: string;
	  }
	| {
			type: "openDetails";
			requestId: string;
	  }
	| {
			type: "setDetailsOpen";
			open: boolean;
	  }
	| {
			type: "clearSelectedRequest";
	  }
	| {
			type: "setFilter";
			groupId: string;
			value: FilterValue;
			operator?: ManagedFilterValue["operator"];
	  }
	| {
			type: "clearAllFilters";
	  }
	| {
			type: "setCreateModalOpen";
			open: boolean;
	  };

interface RequestsPageModel {
	requests: RequestItem[];
	isPending: boolean;
	requestsError: unknown;
	totalPages: number;
	totalItems: number;
	currentPage: number;
	startItem: number;
	endItem: number;
}

interface DashboardRequestsActions {
	openDetails: (requestId: string) => void;
	setDetailsOpen: (open: boolean) => void;
	setPage: (page: number) => void;
	setSearchQuery: (searchQuery: string) => void;
	setCreateModalOpen: (open: boolean) => void;
	handleFilterChange: (
		groupId: string,
		value: FilterValue,
		operator?: ManagedFilterValue["operator"],
	) => void;
	clearAllFilters: () => void;
}

const REQUEST_FILTER_GROUPS: FilterGroup<RequestItem>[] = [
	{
		id: "status",
		label: "Status",
		type: "select",
		icon: ListFilterIcon,
		getItemValue: (request) => request.status,
		options: [
			{
				id: TCommissionRequestStatus.Pending,
				label: stageLabel(TCommissionRequestStatus.Pending),
			},
			{
				id: TCommissionRequestStatus.Accepted,
				label: stageLabel(TCommissionRequestStatus.Accepted),
			},
			{
				id: TCommissionRequestStatus.In_Progress,
				label: stageLabel(TCommissionRequestStatus.In_Progress),
			},
			{
				id: TCommissionRequestStatus.Delivered,
				label: stageLabel(TCommissionRequestStatus.Delivered),
			},
			{
				id: TCommissionRequestStatus.Completed,
				label: stageLabel(TCommissionRequestStatus.Completed),
			},
			{
				id: TCommissionRequestStatus.Cancelled,
				label: stageLabel(TCommissionRequestStatus.Cancelled),
			},
		],
	},
	{
		id: "payment",
		label: "Payment",
		type: "select",
		icon: CreditCard,
		getItemValue: (request) => getPaymentFilterValue(request),
		options: [
			{
				id: TPaymentStatus.Pending,
				label: "Pending",
				icon: OutlineClock03,
			},
			{
				id: TPaymentStatus.Completed,
				label: "Paid",
				icon: OutlineCheck,
			},
			{
				id: TPaymentStatus.Failed,
				label: "Failed",
				icon: OutlineClose,
			},
			{
				id: TPaymentStatus.Refunded,
				label: "Refunded",
				icon: OutlineClose,
			},
		],
	},
	{
		id: "timeline",
		label: "Timeline",
		type: "select",
		icon: Flag,
		getItemValue: (request) => getRequestTimelineFilterValue(request),
		options: [
			{ id: "awaiting_review", label: "Awaiting review" },
			{ id: "accepted", label: "Accepted" },
			{ id: "in_progress", label: "In progress" },
			{ id: "delivered", label: "Delivered" },
			{ id: "completed", label: "Completed" },
			{ id: "cancelled", label: "Cancelled" },
		],
	},
	{
		id: "submittedDate",
		label: "Submitted date",
		type: "date",
		icon: CalendarIcon,
		getItemValue: (request) => new Date(request.createdAt),
	},
];

function createInitialFilterState(): ManagedFiltersState {
	return {
		status: { value: [] },
		payment: { value: [] },
		timeline: { value: [] },
		submittedDate: {
			value: { from: undefined, to: undefined },
			operator: "is between",
		},
	};
}

const INITIAL_DASHBOARD_REQUESTS_STATE: DashboardRequestsState = {
	page: 1,
	selectedRequestId: null,
	detailsOpen: false,
	searchQuery: "",
	filterState: createInitialFilterState(),
	isCreateModalOpen: false,
};

function dashboardRequestsReducer(
	state: DashboardRequestsState,
	action: DashboardRequestsAction,
): DashboardRequestsState {
	switch (action.type) {
		case "setPage":
			return {
				...state,
				page: action.page,
			};

		case "setSearchQuery":
			return {
				...state,
				searchQuery: action.searchQuery,
			};

		case "openDetails":
			return {
				...state,
				selectedRequestId: action.requestId,
				detailsOpen: true,
			};

		case "setDetailsOpen":
			return {
				...state,
				detailsOpen: action.open,
			};

		case "clearSelectedRequest":
			return {
				...state,
				selectedRequestId: null,
				detailsOpen: false,
			};

		case "setFilter":
			return {
				...state,
				filterState: {
					...state.filterState,
					[action.groupId]: {
						value: action.value,
						operator: action.operator,
					},
				},
			};

		case "clearAllFilters":
			return {
				...state,
				filterState: createInitialFilterState(),
			};

		case "setCreateModalOpen":
			return {
				...state,
				isCreateModalOpen: action.open,
			};

		default:
			return state;
	}
}

function isDateRangeValue(value: FilterValue): value is DateRangeValue {
	if (!value || typeof value !== "object" || Array.isArray(value)) return false;

	return "from" in value || "to" in value;
}

function startOfDay(date: Date) {
	const next = new Date(date);
	next.setHours(0, 0, 0, 0);

	return next;
}

function endOfDay(date: Date) {
	const next = new Date(date);
	next.setHours(23, 59, 59, 999);

	return next;
}

function matchSubmittedDate(
	input: string | Date,
	range?: DateRangeValue,
	fallbackOperator?: ManagedFilterValue["operator"],
) {
	if (!range?.from) return true;

	const date = new Date(input);
	const fromStart = startOfDay(range.from);
	const fromEnd = endOfDay(range.from);
	const toEnd = endOfDay(range.to ?? range.from);

	const operator = (range.operator ??
		fallbackOperator ??
		(range.to ? "is between" : "is")) as DateFilterOperator;

	switch (operator) {
		case "is":
			return date >= fromStart && date <= fromEnd;
		case "is not":
			return !(date >= fromStart && date <= fromEnd);
		case "is before":
			return date < fromStart;
		case "is on or after":
			return date >= fromStart;
		case "is after":
			return date > fromEnd;
		case "is on or before":
			return date <= fromEnd;
		case "is between":
			return date >= fromStart && date <= toEnd;
		case "is not between":
			return !(date >= fromStart && date <= toEnd);
		default:
			return true;
	}
}

function resolveOptionOperator(
	operator: ManagedFilterValue["operator"],
	valueCount: number,
) {
	if (operator) {
		return operator as string;
	}

	return valueCount <= 1 ? "is" : "is any of";
}

export function getSelectedValues(value: FilterValue | undefined): string[] {
	if (Array.isArray(value)) {
		return value.filter((item): item is string => typeof item === "string");
	}

	if (typeof value === "string") {
		return [value];
	}

	return [];
}

function useDashboardRequestsController() {
	const [state, dispatch] = useReducer(
		dashboardRequestsReducer,
		INITIAL_DASHBOARD_REQUESTS_STATE,
	);

	const openDetails = useCallback((requestId: string) => {
		dispatch({ type: "openDetails", requestId });
	}, []);

	const setDetailsOpen = useCallback((nextOpen: boolean) => {
		if (nextOpen) {
			dispatch({ type: "setDetailsOpen", open: true });
			return;
		}

		dispatch({ type: "clearSelectedRequest" });
	}, []);

	const setPage = useCallback((nextPage: number) => {
		dispatch({ type: "setPage", page: nextPage });
		dispatch({ type: "clearSelectedRequest" });
	}, []);

	const setSearchQuery = useCallback((nextSearchQuery: string) => {
		dispatch({ type: "setSearchQuery", searchQuery: nextSearchQuery });
	}, []);

	const setCreateModalOpen = useCallback((nextOpen: boolean) => {
		dispatch({ type: "setCreateModalOpen", open: nextOpen });
	}, []);

	const handleFilterChange = useCallback(
		(
			groupId: string,
			value: FilterValue,
			operator?: ManagedFilterValue["operator"],
		) => {
			dispatch({
				type: "setFilter",
				groupId,
				value,
				operator,
			});
		},
		[],
	);

	const clearAllFilters = useCallback(() => {
		dispatch({ type: "clearAllFilters" });
	}, []);

	const actions = useMemo<DashboardRequestsActions>(
		() => ({
			openDetails,
			setDetailsOpen,
			setPage,
			setSearchQuery,
			setCreateModalOpen,
			handleFilterChange,
			clearAllFilters,
		}),
		[
			openDetails,
			setDetailsOpen,
			setPage,
			setSearchQuery,
			setCreateModalOpen,
			handleFilterChange,
			clearAllFilters,
		],
	);

	return {
		state,
		actions,
	};
}

function useRequestsPage(page: number): RequestsPageModel {
	const {
		data: pageData,
		isPending,
		error: requestsError,
	} = useIncomingCommissionRequests(page - 1, ITEMS_PER_PAGE);

	const requests = useMemo<RequestItem[]>(
		() => (pageData?.content ?? []) as RequestItem[],
		[pageData],
	);

	const totalPages = Math.max(1, pageData?.totalPages ?? 1);
	const totalItems = pageData?.totalElements ?? 0;
	const currentPage = (pageData?.number ?? page - 1) + 1;
	const startItem =
		totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
	const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

	return {
		requests,
		isPending,
		requestsError,
		totalPages,
		totalItems,
		currentPage,
		startItem,
		endItem,
	};
}

function useSelectedRequest(
	requests: RequestItem[],
	selectedRequestId: string | null,
) {
	return useMemo(
		() =>
			selectedRequestId
				? (requests.find((request) => request.id === selectedRequestId) ?? null)
				: null,
		[requests, selectedRequestId],
	);
}

function useFilterValues(filterState: ManagedFiltersState) {
	return useMemo<Record<string, ManagedFilterValue>>(
		() => ({
			status: filterState.status,
			payment: filterState.payment,
			timeline: filterState.timeline,
			submittedDate: filterState.submittedDate,
		}),
		[filterState],
	);
}

function useFilteredRequests(
	requests: RequestItem[],
	filterState: ManagedFiltersState,
	searchQuery: string,
) {
	return useMemo(() => {
		const query = searchQuery.trim().toLowerCase();

		const statusValues = getSelectedValues(filterState.status?.value);
		const paymentValues = getSelectedValues(filterState.payment?.value);
		const timelineValues = getSelectedValues(filterState.timeline?.value);
		const submittedDateValue = isDateRangeValue(
			filterState.submittedDate?.value,
		)
			? filterState.submittedDate.value
			: undefined;

		return requests.filter((request) => {
			const payment = getPaymentFilterValue(request);
			const paymentLabel = getPaymentStatus(request);
			const timeline = getRequestTimelineFilterValue(request);

			const matchesSearch = query
				? createSearchText(request, payment, paymentLabel).includes(query)
				: true;

			const matchesStatus = matchesSelectFilter(
				request.status,
				filterState.status,
				statusValues,
			);

			const matchesPayment = matchesSelectFilter(
				payment,
				filterState.payment,
				paymentValues,
			);

			const matchesTimeline = matchesSelectFilter(
				timeline,
				filterState.timeline,
				timelineValues,
			);

			const matchesSubmittedDate = matchSubmittedDate(
				request.createdAt,
				submittedDateValue,
				filterState.submittedDate?.operator,
			);

			return (
				matchesSearch &&
				matchesStatus &&
				matchesPayment &&
				matchesTimeline &&
				matchesSubmittedDate
			);
		});
	}, [filterState, requests, searchQuery]);
}

function createSearchText(
	request: RequestItem,
	payment: string,
	paymentLabel: string,
) {
	return [
		request.id,
		request.commissionId,
		request.artistId,
		request.clientId,
		request.description ?? "",
		request.status,
		payment,
		paymentLabel,
		String(request.commissionVersion ?? ""),
	]
		.join(" ")
		.toLowerCase();
}

function matchesSelectFilter(
	actualValue: string,
	filter: ManagedFilterValue | undefined,
	selectedValues: string[],
) {
	if (selectedValues.length === 0) {
		return true;
	}

	return matchSingleOrMulti(
		actualValue,
		resolveOptionOperator(filter?.operator, selectedValues.length),
		selectedValues,
	);
}

function DashboardCommissionsRequests() {
	const { state, actions } = useDashboardRequestsController();
	const pageModel = useRequestsPage(state.page);
	const selectedRequest = useSelectedRequest(
		pageModel.requests,
		state.selectedRequestId,
	);
	const filteredRequests = useFilteredRequests(
		pageModel.requests,
		state.filterState,
		state.searchQuery,
	);
	const filterValues = useFilterValues(state.filterState);

	return (
		<DashboardCommissionsRequestsPage
			state={state}
			actions={actions}
			pageModel={pageModel}
			filterValues={filterValues}
			filteredRequests={filteredRequests}
			selectedRequest={selectedRequest}
		/>
	);
}

interface DashboardCommissionsRequestsPageProps {
	state: DashboardRequestsState;
	actions: DashboardRequestsActions;
	pageModel: RequestsPageModel;
	filterValues: Record<string, ManagedFilterValue>;
	filteredRequests: RequestItem[];
	selectedRequest: RequestItem | null;
}

function DashboardCommissionsRequestsPage({
	state,
	actions,
	pageModel,
	filterValues,
	filteredRequests,
	selectedRequest,
}: DashboardCommissionsRequestsPageProps) {
	const detailsModalOpen = state.detailsOpen && selectedRequest !== null;

	const handleRequestAction = useCallback(
		(action: string, request: RequestItem) => {
			if (action === "review") {
				actions.openDetails(request.id);
				return;
			}

			if (action === "set_wip") {
				console.log("Set WIP clicked for", request.id);
				return;
			}

			if (action === "final_delivery") {
				console.log("Final delivery clicked for", request.id);
			}
		},
		[actions],
	);

	return (
		<div className="flex h-full flex-1 flex-col bg-muted/40">
			<CommissionsRequestsHeader />

			<div className="flex flex-1 flex-col gap-4 p-6">
				<div className="flex items-center justify-between mb-2">
					<h1 className="text-3xl font-semibold tracking-tight text-foreground">
						Commissions Requests
					</h1>
					<div className="flex items-center gap-3">
						<Button
							size="xl"
							onClick={() =>
								dispatch({ type: "setCreateModalOpen", open: true })
							}
						>
							<OutlinePlus className="size-4 mr-2" />
							<span className="hidden sm:inline">Create Commission</span>
						</Button>
					</div>
				</div>

				<RequestsErrorBanner error={pageModel.requestsError} />

				<FilterBar
					data={pageModel.requests}
					groups={REQUEST_FILTER_GROUPS}
					values={filterValues}
					onFilterChange={actions.handleFilterChange}
					searchQuery={state.searchQuery}
					onSearchChange={actions.setSearchQuery}
					searchPlaceholder="Search by description, commission ID, request ID..."
					onClearAll={actions.clearAllFilters}
				/>

				<RequestList
					requests={filteredRequests}
					onRequestClick={actions.openDetails}
					isPending={pageModel.isPending}
					totalCount={pageModel.totalItems}
					currentPage={pageModel.currentPage}
					totalPages={pageModel.totalPages}
					startItem={pageModel.startItem}
					endItem={pageModel.endItem}
					isRefreshing={pageModel.isPending}
					viewType="artist"
					onPageChange={actions.setPage}
					onAction={handleRequestAction}
				/>

				<RequestDetailsModal
					request={selectedRequest}
					open={detailsModalOpen}
					onOpenChange={actions.setDetailsOpen}
					viewType="artist"
				/>

				<CreateCommissionDialog
					open={state.isCreateModalOpen}
					onOpenChange={actions.setCreateModalOpen}
				/>
			</div>
		</div>
	);
}

function CommissionsRequestsHeader() {
	return <DashboardHeader title="Commissions Requests" />;
}

function RequestsErrorBanner({ error }: { error: unknown }) {
	if (!error) {
		return null;
	}

	return (
		<div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
			{error instanceof Error
				? error.message
				: "Failed to load commission requests."}
		</div>
	);
}

function CreateCommissionDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { user } = useAuth();

	if (!open || !user) {
		return null;
	}

	return (
		<CommissionForm
			username={user.username || user.userId}
			tab="commissions"
			artistId={user.userId}
			onClose={() => onOpenChange(false)}
		/>
	);
}
