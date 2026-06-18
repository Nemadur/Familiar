import {
	ArrowDownIcon,
	ArrowLeftIcon,
	ArrowLeftToLineIcon,
	ArrowRightIcon,
	ArrowRightToLineIcon,
	ArrowUpIcon,
	CheckIcon,
	Settings2Icon,
} from "lucide-react";
import { type ReactNode, useMemo } from "react";
import {
	getColumnHeaderLabel,
	useDataGrid,
} from "src/components/reui/data-grid/data-grid";
import { Button } from "src/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";

type DataGridContext = ReturnType<typeof useDataGrid>;

type HeaderTable = Pick<
	DataGridContext["table"],
	"getAllColumns" | "setColumnOrder"
>;

interface HeaderMenuColumn {
	id: string;
	clearSorting: () => void;
	toggleSorting: (desc?: boolean) => void;
	pin: (position: false | "left" | "right") => void;
}

type SortState = "none" | "asc" | "desc";
type PinState = "none" | "left" | "right";
type ControlState = "enabled" | "disabled";

interface HeaderTriggerConfig {
	icon?: ReactNode;
	title: string;
	sortIcon: ReactNode;
	className: string;
	state: ControlState;
}

interface SortMenuConfig {
	state: SortState;
}

interface PinMenuConfig {
	state: PinState;
}

interface MoveMenuConfig {
	columnIndex: number;
	columnOrder: string[];
	left: ControlState;
	right: ControlState;
	pinState: PinState;
}

interface DataGridColumnHeaderDropdownProps {
	column: HeaderMenuColumn;
	table: HeaderTable;
	filter?: ReactNode;
	trigger: HeaderTriggerConfig;
	sort?: SortMenuConfig;
	pin?: PinMenuConfig;
	move?: MoveMenuConfig;
	columnVisibility?: "enabled";
}

function getColumnVisibilityItems(table: HeaderTable) {
	const items: ReactNode[] = [];

	for (const col of table.getAllColumns()) {
		if (!col.getCanHide()) {
			continue;
		}

		items.push(
			<DropdownMenuCheckboxItem
				key={col.id}
				checked={col.getIsVisible()}
				onSelect={(event) => event.preventDefault()}
				onCheckedChange={(value) => col.toggleVisibility(!!value)}
				className="capitalize"
			>
				{getColumnHeaderLabel(col)}
			</DropdownMenuCheckboxItem>,
		);
	}

	return items;
}

function moveColumnLeft(
	table: HeaderTable,
	columnIndex: number,
	columnOrder: string[],
) {
	if (columnIndex <= 0) return;

	const newOrder = [...columnOrder];
	const movedColumn = newOrder[columnIndex];

	if (!movedColumn) return;

	newOrder.splice(columnIndex, 1);
	newOrder.splice(columnIndex - 1, 0, movedColumn);
	table.setColumnOrder(newOrder);
}

function moveColumnRight(
	table: HeaderTable,
	columnIndex: number,
	columnOrder: string[],
) {
	if (columnIndex < 0 || columnIndex >= columnOrder.length - 1) {
		return;
	}

	const newOrder = [...columnOrder];
	const movedColumn = newOrder[columnIndex];

	if (!movedColumn) return;

	newOrder.splice(columnIndex, 1);
	newOrder.splice(columnIndex + 1, 0, movedColumn);
	table.setColumnOrder(newOrder);
}

