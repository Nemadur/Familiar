import type { DateRange } from "react-day-picker";
import {
	type TCommissionRequest,
	TCommissionRequestStatus,
} from "@/types/commissions";
import { TPaymentStatus } from "@/types/payment";

export type RequestPayment = {
	paymentStatus: TPaymentStatus;
	updatedAt: string;
} | null;

export type RequestItem = Omit<TCommissionRequest, "payment"> & {
	payment: RequestPayment;
};

export type SortValue = "newest" | "oldest" | "updated";
export type QuickTab = "all" | "pending" | "accepted" | "completed" | "other";
export type DetailTab = "details" | "delivery" | "review";

export const ITEMS_PER_PAGE = 10;

export function getPaymentStatus(request: RequestItem): TPaymentStatus {
	return request.payment?.paymentStatus ?? TPaymentStatus.Pending;
}

export function getPaymentFilterValue(request: RequestItem): TPaymentStatus {
	return request.payment?.paymentStatus ?? TPaymentStatus.Pending;
}

export type TimelineFilterValue =
	| "awaiting_review"
	| "accepted"
	| "in_progress"
	| "delivered"
	| "completed"
	| "cancelled";

export function getRequestTimelineFilterValue(
	request: RequestItem,
): TimelineFilterValue {
	switch (request.status) {
		case TCommissionRequestStatus.Pending:
			return "awaiting_review";
		case TCommissionRequestStatus.Accepted:
			return "accepted";
		case TCommissionRequestStatus.In_Progress:
			return "in_progress";
		case TCommissionRequestStatus.Delivered:
			return "delivered";
		case TCommissionRequestStatus.Completed:
			return "completed";
		case TCommissionRequestStatus.Cancelled:
			return "cancelled";
		default:
			return "awaiting_review";
	}
}

export function stageLabel(stage: TCommissionRequestStatus): string {
	switch (stage) {
		case TCommissionRequestStatus.Pending:
			return "Pending";
		case TCommissionRequestStatus.Accepted:
			return "Accepted";
		case TCommissionRequestStatus.In_Progress:
			return "In Progress";
		case TCommissionRequestStatus.Delivered:
			return "Delivered";
		case TCommissionRequestStatus.Completed:
			return "Completed";
		case TCommissionRequestStatus.Cancelled:
			return "Cancelled";
		default:
			return "Unknown";
	}
}

export function paymentLabel(payment: TPaymentStatus): string {
	switch (payment) {
		case TPaymentStatus.Completed:
			return "Paid";
		case TPaymentStatus.Pending:
			return "Pending";
		case TPaymentStatus.Failed:
			return "Failed";
		case TPaymentStatus.Refunded:
			return "Refunded";
		default:
			return "Pending";
	}
}

export function statusTone(stage: TCommissionRequestStatus) {
	switch (stage) {
		case TCommissionRequestStatus.Pending:
			return "warning_ghost";
		case TCommissionRequestStatus.Accepted:
			return "success_ghost";
		case TCommissionRequestStatus.In_Progress:
			return "info_ghost";
		case TCommissionRequestStatus.Delivered:
			return "info_ghost";
		case TCommissionRequestStatus.Completed:
			return "success_ghost";

		case TCommissionRequestStatus.Cancelled:
			return "danger_ghost";
	}
}

export function paymentTone(payment: TPaymentStatus) {
	switch (payment) {
		case TPaymentStatus.Completed:
			return "success_ghost";
		case TPaymentStatus.Pending:
			return "warning_ghost";
		case TPaymentStatus.Failed:
			return "danger_ghost";
		case TPaymentStatus.Refunded:
			return "info_ghost";
		default:
			return "warning_ghost";
	}
}

export function formatShortDate(date: string) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(new Date(date));
}

export function formatTime(date: string) {
	return new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(date));
}

export function formatDetailedDate(date: string) {
	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(new Date(date));
}

export function shortId(value: string, start = 6, end = 4) {
	if (!value) return "";
	if (value.length <= start + end) return value;
	return `${value.slice(0, start)}…${value.slice(-end)}`;
}

export function getRequestTitle(request: RequestItem) {
	const text = request.description?.trim();
	if (!text) return `Commission request ${shortId(request.id)}`;
	return text.length > 44 ? `${text.slice(0, 44).trimEnd()}…` : text;
}

