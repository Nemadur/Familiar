"use client";

import { ScrollShadow } from "@heroui/react";
import type {
	Column,
	DataTableFilterActions,
	FilterStrategy,
	FiltersState,
} from "../core/types";
import type { Locale } from "../lib/i18n";
import { ActiveFilters } from "./active-filters";
import { FilterActions } from "./filter-actions";
import { FilterSelector } from "./filter-selector";

interface DataTableFilterProps<TData> {
	columns: Column<TData>[];
	filters: FiltersState;
	actions: DataTableFilterActions;
	strategy: FilterStrategy;
	locale?: Locale;
}

export function DataTableFilter<TData>({
	columns,
	filters,
	actions,
	strategy,
	locale = "en",
}: DataTableFilterProps<TData>) {
	return (
		<div className="flex w-full flex-col gap-2">
			<div className="flex w-full items-start">
				<FilterSelector
					columns={columns}
					filters={filters}
					actions={actions}
					strategy={strategy}
					locale={locale}
				/>
			</div>

			<ScrollShadow orientation="horizontal" hideScrollBar className="w-full">
				<div className="flex min-w-max items-start gap-2 pb-1">
					<ActiveFilters
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
			</ScrollShadow>
		</div>
	);
}
