import { Surface } from "@heroui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Archive,
	CalendarIcon,
	Edit2,
	ExternalLink,
	GripVertical,
	LinkIcon,
	ListFilterIcon,
	MoreHorizontal,
	Trash,
} from "lucide-react";
import { useCallback, useMemo, useReducer, useState } from "react";
import { toast } from "sonner";
import type { DateFilterOperator } from "@/components/data-table-filter/core/types";
import {
	OutlineEdit,
	OutlineImage,
	OutlineLink,
	OutlinePlus,
	OutlineTrash,
} from "@/components/icons/icons";
import { CommissionForm } from "@/components/layout/commision/commission-form";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { DashboardHeader } from "@/components/layout/dashboard/header";
import {
	type DateRangeValue,
	FilterBar,
	type FilterGroup,
	type FilterValue,
	type ManagedFilterValue,
} from "@/components/layout/filter-bar";
import { matchSingleOrMulti } from "@/components/layout/requests/my/helpers";
import {
	Sortable,
	SortableItem,
	SortableItemHandle,
} from "@/components/reui/sortable";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useDeleteCommission,
	useMyCommissions,
	usePublishCommission,
	useUpdateCommission,
} from "@/hooks/use-commisions";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import { getSelectedValues } from "@/routes/dashboard/commissions_requests";
import { type TCommission, TCommissionStatus } from "@/types/commissions";

export const Route = createFileRoute("/dashboard/services")({
	component: DashboardServices,
});

type ManagedFilterEntry = ManagedFilterValue;
type ManagedFiltersState = Record<string, ManagedFilterEntry>;

interface DashboardServicesState {
	page: number;
	searchQuery: string;
	filterState: ManagedFiltersState;
	isCreateModalOpen: boolean;
	isEditModalOpen: boolean;
	selectedCommissionId: string | null;
	selectedCommissionToArchive: string | null;
}

type DashboardServicesAction =
	| {
			type: "setPage";
			page: number;
	  }
	| {
			type: "setSearchQuery";
			searchQuery: string;
	  }
	| {
			type: "setFilter";
			groupId: string;
			value: FilterValue;
			operator?: ManagedFilterValue["operator"];
	  }
	| {
			type: "clearAllFilters";
	  }
	| {
			type: "setCreateModalOpen";
			open: boolean;
	  }
	| {
			type: "openEditModal";
			commissionId: string;
	  }
	| {
			type: "closeEditModal";
	  }
	| {
			type: "openArchiveModal";
			commissionId: string;
	  }
	| {
			type: "closeArchiveModal";
	  };

const SERVICE_FILTER_GROUPS: FilterGroup<TCommission>[] = [
	{
		id: "status",
		label: "Status",
		type: "select",
		icon: ListFilterIcon,
		getItemValue: (commission) => commission.commissionStatus,
		options: [
			{ id: TCommissionStatus.Active, label: "Active" },
			{ id: TCommissionStatus.Draft, label: "Draft" },
			{ id: TCommissionStatus.Paused, label: "Paused" },
			{ id: TCommissionStatus.OnHold, label: "On Hold" },
			{ id: TCommissionStatus.Archived, label: "Archived" },
		],
	},
	{
		id: "createdDate",
		label: "Created date",
		type: "date",
		icon: CalendarIcon,
		getItemValue: (commission) => new Date(commission.createdAt),
	},
];

function createInitialFilterState(): ManagedFiltersState {
	return {
		status: { value: [] },
		createdDate: {
			value: { from: undefined, to: undefined },
			operator: "is between",
		},
	};
}

// TODO: add price range filter
// TODO: maybe filter out archived services?
// TODO: prepare services for shop and other than commissions

const INITIAL_DASHBOARD_SERVICES_STATE: DashboardServicesState = {
	page: 1,
	searchQuery: "",
	filterState: createInitialFilterState(),
	isCreateModalOpen: false,
	isEditModalOpen: false,
	selectedCommissionId: null,
	selectedCommissionToArchive: null,
};