export function getRequestAvatarLabel(request: RequestItem) {
	const seed = request.artistId || request.commissionId || request.id;
	return seed.slice(0, 2).toUpperCase();
}

export function getRequestTimeline(request: RequestItem) {
	if (request.status === TCommissionRequestStatus.Completed) {
		return {
			primary: "Completed",
			secondary: `Updated ${formatShortDate(request.updatedAt)}`,
		};
	}

	if (request.status === TCommissionRequestStatus.Delivered) {
		return {
			primary: "Ready for review",
			secondary: `Updated ${formatShortDate(request.updatedAt)}`,
		};
	}

	if (request.status === TCommissionRequestStatus.In_Progress) {
		return {
			primary: "Work in progress",
			secondary: `Updated ${formatShortDate(request.updatedAt)}`,
		};
	}

	if (request.status === TCommissionRequestStatus.Accepted) {
		return {
			primary: "Accepted",
			secondary: `Updated ${formatShortDate(request.updatedAt)}`,
		};
	}

	if (request.status === TCommissionRequestStatus.Cancelled) {
		return {
			primary: "Cancelled",
			secondary: `Updated ${formatShortDate(request.updatedAt)}`,
		};
	}

	return {
		primary: "Awaiting review",
		secondary: `Submitted ${formatShortDate(request.createdAt)}`,
	};
}

export function matchQuickTab(status: TCommissionRequestStatus, tab: QuickTab) {
	if (tab === "all") return true;
	if (tab === "pending") return status === TCommissionRequestStatus.Pending;
	if (tab === "accepted") {
		return (
			status === TCommissionRequestStatus.Accepted ||
			status === TCommissionRequestStatus.In_Progress
		);
	}
	if (tab === "completed") {
		return (
			status === TCommissionRequestStatus.Completed ||
			status === TCommissionRequestStatus.Delivered
		);
	}
	return status === TCommissionRequestStatus.Cancelled;
}

export function generatePaginationItems(
	currentPage: number,
	totalPages: number,
) {
	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	if (currentPage <= 3) {
		return [1, 2, 3, 4, "ellipsis", totalPages] as const;
	}

	if (currentPage >= totalPages - 2) {
		return [
			1,
			"ellipsis",
			totalPages - 3,
			totalPages - 2,
			totalPages - 1,
			totalPages,
		] as const;
	}

	return [
		1,
		"ellipsis-left",
		currentPage - 1,
		currentPage,
		currentPage + 1,
		"ellipsis-right",
		totalPages,
	] as const;
}

function startOfLocalDay(date: Date) {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

function endOfLocalDay(date: Date) {
	const d = new Date(date);
	d.setHours(23, 59, 59, 999);
	return d;
}

export function matchesSubmittedRange(dateString: string, range?: DateRange) {
	if (!range?.from && !range?.to) return true;

	const value = new Date(dateString).getTime();
	const from = range?.from
		? startOfLocalDay(range.from).getTime()
		: Number.NEGATIVE_INFINITY;
	const to = range?.to
		? endOfLocalDay(range.to).getTime()
		: Number.POSITIVE_INFINITY;

	return value >= from && value <= to;
}

export function matchSingleOrMulti(
	actual: string,
	operator?: string,
	values: unknown[] = [],
) {
	const selected = values.filter((v): v is string => typeof v === "string");
	if (!selected.length) return true;

	switch (operator) {
		case "is":
			return actual === selected[0];

		case "is not":
		case "is_not":
			return actual !== selected[0];

		case "is any of":
		case "is_any_of":
			return selected.includes(actual);

		case "is none of":
		case "is_none_of":
			return !selected.includes(actual);

		default:
			return true;
	}
}

export function matchDateFilter(
	dateString: string,
	operator: string,
	values: unknown[],
) {
	if (!values?.length || typeof values[0] !== "string") return true;

	const from = new Date(values[0]);
	const to =
		values[1] && typeof values[1] === "string"
			? new Date(values[1])
			: new Date(values[0]);

	const inRange = matchesSubmittedRange(dateString, { from, to });
	return operator === "not_between" ? !inRange : inRange;
}
