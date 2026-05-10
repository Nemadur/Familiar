import { Surface } from "@heroui/react";
import type {
	Column,
	ColumnFiltersState,
	RowData,
	SortingState,
	Table,
} from "@tanstack/react-table";
import { createContext, type ReactNode, use, useMemo } from "react";

import { cn } from "src/lib/utils";

declare module "@tanstack/react-table" {
	interface ColumnMeta<TData extends RowData, TValue> {
		headerTitle?: string;
		headerClassName?: string;
		cellClassName?: string;
		skeleton?: ReactNode;
		expandedContent?: (row: TData) => ReactNode;
	}
}

/** Label for headers / column visibility: `meta.headerTitle`, string `columnDef.header`, or `column.id`. */
export function getColumnHeaderLabel<TData, TValue>(
	column: Column<TData, TValue>,
): string {
	const meta = column.columnDef.meta as { headerTitle?: string } | undefined;
	if (typeof meta?.headerTitle === "string") return meta.headerTitle;
	const defHeader = column.columnDef.header;
	if (typeof defHeader === "string") return defHeader;
	return String(column.id);
}

export type DataGridApiFetchParams = {
	pageIndex: number;
	pageSize: number;
	sorting?: SortingState;
	filters?: ColumnFiltersState;
	searchQuery?: string;
};

export type DataGridApiResponse<T> = {
	data: T[];
	empty: boolean;
	pagination: {
		total: number;
		page: number;
	};
};

export interface DataGridContextProps<TData extends object> {
	props: DataGridProps<TData>;
	table: Table<TData>;
	recordCount: number;
	isLoading: boolean;
}

export type DataGridRequestParams = {
	pageIndex: number;
	pageSize: number;
	sorting?: SortingState;
	columnFilters?: ColumnFiltersState;
};

export interface DataGridProps<TData extends object> {
	className?: string;
	table?: Table<TData>;
	recordCount: number;
	children?: ReactNode;
	onRowClick?: (row: TData) => void;
	isLoading?: boolean;
	loadingMode?: "skeleton" | "spinner";
	loadingMessage?: ReactNode | string;
	fetchingMoreMessage?: ReactNode | string;
	allRowsLoadedMessage?: ReactNode | string;
	emptyMessage?: ReactNode | string;
	tableLayout?: {
		dense?: boolean;
		cellBorder?: boolean;
		rowBorder?: boolean;
		rowRounded?: boolean;
		stripped?: boolean;
		headerBackground?: boolean;
		headerBorder?: boolean;
		headerSticky?: boolean;
		width?: "auto" | "fixed";
		columnsVisibility?: boolean;
		columnsResizable?: boolean;
		columnsResizeMode?: "onChange" | "onEnd";
		columnsPinnable?: boolean;
		columnsMovable?: boolean;
		columnsDraggable?: boolean;
		rowsDraggable?: boolean;
		rowsPinnable?: boolean;
	};
	tableClassNames?: {
		base?: string;
		header?: string;
		headerRow?: string;
		headerSticky?: string;
		body?: string;
		bodyRow?: string;
		footer?: string;
		edgeCell?: string;
	};
}

const DataGridContext = createContext<DataGridContextProps<any> | undefined>(
	undefined,
);

function useDataGrid() {
	const context = use(DataGridContext);
	if (!context) {
		throw new Error("useDataGrid must be used within a DataGridProvider");
	}
	return context;
}

function DataGridProvider<TData extends object>({
	children,
	table,
	recordCount,
	isLoading = false,
	loadingMode,
	loadingMessage,
	fetchingMoreMessage,
	allRowsLoadedMessage,
	emptyMessage,
	onRowClick,
	className,
	tableLayout,
}: DataGridProps<TData> & { table: Table<TData> }) {
	const columnsResizable = tableLayout?.columnsResizable;
	const columnsResizeMode = tableLayout?.columnsResizeMode ?? "onEnd";

	if (columnsResizable) {
		table.options.columnResizeMode = columnsResizeMode;
	}

	const stableTableLayout = useMemo(
		() =>
			tableLayout
				? {
						columnsResizable,
						columnsResizeMode,
					}
				: undefined,
		[columnsResizable, columnsResizeMode, tableLayout],
	);

	const contextProps = useMemo(
		() =>
			({
				recordCount,
				isLoading,
				loadingMode,
				loadingMessage,
				fetchingMoreMessage,
				allRowsLoadedMessage,
				emptyMessage,
				onRowClick,
				className,
				tableLayout: stableTableLayout,
			}) as DataGridProps<TData>,
		[
			recordCount,
			isLoading,
			loadingMode,
			loadingMessage,
			fetchingMoreMessage,
			allRowsLoadedMessage,
			emptyMessage,
			onRowClick,
			className,
			stableTableLayout,
		],
	);

	const value = useMemo(
		() => ({
			props: contextProps,
			table,
			recordCount,
			isLoading,
		}),
		[contextProps, table, recordCount, isLoading],
	);

	return (
		<DataGridContext.Provider value={value}>
			{children}
		</DataGridContext.Provider>
	);
}

function DataGrid<TData extends object>({
	children,
	table,
	...props
}: DataGridProps<TData>) {
	const defaultProps: Partial<DataGridProps<TData>> = {
		loadingMode: "skeleton",
		tableLayout: {
			dense: false,
			cellBorder: false,
			rowBorder: true,
			rowRounded: false,
			stripped: false,
			headerSticky: false,
			headerBackground: true,
			headerBorder: true,
			width: "fixed",
			columnsVisibility: false,
			columnsResizable: false,
			columnsResizeMode: "onEnd",
			columnsPinnable: false,
			columnsMovable: false,
			columnsDraggable: false,
			rowsDraggable: false,
			rowsPinnable: false,
		},
		tableClassNames: {
			base: "",
			header: "",
			headerRow: "",
			headerSticky: "sticky top-0 z-15 bg-background/90 backdrop-blur-xs",
			body: "",
			bodyRow: "",
			footer: "",
			edgeCell: "",
		},
	};

	const mergedProps: DataGridProps<TData> = {
		...defaultProps,
		...props,
		tableLayout: {
			...defaultProps.tableLayout,
			...(props.tableLayout || {}),
		},
		tableClassNames: {
			...defaultProps.tableClassNames,
			...(props.tableClassNames || {}),
		},
	};

	// Ensure table is provided
	if (!table) {
		throw new Error('DataGrid requires a "table" prop');
	}

	return (
		<DataGridProvider table={table} {...mergedProps}>
			{children}
		</DataGridProvider>
	);
}

function DataGridContainer({
	children,
	className,
	border = true,
}: {
	children: ReactNode;
	className?: string;
	border?: boolean;
}) {
	return (
		<Surface
			data-slot="data-grid"
			variant={"transparent"}
			className={cn(
				"w-full overflow-hidden rounded-2xl",
				border && "border-border border",
				className,
			)}
		>
			{children}
		</Surface>
	);
}

export { useDataGrid, DataGridProvider, DataGrid, DataGridContainer };
