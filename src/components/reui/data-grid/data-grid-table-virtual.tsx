import {
	flexRender,
	type HeaderGroup,
	type Row,
	type Table,
} from "@tanstack/react-table";
import {
	useVirtualizer,
	type VirtualItem,
	type Virtualizer,
	type VirtualizerOptions,
} from "@tanstack/react-virtual";
import { memo, type ReactNode, useCallback, useRef, useState } from "react";
import { useDataGrid } from "src/components/reui/data-grid/data-grid";
import {
	DataGridTableBase,
	DataGridTableBody,
	DataGridTableEmpty,
	DataGridTableFoot,
	DataGridTableHead,
	DataGridTableHeadRow,
	DataGridTableHeadRowCell,
	DataGridTableHeadRowCellResize,
	DataGridTableRenderedRow,
	DataGridTableRowSpacer,
	DataGridTableViewport,
	getDataGridTableRowSections,
} from "src/components/reui/data-grid/data-grid-table";
import { Spinner } from "src/components/ui/spinner";
import { cn } from "src/lib/utils";

type DataGridTableVirtualScrollElements = {
	containerElement: HTMLDivElement | null;
	scrollElement: HTMLElement | null;
};

type DataGridTableVirtualizerInstance = Virtualizer<
	HTMLElement,
	HTMLTableRowElement
>;

type DataGridTableVirtualizerOnChange = NonNullable<
	VirtualizerOptions<HTMLElement, HTMLTableRowElement>["onChange"]
>;

type DataGridTableVirtualizerOptions<TData> = Omit<
	VirtualizerOptions<HTMLElement, HTMLTableRowElement>,
	"count" | "estimateSize" | "getItemKey" | "getScrollElement"
> & {
	estimateSize?: (index: number, row: Row<TData>) => number;
	getItemKey?: (index: number, row: Row<TData>) => string | number;
	getScrollElement?: (
		elements: DataGridTableVirtualScrollElements,
	) => HTMLElement | null;
};

interface DataGridTableVirtualProps<TData> {
	height?: number | string;
	estimateSize?: number;
	overscan?: number;
	footerContent?: ReactNode;
	renderHeader?: boolean;
	onFetchMore?: () => void;
	isFetchingMore?: boolean;
	hasMore?: boolean;
	fetchMoreOffset?: number;
	virtualizerOptions?: DataGridTableVirtualizerOptions<TData>;
}

type VirtualizationMode = "static" | "virtual";
type InfiniteRowsStatus = "off" | "idle" | "fetching" | "complete";

interface VirtualBodyProps<TData> {
	table: Table<TData>;
	columnCount: number;
	topRows: Row<TData>[];
	centerRows: Row<TData>[];
	bottomRows: Row<TData>[];
	virtualItems: VirtualItem[];
	totalSize: number;
	virtualizationMode: VirtualizationMode;
	infiniteRowsStatus: InfiniteRowsStatus;
	loadingMoreMessage: ReactNode;
	allRowsLoadedMessage: ReactNode;
	measureRowRef?: (element: HTMLTableRowElement | null) => void;
}

function DataGridTableVirtualSpacer({
	columnCount,
	height,
}: {
	columnCount: number;
	height: number;
}) {
	if (height <= 0) return null;

	return (
		<tr>
			<td colSpan={columnCount} style={{ height, padding: 0 }} />
		</tr>
	);
}

function DataGridTableVirtualStatusRow({
	children,
	className,
	columnCount,
}: {
	children: ReactNode;
	className?: string;
	columnCount: number;
}) {
	return (
		<tr>
			<td
				colSpan={columnCount}
				className={cn(
					"text-muted-foreground py-4 text-center text-sm",
					className,
				)}
			>
				{children}
			</td>
		</tr>
	);
}

