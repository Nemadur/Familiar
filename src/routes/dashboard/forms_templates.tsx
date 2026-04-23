import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Surface } from "@heroui/react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Plus,
	Loader2,
	FileText,
	Search,
	ArrowUpDown,
	Layers3,
	Clock3,
	Braces,
	CalendarIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/components/layout/dashboard/header";
import { FormTemplateModal } from "@/components/layout/commision/form-template-modal";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import {
	OutlineClock03,
	OutlineEdit,
	OutlineTrash,
} from "@/components/icons/icons";
import {
	useFormTemplates,
	useDeleteFormTemplate,
} from "@/hooks/use-form-templates";
import {
	type DateRangeValue,
	FilterBar,
	type FilterGroup,
	type FilterValue,
	type ManagedFilterValue,
} from "@/components/layout/filter-bar";
import type { DateFilterOperator } from "@/components/data-table-filter/core/types";
import { Badge } from "@/components/ui/badge";

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

type SortValue = "updated" | "name" | "fields" | "version";

type ManagedFilterEntry = ManagedFilterValue;
type ManagedFiltersState = Record<string, ManagedFilterEntry>;

const INITIAL_FILTER_STATE: ManagedFiltersState = {
	updatedAt: {
		value: { from: undefined, to: undefined },
		operator: "is between",
	},
};

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

