import { surfaceVariants } from "@heroui/react";
import type { Table } from "@tanstack/react-table";
import { DataGrid, type DataGridProps } from "./data-grid";
import { DataGridScrollArea } from "./data-grid-scroll-area";
import { DataGridTable } from "./data-grid-table";
import { cn } from "@/lib/utils";

interface DataGridListProps<TData extends object>
	extends Omit<DataGridProps<TData>, "table"> {
	table: Table<TData>;
}

export function DataGridList<TData extends object>({
	table,
	className,
	tableClassNames,
	tableLayout,
	children,
	...props
}: DataGridListProps<TData>) {
	return (
		<DataGrid
			table={table}
			{...props}
			tableClassNames={{
				base: cn(
					"border-separate [border-spacing:0_12px]",
					tableClassNames?.base,
				),
				header: cn("bg-transparent", tableClassNames?.header),
				headerRow: cn(
					"bg-transparent [&>th]:text-xs [&>th]:uppercase [&>th]:tracking-wider [&>th]:font-semibold [&>th]:text-muted-foreground [&>th]:border-b-0 [&>th]:pb-0",
					tableClassNames?.headerRow,
				),
				body: cn("bg-transparent", tableClassNames?.body),
				bodyRow: cn(
					"group transition-colors cursor-pointer",
					"[&>td]:align-middle [&>td]:transition-colors",
					tableClassNames?.bodyRow,
				),
				edgeCell: cn("", tableClassNames?.edgeCell),
			}}
			tableLayout={{
				headerBorder: false,
				headerBackground: false,
				cellBorder: false,
				rowBorder: false,
				...tableLayout,
			}}
			className={className}
		>
			<DataGridScrollArea className="w-full">
				<DataGridTable />
			</DataGridScrollArea>
			{children}
		</DataGrid>
	);
}
