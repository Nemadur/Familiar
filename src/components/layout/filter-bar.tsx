import { ScrollShadow } from "@heroui/react";
import { Search } from "lucide-react";
import type React from "react";
import { useMemo } from "react";
import { useDataTableFilters } from "@/components/data-table-filter";
import { ActiveFilters } from "@/components/data-table-filter/components/active-filters";
import { FilterActions } from "@/components/data-table-filter/components/filter-actions";
import { FilterSelector } from "@/components/data-table-filter/components/filter-selector";
import { createColumnConfigHelper } from "@/components/data-table-filter/core/filters";
import { DEFAULT_OPERATORS } from "@/components/data-table-filter/core/operators";
import type {
	ColumnConfig,
	ColumnDataType,
	ColumnOption,
	DateFilterOperator,
	FilterModel,
	FilterOperators,
	FiltersState,
	MultiOptionFilterOperator,
	NumberFilterOperator,
	OptionFilterOperator,
	TextFilterOperator,
} from "@/components/data-table-filter/core/types";
import { cn } from "@/lib/utils";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "../ui/input-group";

type FilterOperator = FilterOperators[ColumnDataType];

export type FilterGroupType =
	| "select"
	| "multiselect"
	| "boolean"
	| "range"
	| "date"
	| "text";

export type DateRangeValue = {
	from?: Date;
	to?: Date;
	operator?: DateFilterOperator;
};

export type FilterValue = string[] | number[] | DateRangeValue | string;

export type ManagedFilterValue = {
	value: FilterValue;
	operator?: FilterOperator;
};

export type FilterOption = {
	id: string;
	label: string;
	value?: string;
	count?: number;
	icon?: ColumnOption["icon"];
	parentId?: string;
};

export type FilterGroup<TData> = {
	id: string;
	label: string;
	type: FilterGroupType;
	icon: React.ComponentType<{ className?: string }>;
	getItemValue: (item: TData) => unknown;
	options?: FilterOption[];
};

interface FilterBarProps<TData> {
	data: TData[];
	groups: FilterGroup<TData>[];
	values?: Record<string, FilterValue | ManagedFilterValue | undefined>;
	onFilterChange: (
		groupId: string,
		value: FilterValue,
		operator?: FilterOperator,
	) => void;
	searchQuery?: string;
	onSearchChange?: (value: string) => void;
	searchPlaceholder?: string;
	onClearAll?: () => void;
	className?: string;
}

const EMPTY_FILTER_VALUES: Record<
	string,
	FilterValue | ManagedFilterValue | undefined
> = {};

function asColumnConfig<TData>(config: unknown): ColumnConfig<TData> {
	return config as ColumnConfig<TData>;
}

function isManagedFilterValue(
	value: FilterValue | ManagedFilterValue | undefined,
): value is ManagedFilterValue {
	return (
		!!value &&
		typeof value === "object" &&
		!Array.isArray(value) &&
		"value" in value
	);
}

function isDateRangeValue(
	value: FilterValue | undefined,
): value is DateRangeValue {
	return (
		!!value &&
		typeof value === "object" &&
		!Array.isArray(value) &&
		("from" in value || "to" in value)
	);
}

function mapGroupTypeToColumnType(type: FilterGroupType): ColumnDataType {
	switch (type) {
		case "select":
		case "boolean":
			return "option";
		case "multiselect":
			return "multiOption";
		case "range":
			return "number";
		case "date":
			return "date";
		default:
			return "text";
	}
}

function getEmptyFilterValue(type: FilterGroupType): FilterValue {
	switch (type) {
		case "range":
			return [];
		case "date":
			return { from: undefined, to: undefined };
		case "text":
			return "";
		default:
			return [];
	}
}

function normalizeFilterOptions(options: FilterOption[]): ColumnOption[] {
	const normalizedOptions: ColumnOption[] = [];

	for (const option of options) {
		normalizedOptions.push({
			label: option.label,
			value: option.value ?? option.id,
			icon: option.icon,
			parentId: option.parentId,
			id: option.id,
		});
	}

	return normalizedOptions;
}

function normalizeBooleanOptions(options?: FilterOption[]): ColumnOption[] {
	if (!options?.length) {
		return [
			{ label: "Yes", value: "true" },
			{ label: "No", value: "false" },
		];
	}

	const normalizedOptions: ColumnOption[] = [];

	for (const option of options) {
		normalizedOptions.push({
			label: option.label,
			value: option.value ?? option.id,
			icon: option.icon,
		});
	}

	return normalizedOptions;
}

function normalizeColumnOptions(
	group: FilterGroup<unknown>,
): ColumnOption[] | undefined {
	if (group.type === "boolean") {
		return normalizeBooleanOptions(group.options);
	}

	if (!group.options?.length) return undefined;

	return normalizeFilterOptions(group.options);
}

