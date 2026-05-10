import {
	type ColumnDef,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { Download, Flag } from "lucide-react";
import { useMemo } from "react";
import { OutlineChat, OutlineFileArchive } from "@/components/icons/icons";
import { DataGrid } from "@/components/reui/data-grid/data-grid";
import { DataGridColumnHeader } from "@/components/reui/data-grid/data-grid-column-header";
import { DataGridScrollArea } from "@/components/reui/data-grid/data-grid-scroll-area";
import { DataGridTable } from "@/components/reui/data-grid/data-grid-table";
import { Button } from "@/components/ui/button";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { useCommission } from "@/hooks/use-commisions";
import { useUserById } from "@/hooks/use-user";
import { cn } from "@/lib/utils";
import { TCommissionRequestStatus } from "@/types/commissions";
import { TPaymentStatus } from "@/types/payment";
import type { TUserProfile } from "@/types/user";
import { EmptyPage } from "../../empty-page";
import User from "../../profile/user";
import { PaymentText, StatusBadge } from "./badges";
import {
	formatShortDate,
	formatTime,
	generatePaginationItems,
	getPaymentStatus,
	getRequestTimeline,
	type RequestItem,
} from "./helpers";

export type UserPreview = Partial<TUserProfile> & {
	userId: string;
	username?: string | null;
	displayName?: string | null;
	avatarPath?: string | null;
	isVerified?: boolean | null;
};

export type CommissionPreview = {
	id: string;
	title?: string | null;
	description?: string | null;
	multimedia?: Array<{
		sizes?: {
			thumbnail?: string | null;
			half?: string | null;
			full?: string | null;
		} | null;
	}> | null;
};

export type RequestListItem = RequestItem & {
	commission?: CommissionPreview | null;
	artist?: UserPreview | null;
	client?: UserPreview | null;
};

type RequestAction = "review" | "set_wip" | "final_delivery" | "chat";

interface RequestListProps {
	requests: RequestListItem[];
	onRequestClick: (requestId: string) => void;
	className?: string;
	totalCount?: number;
	isPending?: boolean;
	currentPage?: number;
	totalPages?: number;
	startItem?: number;
	endItem?: number;
	isRefreshing?: boolean;
	viewType?: "client" | "artist";
	onPageChange?: (page: number) => void;
	onAction?: (action: RequestAction, request: RequestListItem) => void;
}

function UserIdentity({ user }: { user?: UserPreview | null }) {
	return <User user={user as TUserProfile} />;
}

function RequestIdentityCell({ request }: { request: RequestListItem }) {
	const commissionQuery = useCommission(request.commissionId);
	const artistQuery = useUserById(request.artistId);

	const commission = request.commission ?? commissionQuery.data ?? null;
	const artist = request.artist ?? artistQuery.user ?? null;

	const coverImage =
		commission?.multimedia?.[0]?.sizes?.half ||
		commission?.multimedia?.[0]?.sizes?.thumbnail ||
		commission?.multimedia?.[0]?.sizes?.full ||
		null;

	const commissionTitle =
		commission?.title ||
		(commissionQuery.isLoading
			? "Loading commission..."
			: "Untitled commission");

	return (
		<div className="flex min-w-0 items-center gap-4">
			<div className="h-16 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted md:h-[76px] md:w-[112px]">
				{coverImage ? (
					<img
						src={coverImage}
						alt={commissionTitle}
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center text-xs font-medium text-muted-foreground">
						No image
					</div>
				)}
			</div>

			<div className="min-w-0">
				<p className="truncate text-[15px] font-semibold text-foreground">
					{commissionTitle}
				</p>

				<div className="mt-2">
					{artistQuery.isPending && !artist ? (
						<span className="text-sm text-muted-foreground">
							Loading artist&hellip;
						</span>
					) : (
						<UserIdentity user={artist} />
					)}
				</div>
			</div>
		</div>
	);
}

function ArtistRequestIdentityCell({ request }: { request: RequestListItem }) {
	const commissionQuery = useCommission(request.commissionId);
	const commission = request.commission ?? commissionQuery.data ?? null;

	const commissionTitle =
		commission?.title ||
		(commissionQuery.isLoading
			? "Loading commission..."
			: "Untitled commission");

	return (
		<div className="flex h-full min-w-0 flex-col justify-center">
			<p className="truncate text-[15px] font-semibold text-foreground">
				{commissionTitle}
			</p>
		</div>
	);
}

function RequestDateCell({ value }: { value: string }) {
	return (
		<div className="space-y-0.5">
			<p className="text-[15px] font-medium leading-5 text-foreground">
				{formatShortDate(value)}
			</p>
			<p className="text-sm text-muted-foreground">{formatTime(value)}</p>
		</div>
	);
}

function RequestTimelineCell({ request }: { request: RequestListItem }) {
	const timeline = getRequestTimeline(request);

	return (
		<div className="min-w-0">
			<div className="space-y-1">
				<p className="truncate text-[15px] font-medium leading-5 text-foreground">
					{timeline.primary}
				</p>
				<p className="flex items-center gap-1.5 text-sm leading-5 text-muted-foreground">
					<Flag className="size-3 shrink-0" />
					<span className="line-clamp-2">{timeline.secondary}</span>
				</p>
			</div>
		</div>
	);
}

function RequestRowActions({
	request,
	viewType,
	onAction,
}: {
	request: RequestListItem;
	viewType: "client" | "artist";
	onAction?: (action: RequestAction, request: RequestListItem) => void;
}) {
	const status = request.status;
	const payment = getPaymentStatus(request);
	const isAcceptedPaid =
		status === TCommissionRequestStatus.Accepted &&
		payment === TPaymentStatus.Completed;

	return (
		<div className="flex items-center justify-end gap-2">
			{viewType === "client" ? (
				<Button
					size="lg"
					onClick={(event) => {
						event.stopPropagation();
						// TODO: invoice action
					}}
				>
					<Download />
					Invoice
				</Button>
			) : (
				<>
					{status === TCommissionRequestStatus.Pending && (
						<Button
							size="lg"
							variant="secondary"
							onClick={(event) => {
								event.stopPropagation();
								onAction?.("review", request);
							}}
						>
							Review
						</Button>
					)}

					{isAcceptedPaid && (
						<Button
							size="lg"
							variant="secondary"
							onClick={(event) => {
								event.stopPropagation();
								onAction?.("set_wip", request);
							}}
						>
							Set to WIP
						</Button>
					)}

					{status === TCommissionRequestStatus.In_Progress && (
						<Button
							size="lg"
							variant="secondary"
							onClick={(event) => {
								event.stopPropagation();
								onAction?.("final_delivery", request);
							}}
						>
							Final Delivery
						</Button>
					)}
				</>
			)}

			{status !== TCommissionRequestStatus.Pending &&
				status !== TCommissionRequestStatus.Cancelled && (
					<Button
						size="icon-lg"
						variant="secondary"
						onClick={(event) => {
							event.stopPropagation();
							onAction?.("chat", request);
						}}
					>
						<OutlineChat />
					</Button>
				)}

			{status === TCommissionRequestStatus.Cancelled && (
				<Button
					size="icon-lg"
					variant="destructive"
					onClick={(event) => {
						event.stopPropagation();
						// TODO: archive action
					}}
				>
					<OutlineFileArchive />
				</Button>
			)}
		</div>
	);
}

function useRequestListColumns({
	viewType,
	onAction,
}: {
	viewType: "client" | "artist";
	onAction?: (action: RequestAction, request: RequestListItem) => void;
}) {
	return useMemo<ColumnDef<RequestListItem>[]>(
		() => [
			{
				accessorKey: "id",
				id: "identity",
				header: ({ column }) => (
					<DataGridColumnHeader
						title="Commission"
						visibility={true}
						column={column}
					/>
				),
				cell: ({ row }) =>
					viewType === "artist" ? (
						<ArtistRequestIdentityCell request={row.original} />
					) : (
						<RequestIdentityCell request={row.original} />
					),
				size: viewType === "artist" ? 260 : 360,
				enableSorting: false,
			},
			{
				accessorKey: "status",
				id: "status",
				header: ({ column }) => (
					<DataGridColumnHeader
						title="Status"
						visibility={true}
						column={column}
					/>
				),
				cell: ({ row }) => <StatusBadge status={row.original.status} />,
				size: 140,
				enableSorting: false,
			},
			{
				accessorKey: "createdAt",
				id: "submitted",
				header: ({ column }) => (
					<DataGridColumnHeader
						title="Submitted"
						visibility={true}
						column={column}
					/>
				),
				cell: ({ row }) => <RequestDateCell value={row.original.createdAt} />,
				size: 180,
				enableSorting: false,
			},
			{
				id: "payment",
				header: ({ column }) => (
					<DataGridColumnHeader
						title="Payment"
						visibility={true}
						column={column}
					/>
				),
				cell: ({ row }) => (
					<PaymentText status={getPaymentStatus(row.original)} />
				),
				size: 120,
				enableSorting: false,
			},
			{
				id: "timeline",
				header: ({ column }) => (
					<DataGridColumnHeader
						title="Timeline"
						visibility={true}
						column={column}
					/>
				),
				cell: ({ row }) => <RequestTimelineCell request={row.original} />,
				size: 260,
				enableSorting: false,
			},
			{
				id: "actions",
				header: () => null,
				cell: ({ row }) => (
					<RequestRowActions
						request={row.original}
						viewType={viewType}
						onAction={onAction}
					/>
				),
				size: viewType === "client" ? 160 : 220,
				enableSorting: false,
			},
		],
		[viewType, onAction],
	);
}

function RequestListTable({
	requests,
	totalCount,
	onRequestClick,
	columns,
}: {
	requests: RequestListItem[];
	totalCount?: number;
	onRequestClick: (requestId: string) => void;
	columns: ColumnDef<RequestListItem>[];
}) {
	const table = useReactTable({
		columns,
		data: requests,
		getRowId: (row) => row.id,
		getCoreRowModel: getCoreRowModel(),
		columnResizeMode: "onChange",
	});

	return (
		<DataGrid
			table={table}
			recordCount={totalCount ?? requests.length}
			onRowClick={(row: RequestListItem) => onRequestClick(row.id)}
			tableClassNames={{
				base: "border-separate [border-spacing:0_12px] px-3",
				header: "bg-transparent",
				headerRow: "bg-transparent",
				body: "bg-transparent",
				bodyRow: cn(
					"group hover:bg-transparent data-[state=selected]:bg-transparent",
					"[&>td]:bg-surface [&>td]:align-middle [&>td]:transition-colors",
					"hover:[&>td]:bg-muted/40 data-[state=selected]:[&>td]:bg-muted/50",
					"[&>td:first-child]:rounded-l-2xl [&>td:last-child]:rounded-r-2xl",
					"[&>td:first-child]:pl-1 [&>td:last-child]:pr-4 [&>td]:py-1",
				),
				edgeCell: "",
			}}
			tableLayout={{
				headerBorder: false,
				headerBackground: false,
				cellBorder: false,
				rowBorder: false,
			}}
		>
			<DataGridScrollArea className="w-full">
				<DataGridTable />
			</DataGridScrollArea>
		</DataGrid>
	);
}

function RequestListFooter({
	requests,
	totalCount,
	currentPage,
	totalPages,
	startItem,
	endItem,
	isRefreshing,
	onPageChange,
}: {
	requests: RequestListItem[];
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
		<div className="flex flex-col gap-3 border-t px-4 py-3 md:flex-row md:items-center">
			<RequestListSummary
				requests={requests}
				totalCount={totalCount}
				currentPage={currentPage}
				totalPages={totalPages}
				startItem={startItem}
				endItem={endItem}
				isRefreshing={isRefreshing}
			/>

			{totalPages > 1 ? (
				<RequestListPagination
					currentPage={currentPage}
					totalPages={totalPages}
					paginationItems={paginationItems}
					onPageChange={onPageChange}
				/>
			) : null}
		</div>
	);
}

function RequestListSummary({
	requests,
	totalCount,
	currentPage,
	totalPages,
	startItem,
	endItem,
	isRefreshing,
}: {
	requests: RequestListItem[];
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
					{totalCount ?? requests.length}
				</span>{" "}
				requests
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

function RequestListPagination({
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

export function RequestList({
	requests,
	onRequestClick,
	className,
	totalCount,
	isPending = true,
	currentPage = 1,
	totalPages = 1,
	startItem = 0,
	endItem = 0,
	isRefreshing = false,
	viewType = "client",
	onPageChange,
	onAction,
}: RequestListProps) {
	const columns = useRequestListColumns({ viewType, onAction });

	if (requests.length === 0 && !isPending) {
		return (
			<div className={cn("w-full", className)}>
				<EmptyPage title="No requests found" />
			</div>
		);
	}

	return (
		<div className={cn("w-full", className)}>
			<div className="overflow-hidden rounded-3xl border bg-background">
				<RequestListTable
					requests={requests}
					totalCount={totalCount}
					onRequestClick={onRequestClick}
					columns={columns}
				/>

				<RequestListFooter
					requests={requests}
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
