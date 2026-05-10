import type { Column } from "@tanstack/react-table";
import { PinOffIcon } from "lucide-react";
import { type HTMLAttributes, memo, type ReactNode } from "react";
import {
	getColumnHeaderLabel,
	useDataGrid,
} from "src/components/reui/data-grid/data-grid";
import { DataGridColumnHeaderDropdown } from "src/components/reui/data-grid/data-grid-column-header-menu";
import {
	ColumnSortIcon,
	getColumnHeaderButtonClassName,
	getColumnHeaderLabelClassName,
} from "src/components/reui/data-grid/data-grid-column-header-utils";
import { Button } from "src/components/ui/button";
import { cn } from "src/lib/utils";

interface DataGridColumnHeaderProps<TData, TValue>
	extends HTMLAttributes<HTMLDivElement> {
	column: Column<TData, TValue>;
	/** When omitted, uses `column.columnDef.meta.headerTitle`, then a string `columnDef.header`, then `column.id`. */
	title?: string;
	icon?: ReactNode;
	pinnable?: boolean;
	filter?: ReactNode;
	visibility?: boolean;
}

function normalizeSortState(value: false | "asc" | "desc") {
	return value === false ? "none" : value;
}

function normalizePinState(value: false | "left" | "right") {
	return value === false ? "none" : value;
}

function DataGridColumnHeaderInner<TData, TValue>({
	column,
	title,
	icon,
	className,
	filter,
	visibility = false,
}: DataGridColumnHeaderProps<TData, TValue>) {
	const { isLoading, table, props, recordCount } = useDataGrid();
	const resolvedTitle = title ?? getColumnHeaderLabel(column);

	const columnOrder = table.getState().columnOrder;
	const isSorted = column.getIsSorted();
	const isPinned = column.getIsPinned();
	const canSort = column.getCanSort();
	const canPin = column.getCanPin();
	const canResize = column.getCanResize();

	const columnIndex = columnOrder.indexOf(column.id);
	const canMoveLeft = columnIndex > 0;
	const canMoveRight = columnIndex < columnOrder.length - 1;

	const headerLabelClassName = getColumnHeaderLabelClassName(className);
	const headerButtonClassName = getColumnHeaderButtonClassName();
	const sortIcon = <ColumnSortIcon canSort={canSort} isSorted={isSorted} />;

	const hasControls =
		props.tableLayout?.columnsMovable ||
		(props.tableLayout?.columnsVisibility && visibility) ||
		(props.tableLayout?.columnsPinnable && canPin) ||
		filter;

	function handleSort() {
		if (isSorted === "asc") {
			column.toggleSorting(true);
		} else if (isSorted === "desc") {
			column.clearSorting();
		} else {
			column.toggleSorting(false);
		}
	}

	if (hasControls) {
		const pinState = normalizePinState(isPinned);

		return (
			<div
				className={cn(
					"flex h-full items-center justify-between gap-1.5",
					className,
				)}
			>
				<DataGridColumnHeaderDropdown
					column={column}
					table={table}
					filter={filter}
					trigger={{
						icon,
						title: resolvedTitle,
						sortIcon,
						className: headerButtonClassName,
						state: isLoading || recordCount === 0 ? "disabled" : "enabled",
					}}
					sort={canSort ? { state: normalizeSortState(isSorted) } : undefined}
					pin={
						props.tableLayout?.columnsPinnable && canPin
							? { state: pinState }
							: undefined
					}
					move={
						props.tableLayout?.columnsMovable
							? {
									columnIndex,
									columnOrder,
									left: canMoveLeft ? "enabled" : "disabled",
									right: canMoveRight ? "enabled" : "disabled",
									pinState,
								}
							: undefined
					}
					columnVisibility={
						props.tableLayout?.columnsVisibility && visibility
							? "enabled"
							: undefined
					}
				/>

				{props.tableLayout?.columnsPinnable && canPin && isPinned && (
					<Button
						size="icon-sm"
						variant="ghost"
						className="-me-1 size-7 rounded-md"
						onClick={() => column.pin(false)}
						aria-label={`Unpin ${resolvedTitle} column`}
						title={`Unpin ${resolvedTitle} column`}
					>
						<PinOffIcon className="size-3.5! opacity-50!" aria-hidden="true" />
					</Button>
				)}
			</div>
		);
	}

	if (canSort || (props.tableLayout?.columnsResizable && canResize)) {
		return (
			<div className={cn("flex h-full items-center", className)}>
				<Button
					variant="ghost"
					className={headerButtonClassName}
					disabled={isLoading || recordCount === 0}
					onClick={handleSort}
				>
					{icon}
					{resolvedTitle}
					{sortIcon}
				</Button>
			</div>
		);
	}

	return (
		<div className={headerLabelClassName}>
			{icon}
			{resolvedTitle}
		</div>
	);
}

const DataGridColumnHeader = memo(
	DataGridColumnHeaderInner,
) as typeof DataGridColumnHeaderInner;

export { DataGridColumnHeader, type DataGridColumnHeaderProps };
