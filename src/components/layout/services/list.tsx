import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Link } from "@tanstack/react-router";
import { ExternalLink, MoreHorizontal, Send, Trash } from "lucide-react";
import { useMemo } from "react";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { DataGridList } from "@/components/reui/data-grid/data-grid-list";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TCommission } from "@/types/commissions";
import { EmptyPage } from "../empty-page";
import { generatePaginationItems } from "../requests/my/helpers";
import { CommissionStatusBadge } from "../badges";

interface ServiceListProps {
	commissions: TCommission[];
	className?: string;
	totalCount?: number;
	isPending?: boolean;
	currentPage?: number;
	totalPages?: number;
	startItem?: number;
	endItem?: number;
	isRefreshing?: boolean;
	username?: string;
	onPageChange?: (page: number) => void;
	onPublish?: (id: string) => void;
	onDelete?: (id: string) => void;
	onRequestClick?: (id: string) => void;
}

function ServiceDateCell({ value }: { value: string }) {
	const date = new Date(value);
	return (
		<time dateTime={date.toISOString()} className="text-muted-foreground">
			{date.toLocaleDateString()}
		</time>
	);
}

function useServiceListColumns({
	username,
	onPublish,
	onDelete,
}: {
	username?: string;
	onPublish?: (id: string) => void;
	onDelete?: (id: string) => void;
}) {
	return useMemo<ColumnDef<TCommission>[]>(
		() => [
			{
				accessorKey: "title",
				id: "title",
				header: ({ column }) => (
					<DataGridColumnHeader
						title="Title"
						visibility={true}
						column={column}
					/>
				),
				cell: ({ row }) => (
					<span className="font-medium">{row.original.title}</span>
				),
				size: 260,
				enableSorting: false,
			},
			{
				accessorKey: "commissionStatus",
				id: "status",
				header: ({ column }) => (
					<DataGridColumnHeader
						title="Status"
						visibility={true}
						column={column}
					/>
				),
				cell: ({ row }) => (
					<CommissionStatusBadge status={row.original.commissionStatus} />
				),
				size: 140,
				enableSorting: false,
			},
			{
				id: "basePrice",
				header: ({ column }) => (
					<DataGridColumnHeader
						title="Base Price"
						visibility={true}
						column={column}
					/>
				),
				cell: ({ row }) => (
					<span>
						{row.original.basePrice} {row.original.currencyCode}
					</span>
				),
				size: 140,
				enableSorting: false,
			},
			{
				accessorKey: "createdAt",
				id: "created",
				header: ({ column }) => (
					<DataGridColumnHeader
						title="Created"
						visibility={true}
						column={column}
					/>
				),
				cell: ({ row }) => <ServiceDateCell value={row.original.createdAt} />,
				size: 180,
				enableSorting: false,
			},
			{
				id: "actions",
				header: () => null,
				cell: ({ row }) => {
					const commission = row.original;
					return (
						<div className="flex justify-end">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="size-8"
										aria-label={`Open actions for ${commission.title}`}
									>
										<MoreHorizontal className="size-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									{commission.commissionStatus === "DRAFT" && onPublish && (
										<DropdownMenuItem onClick={() => onPublish(commission.id)}>
											<Send className="mr-2 size-4" />
											Publish
										</DropdownMenuItem>
									)}
									<DropdownMenuItem asChild>
										<Link
											to={`/${username}/commissions/${commission.id}` as string}
										>
											<ExternalLink className="mr-2 size-4" />
											View Page
										</Link>
									</DropdownMenuItem>
									{onDelete && (
										<DropdownMenuItem
											onClick={() => onDelete(commission.id)}
											className="text-destructive focus:text-destructive"
										>
											<Trash className="mr-2 size-4" />
											Delete
										</DropdownMenuItem>
									)}
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					);
				},
				size: 80,
				enableSorting: false,
			},
		],
		[username, onPublish, onDelete],
	);
}

function ServiceListTable({
	commissions,
	totalCount,
	columns,
	onRequestClick,
}: {
	commissions: TCommission[];
	totalCount?: number;
	columns: ColumnDef<TCommission>[];
	onRequestClick?: (id: string) => void;
}) {
	const table = useReactTable({
		columns,
		data: commissions,
		getRowId: (row) => row.id,
		getCoreRowModel: getCoreRowModel(),
		columnResizeMode: "onChange",
	});

	return (
		<DataGridList
			table={table}
			recordCount={totalCount ?? commissions.length}
			onRowClick={
				onRequestClick
					? (row: TCommission) => onRequestClick(row.id)
					: undefined
			}
		/>
	);
}

