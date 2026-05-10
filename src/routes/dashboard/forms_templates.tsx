import { createFileRoute } from "@tanstack/react-router";
import { Surface } from "@heroui/react";
import { CalendarIcon, Loader2, Plus, Search } from "lucide-react";
import { useCallback, useMemo, useReducer } from "react";
import { toast } from "sonner";

import type { DateFilterOperator } from "@/components/data-table-filter/core/types";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { FormTemplateModal } from "@/components/layout/commision/form-template-modal";
import { DashboardHeader } from "@/components/layout/dashboard/header";
import {
	type DateRangeValue,
	FilterBar,
	type FilterGroup,
	type FilterValue,
	type ManagedFilterValue,
} from "@/components/layout/filter-bar";
import {
	OutlineClock03,
	OutlineEdit,
	OutlineTrash,
} from "@/components/icons/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	useDeleteFormTemplate,
	useFormTemplates,
} from "@/hooks/use-form-templates";

export const Route = createFileRoute("/dashboard/forms_templates")({
	component: DashboardForms,
});

type TemplateField = {
	id?: string;
	label?: string;
	type?: string;
	required?: boolean;
};

type FormTemplateItem = {
	id: string;
	name: string;
	description?: string | null;
	version: number;
	fields?: TemplateField[];
	createdAt?: string;
	updatedAt?: string;
};

type ManagedFilterEntry = ManagedFilterValue;
type ManagedFiltersState = Record<string, ManagedFilterEntry>;

interface DashboardFormsState {
	isModalOpen: boolean;
	templateToDelete: string | null;
	editingTemplate: FormTemplateItem | null;
	searchQuery: string;
	filterState: ManagedFiltersState;
}

type DashboardFormsAction =
	| { type: "openCreateModal" }
	| { type: "openEditModal"; template: FormTemplateItem }
	| { type: "closeModal" }
	| { type: "setTemplateToDelete"; templateId: string | null }
	| { type: "setSearchQuery"; searchQuery: string }
	| {
			type: "setFilter";
			groupId: string;
			value: FilterValue;
			operator?: ManagedFilterValue["operator"];
	  }
	| { type: "clearFilters" };

interface DashboardFormsActions {
	openCreateModal: () => void;
	openEditModal: (template: FormTemplateItem) => void;
	closeModal: () => void;
	setTemplateToDelete: (templateId: string | null) => void;
	setSearchQuery: (searchQuery: string) => void;
	handleFilterChange: (
		groupId: string,
		value: FilterValue,
		operator?: ManagedFilterValue["operator"],
	) => void;
	clearFilters: () => void;
}

const FORM_TEMPLATE_FILTER_GROUPS: FilterGroup<FormTemplateItem>[] = [
	{
		id: "updatedAt",
		label: "Last updated",
		type: "date",
		icon: CalendarIcon,
		getItemValue: (template) =>
			new Date(template.updatedAt || template.createdAt || 0),
	},
];

function createInitialFilterState(): ManagedFiltersState {
	return {
		updatedAt: {
			value: { from: undefined, to: undefined },
			operator: "is between",
		},
	};
}

const INITIAL_DASHBOARD_FORMS_STATE: DashboardFormsState = {
	isModalOpen: false,
	templateToDelete: null,
	editingTemplate: null,
	searchQuery: "",
	filterState: createInitialFilterState(),
};