function DashboardForms() {
	const { data: templates, isPending: templatesPending } = useFormTemplates();
	const deleteMutation = useDeleteFormTemplate();

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
	const [editingTemplate, setEditingTemplate] =
		useState<FormTemplateItem | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [filterState, setFilterState] =
		useState<ManagedFiltersState>(INITIAL_FILTER_STATE);

	const typedTemplates = (templates ?? []) as FormTemplateItem[];

	function handleFilterChange(
		groupId: string,
		value: FilterValue,
		operator?: ManagedFilterValue["operator"],
	) {
		setFilterState((previous) => ({
			...previous,
			[groupId]: {
				value,
				operator,
			},
		}));
	}

	function clearAllFilters() {
		setFilterState(INITIAL_FILTER_STATE);
	}

	const filterGroups = useMemo<FilterGroup<FormTemplateItem>[]>(
		() => [
			{
				id: "updatedAt",
				label: "Last updated",
				type: "date",
				icon: CalendarIcon,
				getItemValue: (template) =>
					new Date(template.updatedAt || template.createdAt || 0),
			},
		],
		[],
	);

	const filterValues = useMemo<Record<string, ManagedFilterValue>>(
		() => ({
			updatedAt: filterState.updatedAt,
		}),
		[filterState],
	);

	const stats = useMemo(() => {
		const totalTemplates = typedTemplates.length;
		const totalFields = typedTemplates.reduce(
			(sum, template) => sum + (template.fields?.length ?? 0),
			0,
		);
		const avgFields =
			totalTemplates > 0 ? Math.round(totalFields / totalTemplates) : 0;

		return {
			totalTemplates,
			totalFields,
			avgFields,
		};
	}, [typedTemplates]);

	const filteredTemplates = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();

		const updatedAtValue = isDateRangeValue(filterState.updatedAt?.value)
			? filterState.updatedAt.value
			: undefined;

		let result = typedTemplates.filter((template) => {
			const matchesSearch = query
				? [
						template.name,
						template.description,
						...(template.fields?.map(
							(field) => field.label || field.type || "",
						) ?? []),
					]
						.filter(Boolean)
						.join(" ")
						.toLowerCase()
						.includes(query)
				: true;

			const matchesDate = matchSubmittedDate(
				template.updatedAt || template.createdAt,
				updatedAtValue,
				filterState.updatedAt?.operator,
			);

			return matchesSearch && matchesDate;
		});

		result = [...result].sort((a, b) => {
			return (
				new Date(b.updatedAt || b.createdAt || 0).getTime() -
				new Date(a.updatedAt || a.createdAt || 0).getTime()
			);
		});

		return result;
	}, [typedTemplates, searchQuery, filterState]);

	const performDelete = (id: string) => {
		toast.promise(deleteMutation.mutateAsync(id), {
			loading: "Deleting template...",
			success: "Template deleted successfully",
			error: (e: any) => e.message || "Failed to delete template",
		});
		setTemplateToDelete(null);
	};

	const handleEdit = (template: FormTemplateItem) => {
		setEditingTemplate(template);
		setIsModalOpen(true);
	};

	const handleCreate = () => {
		setEditingTemplate(null);
		setIsModalOpen(true);
	};

	return (
		<div className="flex h-full flex-1 flex-col bg-muted/40">
			<DashboardHeader
				title="Form Templates"
				actions={
					<Button onClick={handleCreate} className="gap-2" size="xl">
						<Plus className="size-4" />
						<span className="hidden sm:inline">New Template</span>
					</Button>
				}
			/>

			<main className="flex-1 overflow-y-auto p-6">
				{templatesPending ? (
					<div className="flex h-40 items-center justify-center">
						<Loader2 className="size-8 animate-spin text-muted-foreground" />
					</div>
				) : (
					<div className="space-y-6">
						{typedTemplates.length > 0 && (
							<FilterBar
								data={typedTemplates}
								groups={filterGroups}
								values={filterValues}
								onFilterChange={handleFilterChange}
								searchQuery={searchQuery}
								onSearchChange={setSearchQuery}
								searchPlaceholder="Search by name, description, or field labels..."
								onClearAll={clearAllFilters}
							/>
						)}

						{!typedTemplates.length ? (
							<Surface className="flex h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed text-center">
								<h2 className="text-lg font-semibold">No templates yet</h2>
								<p className="mt-2 max-w-md text-sm text-muted-foreground">
									Start by creating a reusable request form for portraits,
									emotes, illustrations, character sheets, or any other
									commission type.
								</p>

								<Button onClick={handleCreate} className="mt-6 gap-2">
									<Plus className="size-4" />
									Create Template
								</Button>
							</Surface>
						) : !filteredTemplates.length ? (
							<Surface className="flex h-[280px] flex-col items-center justify-center rounded-[28px] border text-center">
								<div className="mb-4 flex size-12 items-center justify-center rounded-2xl border bg-muted/50">
									<Search className="size-5 text-muted-foreground" />
								</div>
								<h3 className="text-base font-semibold">
									No matching templates
								</h3>
								<p className="mt-2 text-sm text-muted-foreground">
									Try a different search phrase or change sorting.
								</p>
							</Surface>
						) : (
							<div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
								{filteredTemplates.map((template) => {
									const fields = template.fields ?? [];
									const previewFields = fields.slice(0, 4);
									const remainingFields = Math.max(fields.length - 4, 0);

									return (
										<Surface
											key={template.id}
											className="group flex min-h-[280px] flex-col rounded-3xl border p-4"
										>
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

												<Badge size={"sm"} variant={"secondary"}>
													v{template.version}
												</Badge>
											</div>

											<p className="mt-5 min-h-[40px] text-sm leading-6 text-muted-foreground line-clamp-2">
												{template.description || "No description provided."}
											</p>

											<div className="mt-5 flex flex-wrap gap-2">
												{previewFields.length ? (
													<>
														{previewFields.map((field, index) => (
															<Badge
																size={"sm"}
																variant={"secondary"}
																key={field.id || "${template.id}-${index}"}
															>
																{getFieldPreviewLabel(field, index)}
															</Badge>
														))}
														{remainingFields > 0 && (
															<Badge size={"sm"} variant={"outline"}>
																+{remainingFields} more
															</Badge>
														)}
													</>
												) : (
													<Badge size={"sm"} variant={"outline"}>
														No fields yet
													</Badge>
												)}
											</div>

											<div className="mt-auto pt-6 flex justify-end gap-2 w-full">
												<Button
													size={"xl"}
													variant="ghost"
													onClick={() => handleEdit(template)}
												>
													<OutlineEdit />
													Edit
												</Button>

												<Button
													size={"xl"}
													variant="destructive"
													onClick={() => setTemplateToDelete(template.id)}
													disabled={
														deleteMutation.isPending &&
														templateToDelete === template.id
													}
												>
													<OutlineTrash />
													Delete
												</Button>
											</div>
										</Surface>
									);
								})}
							</div>
						)}
					</div>
				)}
			</main>

			{isModalOpen && (
				<FormTemplateModal
					open={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					template={editingTemplate}
				/>
			)}

			<ConfirmDialog
				open={!!templateToDelete}
				onOpenChange={(open) => !open && setTemplateToDelete(null)}
				title="Delete Template"
				description="Are you sure you want to delete this template? This action cannot be undone."
				onConfirm={() => templateToDelete && performDelete(templateToDelete)}
				confirmText="Delete"
				isPending={deleteMutation.isPending}
			/>
		</div>
	);
}
