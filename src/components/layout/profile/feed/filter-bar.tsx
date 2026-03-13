import { ScrollShadow } from "@heroui/react";
import { memo, type ReactNode, useCallback, useMemo, useState } from "react";
import {
	OutlineClose,
	OutlineFilter,
	OutlineSearch,
} from "@/components/icons/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useIsTablet } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

/* =========================
   Types
========================= */

export interface FilterOption {
	id: string;
	label: string;
	value?: string;
	count?: number;
}

export type FilterGroupType = "select" | "multiselect" | "boolean" | "range";

export interface RangeValue {
	min?: number;
	max?: number;
}

export interface RangeConfig {
	min: number;
	max: number;
	step?: number;
	presets?: Array<{
		id: string;
		label: string;
		value: RangeValue;
	}>;
	minLabel?: string;
	maxLabel?: string;
	formatValue?: (value: number) => string;
}

export interface FilterGroup {
	id: string;
	label: string;
	description?: string;
	type: FilterGroupType;
	options?: FilterOption[];
	range?: RangeConfig;
}

export interface SortOption {
	id: string;
	label: string;
}

export type FilterValue = string[] | boolean | RangeValue;

interface FilterBarV4Props {
	groups: FilterGroup[];
	values: Record<string, FilterValue>;
	onFilterChange: (groupId: string, value: FilterValue) => void;

	searchQuery: string;
	onSearchChange: (query: string) => void;
	searchPlaceholder?: string;

	sortOptions?: SortOption[];
	sortValue?: string;
	onSortChange?: (value: string) => void;

	extraActions?: ReactNode;
	className?: string;
	onClearAll?: () => void;
}

/* =========================
   Helpers
========================= */

const EMPTY_IDS: string[] = [];

function isStringArrayValue(value: FilterValue | undefined): value is string[] {
	return Array.isArray(value);
}

function isRangeValue(value: FilterValue | undefined): value is RangeValue {
	return (
		typeof value === "object" &&
		value !== null &&
		!Array.isArray(value) &&
		("min" in value || "max" in value)
	);
}

function hasActiveRange(value: RangeValue | undefined, range?: RangeConfig) {
	if (!value || !range) return false;

	return (
		(value.min !== undefined && value.min !== range.min) ||
		(value.max !== undefined && value.max !== range.max)
	);
}

/* =========================
   Small UI pieces
========================= */

const SectionHeader = memo(function SectionHeader({
	label,
	activeCount,
	onClear,
}: {
	label: string;
	activeCount: number;
	onClear?: () => void;
}) {
	return (
		<div className="mb-3.5 grid min-h-8 grid-cols-[1fr_auto] items-center gap-3">
			<div className="flex min-w-0 items-center gap-2">
				<span className="truncate text-sm font-semibold tracking-wide text-foreground/90">
					{label}
				</span>

				<span
					className={cn(
						"inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-[11px] font-semibold text-secondary-foreground",
						activeCount === 0 && "invisible",
					)}
					aria-hidden={activeCount === 0}
				>
					{activeCount || 0}
				</span>
			</div>

			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					onClear?.();
				}}
				className={cn(
					"text-xs transition-colors",
					activeCount > 0 && onClear
						? "text-muted-foreground hover:text-foreground"
						: "pointer-events-none invisible",
				)}
			>
				Clear
			</button>
		</div>
	);
});

const Chip = memo(function Chip({
	id,
	label,
	active,
	onToggle,
	count,
}: {
	id: string;
	label: string;
	active: boolean;
	onToggle: (id: string) => void;
	count?: number;
}) {
	return (
		<Button
			variant={active ? "default" : "outline"}
			onClick={() => onToggle(id)}
			size={"sm"}
		>
			{label}
			{count !== undefined && (
				<span className="text-[10px] opacity-70">{count}</span>
			)}
		</Button>
	);
});

/* =========================
   Group components
========================= */