function dashboardFormsReducer(
	state: DashboardFormsState,
	action: DashboardFormsAction,
): DashboardFormsState {
	switch (action.type) {
		case "openCreateModal":
			return {
				...state,
				isModalOpen: true,
				editingTemplate: null,
			};

		case "openEditModal":
			return {
				...state,
				isModalOpen: true,
				editingTemplate: action.template,
			};

		case "closeModal":
			return {
				...state,
				isModalOpen: false,
			};

		case "setTemplateToDelete":
			return {
				...state,
				templateToDelete: action.templateId,
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

		case "clearFilters":
			return {
				...state,
				filterState: createInitialFilterState(),
			};

		default:
			return state;
	}
}

function isDateRangeValue(value: FilterValue): value is DateRangeValue {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return false;
	}

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

function matchSubmittedDate(
	input: string | Date | undefined,
	range?: DateRangeValue,
	fallbackOperator?: ManagedFilterValue["operator"],
) {
	if (!input) return false;
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

function formatRelativeDate(date?: string) {
	if (!date) return "No recent updates";

	const now = new Date();
	const value = new Date(date);
	const diffMs = now.getTime() - value.getTime();

	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;

	if (diffMs < hour) {
		const minutes = Math.max(1, Math.floor(diffMs / minute));
		return `${minutes}m ago`;
	}

	if (diffMs < day) {
		const hours = Math.floor(diffMs / hour);
		return `${hours}h ago`;
	}

	if (diffMs < 7 * day) {
		const days = Math.floor(diffMs / day);
		return `${days}d ago`;
	}

	return value.toLocaleDateString();
}

function getFieldPreviewLabel(field: TemplateField, index: number) {
	return field.label || field.type || `Field ${index + 1}`;
}

function useDashboardFormsController() {
	const [state, dispatch] = useReducer(
		dashboardFormsReducer,
		INITIAL_DASHBOARD_FORMS_STATE,
	);

	const openCreateModal = useCallback(() => {
		dispatch({ type: "openCreateModal" });
	}, []);

	const openEditModal = useCallback((template: FormTemplateItem) => {
		dispatch({ type: "openEditModal", template });
	}, []);

	const closeModal = useCallback(() => {
		dispatch({ type: "closeModal" });
	}, []);

	const setTemplateToDelete = useCallback((templateId: string | null) => {
		dispatch({ type: "setTemplateToDelete", templateId });
	}, []);

	const setSearchQuery = useCallback((searchQuery: string) => {
		dispatch({ type: "setSearchQuery", searchQuery });
	}, []);

	const handleFilterChange = useCallback(
		(
			groupId: string,
			value: FilterValue,
			operator?: ManagedFilterValue["operator"],
		) => {
			dispatch({
				type: "setFilter",
				groupId,
				value,
				operator,
			});
		},
		[],
	);

	const clearFilters = useCallback(() => {
		dispatch({ type: "clearFilters" });
	}, []);

	const actions = useMemo<DashboardFormsActions>(
		() => ({
			openCreateModal,
			openEditModal,
			closeModal,
			setTemplateToDelete,
			setSearchQuery,
			handleFilterChange,
			clearFilters,
		}),
		[
			openCreateModal,
			openEditModal,
			closeModal,
			setTemplateToDelete,
			setSearchQuery,
			handleFilterChange,
			clearFilters,
		],
	);

	return {
		state,
		actions,
	};
}

function useFilterValues(filterState: ManagedFiltersState) {
	return useMemo<Record<string, ManagedFilterValue>>(
		() => ({
			updatedAt: filterState.updatedAt,
		}),
		[filterState],
	);
}

function useFilteredTemplates(
	templates: FormTemplateItem[],
	searchQuery: string,
	filterState: ManagedFiltersState,
) {
	return useMemo(() => {
		const query = searchQuery.trim().toLowerCase();

		const updatedAtValue = isDateRangeValue(filterState.updatedAt?.value)
			? filterState.updatedAt.value
			: undefined;

		const filtered = templates.filter((template) => {
			const matchesSearch = query
				? createTemplateSearchText(template).includes(query)
				: true;

			const matchesDate = matchSubmittedDate(
				template.updatedAt || template.createdAt,
				updatedAtValue,
				filterState.updatedAt?.operator,
			);

			return matchesSearch && matchesDate;
		});

		return filtered.toSorted(sortByLatestTemplateUpdate);
	}, [templates, searchQuery, filterState]);
}

function createTemplateSearchText(template: FormTemplateItem) {
	return [
		template.name,
		template.description,
		...(template.fields?.map((field) => field.label || field.type || "") ?? []),
	]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();
}

function sortByLatestTemplateUpdate(
	first: FormTemplateItem,
	second: FormTemplateItem,
) {
	return (
		new Date(second.updatedAt || second.createdAt || 0).getTime() -
		new Date(first.updatedAt || first.createdAt || 0).getTime()
	);
}

function DashboardForms() {
	const { data: templates, isPending: templatesPending } = useFormTemplates();
	const deleteMutation = useDeleteFormTemplate();
	const { state, actions } = useDashboardFormsController();

	const typedTemplates = useMemo(
		() => (templates ?? []) as FormTemplateItem[],
		[templates],
	);

	const filterValues = useFilterValues(state.filterState);
	const filteredTemplates = useFilteredTemplates(
		typedTemplates,
		state.searchQuery,
		state.filterState,
	);

	const performDelete = useCallback(
		(id: string) => {
			toast.promise(deleteMutation.mutateAsync(id), {
				loading: "Deleting template...",
				success: "Template deleted successfully",
				error: (error: unknown) =>
					error instanceof Error ? error.message : "Failed to delete template",
			});

			actions.setTemplateToDelete(null);
		},
		[actions, deleteMutation],
	);

	return (
		<DashboardFormsPage
			state={state}
			actions={actions}
			templates={typedTemplates}
			filteredTemplates={filteredTemplates}
			filterValues={filterValues}
			templatesPending={templatesPending}
			isDeletePending={deleteMutation.isPending}
			onDelete={performDelete}
		/>
	);
}

interface DashboardFormsPageProps {
	state: DashboardFormsState;
	actions: DashboardFormsActions;
	templates: FormTemplateItem[];
	filteredTemplates: FormTemplateItem[];
	filterValues: Record<string, ManagedFilterValue>;
	templatesPending: boolean;
	isDeletePending: boolean;
	onDelete: (templateId: string) => void;
}

function DashboardFormsPage({
	state,
	actions,
	templates,
	filteredTemplates,
	filterValues,
	templatesPending,
	isDeletePending,
	onDelete,
}: DashboardFormsPageProps) {
	return (
		<div className="flex h-full flex-1 flex-col bg-muted/40">
			<FormsHeader onCreate={actions.openCreateModal} />

			<main className="flex-1 overflow-y-auto p-6">
				{templatesPending ? (
					<TemplatesLoadingState />
				) : (
					<TemplatesContent
						templates={templates}
						filteredTemplates={filteredTemplates}
						filterValues={filterValues}
						searchQuery={state.searchQuery}
						templateToDelete={state.templateToDelete}
						isDeletePending={isDeletePending}
						onCreate={actions.openCreateModal}
						onEdit={actions.openEditModal}
						onDeleteClick={actions.setTemplateToDelete}
						onSearchChange={actions.setSearchQuery}
						onFilterChange={actions.handleFilterChange}
						onClearFilters={actions.clearFilters}
					/>
				)}
			</main>

			<TemplateEditorModal
				open={state.isModalOpen}
				template={state.editingTemplate}
				onClose={actions.closeModal}
			/>

			<DeleteTemplateDialog
				templateId={state.templateToDelete}
				isPending={isDeletePending}
				onOpenChange={(open) => {
					if (!open) {
						actions.setTemplateToDelete(null);
					}
				}}
				onConfirm={onDelete}
			/>
		</div>
	);
}

function FormsHeader({ onCreate }: { onCreate: () => void }) {
	return (
		<DashboardHeader
			title="Form Templates"
			actions={
				<Button onClick={onCreate} className="gap-2" size="xl">
					<Plus className="size-4" />
					<span className="hidden sm:inline">New Template</span>
				</Button>
			}
		/>
	);
}

function TemplatesLoadingState() {
	return (
		<div className="flex h-40 items-center justify-center">
			<Loader2 className="size-8 animate-spin text-muted-foreground" />
		</div>
	);
}

interface TemplatesContentProps {
	templates: FormTemplateItem[];
	filteredTemplates: FormTemplateItem[];
	filterValues: Record<string, ManagedFilterValue>;
	searchQuery: string;
	templateToDelete: string | null;
	isDeletePending: boolean;
	onCreate: () => void;
	onEdit: (template: FormTemplateItem) => void;
	onDeleteClick: (templateId: string | null) => void;
	onSearchChange: (searchQuery: string) => void;
	onFilterChange: (
		groupId: string,
		value: FilterValue,
		operator?: ManagedFilterValue["operator"],
	) => void;
	onClearFilters: () => void;
}

function TemplatesContent({
	templates,
	filteredTemplates,
	filterValues,
	searchQuery,
	templateToDelete,
	isDeletePending,
	onCreate,
	onEdit,
	onDeleteClick,
	onSearchChange,
	onFilterChange,
	onClearFilters,
}: TemplatesContentProps) {
	return (
		<div className="space-y-6">
			{templates.length > 0 && (
				<TemplatesFilterBar
					templates={templates}
					filterValues={filterValues}
					searchQuery={searchQuery}
					onSearchChange={onSearchChange}
					onFilterChange={onFilterChange}
					onClearFilters={onClearFilters}
				/>
			)}

			<TemplatesBody
				templates={templates}
				filteredTemplates={filteredTemplates}
				templateToDelete={templateToDelete}
				isDeletePending={isDeletePending}
				onCreate={onCreate}
				onEdit={onEdit}
				onDeleteClick={onDeleteClick}
			/>
		</div>
	);
}

interface TemplatesFilterBarProps {
	templates: FormTemplateItem[];
	filterValues: Record<string, ManagedFilterValue>;
	searchQuery: string;
	onSearchChange: (searchQuery: string) => void;
	onFilterChange: (
		groupId: string,
		value: FilterValue,
		operator?: ManagedFilterValue["operator"],
	) => void;
	onClearFilters: () => void;
}

function TemplatesFilterBar({
	templates,
	filterValues,
	searchQuery,
	onSearchChange,
	onFilterChange,
	onClearFilters,
}: TemplatesFilterBarProps) {
	return (
		<FilterBar
			data={templates}
			groups={FORM_TEMPLATE_FILTER_GROUPS}
			values={filterValues}
			onFilterChange={onFilterChange}
			searchQuery={searchQuery}
			onSearchChange={onSearchChange}
			searchPlaceholder="Search by name, description, or field labels..."
			onClearAll={onClearFilters}
		/>
	);
}

interface TemplatesBodyProps {
	templates: FormTemplateItem[];
	filteredTemplates: FormTemplateItem[];
	templateToDelete: string | null;
	isDeletePending: boolean;
	onCreate: () => void;
	onEdit: (template: FormTemplateItem) => void;
	onDeleteClick: (templateId: string | null) => void;
}

function TemplatesBody({
	templates,
	filteredTemplates,
	templateToDelete,
	isDeletePending,
	onCreate,
	onEdit,
	onDeleteClick,
}: TemplatesBodyProps) {
	if (!templates.length) {
		return <EmptyTemplatesState onCreate={onCreate} />;
	}

	if (!filteredTemplates.length) {
		return <NoMatchingTemplatesState />;
	}

	return (
		<TemplatesGrid
			templates={filteredTemplates}
			templateToDelete={templateToDelete}
			isDeletePending={isDeletePending}
			onEdit={onEdit}
			onDeleteClick={onDeleteClick}
		/>
	);
}

function EmptyTemplatesState({ onCreate }: { onCreate: () => void }) {
	return (
		<Surface className="flex h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed text-center">
			<h2 className="text-lg font-semibold">No templates yet</h2>
			<p className="mt-2 max-w-md text-sm text-muted-foreground">
				Start by creating a reusable request form for portraits, emotes,
				illustrations, character sheets, or any other commission type.
			</p>

			<Button onClick={onCreate} className="mt-6 gap-2">
				<Plus className="size-4" />
				Create Template
			</Button>
		</Surface>
	);
}

function NoMatchingTemplatesState() {
	return (
		<Surface className="flex h-[280px] flex-col items-center justify-center rounded-[28px] border text-center">
			<div className="mb-4 flex size-12 items-center justify-center rounded-2xl border bg-muted/50">
				<Search className="size-5 text-muted-foreground" />
			</div>
			<h3 className="text-base font-semibold">No matching templates</h3>
			<p className="mt-2 text-sm text-muted-foreground">
				Try a different search phrase or change sorting.
			</p>
		</Surface>
	);
}

interface TemplatesGridProps {
	templates: FormTemplateItem[];
	templateToDelete: string | null;
	isDeletePending: boolean;
	onEdit: (template: FormTemplateItem) => void;
	onDeleteClick: (templateId: string | null) => void;
}

function TemplatesGrid({
	templates,
	templateToDelete,
	isDeletePending,
	onEdit,
	onDeleteClick,
}: TemplatesGridProps) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
			{templates.map((template) => (
				<TemplateCard
					key={template.id}
					template={template}
					isDeletePending={isDeletePending}
					isSelectedForDelete={templateToDelete === template.id}
					onEdit={() => onEdit(template)}
					onDelete={() => onDeleteClick(template.id)}
				/>
			))}
		</div>
	);
}

