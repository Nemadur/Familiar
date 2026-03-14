import { type ReactNode, useMemo, useRef } from "react";
import {
	DataTableFilter,
	useDataTableFilters,
} from "@/components/data-table-filter";
import type {
	ColumnConfig,
	ColumnDataType,
	FiltersState,
	MultiOptionFilterOperator,
	NumberFilterOperator,
	OptionFilterOperator,
} from "@/components/data-table-filter/core/types";
import { OutlineFilter, OutlineSearch } from "@/components/icons/icons";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

/* =========================
   Types
========================= */

export interface FilterOption {
	id: string;
	label: string;
	value?: string;
	count?: number;
}

export type FilterGroupType = "select" | "multiselect" | "boolean" | "range";

export interface RangeValue {
	min?: number;
	max?: number;
	operator?: NumberFilterOperator;
}

export interface RangeConfig {
	min: number;
	max: number;
	step?: number;
	presets?: Array<{
		id: string;
		label: string;
		value: RangeValue;
	}>;
	minLabel?: string;
	maxLabel?: string;
	formatValue?: (value: number) => string;
}

export interface FilterGroup {
	id: string;
	label: string;
	description?: string;
	type: FilterGroupType;
	options?: FilterOption[];
	range?: RangeConfig;
}

export interface SortOption {
	id: string;
	label: string;
}

export type FilterValue = string[] | boolean | RangeValue;

interface FilterBarV4Props {
	groups: FilterGroup[];
	values: Record<string, FilterValue>;
	onFilterChange: (
		groupId: string,
		value: FilterValue,
		operator?: string,
	) => void;

	searchQuery: string;
	onSearchChange: (query: string) => void;
	searchPlaceholder?: string;

	sortOptions?: SortOption[];
	sortValue?: string;
	onSortChange?: (value: string) => void;

	extraActions?: ReactNode;
	className?: string;
	onClearAll?: () => void;
}

/* =========================
   Helpers
========================= */

function isRangeValue(value: FilterValue | undefined): value is RangeValue {
	return (
		typeof value === "object" &&
		value !== null &&
		!Array.isArray(value) &&
		("min" in value || "max" in value)
	);
}

const SINGLE_NUMBER_OPERATORS: NumberFilterOperator[] = [
	"is",
	"is not",
	"is less than",
	"is greater than or equal to",
	"is greater than",
	"is less than or equal to",
];

const RANGE_NUMBER_OPERATORS: NumberFilterOperator[] = [
	"is between",
	"is not between",
];

const SINGLE_OPTION_OPERATORS: OptionFilterOperator[] = ["is", "is not"];

const MULTI_OPTION_OPERATORS: OptionFilterOperator[] = [
	"is any of",
	"is none of",
];

const SINGLE_MULTI_OPTION_OPERATORS: MultiOptionFilterOperator[] = [
	"include",
	"exclude",
];

const MULTI_MULTI_OPTION_OPERATORS: MultiOptionFilterOperator[] = [
	"include any of",
	"include all of",
	"exclude if any of",
	"exclude if all",
];

function resolveNumberOperator(
	operator: NumberFilterOperator | undefined,
	isSingle: boolean,
): NumberFilterOperator {
	if (isSingle) {
		return operator && SINGLE_NUMBER_OPERATORS.includes(operator)
			? operator
			: "is";
	}
	return operator && RANGE_NUMBER_OPERATORS.includes(operator)
		? operator
		: "is between";
}

function resolveOptionOperator(
	operator: OptionFilterOperator | undefined,
	valueCount: number,
): OptionFilterOperator {
	if (valueCount <= 1) {
		return operator && SINGLE_OPTION_OPERATORS.includes(operator)
			? operator
			: "is";
	}
	return operator && MULTI_OPTION_OPERATORS.includes(operator)
		? operator
		: "is any of";
}

function resolveMultiOptionOperator(
	operator: MultiOptionFilterOperator | undefined,
	valueCount: number,
): MultiOptionFilterOperator {
	if (valueCount <= 1) {
		return operator && SINGLE_MULTI_OPTION_OPERATORS.includes(operator)
			? operator
			: "include";
	}
	return operator && MULTI_MULTI_OPTION_OPERATORS.includes(operator)
		? operator
		: "include any of";
}

/* =========================
   Main Component
========================= */

