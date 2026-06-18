import type { Column } from "@tanstack/react-table";
import { CheckIcon, CirclePlusIcon } from "lucide-react";
import { type ComponentType, type ReactNode, useMemo, useState } from "react";
import { Badge } from "src/components/reui/badge";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "src/components/ui/popover";
import { Separator } from "src/components/ui/separator";
import { cn } from "src/lib/utils";

interface DataGridColumnFilterProps<TData, TValue> {
	column?: Column<TData, TValue>;
	title?: string;
	options: {
		label: string;
		value: string;
		icon?: ComponentType<{ className?: string }>;
	}[];
}

function getSelectedOptionBadges(
	options: DataGridColumnFilterProps<unknown, unknown>["options"],
	selectedValues: Set<string>,
): ReactNode[] {
	const badges: ReactNode[] = [];

	for (const option of options) {
		if (!selectedValues.has(option.value)) {
			continue;
		}

		badges.push(
			<Badge
				variant="secondary"
				key={option.value}
				className="rounded-sm px-1 font-normal"
			>
				{option.label}
			</Badge>,
		);
	}

	return badges;
}

function getNextFilterValue(selectedValues: Set<string>, value: string) {
	const nextSelectedValues = new Set(selectedValues);

	if (nextSelectedValues.has(value)) {
		nextSelectedValues.delete(value);
	} else {
		nextSelectedValues.add(value);
	}

	const filterValues = Array.from(nextSelectedValues);

	return filterValues.length ? filterValues : undefined;
}

function DataGridColumnFilter<TData, TValue>({
	column,
	title,
	options,
}: DataGridColumnFilterProps<TData, TValue>) {
	const facets = column?.getFacetedUniqueValues();
	const selectedValues = new Set(
		column?.getFilterValue() as string[] | undefined,
	);
	const [searchQuery, setSearchQuery] = useState("");

	const filteredOptions = useMemo(() => {
		if (!searchQuery) return options;

		return options.filter((option) =>
			option.label.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [options, searchQuery]);

	const selectedOptionBadges = useMemo(
		() => getSelectedOptionBadges(options, selectedValues),
		[options, selectedValues],
	);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm">
					<CirclePlusIcon className="size-4" />
					{title}
					{selectedValues.size > 0 && (
						<>
							<Separator orientation="vertical" className="mx-2 h-4" />
							<Badge
								variant="secondary"
								className="rounded-sm px-1 font-normal lg:hidden"
							>
								{selectedValues.size}
							</Badge>
							<div className="hidden gap-x-1 lg:flex">
								{selectedValues.size > 2 ? (
									<Badge
										variant="secondary"
										className="rounded-sm px-1 font-normal"
									>
										{selectedValues.size} selected
									</Badge>
								) : (
									selectedOptionBadges
								)}
							</div>
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0" align="start">
				<div className="p-2">
					<Input
						placeholder={title}
						value={searchQuery}
						onChange={(event) => setSearchQuery(event.target.value)}
						className="h-8"
					/>
				</div>
				<div className="max-h-[300px] overflow-y-auto">
					{filteredOptions.length === 0 ? (
						<div className="text-muted-foreground py-6 text-center text-sm">
							No results found.
						</div>
					) : (
						<div className="p-1">
							{filteredOptions.map((option) => {
								const isSelected = selectedValues.has(option.value);

								return (
									<button
										type="button"
										key={option.value}
										onClick={() =>
											column?.setFilterValue(
												getNextFilterValue(selectedValues, option.value),
											)
										}
										className={cn(
											"relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none",
											"hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
										)}
									>
										<div
											className={cn(
												"border-primary me-2 flex h-4 w-4 items-center justify-center rounded-sm border",
												isSelected
													? "bg-primary text-primary-foreground"
													: "opacity-50 [&_svg]:invisible",
											)}
										>
											<CheckIcon className="size-4" />
										</div>
										{option.icon && (
											<option.icon className="text-muted-foreground mr-2 size-4" />
										)}
										<span>{option.label}</span>
										{facets?.get(option.value) && (
											<span className="ms-auto flex size-4 items-center justify-center font-mono text-xs">
												{facets.get(option.value)}
											</span>
										)}
									</button>
								);
							})}
						</div>
					)}
					{selectedValues.size > 0 && (
						<>
							<div className="bg-border -mx-1 my-1 h-px" />
							<div className="p-1">
								<button
									type="button"
									onClick={() => column?.setFilterValue(undefined)}
									className="hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center justify-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none"
								>
									Clear filters
								</button>
							</div>
						</>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}

export { DataGridColumnFilter, type DataGridColumnFilterProps };
