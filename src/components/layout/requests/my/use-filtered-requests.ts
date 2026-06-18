import { useMemo } from "react";
import {
	getPaymentFilterValue,
	getPaymentStatus,
	getRequestTimelineFilterValue,
	matchSingleOrMulti,
	type RequestItem,
} from "@/components/layout/requests/my/helpers";
import {
	getSelectedValues,
	isDateRangeValue,
	matchSubmittedDate,
	resolveOptionOperator,
} from "@/components/layout/requests/my/filtering";
import type { ManagedFiltersState } from "@/components/layout/requests/my/page-state";

interface UseFilteredMyRequestsParams {
	requests: RequestItem[];
	searchQuery: string;
	filterState: ManagedFiltersState;
}

export function useFilteredMyRequests({
	requests,
	searchQuery,
	filterState,
}: UseFilteredMyRequestsParams) {
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
}
