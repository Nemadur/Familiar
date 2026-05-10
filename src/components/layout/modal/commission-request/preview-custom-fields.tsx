import type {
	Column,
	DataTableFilterActions,
	FilterModel,
	FilterStrategy,
} from "@/components/data-table-filter/core/types";
import { isEqual } from "date-fns";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "src/components/ui/calendar";

let clientDefaultMonthSnapshot: Date | undefined;

function subscribeToClientDateStore() {
	return () => {};
}

function getClientDefaultMonthSnapshot() {
	clientDefaultMonthSnapshot ??= new Date();
	return clientDefaultMonthSnapshot;
}

function getServerDefaultMonthSnapshot() {
	return undefined;
}

function useClientDefaultMonth() {
	return useSyncExternalStore(
		subscribeToClientDateStore,
		getClientDefaultMonthSnapshot,
		getServerDefaultMonthSnapshot,
	);
}

// Replace only your existing FilterValueDateController with this version.
export function FilterValueDateController<TData>({
	filter,
	column,
	actions,
}: {
	filter: FilterModel<"date">;
	column: Column<TData, "date">;
	actions: DataTableFilterActions;
	strategy: FilterStrategy;
	locale?: string;
}) {
	const clientDefaultMonth = useClientDefaultMonth();
	const [date, setDate] = useState<DateRange | undefined>({
		from: filter?.values[0] ?? undefined,
		to: filter?.values[1] ?? undefined,
	});

	useEffect(() => {
		setDate({
			from: filter?.values[0] ?? undefined,
			to: filter?.values[1] ?? undefined,
		});
	}, [filter?.values]);

	function changeDateRange(value: DateRange | undefined) {
		const start = value?.from;
		const end =
			start && value?.to && !isEqual(start, value.to) ? value.to : undefined;

		setDate({ from: start, to: end });

		const isRange = !!start && !!end;
		const newValues = isRange ? [start, end] : start ? [start] : [];

		actions.setFilterValue(column, newValues);
	}

	return (
		<Calendar
			mode="range"
			defaultMonth={date?.from ?? clientDefaultMonth}
			selected={date}
			onSelect={changeDateRange}
			numberOfMonths={2}
		/>
	);
}