function dashboardServicesReducer(
	state: DashboardServicesState,
	action: DashboardServicesAction,
): DashboardServicesState {
	switch (action.type) {
		case "setPage":
			return {
				...state,
				page: action.page,
			};
		case "setSearchQuery":
			return {
				...state,
				searchQuery: action.searchQuery,
			};
		case "setFilter":
			return {
				...state,
				filterState: {
					...state.filterState,
					[action.groupId]: {
						value: action.value,
						operator: action.operator,
					},
				},
			};
		case "clearAllFilters":
			return {
				...state,
				filterState: createInitialFilterState(),
			};
		case "setCreateModalOpen":
			return {
				...state,
				isCreateModalOpen: action.open,
			};
		case "openEditModal":
			return {
				...state,
				isEditModalOpen: true,
				selectedCommissionId: action.commissionId,
			};
		case "closeEditModal":
			return {
				...state,
				isEditModalOpen: false,
				selectedCommissionId: null,
			};
		case "openArchiveModal":
			return {
				...state,
				selectedCommissionToArchive: action.commissionId,
			};
		case "closeArchiveModal":
			return {
				...state,
				selectedCommissionToArchive: null,
			};
		default:
			return state;
	}
}

function isDateRangeValue(value: FilterValue): value is DateRangeValue {
	if (!value || typeof value !== "object" || Array.isArray(value)) return false;
	return "from" in value || "to" in value;
}

function startOfDay(date: Date) {
	const next = new Date(date);
	next.setHours(0, 0, 0, 0);
	return next;
}

function endOfDay(date: Date) {
	const next = new Date(date);
	next.setHours(23, 59, 59, 999);
	return next;
}

function matchDate(
	input: string | Date,
	range?: DateRangeValue,
	fallbackOperator?: ManagedFilterValue["operator"],
) {
	if (!range?.from) return true;

	const date = new Date(input);
	const fromStart = startOfDay(range.from);
	const fromEnd = endOfDay(range.from);
	const toEnd = endOfDay(range.to ?? range.from);

	const operator = (range.operator ??
		fallbackOperator ??
		(range.to ? "is between" : "is")) as DateFilterOperator;

	switch (operator) {
		case "is":
			return date >= fromStart && date <= fromEnd;
		case "is not":
			return !(date >= fromStart && date <= fromEnd);
		case "is before":
			return date < fromStart;
		case "is on or after":
			return date >= fromStart;
		case "is after":
			return date > fromEnd;
		case "is on or before":
			return date <= fromEnd;
		case "is between":
			return date >= fromStart && date <= toEnd;
		case "is not between":
			return !(date >= fromStart && date <= toEnd);
		default:
			return true;
	}
}

function resolveOptionOperator(
	operator: ManagedFilterValue["operator"],
	valueCount: number,
) {
	if (operator) {
		return operator as string;
	}
	return valueCount <= 1 ? "is" : "is any of";
}

function matchesSelectFilter(
	actualValue: string,
	filter: ManagedFilterValue | undefined,
	selectedValues: string[],
) {
	if (selectedValues.length === 0) {
		return true;
	}
	return matchSingleOrMulti(
		actualValue,
		resolveOptionOperator(filter?.operator, selectedValues.length),
		selectedValues,
	);
}

function useFilteredCommissions(
	commissions: TCommission[],
	filterState: ManagedFiltersState,
	searchQuery: string,
) {
	return useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		const statusValues = getSelectedValues(filterState.status?.value);
		const createdDateValue = isDateRangeValue(filterState.createdDate?.value)
			? filterState.createdDate.value
			: undefined;

		return commissions.filter((commission) => {
			const matchesSearch = query
				? [
						commission.title,
						commission.description ?? "",
						commission.id,
						commission.commissionStatus,
						String(commission.basePrice),
						commission.currencyCode,
					]
						.join(" ")
						.toLowerCase()
						.includes(query)
				: true;

			const matchesStatus = matchesSelectFilter(
				commission.commissionStatus,
				filterState.status,
				statusValues,
			);

			const matchesCreatedDate = matchDate(
				commission.createdAt,
				createdDateValue,
				filterState.createdDate?.operator,
			);

			return matchesSearch && matchesStatus && matchesCreatedDate;
		});
	}, [filterState, commissions, searchQuery]);
}

