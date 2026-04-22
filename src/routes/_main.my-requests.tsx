import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "boneyard-js/react";
import { CalendarIcon, CreditCard, Flag, ListFilterIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DateFilterOperator } from "@/components/data-table-filter/core/types";
import {
	OutlineCheck,
	OutlineClock03,
	OutlineClose,
} from "@/components/icons/icons";
import {
	type DateRangeValue,
	FilterBar,
	type FilterGroup,
	type FilterValue,
	type ManagedFilterValue,
} from "@/components/layout/filter-bar";
import { RequestDetailsModal } from "@/components/layout/modal/my-requests";
import {
	generatePaginationItems,
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
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { useMyCommissionRequests } from "@/hooks/use-commisions";
import { cn } from "@/lib/utils";
import { TCommissionRequestStatus } from "@/types/commissions";
import { TPaymentStatus } from "@/types/payment";

type ManagedFilterEntry = ManagedFilterValue;
type ManagedFiltersState = Record<string, ManagedFilterEntry>;

const INITIAL_FILTER_STATE: ManagedFiltersState = {
	status: { value: [] },
	payment: { value: [] },
	timeline: { value: [] },
	submittedDate: {
		value: { from: undefined, to: undefined },
		operator: "is between",
	},
};

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

export const Route = createFileRoute("/_main/my-requests")({
	component: RouteComponent,
});

export function getSelectedValues(value: FilterValue | undefined): string[] {
	if (Array.isArray(value)) {
		return value.filter((item): item is string => typeof item === "string");
	}

	if (typeof value === "string") {
		return [value];
	}

	return [];
}

function RouteComponent() {
	const [page, setPage] = useState(1);
	const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
		null,
	)
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterState, setFilterState] =
		useState<ManagedFiltersState>(INITIAL_FILTER_STATE);

	const {
		data: myRequestsData,
		isFetching,
		isError,
		error,
	} = useMyCommissionRequests(page - 1, ITEMS_PER_PAGE);

	useEffect(() => {
		if (isError) {
			console.error("[MyRequestsPage] Error fetching requests:", error);
		}
	}, [isError, error]);

	const pageData = myRequestsData;
	const requests = useMemo<RequestItem[]>(
		() => pageData?.content ?? [],
		[pageData],
	)

	const showSkeleton = !pageData && !isError;

	const filterGroups = useMemo<FilterGroup<RequestItem>[]>(
		() => [
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
		],
		[],
	)

	const filterValues = useMemo<Record<string, ManagedFilterValue>>(
		() => ({
			status: filterState.status,
			payment: filterState.payment,
			timeline: filterState.timeline,
			submittedDate: filterState.submittedDate,
		}),
		[filterState],
	)

	const filteredRequests = useMemo(() => {
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
				? [
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
						.toLowerCase()
						.includes(query)
				: true

			const matchesStatus =
				statusValues.length === 0
					? true
					: matchSingleOrMulti(
							request.status,
							resolveOptionOperator(
								filterState.status?.operator,
								statusValues.length,
							),
							statusValues,
						)

			const matchesPayment =
				paymentValues.length === 0
					? true
					: matchSingleOrMulti(
							payment,
							resolveOptionOperator(
								filterState.payment?.operator,
								paymentValues.length,
							),
							paymentValues,
						)

			const matchesTimeline =
				timelineValues.length === 0
					? true
					: matchSingleOrMulti(
							timeline,
							resolveOptionOperator(
								filterState.timeline?.operator,
								timelineValues.length,
							),
							timelineValues,
						)

			const matchesSubmittedDate = matchSubmittedDate(
				request.createdAt,
				submittedDateValue,
				filterState.submittedDate?.operator,
			)

			return (
				matchesSearch &&
				matchesStatus &&
				matchesPayment &&
				matchesTimeline &&
				matchesSubmittedDate
			)
		})
	}, [filterState, requests, searchQuery]);

	const totalPages = Math.max(1, pageData?.totalPages ?? 1);
	const totalItems = pageData?.totalElements ?? 0;
	const currentPage = (pageData?.number ?? page - 1) + 1;
	const startItem =
		totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
	const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);
	const paginationItems = generatePaginationItems(currentPage, totalPages);

	const selectedRequest =
		requests.find((request) => request.id === selectedRequestId) ?? null;

	useEffect(() => {
		if (
			selectedRequestId &&
			!requests.some((request) => request.id === selectedRequestId)
		) {
			setSelectedRequestId(null);
			setDetailsOpen(false);
		}
	}, [requests, selectedRequestId]);

	function openDetails(requestId: string) {
		setSelectedRequestId(requestId);
		setDetailsOpen(true);
	}

	function handleFilterChange(
		groupId: string,
		value: FilterValue,
		operator?: ManagedFilterValue["operator"],
	) {
		setFilterState((previous) => ({
			...previous,
			[groupId]: {
				value,
				operator,
			},
		}))
	}

	function clearAllFilters() {
		setFilterState(INITIAL_FILTER_STATE);
	}

	if (isError) {
		return (
			<div className="border-b pb-4">
				<p className="text-sm font-medium text-destructive">
					Could not load your requests
				</p>
				<p className="mt-1 text-xs text-muted-foreground">{error?.message}</p>
			</div>
		)
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

				{/* {!showSkeleton && totalPages > 1 && (
					<div className="pt-1">
						<Pagination>
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										onClick={(e) => {
											e.preventDefault()
											if (currentPage > 1) setPage(currentPage - 1);
										}}
										className={cn(
											currentPage <= 1 && "pointer-events-none opacity-50",
										)}
									/>
								</PaginationItem>

								{paginationItems.map((item) =>
									typeof item !== "number" ? (
										<PaginationItem key={`${item}`}>
											<PaginationEllipsis />
										</PaginationItem>
									) : (
										<PaginationItem key={item}>
											<PaginationLink
												isActive={item === currentPage}
												onClick={(e) => {
													e.preventDefault()
													setPage(item)
												}}
											>
												{item}
											</PaginationLink>
										</PaginationItem>
									),
								)}

								<PaginationItem>
									<PaginationNext
										onClick={(e) => {
											e.preventDefault()
											if (currentPage < totalPages) setPage(currentPage + 1);
										}}
										className={cn(
											currentPage >= totalPages &&
												"pointer-events-none opacity-50",
										)}
									/>
								</PaginationItem>
							</PaginationContent>
						</Pagination>
					</div>
				)} */}
			</div>

			<RequestDetailsModal
				request={selectedRequest as any}
				open={detailsOpen}
				onOpenChange={setDetailsOpen}
				viewType="client"
			/>
		</Skeleton>
	)
}
