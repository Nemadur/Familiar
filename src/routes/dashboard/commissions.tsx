import { createFileRoute } from "@tanstack/react-router";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIncomingCommissionRequests } from "@/hooks/use-commisions";
import { RequestList } from "@/components/layout/requests/my/list";
import {
	getPaymentFilterValue,
	getPaymentStatus,
	getRequestTimelineFilterValue,
	ITEMS_PER_PAGE,
	matchSingleOrMulti,
	type RequestItem,
	stageLabel,
} from "@/components/layout/requests/my/helpers";
import { useState, useMemo, useEffect } from "react";
import { RequestDetailsModal } from "@/components/layout/modal/my-requests";
import {
	type DateRangeValue,
	FilterBar,
	type FilterGroup,
	type FilterValue,
	type ManagedFilterValue,
} from "@/components/layout/filter-bar";
import { CalendarIcon, CreditCard, Flag, ListFilterIcon } from "lucide-react";
import {
	OutlineCheck,
	OutlineClock03,
	OutlineClose,
} from "@/components/icons/icons";
import { TCommissionRequestStatus } from "@/types/commissions";
import { TPaymentStatus } from "@/types/payment";
import type { DateFilterOperator } from "@/components/data-table-filter/core/types";
import { useAuth } from "@/providers/auth";
import User from "@/components/layout/profile/user";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/dashboard/commissions")({
	component: DashboardCommissions,
});

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

export function getSelectedValues(value: FilterValue | undefined): string[] {
	if (Array.isArray(value)) {
		return value.filter((item): item is string => typeof item === "string");
	}

	if (typeof value === "string") {
		return [value];
	}

	return [];
}

function DashboardCommissions() {
	const [page, setPage] = useState(1);
	const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
		null,
	);
	const [detailsOpen, setDetailsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterState, setFilterState] =
		useState<ManagedFiltersState>(INITIAL_FILTER_STATE);

	const {
		data: pageData,
		isPending,
		error: requestsError,
	} = useIncomingCommissionRequests(page - 1, ITEMS_PER_PAGE);
	const requests = useMemo<RequestItem[]>(
		() => (pageData?.content ?? []) as RequestItem[],
		[pageData],
	);

	const { user, isPending: userIsPending, error: userError } = useAuth();

	const { t } = useTranslation();

	const totalPages = Math.max(1, pageData?.totalPages ?? 1);
	const totalItems = pageData?.totalElements ?? 0;
	const currentPage = (pageData?.number ?? page - 1) + 1;
	const startItem =
		totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
	const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

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

	return (
		<div className="flex flex-1 flex-col gap-4 p-4 pt-0 h-full">
			<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 justify-between">
				<div className="flex items-center gap-2">
					<SidebarTrigger className="-ml-1" />
					<h1 className="text-xl font-bold">Commissions</h1>
				</div>

				{userIsPending ? null : user ? (
					<User user={user} showInfo={false} isDropdown />
				) : (
					<div className="hidden lg:flex items-center gap-2">
						<Button asChild variant={"secondary"} size={"xl"}>
							<Link to="/auth/login">{t("auth.login.cta")}</Link>
						</Button>
						<Button asChild size={"xl"}>
							<Link to="/auth/register">{t("auth.register.cta")}</Link>
						</Button>
					</div>
				)}
			</header>

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

			{/* TODO: remove commission image and artist info for artist dashbarod version */}
			<RequestList
				requests={filteredRequests as any}
				onRequestClick={openDetails}
				isPending={isPending}
				totalCount={totalItems}
				currentPage={currentPage}
				totalPages={totalPages}
				startItem={startItem}
				endItem={endItem}
				isRefreshing={isPending}
				onPageChange={setPage}
			/>

			<RequestDetailsModal
				request={selectedRequest as any}
				open={detailsOpen}
				onOpenChange={setDetailsOpen}
			/>
		</div>
	);
}