function DataGridTableVirtualBody<TData>({
	columnCount,
	topRows,
	centerRows,
	bottomRows,
	virtualItems,
	totalSize,
	virtualizationMode,
	infiniteRowsStatus,
	loadingMoreMessage,
	allRowsLoadedMessage,
	measureRowRef,
}: VirtualBodyProps<TData>) {
	const totalRows = topRows.length + centerRows.length + bottomRows.length;

	if (!totalRows) return <DataGridTableEmpty />;

	const isVirtualizationEnabled = virtualizationMode === "virtual";
	const hasCenterRows = centerRows.length > 0;
	const showFetchingRow = infiniteRowsStatus === "fetching";
	const showCompleteRow = infiniteRowsStatus === "complete";
	const hasMiddleSection = hasCenterRows || showFetchingRow || showCompleteRow;

	const leadingSpacerHeight =
		isVirtualizationEnabled && hasCenterRows && virtualItems.length > 0
			? (virtualItems[0]?.start ?? 0)
			: 0;

	const trailingSpacerHeight =
		isVirtualizationEnabled && hasCenterRows && virtualItems.length > 0
			? Math.max(
					0,
					totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0),
				)
			: 0;

	const renderedRows: ReactNode[] = [];

	topRows.forEach((row, index) => {
		renderedRows.push(
			<DataGridTableRenderedRow
				key={row.id}
				row={row}
				pinnedBoundary={
					index === topRows.length - 1 && hasMiddleSection ? "top" : undefined
				}
			/>,
		);
	});

	if (isVirtualizationEnabled) {
		if (leadingSpacerHeight > 0) {
			renderedRows.push(
				<DataGridTableVirtualSpacer
					key="virtual-spacer-start"
					columnCount={columnCount}
					height={leadingSpacerHeight}
				/>,
			);
		}

		virtualItems.forEach((virtualRow) => {
			const row = centerRows[virtualRow.index];

			if (!row) return;

			renderedRows.push(
				<DataGridTableRenderedRow
					key={row.id}
					row={row}
					rowRef={measureRowRef}
				/>,
			);
		});

		if (trailingSpacerHeight > 0) {
			renderedRows.push(
				<DataGridTableVirtualSpacer
					key="virtual-spacer-end"
					columnCount={columnCount}
					height={trailingSpacerHeight}
				/>,
			);
		}
	} else {
		centerRows.forEach((row) => {
			renderedRows.push(<DataGridTableRenderedRow key={row.id} row={row} />);
		});
	}

	if (showFetchingRow) {
		renderedRows.push(
			<DataGridTableVirtualStatusRow
				key="virtual-status-loading"
				columnCount={columnCount}
			>
				<div className="flex items-center justify-center gap-2">
					<Spinner className="size-4 opacity-60" />
					{loadingMoreMessage}
				</div>
			</DataGridTableVirtualStatusRow>,
		);
	}

	if (showCompleteRow) {
		renderedRows.push(
			<DataGridTableVirtualStatusRow
				key="virtual-status-complete"
				columnCount={columnCount}
				className="py-3 text-xs"
			>
				{allRowsLoadedMessage}
			</DataGridTableVirtualStatusRow>,
		);
	}

	bottomRows.forEach((row, index) => {
		renderedRows.push(
			<DataGridTableRenderedRow
				key={row.id}
				row={row}
				pinnedBoundary={
					index === 0 && (topRows.length > 0 || hasMiddleSection)
						? "bottom"
						: undefined
				}
			/>,
		);
	});

	return <>{renderedRows}</>;
}

/**
 * Memoized virtual body: skip re-renders during active column resize.
 * Column widths update via CSS variables on the <table> element,
 * so the browser handles width changes without React re-renders.
 */
const MemoizedVirtualBody = memo(
	DataGridTableVirtualBody,
	(_prev, next) => !!next.table.getState().columnSizingInfo.isResizingColumn,
) as typeof DataGridTableVirtualBody;