const FilterSelectGroup = memo(function FilterSelectGroup({
	group,
	value,
	onFilterChange,
}: {
	group: FilterGroup;
	value: FilterValue | undefined;
	onFilterChange: (groupId: string, value: FilterValue) => void;
}) {
	const currentIds = isStringArrayValue(value) ? value : EMPTY_IDS;

	const selectedSet = useMemo(() => new Set(currentIds), [currentIds]);

	const handleToggle = useCallback(
		(optionId: string) => {
			const isActive = selectedSet.has(optionId);

			if (group.type === "select") {
				onFilterChange(group.id, isActive ? EMPTY_IDS : [optionId]);
				return;
			}

			onFilterChange(
				group.id,
				isActive
					? currentIds.filter((id) => id !== optionId)
					: [...currentIds, optionId],
			);
		},
		[currentIds, group.id, group.type, onFilterChange, selectedSet],
	);

	const handleClear = useCallback(() => {
		onFilterChange(group.id, EMPTY_IDS);
	}, [group.id, onFilterChange]);

	return (
		<div className="border-b border-border/40 pb-6 last:border-0 last:pb-0">
			<SectionHeader
				label={group.label}
				activeCount={currentIds.length}
				onClear={handleClear}
			/>

			<div className="flex flex-wrap content-start items-start gap-2">
				{group.options?.map((option) => (
					<Chip
						key={option.id}
						id={option.id}
						label={option.label}
						count={option.count}
						active={selectedSet.has(option.id)}
						onToggle={handleToggle}
					/>
				))}
			</div>
		</div>
	);
});

const FilterBooleanGroup = memo(function FilterBooleanGroup({
	group,
	value,
	onFilterChange,
}: {
	group: FilterGroup;
	value: FilterValue | undefined;
	onFilterChange: (groupId: string, value: FilterValue) => void;
}) {
	const isActive = value === true;

	return (
		<div className="border-b border-border/40 pb-6 last:border-0 last:pb-0">
			<div className="flex items-center justify-between rounded-xl border border-border/50 bg-secondary/20 p-3">
				<span className="text-[13px] font-medium text-foreground/80">
					{group.label}
				</span>
				<Switch
					checked={isActive}
					onCheckedChange={(checked) => onFilterChange(group.id, checked)}
				/>
			</div>
		</div>
	);
});

const RangeFilterItem = memo(function RangeFilterItem({
	group,
	value,
	onChange,
}: {
	group: FilterGroup;
	value: FilterValue | undefined;
	onChange: (groupId: string, value: FilterValue) => void;
}) {
	const range = group.range || { min: 0, max: 0, step: 1 };
	const currentValue = isRangeValue(value) ? value : undefined;
	const min = currentValue?.min ?? range.min;
	const max = currentValue?.max ?? range.max;
	const isModified = hasActiveRange(currentValue, range);

	const [localValue, setLocalValue] = useState([min, max]);
	const [prevMin, setPrevMin] = useState(min);
	const [prevMax, setPrevMax] = useState(max);

	if (min !== prevMin || max !== prevMax) {
		setPrevMin(min);
		setPrevMax(max);
		setLocalValue([min, max]);
	}

	const handleClear = useCallback(() => {
		if (!group.range) return;
		onChange(group.id, {
			min: group.range.min,
			max: group.range.max,
		});
	}, [group.id, group.range, onChange]);

	if (!group.range) return null;

	return (
		<div className="border-b border-border/40 pb-6 last:border-0 last:pb-0">
			<SectionHeader
				label={group.label}
				activeCount={isModified ? 1 : 0}
				onClear={handleClear}
			/>

			<div className="rounded-xl border border-border/50 bg-secondary/20 p-4">
				<div className="mb-3.5 flex justify-between">
					<div>
						<div className="mb-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
							Min
						</div>
						<div className="font-syne text-lg font-semibold text-foreground">
							{group.range.formatValue?.(localValue[0]) ?? localValue[0]}
						</div>
					</div>

					<div className="text-right">
						<div className="mb-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
							Max
						</div>
						<div className="font-syne text-lg font-semibold text-foreground">
							{group.range.formatValue?.(localValue[1]) ?? localValue[1]}
						</div>
					</div>
				</div>

				<Slider
					min={group.range.min}
					max={group.range.max}
					step={group.range.step ?? 1}
					value={localValue}
					onValueChange={setLocalValue}
					onValueCommit={(val) =>
						onChange(group.id, { min: val[0], max: val[1] })
					}
				/>
			</div>
		</div>
	);
});

/* =========================
   Filter Content
========================= */

