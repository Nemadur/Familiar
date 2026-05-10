import type { DateFilterOperator } from "@/components/data-table-filter/core/types";
import type {
	DateRangeValue,
	FilterValue,
	ManagedFilterValue,
} from "@/components/layout/filter-bar";

export function isDateRangeValue(value: FilterValue): value is DateRangeValue {
	if (!value || typeof value !== "object" || Array.isArray(value)) return false;

	return "from" in value || "to" in value;
}

export function startOfDay(date: Date) {
	const next = new Date(date);
	next.setHours(0, 0, 0, 0);

	return next;
}

export function endOfDay(date: Date) {
	const next = new Date(date);
	next.setHours(23, 59, 59, 999);

	return next;
}

export function matchSubmittedDate(
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

export function resolveOptionOperator(
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