function getOptionValue(raw: unknown) {
	if (raw == null) return undefined;

	return String(raw);
}

function getMultiOptionValue(raw: unknown) {
	if (!Array.isArray(raw)) return undefined;

	const values: string[] = [];

	for (const value of raw) {
		if (value != null) {
			values.push(String(value));
		}
	}

	return values;
}

function getNumberValue(raw: unknown) {
	if (typeof raw === "number" && Number.isFinite(raw)) return raw;
	if (
		typeof raw === "string" &&
		raw.trim() !== "" &&
		Number.isFinite(Number(raw))
	) {
		return Number(raw);
	}

	return undefined;
}

function getDateValue(raw: unknown) {
	if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw;

	if (typeof raw === "string" || typeof raw === "number") {
		const parsed = new Date(raw);

		if (!Number.isNaN(parsed.getTime())) return parsed;
	}

	return undefined;
}

function getManagedValue(input: FilterValue | ManagedFilterValue | undefined) {
	if (isManagedFilterValue(input)) {
		return input;
	}

	if (input == null) return undefined;

	return { value: input } satisfies ManagedFilterValue;
}

function getStringFilterValues(value: FilterValue): string[] {
	if (!Array.isArray(value)) return [];

	const values: string[] = [];

	for (const item of value) {
		if (typeof item === "string") {
			values.push(item);
		}
	}

	return values;
}

function getNumberFilterValues(value: FilterValue): number[] {
	if (!Array.isArray(value)) return [];

	const values: number[] = [];

	for (const item of value) {
		if (typeof item === "number") {
			values.push(item);
		}
	}

	return values;
}

function getDateFilterValues(dateRange?: DateRangeValue): Date[] {
	const values: Date[] = [];

	if (dateRange?.from instanceof Date) {
		values.push(dateRange.from);
	}

	if (dateRange?.to instanceof Date) {
		values.push(dateRange.to);
	}

	return values;
}

function toFilterModel<TData>(
	group: FilterGroup<TData>,
	input: FilterValue | ManagedFilterValue | undefined,
): FilterModel | null {
	const managed = getManagedValue(input);
	if (!managed) return null;

	const columnType = mapGroupTypeToColumnType(group.type);

	switch (columnType) {
		case "option": {
			const values = getStringFilterValues(managed.value);

			if (values.length === 0) return null;

			return {
				columnId: group.id,
				type: "option",
				operator:
					(managed.operator as OptionFilterOperator | undefined) ??
					(values.length > 1
						? DEFAULT_OPERATORS.option.multiple
						: DEFAULT_OPERATORS.option.single),
				values,
			};
		}

		case "multiOption": {
			const values = getStringFilterValues(managed.value);

			if (values.length === 0) return null;

			return {
				columnId: group.id,
				type: "multiOption",
				operator:
					(managed.operator as MultiOptionFilterOperator | undefined) ??
					(values.length > 1
						? DEFAULT_OPERATORS.multiOption.multiple
						: DEFAULT_OPERATORS.multiOption.single),
				values,
			};
		}

		case "number": {
			const values = getNumberFilterValues(managed.value);

			if (values.length === 0) return null;

			return {
				columnId: group.id,
				type: "number",
				operator:
					(managed.operator as NumberFilterOperator | undefined) ??
					(values.length > 1
						? DEFAULT_OPERATORS.number.multiple
						: DEFAULT_OPERATORS.number.single),
				values,
			};
		}

		case "date": {
			const dateRange = isDateRangeValue(managed.value)
				? managed.value
				: undefined;
			const values = getDateFilterValues(dateRange);

			if (values.length === 0) return null;

			return {
				columnId: group.id,
				type: "date",
				operator:
					(managed.operator as DateFilterOperator | undefined) ??
					dateRange?.operator ??
					(values.length > 1
						? DEFAULT_OPERATORS.date.multiple
						: DEFAULT_OPERATORS.date.single),
				values,
			};
		}

		default: {
			const value = typeof managed.value === "string" ? managed.value : "";
			if (!value.trim()) return null;

			return {
				columnId: group.id,
				type: "text",
				operator:
					(managed.operator as TextFilterOperator | undefined) ??
					DEFAULT_OPERATORS.text.single,
				values: [value],
			};
		}
	}
}

function fromFilterModel(filter: FilterModel): {
	value: FilterValue;
	operator?: FilterOperator;
} {
	switch (filter.type) {
		case "option":
		case "multiOption":
			return { value: [...filter.values], operator: filter.operator };
		case "number":
			return { value: [...filter.values], operator: filter.operator };
		case "date":
			return {
				value: {
					from: filter.values[0],
					to: filter.values[1],
					operator: filter.operator,
				},
				operator: filter.operator,
			};
		default:
			return { value: filter.values[0] ?? "", operator: filter.operator };
	}
}