interface TemplateCardProps {
	template: FormTemplateItem;
	isDeletePending: boolean;
	isSelectedForDelete: boolean;
	onEdit: () => void;
	onDelete: () => void;
}

function TemplateCard({
	template,
	isDeletePending,
	isSelectedForDelete,
	onEdit,
	onDelete,
}: TemplateCardProps) {
	return (
		<Surface className="group flex min-h-[280px] flex-col rounded-3xl border p-4">
			<TemplateCardHeader template={template} />
			<TemplateDescription description={template.description} />
			<TemplateFieldsPreview template={template} />
			<TemplateCardActions
				onEdit={onEdit}
				onDelete={onDelete}
				deleteDisabled={isDeletePending && isSelectedForDelete}
			/>
		</Surface>
	);
}

function TemplateCardHeader({ template }: { template: FormTemplateItem }) {
	return (
		<div className="flex items-start justify-between gap-4">
			<div className="flex min-w-0 items-start gap-3">
				<div className="min-w-0">
					<h3 className="truncate text-base font-semibold text-foreground">
						{template.name}
					</h3>
					<p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
						<OutlineClock03 className="size-3.5" />
						Updated {formatRelativeDate(template.updatedAt)}
					</p>
				</div>
			</div>

			<Badge size="sm" variant="secondary">
				v{template.version}
			</Badge>
		</div>
	);
}