const ITEMS_PER_PAGE = 100;

function DashboardServices() {
	const [state, dispatch] = useReducer(
		dashboardServicesReducer,
		INITIAL_DASHBOARD_SERVICES_STATE,
	);

	const { user } = useAuth();
	const { data: pageData, isPending } = useMyCommissions(
		state.page - 1,
		ITEMS_PER_PAGE,
	);
	const deleteMutation = useDeleteCommission();
	const publishMutation = usePublishCommission();
	const updateMutation = useUpdateCommission();

	const commissions = pageData?.content ?? [];
	const filteredCommissions = useFilteredCommissions(
		commissions,
		state.filterState,
		state.searchQuery,
	);

	const groupedCommissions = useMemo(() => {
		const groups: Record<string, TCommission[]> = {};
		for (const commission of filteredCommissions) {
			const catName = commission.category.name || "Other";
			if (!groups[catName]) groups[catName] = [];
			groups[catName].push(commission);
		}
		return groups;
	}, [filteredCommissions]);

	const [activeCategory, setActiveCategory] = useState<string | null>(null);

	const filterValues = useMemo<Record<string, ManagedFilterValue>>(
		() => ({
			status: state.filterState.status,
			createdDate: state.filterState.createdDate,
		}),
		[state.filterState],
	);

	// const handleDelete = async (id: string) => {
	// 	if (!window.confirm("Are you sure you want to delete this commission?")) {
	// 		return;
	// 	}

	// 	try {
	// 		await deleteMutation.mutateAsync(id);
	// 		toast.success("Commission deleted successfully");
	// 	} catch {
	// 		toast.error("Failed to delete commission");
	// 	}
	// };

	// const handlePublish = async (id: string) => {
	// 	try {
	// 		await publishMutation.mutateAsync(id);
	// 		toast.success("Commission published successfully");
	// 	} catch {
	// 		toast.error("Failed to publish commission");
	// 	}
	// };

	const handleStatusChange = async (id: string, status: TCommissionStatus) => {
		try {
			await updateMutation.mutateAsync({
				commissionId: id,
				data: { commissionStatus: status },
			});
			toast.success("Status updated");
		} catch {
			toast.error("Failed to update status");
		}
	};

	const totalPages = Math.max(1, pageData?.totalPages ?? 1);
	const totalItems = pageData?.totalElements ?? 0;
	const currentPage = (pageData?.number ?? state.page - 1) + 1;
	const startItem =
		totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
	const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

	return (
		<div className="flex flex-1 flex-col h-full bg-muted/40">
			<DashboardHeader title="Services" />

			<div className="flex flex-1 flex-col gap-4 p-6">
				<div className="flex items-center justify-between mb-2">
					<h1 className="text-3xl font-semibold tracking-tight text-foreground">
						Services
					</h1>
					<div className="flex items-center gap-3">
						<Button size="xl" variant="secondary">
							<OutlinePlus />
							Category
						</Button>
						<Button
							size="xl"
							onClick={() =>
								dispatch({ type: "setCreateModalOpen", open: true })
							}
						>
							<OutlinePlus />
							Service
						</Button>
					</div>
				</div>

				<FilterBar
					data={commissions}
					groups={SERVICE_FILTER_GROUPS}
					values={filterValues}
					onFilterChange={(groupId, value, operator) => {
						dispatch({ type: "setFilter", groupId, value, operator });
					}}
					searchQuery={state.searchQuery}
					onSearchChange={(searchQuery) => {
						dispatch({ type: "setSearchQuery", searchQuery });
					}}
					searchPlaceholder="Search by title, description, status..."
					onClearAll={() => dispatch({ type: "clearAllFilters" })}
				/>

				<div className="flex flex-wrap gap-2 mb-2">
					{Object.keys(groupedCommissions).map((cat) => (
						<Button
							key={cat}
							variant={activeCategory === cat ? "default" : "outline"}
							onClick={() =>
								setActiveCategory(activeCategory === cat ? null : cat)
							}
							className="rounded-full"
						>
							{cat}
						</Button>
					))}
				</div>

				<Sortable
					value={Object.keys(groupedCommissions)}
					onValueChange={() => {
						// Visual only, no reorder API available
					}}
					getItemValue={(categoryName) => categoryName}
				>
					<div className="flex flex-col gap-8">
						{Object.entries(groupedCommissions).map(([categoryName, items]) => {
							if (activeCategory && categoryName !== activeCategory)
								return null;
							return (
								<SortableItem key={categoryName} value={categoryName}>
									<div className="space-y-4 group/category relative bg-transparent">
										<div className="flex items-center justify-between">
											<h2 className="text-xl font-semibold text-foreground/80">
												{categoryName}
											</h2>
											<div className="flex items-center gap-2">
												<Button
													variant="outline"
													size={"lg"}
													className="rounded-full"
												>
													Edit
												</Button>
												<Button
													size={"lg"}
													className="rounded-full"
													onClick={() =>
														dispatch({ type: "setCreateModalOpen", open: true })
													}
												>
													<OutlinePlus /> Service
												</Button>

												<Button variant={"destructive_ghost"} size="icon-lg">
													<OutlineTrash />
												</Button>
												<SortableItemHandle
													className={cn(
														buttonVariants({
															variant: "ghost",
															size: "icon-lg",
														}),
														"cursor-grab hover:bg-transparent",
													)}
												>
													<GripVertical className="size-4 text-muted-foreground" />
												</SortableItemHandle>
											</div>
										</div>

										<div className="flex flex-col gap-2">
											<Sortable
												value={items}
												onValueChange={() => {
													// Visual only, no reorder API available
												}}
												getItemValue={(item) => item.id}
											>
												<div className="flex flex-col gap-2">
													{items.map((item, index) => (
														<SortableItem key={item.id} value={item.id}>
															<ServiceCategoryItem
																key={item.id}
																item={item}
																onStatusChange={(value) =>
																	handleStatusChange(
																		item.id,
																		value as TCommissionStatus,
																	)
																}
																onEdit={() =>
																	dispatch({
																		type: "openEditModal",
																		commissionId: item.id,
																	})
																}
																onArchive={() =>
																	dispatch({
																		type: "openArchiveModal",
																		commissionId: item.id,
																	})
																}
															/>
														</SortableItem>
													))}
												</div>
											</Sortable>
										</div>
									</div>
								</SortableItem>
							);
						})}
					</div>
				</Sortable>
			</div>

			{state.isCreateModalOpen && user && (
				<CommissionForm
					username={user.username || user.userId}
					tab="commissions"
					artistId={user.userId}
					onClose={() => {
						dispatch({ type: "setCreateModalOpen", open: false });
					}}
				/>
			)}

			{state.isEditModalOpen && state.selectedCommissionId && user && (
				<CommissionForm
					username={user.username || user.userId}
					tab="commissions"
					artistId={user.userId}
					commissionId={state.selectedCommissionId}
					onClose={() => {
						dispatch({ type: "closeEditModal" });
					}}
				/>
			)}

			<ConfirmDialog
				open={!!state.selectedCommissionToArchive}
				onOpenChange={(open) =>
					!open && dispatch({ type: "closeArchiveModal" })
				}
				title="Archive Service"
				description="Are you sure you want to archive this service? This action cannot be undone and you will not be able to unarchive it later."
				onConfirm={() => {
					if (state.selectedCommissionToArchive) {
						handleStatusChange(
							state.selectedCommissionToArchive,
							TCommissionStatus.Archived,
						);
						dispatch({ type: "closeArchiveModal" });
					}
				}}
				confirmText="Archive"
				isPending={updateMutation.isPending}
			/>
		</div>
	);
}