function getControlledFilters<TData>(
	groups: FilterGroup<TData>[],
	values: Record<string, FilterValue | ManagedFilterValue | undefined>,
): FiltersState {
	const filters: FiltersState = [];

	for (const group of groups) {
		const filter = toFilterModel(group, values[group.id]);

		if (filter) {
			filters.push(filter);
		}
	}

	return filters;
}

function getNextFiltersById(nextFilters: FiltersState) {
	const nextById = new Map<string, FilterModel>();

	for (const filter of nextFilters) {
		nextById.set(filter.columnId, filter);
	}

	return nextById;
}

export function FilterBar<TData>({
	data,
	groups,
	values = EMPTY_FILTER_VALUES,
	onFilterChange,
	searchQuery = "",
	onSearchChange,
	searchPlaceholder = "Search…",
	onClearAll,
	className,
}: FilterBarProps<TData>) {
	const dtf = useMemo(() => createColumnConfigHelper<TData>(), []);

	const columnsConfig = useMemo<ReadonlyArray<ColumnConfig<TData>>>(() => {
		return groups.map((group) => {
			const columnType = mapGroupTypeToColumnType(group.type);
			const options = normalizeColumnOptions(group as FilterGroup<unknown>);

			switch (columnType) {
				case "option": {
					let builder = dtf
						.option()
						.id(group.id)
						.accessor((row) => getOptionValue(group.getItemValue(row)))
						.displayName(group.label)
						.icon(group.icon);

					if (options?.length) builder = builder.options(options);
					return asColumnConfig(builder.build());
				}

				case "multiOption": {
					let builder = dtf
						.multiOption()
						.id(group.id)
						.accessor((row) => getMultiOptionValue(group.getItemValue(row)))
						.displayName(group.label)
						.icon(group.icon);

					if (options?.length) builder = builder.options(options);
					return asColumnConfig(builder.build());
				}

				case "number":
					return asColumnConfig(
						dtf
							.number()
							.id(group.id)
							.accessor((row) => getNumberValue(group.getItemValue(row)))
							.displayName(group.label)
							.icon(group.icon)
							.build(),
					);

				case "date":
					return asColumnConfig(
						dtf
							.date()
							.id(group.id)
							.accessor((row) => getDateValue(group.getItemValue(row)))
							.displayName(group.label)
							.icon(group.icon)
							.build(),
					);

				default:
					return asColumnConfig(
						dtf
							.text()
							.id(group.id)
							.accessor((row) => String(group.getItemValue(row) ?? ""))
							.displayName(group.label)
							.icon(group.icon)
							.build(),
					);
			}
		});
	}, [dtf, groups]);

	const controlledFilters = useMemo<FiltersState>(
		() => getControlledFilters(groups, values),
		[groups, values],
	);

	const { columns, filters, actions, strategy } = useDataTableFilters({
		strategy: "client",
		data,
		columnsConfig,
		filters: controlledFilters,
		onFiltersChange: (nextValue) => {
			const nextFilters =
				typeof nextValue === "function"
					? nextValue(controlledFilters)
					: nextValue;
			const nextById = getNextFiltersById(nextFilters);

			for (const group of groups) {
				const nextFilter = nextById.get(group.id);

				if (!nextFilter) {
					onFilterChange(group.id, getEmptyFilterValue(group.type));
					continue;
				}

				const managed = fromFilterModel(nextFilter);
				onFilterChange(group.id, managed.value, managed.operator);
			}
		},
	});

	const wrappedActions = useMemo(
		() => ({
			...actions,
			removeAllFilters: () => {
				if (onClearAll) {
					onClearAll();
					return;
				}

				actions.removeAllFilters();
			},
		}),
		[actions, onClearAll],
	);

	return (
		<div className={cn("flex flex-col gap-3", className)}>
			<div className="flex items-center gap-3">
				<div className="min-w-0 flex-1">
					<InputGroup className="w-full">
						<InputGroupAddon>
							<Search className="size-4" />
						</InputGroupAddon>
						<InputGroupInput
							value={searchQuery}
							onChange={(event) => onSearchChange?.(event.target.value)}
							placeholder={searchPlaceholder}
						/>
					</InputGroup>
				</div>

				<div className="shrink-0">
					<FilterSelector
						columns={columns}
						filters={filters}
						actions={wrappedActions}
						strategy={strategy}
						backButtonMode="floating"
					/>
				</div>
			</div>

			<ScrollShadow
				orientation="horizontal"
				hideScrollBar
				className="flex w-full justify-between"
			>
				<div className="flex min-w-max items-start gap-2 pb-1">
					<ActiveFilters
						columns={columns}
						filters={filters}
						actions={wrappedActions}
						strategy={strategy}
					/>
				</div>
				<FilterActions
					hasFilters={filters.length > 0}
					actions={wrappedActions}
				/>
			</ScrollShadow>
		</div>
	);
}
