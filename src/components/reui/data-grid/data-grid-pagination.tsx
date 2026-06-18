import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type React from "react";
import type { ReactNode } from "react";
import { useDataGrid } from "src/components/reui/data-grid/data-grid";
import { Button } from "src/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "src/components/ui/select";
import { Skeleton } from "src/components/ui/skeleton";
import { cn } from "src/lib/utils";

interface DataGridPaginationProps {
	sizes?: number[];
	sizesInfo?: string;
	sizesLabel?: string;
	sizesDescription?: string;
	sizesSkeleton?: ReactNode;
	more?: boolean;
	moreLimit?: number;
	info?: string;
	infoSkeleton?: ReactNode;
	className?: string;
	rowsPerPageLabel?: string;
	previousPageLabel?: string;
	nextPageLabel?: string;
	ellipsisText?: string;
}

interface PaginationPageButtonProps {
	page: number;
	pageIndex: number;
	className?: string;
	onPageChange: (page: number) => void;
}

function PaginationPageButton({
	page,
	pageIndex,
	className,
	onPageChange,
}: PaginationPageButtonProps) {
	const isActive = pageIndex === page;

	return (
		<Button
			size="icon-sm"
			variant="ghost"
			className={cn(className, "text-muted-foreground", {
				"bg-accent text-accent-foreground": isActive,
			})}
			onClick={() => {
				if (!isActive) {
					onPageChange(page);
				}
			}}
		>
			{page + 1}
		</Button>
	);
}

interface PaginationEllipsisButtonProps {
	className?: string;
	children: ReactNode;
	onClick: () => void;
}

function PaginationEllipsisButton({
	className,
	children,
	onClick,
}: PaginationEllipsisButtonProps) {
	return (
		<Button
			size="icon-sm"
			className={className}
			variant="ghost"
			onClick={onClick}
		>
			{children}
		</Button>
	);
}

function DataGridPagination(props: DataGridPaginationProps): React.JSX.Element {
	const { table, recordCount, isLoading } = useDataGrid();

	const defaultProps: Partial<DataGridPaginationProps> = {
		sizes: [5, 10, 25, 50, 100],
		sizesLabel: "Show",
		sizesDescription: "per page",
		sizesSkeleton: <Skeleton className="h-8 w-44" />,
		moreLimit: 5,
		more: false,
		info: "{from} - {to} of {count}",
		infoSkeleton: <Skeleton className="h-8 w-60" />,
		rowsPerPageLabel: "Rows per page",
		previousPageLabel: "Go to previous page",
		nextPageLabel: "Go to next page",
		ellipsisText: "...",
	};

	const mergedProps: DataGridPaginationProps = { ...defaultProps, ...props };

	const btnBaseClasses = "size-7 p-0 text-sm";
	const btnArrowClasses = `${btnBaseClasses} rtl:transform rtl:rotate-180`;
	const pageIndex = table.getState().pagination.pageIndex;
	const pageSize = table.getState().pagination.pageSize;
	const from = pageIndex * pageSize + 1;
	const to = Math.min((pageIndex + 1) * pageSize, recordCount);
	const pageCount = table.getPageCount();

	const paginationInfo = mergedProps.info
		? mergedProps.info
				.replace("{from}", from.toString())
				.replace("{to}", to.toString())
				.replace("{count}", recordCount.toString())
		: `${from} - ${to} of ${recordCount}`;

	const paginationMoreLimit = mergedProps.moreLimit || 5;

	const currentGroupStart =
		Math.floor(pageIndex / paginationMoreLimit) * paginationMoreLimit;
	const currentGroupEnd = Math.min(
		currentGroupStart + paginationMoreLimit,
		pageCount,
	);

	const visiblePages = Array.from(
		{ length: currentGroupEnd - currentGroupStart },
		(_, index) => currentGroupStart + index,
	);

	return (
		<div
			data-slot="data-grid-pagination"
			className={cn(
				"flex grow flex-col flex-wrap items-center justify-between gap-2.5 py-2.5 sm:flex-row sm:py-0",
				mergedProps.className,
			)}
		>
			<div className="order-2 flex flex-wrap items-center gap-x-2.5 pb-2.5 sm:order-1 sm:pb-0">
				{isLoading ? (
					mergedProps.sizesSkeleton
				) : (
					<>
						<div className="text-muted-foreground text-sm">
							{mergedProps.rowsPerPageLabel}
						</div>
						<Select
							value={`${pageSize}`}
							onValueChange={(value) => {
								const newPageSize = Number(value);
								table.setPageSize(newPageSize);
							}}
						>
							<SelectTrigger className="w-14" size="sm">
								<SelectValue />
							</SelectTrigger>
							<SelectContent side="top" className="min-w-18">
								{mergedProps.sizes?.map((size: number) => (
									<SelectItem key={size} value={`${size}`}>
										{size}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</>
				)}
			</div>

			<div className="order-1 flex flex-col items-center justify-center gap-2.5 pt-2.5 sm:order-2 sm:flex-row sm:justify-end sm:pt-0">
				{isLoading ? (
					mergedProps.infoSkeleton
				) : (
					<>
						<div className="text-muted-foreground order-2 text-nowrap text-sm sm:order-1">
							{paginationInfo}
						</div>

						{pageCount > 1 && (
							<div className="order-1 flex items-center gap-x-1 sm:order-2">
								<Button
									size="icon-sm"
									variant="ghost"
									className={btnArrowClasses}
									onClick={() => table.previousPage()}
									disabled={!table.getCanPreviousPage()}
								>
									<span className="sr-only">
										{mergedProps.previousPageLabel}
									</span>
									<ChevronLeftIcon className="size-4" />
								</Button>

								{currentGroupStart > 0 && (
									<PaginationEllipsisButton
										className={btnBaseClasses}
										onClick={() => table.setPageIndex(currentGroupStart - 1)}
									>
										{mergedProps.ellipsisText}
									</PaginationEllipsisButton>
								)}

								{visiblePages.map((page) => (
									<PaginationPageButton
										key={`pagination-page-${page}`}
										page={page}
										pageIndex={pageIndex}
										className={btnBaseClasses}
										onPageChange={table.setPageIndex}
									/>
								))}

								{currentGroupEnd < pageCount && (
									<PaginationEllipsisButton
										className={btnBaseClasses}
										onClick={() => table.setPageIndex(currentGroupEnd)}
									>
										{mergedProps.ellipsisText}
									</PaginationEllipsisButton>
								)}

								<Button
									size="icon-sm"
									variant="ghost"
									className={btnArrowClasses}
									onClick={() => table.nextPage()}
									disabled={!table.getCanNextPage()}
								>
									<span className="sr-only">{mergedProps.nextPageLabel}</span>
									<ChevronRightIcon className="size-4" />
								</Button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}

export { DataGridPagination, type DataGridPaginationProps };