export function DataGridColumnHeaderDropdown({
	column,
	table,
	filter,
	trigger,
	sort,
	pin,
	move,
	columnVisibility,
}: DataGridColumnHeaderDropdownProps) {
	const menuItems = useMemo(() => {
		const items: ReactNode[] = [];
		let hasPreviousSection = false;

		if (filter) {
			items.push(
				<DropdownMenuGroup key="group-filter">
					<DropdownMenuLabel key="filter">{filter}</DropdownMenuLabel>
				</DropdownMenuGroup>,
			);
			hasPreviousSection = true;
		}

		if (sort) {
			if (hasPreviousSection) {
				items.push(<DropdownMenuSeparator key="sep-sort" />);
			}

			items.push(
				<DropdownMenuItem
					key="sort-asc"
					onClick={() => {
						if (sort.state === "asc") {
							column.clearSorting();
						} else {
							column.toggleSorting(false);
						}
					}}
				>
					<ArrowUpIcon className="size-3.5!" />
					<span className="grow">Asc</span>
					{sort.state === "asc" && (
						<CheckIcon className="text-primary size-4 opacity-100!" />
					)}
				</DropdownMenuItem>,
				<DropdownMenuItem
					key="sort-desc"
					onClick={() => {
						if (sort.state === "desc") {
							column.clearSorting();
						} else {
							column.toggleSorting(true);
						}
					}}
				>
					<ArrowDownIcon className="size-3.5!" />
					<span className="grow">Desc</span>
					{sort.state === "desc" && (
						<CheckIcon className="text-primary size-4 opacity-100!" />
					)}
				</DropdownMenuItem>,
			);
			hasPreviousSection = true;
		}

		if (pin) {
			if (hasPreviousSection) {
				items.push(<DropdownMenuSeparator key="sep-pin" />);
			}

			items.push(
				<DropdownMenuItem
					key="pin-left"
					onClick={() => column.pin(pin.state === "left" ? false : "left")}
				>
					<ArrowLeftToLineIcon className="size-3.5!" aria-hidden="true" />
					<span className="grow">Pin to left</span>
					{pin.state === "left" && (
						<CheckIcon className="text-primary size-4 opacity-100!" />
					)}
				</DropdownMenuItem>,
				<DropdownMenuItem
					key="pin-right"
					onClick={() => column.pin(pin.state === "right" ? false : "right")}
				>
					<ArrowRightToLineIcon className="size-3.5!" aria-hidden="true" />
					<span className="grow">Pin to right</span>
					{pin.state === "right" && (
						<CheckIcon className="text-primary size-4 opacity-100!" />
					)}
				</DropdownMenuItem>,
			);
			hasPreviousSection = true;
		}

		if (move) {
			if (hasPreviousSection) {
				items.push(<DropdownMenuSeparator key="sep-move" />);
			}

			items.push(
				<DropdownMenuItem
					key="move-left"
					onClick={() =>
						moveColumnLeft(table, move.columnIndex, move.columnOrder)
					}
					disabled={move.left === "disabled" || move.pinState !== "none"}
				>
					<ArrowLeftIcon className="size-3.5!" aria-hidden="true" />
					<span>Move to Left</span>
				</DropdownMenuItem>,
				<DropdownMenuItem
					key="move-right"
					onClick={() =>
						moveColumnRight(table, move.columnIndex, move.columnOrder)
					}
					disabled={move.right === "disabled" || move.pinState !== "none"}
				>
					<ArrowRightIcon className="size-3.5!" aria-hidden="true" />
					<span>Move to Right</span>
				</DropdownMenuItem>,
			);
			hasPreviousSection = true;
		}

		if (columnVisibility === "enabled") {
			if (hasPreviousSection) {
				items.push(<DropdownMenuSeparator key="sep-visibility" />);
			}

			items.push(
				<DropdownMenuSub key="visibility">
					<DropdownMenuSubTrigger>
						<Settings2Icon className="size-3.5!" />
						<span>Columns</span>
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						{getColumnVisibilityItems(table)}
					</DropdownMenuSubContent>
				</DropdownMenuSub>,
			);
		}

		return items;
	}, [filter, sort, column, pin, move, columnVisibility, table]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className={trigger.className}
					disabled={trigger.state === "disabled"}
				>
					{trigger.icon}
					{trigger.title}
					{trigger.sortIcon}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-40" align="start">
				{menuItems}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
