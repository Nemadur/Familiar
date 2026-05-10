import { CalendarIcon, CreditCard, Flag, ListFilterIcon } from "lucide-react";
import { useMemo } from "react";
import {
	OutlineCheck,
	OutlineClock03,
	OutlineClose,
} from "@/components/icons/icons";
import type { FilterGroup } from "@/components/layout/filter-bar";
import {
	getPaymentFilterValue,
	getRequestTimelineFilterValue,
	type RequestItem,
	stageLabel,
} from "@/components/layout/requests/my/helpers";
import { TCommissionRequestStatus } from "@/types/commissions";
import { TPaymentStatus } from "@/types/payment";

export function useMyRequestFilterGroups() {
	return useMemo<FilterGroup<RequestItem>[]>(
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
}
