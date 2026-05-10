import type { Table } from "@tanstack/react-table";
import type { ReactElement, ReactNode } from "react";
import { getColumnHeaderLabel } from "src/components/reui/data-grid/data-grid";

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";

function getColumnVisibilityItems<TData>(table: Table<TData>): ReactNode[] {
	const items: ReactNode[] = [];

	for (const column of table.getAllColumns()) {
		if (!column.getCanHide()) {
			continue;
		}

		items.push(
			<DropdownMenuCheckboxItem
				key={column.id}
				className="capitalize"
				checked={column.getIsVisible()}
				onSelect={(event) => event.preventDefault()}
				onCheckedChange={(value) => column.toggleVisibility(!!value)}
			>
				{getColumnHeaderLabel(column)}
			</DropdownMenuCheckboxItem>,
		);
	}

	return items;
}

function DataGridColumnVisibility<TData>({
	table,
	trigger,
}: {
	table: Table<TData>;
	trigger: ReactElement<Record<string, unknown>>;
}) {
	const columnVisibilityItems = getColumnVisibilityItems(table);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-[150px]">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="font-medium">
						Toggle Columns
					</DropdownMenuLabel>
					{columnVisibilityItems}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export { DataGridColumnVisibility };