function DataGridTableVirtual<TData>({
	height,
	estimateSize = 48,
	overscan = 10,
	footerContent,
	renderHeader = true,
	onFetchMore,
	isFetchingMore = false,
	hasMore,
	fetchMoreOffset = 0,
	virtualizerOptions,
}: DataGridTableVirtualProps<TData>) {
	const { table, props } = useDataGrid();

	const { topRows, centerRows, bottomRows } = getDataGridTableRowSections(
		table,
		props.tableLayout?.rowsPinnable,
	);

	const columnCount =
		table.getVisibleFlatColumns().length +
		(props.tableLayout?.columnsResizable ? 1 : 0);

	const isInfiniteMode = typeof onFetchMore === "function";
	const isVirtualizationEnabled = virtualizerOptions?.enabled !== false;

	const virtualizationMode: VirtualizationMode = isVirtualizationEnabled
		? "virtual"
		: "static";

	const infiniteRowsStatus: InfiniteRowsStatus = !isInfiniteMode
		? "off"
		: isFetchingMore
			? "fetching"
			: hasMore === false
				? "complete"
				: "idle";

	const [viewportElements, setViewportElements] =
		useState<DataGridTableVirtualScrollElements>({
			containerElement: null,
			scrollElement: null,
		});

	const {
		estimateSize: customEstimateSize,
		getItemKey: customGetItemKey,
		getScrollElement: customGetScrollElement,
		measureElement: customMeasureElement,
		overscan: customOverscan,
		onChange: customOnChange,
		...virtualizerOptionsRest
	} = virtualizerOptions ?? {};

	const loadingMoreMessage =
		props.fetchingMoreMessage || props.loadingMessage || "Loading...";

	const allRowsLoadedMessage =
		props.allRowsLoadedMessage || "All records loaded";

	const handleViewportRef = useCallback((node: HTMLDivElement | null) => {
		setViewportElements({
			containerElement: node,
			scrollElement:
				(node?.closest(
					'[data-slot="scroll-area-viewport"]',
				) as HTMLElement | null) ?? node,
		});
	}, []);

	const usesExternalScrollArea =
		viewportElements.scrollElement !== null &&
		viewportElements.scrollElement !== viewportElements.containerElement;

	const resolveScrollElement = useCallback(() => {
		if (customGetScrollElement) {
			return customGetScrollElement(viewportElements);
		}

		return viewportElements.scrollElement;
	}, [customGetScrollElement, viewportElements]);

	const resolveItemKey = useCallback(
		(index: number) => {
			const row = centerRows[index];

			if (!row) return index;

			return customGetItemKey?.(index, row) ?? row.id ?? index;
		},
		[centerRows, customGetItemKey],
	);

	const resolveEstimateSize = useCallback(
		(index: number) => {
			const row = centerRows[index];

			return row
				? (customEstimateSize?.(index, row) ?? estimateSize)
				: estimateSize;
		},
		[centerRows, customEstimateSize, estimateSize],
	);

	const resolvedFetchMoreOffset = Math.max(0, fetchMoreOffset);

	const onFetchMoreRef = useRef(onFetchMore);
	onFetchMoreRef.current = onFetchMore;

	const customOnChangeRef = useRef(customOnChange);
	customOnChangeRef.current = customOnChange;

	const infiniteStateRef = useRef({
		centerRowsLength: centerRows.length,
		hasMore,
		isFetchingMore,
		isInfiniteMode,
		isVirtualizationEnabled,
		resolvedFetchMoreOffset,
	});

	infiniteStateRef.current = {
		centerRowsLength: centerRows.length,
		hasMore,
		isFetchingMore,
		isInfiniteMode,
		isVirtualizationEnabled,
		resolvedFetchMoreOffset,
	};

	const lastFetchRequestRowCountRef = useRef<number | null>(null);

	const handleVirtualizerChange = useCallback<DataGridTableVirtualizerOnChange>(
		(instance, sync) => {
			customOnChangeRef.current?.(instance, sync);

			const {
				centerRowsLength,
				hasMore,
				isFetchingMore,
				isInfiniteMode,
				isVirtualizationEnabled,
				resolvedFetchMoreOffset,
			} = infiniteStateRef.current;

			if (
				!isVirtualizationEnabled ||
				!isInfiniteMode ||
				hasMore === false ||
				isFetchingMore
			) {
				return;
			}

			const virtualItems = instance.getVirtualItems();
			const lastItem = virtualItems[virtualItems.length - 1];

			if (!lastItem) return;

			const fetchTriggerIndex = centerRowsLength - 1 - resolvedFetchMoreOffset;

			if (lastItem.index < fetchTriggerIndex) {
				return;
			}

			if (lastFetchRequestRowCountRef.current === centerRowsLength) {
				return;
			}

			lastFetchRequestRowCountRef.current = centerRowsLength;
			onFetchMoreRef.current?.();
		},
		[],
	);

	const virtualizer = useVirtualizer({
		count: centerRows.length,
		getScrollElement: resolveScrollElement,
		getItemKey: resolveItemKey,
		estimateSize: resolveEstimateSize,
		overscan: customOverscan ?? overscan,
		measureElement: customMeasureElement,
		onChange: handleVirtualizerChange,
		...virtualizerOptionsRest,
	}) as DataGridTableVirtualizerInstance;

	const virtualItems = isVirtualizationEnabled
		? virtualizer.getVirtualItems()
		: [];

	const totalSize = isVirtualizationEnabled ? virtualizer.getTotalSize() : 0;

	const measureRowRef =
		isVirtualizationEnabled && customMeasureElement
			? virtualizer.measureElement
			: undefined;

	return (
		<DataGridTableViewport
			viewportRef={handleViewportRef}
			className={!usesExternalScrollArea ? "block" : undefined}
			style={
				usesExternalScrollArea
					? undefined
					: { height, overflow: "auto", position: "relative" }
			}
		>
			<DataGridTableBase>
				{renderHeader && (
					<DataGridTableHead>
						{table.getHeaderGroups().map((headerGroup: HeaderGroup<TData>) => (
							<DataGridTableHeadRow
								headerGroup={headerGroup}
								key={headerGroup.id}
							>
								{headerGroup.headers.map((header) => {
									const { column } = header;

									return (
										<DataGridTableHeadRowCell header={header} key={header.id}>
											{header.isPlaceholder ? null : props.tableLayout
													?.columnsResizable && column.getCanResize() ? (
												<div className="truncate">
													{flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
												</div>
											) : (
												flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)
											)}

											{props.tableLayout?.columnsResizable &&
												column.getCanResize() && (
													<DataGridTableHeadRowCellResize header={header} />
												)}
										</DataGridTableHeadRowCell>
									);
								})}
							</DataGridTableHeadRow>
						))}
					</DataGridTableHead>
				)}

				{renderHeader &&
					(props.tableLayout?.stripped || !props.tableLayout?.rowBorder) && (
						<DataGridTableRowSpacer />
					)}

				<DataGridTableBody>
					<MemoizedVirtualBody
						table={table}
						columnCount={columnCount}
						topRows={topRows}
						centerRows={centerRows}
						bottomRows={bottomRows}
						virtualItems={virtualItems}
						totalSize={totalSize}
						virtualizationMode={virtualizationMode}
						infiniteRowsStatus={infiniteRowsStatus}
						loadingMoreMessage={loadingMoreMessage}
						allRowsLoadedMessage={allRowsLoadedMessage}
						measureRowRef={measureRowRef}
					/>
				</DataGridTableBody>

				{footerContent && (
					<DataGridTableFoot>{footerContent}</DataGridTableFoot>
				)}
			</DataGridTableBase>
		</DataGridTableViewport>
	);
}

export { DataGridTableVirtual };

export type {
	DataGridTableVirtualProps,
	DataGridTableVirtualScrollElements,
	DataGridTableVirtualizerOptions,
};