function ServiceCategoryItem({
	item,
	onStatusChange,
	onEdit,
	onArchive,
}: {
	item: TCommission;
	onStatusChange: (val: string) => void;
	onEdit: () => void;
	onArchive: () => void;
}) {
	const { user } = useAuth();

	return (
		<Surface className="flex rounded-2xl p-1 pr-5!">
			<div className="flex items-center gap-4 flex-1 overflow-hidden">
				<div className="h-16 aspect-video rounded-xl bg-muted overflow-hidden shrink-0">
					{item.multimedia?.[0] ? (
						<img
							src={item.multimedia[0].sizes?.half}
							alt=""
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="h-full w-full flex items-center justify-center text-muted-foreground/50">
							<OutlineImage className="size-6" />
						</div>
					)}
				</div>
				<div className="flex-1 min-w-0">
					<h3 className="font-semibold text-sm truncate">{item.title}</h3>
				</div>
			</div>

			<div className="flex items-center gap-6 shrink-0">
				<div className="text-sm font-medium text-muted-foreground w-28">
					From {item.currencyCode} {item.basePrice}
				</div>

				{item.commissionStatus === TCommissionStatus.Archived ? (
					<Badge
						variant={"danger_ghost"}
						className="w-[120px] h-8 text-xs tracking-wider uppercase font-semibold"
					>
						<div className="flex items-center gap-2">
							<div className="size-2 rounded-full bg-destructive" />
							Archived
						</div>
					</Badge>
				) : (
					<Select value={item.commissionStatus} onValueChange={onStatusChange}>
						<SelectTrigger className="w-[120px] h-8 text-xs tracking-wider uppercase font-semibold">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value={TCommissionStatus.Draft}>
								<div className="flex items-center gap-2">
									<div className="size-2 rounded-full bg-muted-foreground" />
									Draft
								</div>
							</SelectItem>
							<SelectItem value={TCommissionStatus.Active}>
								<div className="flex items-center gap-2">
									<div className="size-2 rounded-full bg-success" />
									Active
								</div>
							</SelectItem>
							<SelectItem value={TCommissionStatus.Paused}>
								<div className="flex items-center gap-2">
									<div className="size-2 rounded-full bg-warning" />
									Paused
								</div>
							</SelectItem>
							<SelectItem value={TCommissionStatus.OnHold}>
								<div className="flex items-center gap-2">
									<div className="size-2 rounded-full bg-primary" />
									On Hold
								</div>
							</SelectItem>
						</SelectContent>
					</Select>
				)}

				<div className="flex items-center gap-1 text-muted-foreground ml-4">
					<Button variant="ghost" size="icon-lg" onClick={onEdit}>
						<OutlineEdit />
					</Button>
					<Button variant="ghost" size="icon-lg" asChild>
						<Link
							to={
								`/${user?.username || user?.userId}/commissions/${item.id}` as string
							}
						>
							<OutlineLink />
						</Link>
					</Button>
					{item.commissionStatus !== TCommissionStatus.Archived && (
						<Button
							variant={"destructive_ghost"}
							size="icon-lg"
							onClick={onArchive}
						>
							<OutlineTrash />
						</Button>
					)}
					<SortableItemHandle
						className={cn(
							buttonVariants({
								variant: "ghost",
								size: "icon-lg",
							}),
							"cursor-grab hover:bg-transparent",
						)}
					>
						<GripVertical />
					</SortableItemHandle>
				</div>
			</div>
		</Surface>
	);
}