export function FilterBar({
	groups,
	values,
	onFilterChange,
	searchQuery,
	onSearchChange,
	searchPlaceholder = "Search...",
	extraActions,
	className,
	onClearAll,
}: FilterBarV4Props) {
	const operatorMemoryRef = useRef<Record<string, string>>({});

	const columnsConfig = useMemo<ColumnConfig<any>[]>(() => {
		return groups.map((group) => {
			let type: ColumnDataType = "option";
			if (group.type === "multiselect") type = "multiOption";
			if (group.type === "range") type = "number";

			return {
				id: group.id,
				displayName: group.label,
				type,
				accessor: () => null,
				icon: OutlineFilter,
				min: group.range?.min,
				max: group.range?.max,
			};
		});
	}, [groups]);

	const options = useMemo(() => {
		const opts: Record<string, any[]> = {};
		for (const group of groups) {
			if (group.options) {
				opts[group.id] = group.options.map((o) => ({
					label: o.label,
					value: o.value || o.id,
					count: o.count,
				}));
			} else if (group.type === "boolean") {
				opts[group.id] = [
					{ label: "Yes", value: "true" },
					{ label: "No", value: "false" },
				];
			}
		}
		return opts;
	}, [groups]);

	const filters = useMemo<FiltersState>(() => {
		const state: FiltersState = [];
		for (const [id, val] of Object.entries(values)) {
			const group = groups.find((g) => g.id === id);
			if (!group) continue;

			if (group.type === "range") {
				if (isRangeValue(val)) {
					// Show as filtered if any value is explicitly set (even if matching range limits)
					// Only consider it "default" (hidden) if both are undefined
					const isDefault = val.min === undefined && val.max === undefined;

					if (!isDefault) {
						const currentMin = val.min ?? group.range?.min ?? 0;
						const currentMax = val.max ?? group.range?.max ?? 100;
						const isSingle = currentMin === currentMax;
						const rememberedOperator = operatorMemoryRef.current[id] as
							| NumberFilterOperator
							| undefined;
						const operator = resolveNumberOperator(
							val.operator ?? rememberedOperator,
							isSingle,
						);

						state.push({
							columnId: id,
							type: "number",
							operator,
							values: isSingle ? [currentMin] : [currentMin, currentMax],
						});
					}
				}
			} else if (group.type === "boolean") {
				if (typeof val === "boolean" && val) {
					const rememberedOperator = operatorMemoryRef.current[id] as
						| OptionFilterOperator
						| undefined;
					state.push({
						columnId: id,
						type: "option",
						operator: resolveOptionOperator(rememberedOperator, 1),
						values: ["true"],
					});
				}
			} else {
				if (Array.isArray(val) && val.length > 0) {
					const rememberedOperator = operatorMemoryRef.current[id];
					const isMultiOption = group.type === "multiselect";
					state.push({
						columnId: id,
						type: isMultiOption ? "multiOption" : "option",
						operator: isMultiOption
							? resolveMultiOptionOperator(
									rememberedOperator as MultiOptionFilterOperator | undefined,
									val.length,
								)
							: resolveOptionOperator(
									rememberedOperator as OptionFilterOperator | undefined,
									val.length,
								),
						values: val,
					});
				}
			}
		}
		return state;
	}, [values, groups]);

	const {
		filters: hookFilters,
		actions,
		columns,
	} = useDataTableFilters({
		columnsConfig,
		data: [],
		filters,
		onFiltersChange: (update) => {
			const next = typeof update === "function" ? update(filters) : update;

			if (next.length === 0 && filters.length > 0) {
				onClearAll?.();
				return;
			}

			// Added/Changed
			for (const f of next) {
				const oldF = filters.find((o) => o.columnId === f.columnId);
				if (
					!oldF ||
					JSON.stringify(oldF.values) !== JSON.stringify(f.values) ||
					oldF.operator !== f.operator
				) {
					operatorMemoryRef.current[f.columnId] = f.operator;
					const group = groups.find((g) => g.id === f.columnId);
					if (!group) continue;

					let newVal: FilterValue = f.values as string[];
					if (group.type === "range") {
						if (f.values.length === 1) {
							const val = f.values[0] as number;
							newVal = {
								min: val,
								max: val,
								operator: f.operator as NumberFilterOperator,
							};
						} else {
							newVal = {
								min: f.values[0] as number,
								max: f.values[1] as number,
								operator: f.operator as NumberFilterOperator,
							};
						}
					} else if (group.type === "boolean") {
						newVal = f.values[0] === "true";
					}

					onFilterChange(group.id, newVal, f.operator);
					return;
				}
			}

			// Removed
			for (const f of filters) {
				const newF = next.find((n) => n.columnId === f.columnId);
				if (!newF) {
					delete operatorMemoryRef.current[f.columnId];
					const group = groups.find((g) => g.id === f.columnId);
					if (group?.type === "select" || group?.type === "multiselect") {
						onFilterChange(f.columnId, [], undefined);
					} else if (group?.type === "boolean") {
						onFilterChange(f.columnId, false, undefined);
					} else if (group?.type === "range" && group.range) {
						onFilterChange(f.columnId, {
							min: undefined,
							max: undefined,
						});
					}
					return;
				}
			}
		},
		options,
		strategy: "and",
	});

	return (
		<div className={cn("w-full space-y-3", className)}>
			<div className="flex w-full items-start gap-3">
				<InputGroup className="flex-1 h-10 bg-input">
					<InputGroupAddon>
						<OutlineSearch />
					</InputGroupAddon>
					<InputGroupInput
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder={searchPlaceholder}
						className="h-10"
					/>
				</InputGroup>

				<div className="min-w-0 pt-0.5 ml-auto">
					<DataTableFilter
						columns={columns}
						filters={hookFilters}
						actions={actions}
						strategy="and"
						layout="selector-only"
					/>
				</div>

				{extraActions}
			</div>

			{hookFilters.length > 0 && (
				<DataTableFilter
					columns={columns}
					filters={hookFilters}
					actions={actions}
					strategy="and"
					layout="active-only"
				/>
			)}
		</div>
	);
}