function ServiceListFooter({
	commissions,
	totalCount,
	currentPage,
	totalPages,
	startItem,
	endItem,
	isRefreshing,
	onPageChange,
}: {
	commissions: TCommission[];
	totalCount?: number;
	currentPage: number;
	totalPages: number;
	startItem: number;
	endItem: number;
	isRefreshing: boolean;
	onPageChange?: (page: number) => void;
}) {
	const paginationItems = useMemo(
		() => generatePaginationItems(currentPage, totalPages),
		[currentPage, totalPages],
	);

	return (
		<div className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center">
			<ServiceListSummary
				commissions={commissions}
				totalCount={totalCount}
				currentPage={currentPage}
				totalPages={totalPages}
				startItem={startItem}
				endItem={endItem}
				isRefreshing={isRefreshing}
			/>

			{totalPages > 1 ? (
				<ServiceListPagination
					currentPage={currentPage}
					totalPages={totalPages}
					paginationItems={paginationItems}
					onPageChange={onPageChange}
				/>
			) : null}
		</div>
	);
}

function ServiceListSummary({
	commissions,
	totalCount,
	currentPage,
	totalPages,
	startItem,
	endItem,
	isRefreshing,
}: {
	commissions: TCommission[];
	totalCount?: number;
	currentPage: number;
	totalPages: number;
	startItem: number;
	endItem: number;
	isRefreshing: boolean;
}) {
	return (
		<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
			<span>
				Showing <span className="font-medium text-foreground">{startItem}</span>
				–<span className="font-medium text-foreground">{endItem}</span> of{" "}
				<span className="font-medium text-foreground">
					{totalCount ?? commissions.length}
				</span>{" "}
				services
			</span>

			<span>
				Page <span className="font-medium text-foreground">{currentPage}</span>{" "}
				of <span className="font-medium text-foreground">{totalPages}</span>
			</span>

			{isRefreshing ? (
				<span className="inline-flex items-center gap-1.5">Refreshing</span>
			) : null}
		</div>
	);
}

function ServiceListPagination({
	currentPage,
	totalPages,
	paginationItems,
	onPageChange,
}: {
	currentPage: number;
	totalPages: number;
	paginationItems: ReturnType<typeof generatePaginationItems>;
	onPageChange?: (page: number) => void;
}) {
	return (
		<div className="md:ml-auto">
			<Pagination className="w-auto justify-start md:justify-end">
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							onClick={(event) => {
								event.preventDefault();

								if (currentPage > 1) {
									onPageChange?.(currentPage - 1);
								}
							}}
							className={cn(
								currentPage <= 1 && "pointer-events-none opacity-50",
							)}
						/>
					</PaginationItem>

					{paginationItems.map((item) =>
						typeof item !== "number" ? (
							<PaginationItem key={item}>
								<PaginationEllipsis />
							</PaginationItem>
						) : (
							<PaginationItem key={item}>
								<PaginationLink
									isActive={item === currentPage}
									onClick={(event) => {
										event.preventDefault();
										onPageChange?.(item);
									}}
								>
									{item}
								</PaginationLink>
							</PaginationItem>
						),
					)}

					<PaginationItem>
						<PaginationNext
							onClick={(event) => {
								event.preventDefault();

								if (currentPage < totalPages) {
									onPageChange?.(currentPage + 1);
								}
							}}
							className={cn(
								currentPage >= totalPages && "pointer-events-none opacity-50",
							)}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	);
}

export function ServiceList({
	commissions,
	className,
	totalCount,
	isPending = true,
	currentPage = 1,
	totalPages = 1,
	startItem = 0,
	endItem = 0,
	isRefreshing = false,
	username,
	onPageChange,
	onPublish,
	onDelete,
	onRequestClick,
}: ServiceListProps) {
	const columns = useServiceListColumns({ username, onPublish, onDelete });

	if (commissions.length === 0 && !isPending) {
		return (
			<div className={cn("w-full", className)}>
				<EmptyPage title="No services found. Create one to get started!" />
			</div>
		);
	}

	return (
		<div className={cn("w-full", className)}>
			<div className="overflow-hidden">
				<ServiceListTable
					commissions={commissions}
					totalCount={totalCount}
					columns={columns}
					onRequestClick={onRequestClick}
				/>

				<ServiceListFooter
					commissions={commissions}
					totalCount={totalCount}
					currentPage={currentPage}
					totalPages={totalPages}
					startItem={startItem}
					endItem={endItem}
					isRefreshing={isRefreshing}
					onPageChange={onPageChange}
				/>
			</div>
		</div>
	);
}