function TemplateDescription({ description }: { description?: string | null }) {
	return (
		<p className="mt-5 min-h-[40px] text-sm leading-6 text-muted-foreground line-clamp-2">
			{description || "No description provided."}
		</p>
	);
}

function TemplateFieldsPreview({ template }: { template: FormTemplateItem }) {
	const fields = template.fields ?? [];
	const previewFields = fields.slice(0, 4);
	const remainingFields = Math.max(fields.length - 4, 0);

	return (
		<div className="mt-5 flex flex-wrap gap-2">
			{previewFields.length ? (
				<>
					{previewFields.map((field, index) => (
						<Badge
							size="sm"
							variant="secondary"
							key={field.id || `${template.id}-${index}`}
						>
							{getFieldPreviewLabel(field, index)}
						</Badge>
					))}

					{remainingFields > 0 && (
						<Badge size="sm" variant="outline">
							+{remainingFields} more
						</Badge>
					)}
				</>
			) : (
				<Badge size="sm" variant="outline">
					No fields yet
				</Badge>
			)}
		</div>
	);
}

function TemplateCardActions({
	onEdit,
	onDelete,
	deleteDisabled,
}: {
	onEdit: () => void;
	onDelete: () => void;
	deleteDisabled: boolean;
}) {
	return (
		<div className="mt-auto flex w-full justify-end gap-2 pt-6">
			<Button size="xl" variant="ghost" onClick={onEdit}>
				<OutlineEdit />
				Edit
			</Button>

			<Button
				size="xl"
				variant="destructive"
				onClick={onDelete}
				disabled={deleteDisabled}
			>
				<OutlineTrash />
				Delete
			</Button>
		</div>
	);
}

function TemplateEditorModal({
	open,
	template,
	onClose,
}: {
	open: boolean;
	template: FormTemplateItem | null;
	onClose: () => void;
}) {
	if (!open) {
		return null;
	}

	return (
		<FormTemplateModal open={open} onClose={onClose} template={template} />
	);
}

function DeleteTemplateDialog({
	templateId,
	isPending,
	onOpenChange,
	onConfirm,
}: {
	templateId: string | null;
	isPending: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: (templateId: string) => void;
}) {
	return (
		<ConfirmDialog
			open={!!templateId}
			onOpenChange={onOpenChange}
			title="Delete Template"
			description="Are you sure you want to delete this template? This action cannot be undone."
			onConfirm={() => {
				if (templateId) {
					onConfirm(templateId);
				}
			}}
			confirmText="Delete"
			isPending={isPending}
		/>
	);
}