function FilterContent({
	mode,
	groups,
	values,
	onFilterChange,
	onClearAll,
	totalActiveFilters,
	setOpen,
}: {
	mode: "dialog" | "drawer";
	groups: FilterGroup[];
	values: Record<string, FilterValue>;
	onFilterChange: (groupId: string, value: FilterValue) => void;
	onClearAll?: () => void;
	totalActiveFilters: number;
	setOpen: (open: boolean) => void;
}) {
	const headerPadding = mode === "drawer" && "px-4 pt-2 pb-4";
	const bodyPadding = mode === "drawer" && "px-4";
	const footerPadding =
		mode === "drawer" && "px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]";

	return (
		<div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
			<header className={cn("shrink-0", headerPadding)}>
				<div className="mb-5 flex items-start justify-between gap-4">
					<div className="min-w-0">
						<h2 className="text-2xl font-bold leading-tight tracking-tight text-foreground">
							Filters
						</h2>
						<p className="mt-1 text-sm font-normal text-muted-foreground">
							Refine your search results
						</p>
					</div>

					<Button
						variant="ghost"
						size="icon"
						className="shrink-0 max-lg:hidden"
						onClick={() => setOpen(false)}
					>
						<OutlineClose />
					</Button>
				</div>

				<div className="h-px bg-border/40" />
			</header>

			<div className="min-h-0 flex-1">
				<ScrollShadow className={cn("h-full py-4", bodyPadding)}>
					<div className="space-y-6 pb-2">
						{groups.map((group) => {
							const value = values[group.id];

							if (group.type === "select" || group.type === "multiselect") {
								return (
									<FilterSelectGroup
										key={group.id}
										group={group}
										value={value}
										onFilterChange={onFilterChange}
									/>
								);
							}

							if (group.type === "range" && group.range) {
								return (
									<RangeFilterItem
										key={group.id}
										group={group}
										value={value}
										onChange={onFilterChange}
									/>
								);
							}

							if (group.type === "boolean") {
								return (
									<FilterBooleanGroup
										key={group.id}
										group={group}
										value={value}
										onFilterChange={onFilterChange}
									/>
								);
							}

							return null;
						})}
					</div>
				</ScrollShadow>
			</div>

			<footer
				className={cn(
					"shrink-0 border-t pt-4 border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80",
					footerPadding,
				)}
			>
				<div className="flex items-center justify-between gap-3">
					<div className="text-[13px] text-muted-foreground">
						<strong>{totalActiveFilters}</strong> active
					</div>

					<div className="flex items-center gap-2">
						{totalActiveFilters > 0 && onClearAll && (
							<Button variant="ghost" onClick={onClearAll}>
								Reset
							</Button>
						)}

						<Button onClick={() => setOpen(false)}>Show Results</Button>
					</div>
				</div>
			</footer>
		</div>
	);
}

/* =========================
   Main Component
========================= */

export function FilterBarV4({
	groups,
	values,
	onFilterChange,
	searchQuery,
	onSearchChange,
	searchPlaceholder = "Search...",
	extraActions,
	className,
	onClearAll,
}: FilterBarV4Props) {
	const isTablet = useIsTablet();
	const [open, setOpen] = useState(false);

	const totalActiveFilters = useMemo(() => {
		let count = 0;

		for (const group of groups) {
			const val = values[group.id];
			if (!val) continue;

			if (Array.isArray(val)) count += val.length;
			if (typeof val === "boolean" && val) count += 1;
			if (isRangeValue(val) && hasActiveRange(val, group.range)) count += 1;
		}

		return count;
	}, [groups, values]);

	const triggerButton = (
		<Button variant="outline" size={"lg"} className="border-dashed">
			<OutlineFilter />
			Filter
			{totalActiveFilters > 0 && (
				<Badge variant="secondary" className="flex h-5 min-w-5 px-1">
					{totalActiveFilters}
				</Badge>
			)}
		</Button>
	);

	return (
		<div className={cn("w-full", className)}>
			<div className="flex w-full items-center gap-3">
				<div className="relative flex-1 h-10">
					<OutlineSearch className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder={searchPlaceholder}
						className="bg-background/50 pl-9 h-10"
					/>
				</div>

				{isTablet ? (
					<Drawer open={open} onOpenChange={setOpen}>
						<DrawerTrigger asChild>{triggerButton}</DrawerTrigger>
						<DrawerContent className="h-[90svh] max-h-[90svh]">
							<div className="mx-auto flex h-full min-h-0 w-full max-w-screen-sm flex-col">
								<FilterContent
									mode="drawer"
									groups={groups}
									values={values}
									onFilterChange={onFilterChange}
									onClearAll={onClearAll}
									totalActiveFilters={totalActiveFilters}
									setOpen={setOpen}
								/>
							</div>
						</DrawerContent>
					</Drawer>
				) : (
					<Dialog open={open} onOpenChange={setOpen}>
						<DialogTrigger asChild>{triggerButton}</DialogTrigger>
						<DialogContent
							showCloseButton={false}
							className="h-[60svh] min-w-xl"
						>
							<FilterContent
								mode="dialog"
								groups={groups}
								values={values}
								onFilterChange={onFilterChange}
								onClearAll={onClearAll}
								totalActiveFilters={totalActiveFilters}
								setOpen={setOpen}
							/>
						</DialogContent>
					</Dialog>
				)}

				{extraActions}
			</div>
		</div>
	);
}
