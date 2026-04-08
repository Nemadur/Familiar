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
	getPaymentStatus,
	getRequestTimelineFilterValue,
	ITEMS_PER_PAGE,
	matchSingleOrMulti,
	type RequestItem,
	stageLabel,
} from "@/components/layout/my-requests/helpers";
import { RequestList } from "@/components/layout/my-requests/list";
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
		return operator as Parameters<typeof matchSingleOrMulti>[1];
	}

	return (valueCount <= 1 ? "is" : "is any of") as Parameters<
		typeof matchSingleOrMulti
	>[1];
}

export const Route = createFileRoute("/my-requests")({
	component: RouteComponent,
});

function RouteComponent() {
	const [page, setPage] = useState(1);
	const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
		null,
	);
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
	);

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
						id: "PENDING",
						label: stageLabel(TCommissionRequestStatus.Pending),
					},
					{
						id: "ACCEPTED",
						label: stageLabel(TCommissionRequestStatus.Accepted),
					},
					{
						id: "IN_PROGRESS",
						label: stageLabel(TCommissionRequestStatus.In_Progress),
					},
					{
						id: "DELIVERED",
						label: stageLabel(TCommissionRequestStatus.Delivered),
					},
					{
						id: "COMPLETED",
						label: stageLabel(TCommissionRequestStatus.Completed),
					},
					{
						id: "CANCELLED",
						label: stageLabel(TCommissionRequestStatus.Cancelled),
					},
				],
			},
			{
				id: "payment",
				label: "Payment",
				type: "select",
				icon: CreditCard,
				getItemValue: (request) => getPaymentStatus(request),
				options: [
					{
						id: "PENDING",
						label: "Pending",
						icon: OutlineClock03,
					},
					{ id: "COMPLETED", label: "Paid", icon: OutlineCheck },
					{ id: "FAILED", label: "Failed", icon: OutlineClose },
					{ id: "REFUNDED", label: "Refunded", icon: OutlineClose },
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
	);

	const filterValues = useMemo<Record<string, ManagedFilterValue>>(
		() => ({
			status: filterState.status,
			payment: filterState.payment,
			timeline: filterState.timeline,
			submittedDate: filterState.submittedDate,
		}),
		[filterState],
	);

	const filteredRequests = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();

		const statusValues = Array.isArray(filterState.status?.value)
			? filterState.status.value
			: [];
		const paymentValues = Array.isArray(filterState.payment?.value)
			? filterState.payment.value
			: [];
		const timelineValues = Array.isArray(filterState.timeline?.value)
			? filterState.timeline.value
			: [];
		const submittedDateValue = isDateRangeValue(
			filterState.submittedDate?.value,
		)
			? filterState.submittedDate.value
			: undefined;

		return requests.filter((request) => {
			const payment = getPaymentStatus(request);
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
						String(request.commissionVersion ?? ""),
					]
						.join(" ")
						.toLowerCase()
						.includes(query)
				: true;

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
						);

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
						);

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
		}));
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

				<div className="flex items-center justify-between text-xs text-muted-foreground">
					<span>
						Showing{" "}
						<span className="font-medium text-foreground">{startItem}</span>–
						<span className="font-medium text-foreground">{endItem}</span> of{" "}
						<span className="font-medium text-foreground">{totalItems}</span>{" "}
						requests
					</span>

					{isFetching && !showSkeleton && (
						<div className="inline-flex items-center gap-1.5">Refreshing</div>
					)}
				</div>

				<RequestList
					requests={filteredRequests}
					onRequestClick={openDetails}
					isPending={isFetching}
				/>

				{!showSkeleton && totalPages > 1 && (
					<div className="pt-1">
						<Pagination>
							<PaginationContent>
								<PaginationItem>
									<PaginationPrevious
										onClick={(e) => {
											e.preventDefault();
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
													e.preventDefault();
													setPage(item);
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
											e.preventDefault();
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
				)}
			</div>

			<RequestDetailsModal
				request={selectedRequest}
				open={detailsOpen}
				onOpenChange={setDetailsOpen}
			/>
		</Skeleton>
	);
}
