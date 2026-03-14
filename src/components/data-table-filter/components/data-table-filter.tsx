import { useIsMobile } from "src/hooks/use-mobile";
import type {
	Column,
	DataTableFilterActions,
	FilterStrategy,
	FiltersState,
} from "../core/types";
import type { Locale } from "../lib/i18n";
import { ActiveFilters, ActiveFiltersMobileContainer } from "./active-filters";
import { FilterActions } from "./filter-actions";
import { FilterSelector } from "./filter-selector";

interface DataTableFilterProps<TData> {
	columns: Column<TData>[];
	filters: FiltersState;
	actions: DataTableFilterActions;
	strategy: FilterStrategy;
	locale?: Locale;
	layout?: "default" | "selector-only" | "active-only";
}

export function DataTableFilter<TData>({
	columns,
	filters,
	actions,
	strategy,
	locale = "en",
	layout = "default",
}: DataTableFilterProps<TData>) {
	const isMobile = useIsMobile();
	if (isMobile) {
		return (
			<div className="flex w-full items-start justify-between gap-2">
				<div className="flex gap-1">
					<FilterSelector
						columns={columns}
						filters={filters}
						actions={actions}
						strategy={strategy}
						locale={locale}
					/>
					<FilterActions
						hasFilters={filters.length > 0}
						actions={actions}
						locale={locale}
					/>
				</div>
				<ActiveFiltersMobileContainer>
					<ActiveFilters
						columns={columns}
						filters={filters}
						actions={actions}
						strategy={strategy}
						locale={locale}
					/>
				</ActiveFiltersMobileContainer>
			</div>
		);
	}

	if (layout === "selector-only") {
		return (
			<div className="flex w-full items-start gap-2">
				<FilterSelector
					columns={columns}
					filters={filters}
					actions={actions}
					strategy={strategy}
					locale={locale}
				/>
			</div>
		);
	}

	if (layout === "active-only") {
		return (
			<div className="flex w-full items-start justify-between gap-2">
				<div className="flex md:flex-wrap gap-2 w-full flex-1">
					<ActiveFilters
						columns={columns}
						filters={filters}
						actions={actions}
						strategy={strategy}
						locale={locale}
					/>
				</div>
				<FilterActions
					hasFilters={filters.length > 0}
					actions={actions}
					locale={locale}
				/>
			</div>
		);
	}

	return (
		<div className="flex w-full items-start justify-between gap-2">
			<div className="flex md:flex-wrap gap-2 w-full flex-1">
				<FilterSelector
					columns={columns}
					filters={filters}
					actions={actions}
					strategy={strategy}
					locale={locale}
				/>
				<ActiveFilters
					columns={columns}
					filters={filters}
					actions={actions}
					strategy={strategy}
					locale={locale}
				/>
			</div>
			<FilterActions
				hasFilters={filters.length > 0}
				actions={actions}
				locale={locale}
			/>
		</div>
	);
}
