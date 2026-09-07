import { format, isEqual } from "date-fns";
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";
import {
	cloneElement,
	isValidElement,
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import type { DateRange } from "react-day-picker";
import { Button } from "src/components/ui/button";
import { Calendar } from "src/components/ui/calendar";
import { Checkbox } from "src/components/ui/checkbox";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "src/components/ui/command";
import {
	InputGroup,
	InputGroupNumberInput,
} from "src/components/ui/input-group";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "src/components/ui/popover";
import { Slider } from "src/components/ui/slider";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "src/components/ui/tabs";
import { cn } from "src/lib/utils";
import { Badge } from "@/components/ui/badge";
import { numberFilterOperators } from "../core/operators";
import type {
	Column,
	ColumnDataType,
	ColumnOptionExtended,
	DataTableFilterActions,
	FilterModel,
	FilterStrategy,
} from "../core/types";
import { useDebounceCallback } from "../hooks/use-debounce-callback";
import { take } from "../lib/array";
import { createNumberRange } from "../lib/helpers";
import { type Locale, t } from "../lib/i18n";
import { DebouncedInput } from "../ui/debounced-input";

interface FilterValueProps<TData, TType extends ColumnDataType> {
	filter: FilterModel<TType>;
	column: Column<TData, TType>;
	actions: DataTableFilterActions;
	strategy: FilterStrategy;
	locale?: Locale;
}

export const FilterValue = memo(__FilterValue) as typeof __FilterValue;

function __FilterValue<TData, TType extends ColumnDataType>({
	filter,
	column,
	actions,
	strategy,
	locale,
}: FilterValueProps<TData, TType>) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="xl"
					className="whitespace-nowrap rounded-none text-xs hover:text-foreground"
				>
					<FilterValueDisplay
						filter={filter}
						column={column}
						actions={actions}
						locale={locale}
					/>
				</Button>
			</PopoverTrigger>

			<PopoverContent
				align="start"
				className={cn(
					"p-0 origin-(--radix-popover-content-transform-origin)",
					column.type === "date"
						? "w-auto min-w-[18rem] max-w-none overflow-visible"
						: "w-fit",
				)}
			>
				<FilterValueController
					filter={filter}
					column={column}
					actions={actions}
					strategy={strategy}
					locale={locale}
				/>
			</PopoverContent>
		</Popover>
	);
}

interface FilterValueDisplayProps<TData, TType extends ColumnDataType> {
	filter: FilterModel<TType>;
	column: Column<TData, TType>;
	actions: DataTableFilterActions;
	locale?: Locale;
}

export function FilterValueDisplay<TData, TType extends ColumnDataType>({
	filter,
	column,
	actions,
	locale = "en",
}: FilterValueDisplayProps<TData, TType>) {
	switch (column.type) {
		case "option":
			return (
				<FilterValueOptionDisplay
					filter={filter as FilterModel<"option">}
					column={column as Column<TData, "option">}
					actions={actions}
					locale={locale}
				/>
			);
		case "multiOption":
			return (
				<FilterValueMultiOptionDisplay
					filter={filter as FilterModel<"multiOption">}
					column={column as Column<TData, "multiOption">}
					actions={actions}
					locale={locale}
				/>
			);
		case "date":
			return (
				<FilterValueDateDisplay
					filter={filter as FilterModel<"date">}
					column={column as Column<TData, "date">}
					actions={actions}
					locale={locale}
				/>
			);
		case "text":
			return (
				<FilterValueTextDisplay
					filter={filter as FilterModel<"text">}
					column={column as Column<TData, "text">}
					actions={actions}
					locale={locale}
				/>
			);
		case "number":
			return (
				<FilterValueNumberDisplay
					filter={filter as FilterModel<"number">}
					column={column as Column<TData, "number">}
					actions={actions}
					locale={locale}
				/>
			);
		default:
			return null;
	}
}

export function FilterValueOptionDisplay<TData>({
	filter,
	column,
}: FilterValueDisplayProps<TData, "option">) {
	const options = useMemo(() => column.getOptions(), [column]);
	const selected = useMemo(
		() => options.filter((option) => filter?.values.includes(option.value)),
		[filter?.values, options],
	);

	if (selected.length === 1) {
		const { label, icon: Icon } = selected[0];
		const hasIcon = !!Icon;

		return (
			<span className="inline-flex items-center gap-1">
				{hasIcon &&
					(isValidElement(Icon) ? (
						Icon
					) : (
						<Icon className="size-4 text-primary" />
					))}
				<span>{label}</span>
			</span>
		);
	}

	const name = column.displayName.toLowerCase();
	const pluralName = name.endsWith("s") ? `${name}es` : `${name}s`;
	const hasOptionIcons = !options?.some((option) => !option.icon);

	return (
		<div className="inline-flex items-center gap-0.5">
			{hasOptionIcons &&
				take(selected, 3).map(({ value, icon }) => {
					const Icon = icon!;

					return isValidElement(Icon) ? (
						cloneElement(Icon, { key: value })
					) : (
						<Icon key={value} className="size-4" />
					);
				})}
			<span className={cn(hasOptionIcons && "ml-1.5")}>
				{selected.length} {pluralName}
			</span>
		</div>
	);
}

export function FilterValueMultiOptionDisplay<TData>({
	filter,
	column,
}: FilterValueDisplayProps<TData, "multiOption">) {
	const options = useMemo(() => column.getOptions(), [column]);
	const selected = useMemo(
		() => options.filter((option) => filter.values.includes(option.value)),
		[filter.values, options],
	);

	if (selected.length === 1) {
		const { label, icon: Icon } = selected[0];
		const hasIcon = !!Icon;

		return (
			<span className="inline-flex items-center gap-1.5">
				{hasIcon &&
					(isValidElement(Icon) ? (
						Icon
					) : (
						<Icon className="size-4 text-primary" />
					))}

				<span>{label}</span>
			</span>
		);
	}

	const name = column.displayName.toLowerCase();
	const hasOptionIcons = !options?.some((option) => !option.icon);

	return (
		<div className="inline-flex items-center gap-1.5">
			{hasOptionIcons && (
				<div key="icons" className="inline-flex items-center gap-0.5">
					{take(selected, 3).map(({ value, icon }) => {
						const Icon = icon!;

						return isValidElement(Icon) ? (
							cloneElement(Icon, { key: value })
						) : (
							<Icon key={value} className="size-4" />
						);
					})}
				</div>
			)}
			<span>
				{selected.length} {name}
			</span>
		</div>
	);
}

function formatDateRange(start: Date, end: Date) {
	const sameMonth = start.getMonth() === end.getMonth();
	const sameYear = start.getFullYear() === end.getFullYear();

	if (sameMonth && sameYear) {
		return `${format(start, "MMM d")} - ${format(end, "d, yyyy")}`;
	}

	if (sameYear) {
		return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
	}

	return `${format(start, "MMM d, yyyy")} - ${format(end, "MMM d, yyyy")}`;
}

export function FilterValueDateDisplay<TData>({
	filter,
}: FilterValueDisplayProps<TData, "date">) {
	if (!filter?.values) return null;
	if (filter.values.length === 0) return <Ellipsis className="size-4" />;

	if (filter.values.length === 1) {
		const value = filter.values[0];
		const formattedDateStr = format(value, "MMM d, yyyy");

		return <span>{formattedDateStr}</span>;
	}

	const formattedRangeStr = formatDateRange(filter.values[0], filter.values[1]);

	return <span>{formattedRangeStr}</span>;
}

export function FilterValueTextDisplay<TData>({
	filter,
}: FilterValueDisplayProps<TData, "text">) {
	if (!filter?.values) return null;
	if (filter.values.length === 0 || filter.values[0].trim() === "") {
		return <Ellipsis className="size-4" />;
	}

	const value = filter.values[0];

	return <span>{value}</span>;
}

export function FilterValueNumberDisplay<TData>({
	filter,
	locale = "en",
}: FilterValueDisplayProps<TData, "number">) {
	if (!filter?.values || filter.values.length === 0) return null;

	if (
		filter.operator === "is between" ||
		filter.operator === "is not between"
	) {
		const minValue = filter.values[0];
		const maxValue = filter.values[1];

		return (
			<span className="tabular-nums tracking-tight">
				{minValue} {t("and", locale)} {maxValue}
			</span>
		);
	}

	const value = filter.values[0];

	return <span className="tabular-nums tracking-tight">{value}</span>;
}

interface FilterValueControllerProps<TData, TType extends ColumnDataType> {
	filter: FilterModel<TType>;
	column: Column<TData, TType>;
	actions: DataTableFilterActions;
	strategy: FilterStrategy;
	locale?: Locale;
	backButtonMode?: "inside" | "floating";
}

export const FilterValueController = memo(
	__FilterValueController,
) as typeof __FilterValueController;

function __FilterValueController<TData, TType extends ColumnDataType>({
	filter,
	column,
	actions,
	strategy,
	locale = "en",
	backButtonMode = "inside",
	onBack,
}: FilterValueControllerProps<TData, TType> & { onBack?: () => void }) {
	switch (column.type) {
		case "option":
			return (
				<FilterValueOptionController
					filter={filter as FilterModel<"option">}
					column={column as Column<TData, "option">}
					actions={actions}
					strategy={strategy}
					locale={locale}
					backButtonMode={backButtonMode}
					onBack={onBack}
				/>
			);
		case "multiOption":
			return (
				<FilterValueMultiOptionController
					filter={filter as FilterModel<"multiOption">}
					column={column as Column<TData, "multiOption">}
					actions={actions}
					strategy={strategy}
					locale={locale}
					backButtonMode={backButtonMode}
					onBack={onBack}
				/>
			);
		case "date":
			return (
				<FilterValueDateController
					filter={filter as FilterModel<"date">}
					column={column as Column<TData, "date">}
					actions={actions}
					strategy={strategy}
					locale={locale}
					backButtonMode={backButtonMode}
					onBack={onBack}
				/>
			);
		case "text":
			return (
				<FilterValueTextController
					filter={filter as FilterModel<"text">}
					column={column as Column<TData, "text">}
					actions={actions}
					strategy={strategy}
					locale={locale}
					backButtonMode={backButtonMode}
					onBack={onBack}
				/>
			);
		case "number":
			return (
				<FilterValueNumberController
					filter={filter as FilterModel<"number">}
					column={column as Column<TData, "number">}
					actions={actions}
					strategy={strategy}
					locale={locale}
					backButtonMode={backButtonMode}
					onBack={onBack}
				/>
			);
		default:
			return null;
	}
}

type FilterOptionState = ColumnOptionExtended & {
	initialSelected: boolean;
	isFolder?: boolean;
	selectedChildrenCount?: number;
};

interface OptionItemProps {
	option: FilterOptionState;
	onToggle: (value: string, checked: boolean) => void;
	onFolderClick?: (id: string) => void;
}

const OptionItem = memo(function OptionItem({
	option,
	onToggle,
	onFolderClick,
}: OptionItemProps) {
	const {
		value,
		label,
		icon: Icon,
		selected,
		count,
		isFolder,
		id,
		selectedChildrenCount,
	} = option;

	const handleSelect = useCallback(() => {
		if (isFolder && onFolderClick && id) {
			onFolderClick(id);
			return;
		}

		onToggle(value, !selected);
	}, [id, isFolder, onFolderClick, onToggle, selected, value]);

	return (
		<CommandItem
			key={value || id}
			onSelect={handleSelect}
			className="group flex items-center justify-between gap-1.5 cursor-pointer"
		>
			<div className="flex items-center gap-1.5">
				{!isFolder && (
					<Checkbox
						checked={selected}
						className="opacity-0 border-primary/12 data-[state=checked]:opacity-100 group-data-[selected=true]:opacity-100 mr-1"
					/>
				)}
				{Icon &&
					(isValidElement(Icon) ? (
						Icon
					) : (
						<Icon className="size-4 text-primary" />
					))}
				<span>
					{label}
					<sup
						className={cn(
							count == null && "hidden",
							"ml-0.5 tabular-nums tracking-tight text-muted-foreground",
							count === 0 && "slashed-zero",
						)}
					>
						{typeof count === "number" ? (count < 100 ? count : "100+") : ""}
					</sup>
				</span>
			</div>
			<div className="flex items-center gap-1">
				{isFolder && !!selectedChildrenCount && selectedChildrenCount > 0 && (
					<span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 rounded-full">
						{selectedChildrenCount}
					</span>
				)}
				{isFolder && <ChevronRight className="size-4 text-muted-foreground" />}
			</div>
		</CommandItem>
	);
});

function getInitialOptions<TData, TType extends "option" | "multiOption">(
	column: Column<TData, TType>,
	filter: FilterModel<TType>,
): FilterOptionState[] {
	const counts = column.getFacetedUniqueValues();
	const selectedValues = filter?.values ?? [];

	return column.getOptions().map((option) => {
		const selected = selectedValues.includes(option.value);

		return {
			...option,
			selected,
			initialSelected: selected,
			count: counts?.get(option.value) ?? 0,
		};
	});
}

function getVisibleOptions(
	options: FilterOptionState[],
	activeFolder: string | null,
) {
	const folders: FilterOptionState[] = [];
	const visibleOptions: FilterOptionState[] = [];
	const foldersMap = new Map<string, FilterOptionState>();

	for (const option of options) {
		if (option.parentId) {
			if (!foldersMap.has(option.parentId)) {
				// Find the parent option to get its label instead of using the raw ID
				const parentOption = options.find((opt) => opt.id === option.parentId);

				const newFolder = {
					...option,
					id: option.parentId,
					label: parentOption ? parentOption.label : option.parentId,
					value: "",
					isFolder: true,
					// Base it off of the parent's selection state too
					selectedChildrenCount: parentOption?.selected ? 1 : 0,
					// Start count at the parent's own count (e.g. products directly in "Digital Art")
					count: parentOption?.count || 0,
				};
				foldersMap.set(option.parentId, newFolder);
				folders.push(newFolder);
			}

			const folder = foldersMap.get(option.parentId);
			if (folder) {
				// Accumulate the count of all children for the folder
				folder.count = (folder.count || 0) + (option.count || 0);

				if (option.selected) {
					folder.selectedChildrenCount =
						(folder.selectedChildrenCount || 0) + 1;
				}
			}

			if (activeFolder === option.parentId) {
				visibleOptions.push(option);
			}
		} else if (!activeFolder) {
			visibleOptions.push(option);
		}
	}

	// If we're inside a folder, we want to include the parent item itself at the top of the visible options list
	if (activeFolder) {
		const parentItem = options.find(
			(opt) => opt.id === activeFolder && !opt.parentId,
		);
		if (parentItem) {
			visibleOptions.unshift(parentItem);
		}
	}

	// Prevent duplicating top-level items that are also rendered as folders
	const dedupedVisibleOptions = visibleOptions.filter(
		(opt) => !(!activeFolder && !opt.parentId && foldersMap.has(opt.id)),
	);

	return {
		folders: activeFolder ? [] : folders,
		visibleOptions: dedupedVisibleOptions,
	};
}

function splitSelectedOptions(visibleOptions: FilterOptionState[]) {
	const selectedOptions: FilterOptionState[] = [];
	const unselectedOptions: FilterOptionState[] = [];

	for (const option of visibleOptions) {
		if (option.initialSelected) {
			selectedOptions.push(option);
		} else {
			unselectedOptions.push(option);
		}
	}

	return { selectedOptions, unselectedOptions };
}

function useFilterOptionsState<TData, TType extends "option" | "multiOption">(
	column: Column<TData, TType>,
	filter: FilterModel<TType>,
) {
	const initialOptions = useMemo(
		() => getInitialOptions(column, filter),
		[column, filter],
	);
	const [options, setOptions] = useState(initialOptions);

	const filterValuesStr = JSON.stringify(filter?.values);

	useEffect(() => {
		const selectedValues = filter?.values ?? [];

		setOptions((previous) => {
			let hasChanges = false;
			const next = previous.map((option) => {
				const isSelected = selectedValues.includes(option.value);
				if (
					option.selected !== isSelected ||
					option.initialSelected !== isSelected
				) {
					hasChanges = true;
					return {
						...option,
						initialSelected: isSelected,
						selected: isSelected,
					};
				}
				return option;
			});
			return hasChanges ? next : previous;
		});
	}, [filter?.values]);

	return options;
}

export function FloatingBackButton({ onClick }: { onClick: () => void }) {
	const [position, setPosition] = useState<"left" | "right">("left");
	const ref = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!ref.current) return;
		const timer = setTimeout(() => {
			if (!ref.current) return;
			const rect = ref.current.getBoundingClientRect();
			if (position === "left" && rect.left < 10) {
				setPosition("right");
			} else if (position === "right" && rect.right > window.innerWidth - 10) {
				setPosition("left");
			}
		}, 10);
		return () => clearTimeout(timer);
	}, [position]);

	return (
		<Button
			ref={ref}
			variant="outline"
			size="icon"
			className={cn(
				"absolute top-0 z-100 bg-popover",
				position === "left" ? "-left-10" : "-right-10",
			)}
			onClick={onClick}
		>
			<ChevronLeft className="size-4" />
		</Button>
	);
}

export function FilterValueOptionController<TData>({
	filter,
	column,
	actions,
	locale = "en",
	backButtonMode = "inside",
	onBack,
}: FilterValueControllerProps<TData, "option"> & { onBack?: () => void }) {
	const [activeFolder, setActiveFolder] = useState<string | null>(null);
	const options = useFilterOptionsState(column, filter);

	const handleToggle = useCallback(
		(value: string, checked: boolean) => {
			if (checked) actions.addFilterValue(column, [value]);
			else actions.removeFilterValue(column, [value]);
		},
		[actions, column],
	);

	const { folders, visibleOptions } = useMemo(
		() => getVisibleOptions(options, activeFolder),
		[activeFolder, options],
	);

	const { selectedOptions, unselectedOptions } = useMemo(
		() => splitSelectedOptions(visibleOptions),
		[visibleOptions],
	);

	const mainItems = unselectedOptions.filter((opt) => !opt.parentId);
	const subItems = unselectedOptions.filter((opt) => opt.parentId);

	return (
		<>
			{backButtonMode === "floating" && (activeFolder || onBack) && (
				<FloatingBackButton
					onClick={() => {
						if (activeFolder) setActiveFolder(null);
						else if (onBack) onBack();
					}}
				/>
			)}
			<Command loop>
				<CommandInput placeholder={t("search", locale)} />
				<CommandEmpty>{t("noresults", locale)}</CommandEmpty>
				<CommandList className="max-h-fit">
					{backButtonMode === "inside" && (activeFolder || onBack) && (
						<CommandGroup>
							<CommandItem
								onSelect={() => {
									if (activeFolder) setActiveFolder(null);
									else if (onBack) onBack();
								}}
								className="cursor-pointer text-muted-foreground font-medium"
							>
								<ChevronLeft className="size-4 mr-2" />
								{t("back", locale) || "Back"}
							</CommandItem>
						</CommandGroup>
					)}
					<CommandGroup className={cn(folders.length === 0 && "hidden")}>
						{folders.map((folder) => (
							<OptionItem
								key={`folder-${folder.id}`}
								option={folder}
								onToggle={handleToggle}
								onFolderClick={setActiveFolder}
							/>
						))}
					</CommandGroup>
					{folders.length > 0 && selectedOptions.length > 0 && (
						<CommandSeparator className="my-1" />
					)}
					<CommandGroup
						className={cn(selectedOptions.length === 0 && "hidden")}
					>
						{selectedOptions.map((option) => (
							<OptionItem
								key={option.value}
								option={option}
								onToggle={handleToggle}
							/>
						))}
					</CommandGroup>
					{selectedOptions.length > 0 && unselectedOptions.length > 0 && (
						<CommandSeparator className="my-1" />
					)}

					<CommandGroup
						heading={activeFolder ? "Category" : undefined}
						className={cn(mainItems.length === 0 && "hidden")}
					>
						{mainItems.map((option) => (
							<OptionItem
								key={option.value}
								option={option}
								onToggle={handleToggle}
							/>
						))}
					</CommandGroup>

					{mainItems.length > 0 && subItems.length > 0 && (
						<CommandSeparator className="my-1" />
					)}

					<CommandGroup
						heading={activeFolder ? "Subcategories" : undefined}
						className={cn(subItems.length === 0 && "hidden")}
					>
						{subItems.map((option) => (
							<OptionItem
								key={option.value}
								option={option}
								onToggle={handleToggle}
							/>
						))}
					</CommandGroup>
				</CommandList>
			</Command>
		</>
	);
}

export function FilterValueMultiOptionController<TData>({
	filter,
	column,
	actions,
	locale = "en",
	backButtonMode = "inside",
	onBack,
}: FilterValueControllerProps<TData, "multiOption"> & { onBack?: () => void }) {
	const [activeFolder, setActiveFolder] = useState<string | null>(null);
	const options = useFilterOptionsState(column, filter);

	const handleToggle = useCallback(
		(value: string, checked: boolean) => {
			if (checked) actions.addFilterValue(column, [value]);
			else actions.removeFilterValue(column, [value]);
		},
		[actions, column],
	);

	const { folders, visibleOptions } = useMemo(
		() => getVisibleOptions(options, activeFolder),
		[activeFolder, options],
	);

	const { selectedOptions, unselectedOptions } = useMemo(
		() => splitSelectedOptions(visibleOptions),
		[visibleOptions],
	);

	const mainItems = unselectedOptions.filter((opt) => !opt.parentId);
	const subItems = unselectedOptions.filter((opt) => opt.parentId);

	return (
		<>
			{backButtonMode === "floating" && (activeFolder || onBack) && (
				<FloatingBackButton
					onClick={() => {
						if (activeFolder) setActiveFolder(null);
						else if (onBack) onBack();
					}}
				/>
			)}
			<Command loop>
				<CommandInput placeholder={t("search", locale)} />
				<CommandEmpty>{t("noresults", locale)}</CommandEmpty>
				<CommandList className="max-h-[300px]">
					{backButtonMode === "inside" && (activeFolder || onBack) && (
						<CommandGroup>
							<CommandItem
								onSelect={() => {
									if (activeFolder) setActiveFolder(null);
									else if (onBack) onBack();
								}}
								className="cursor-pointer text-muted-foreground font-medium"
							>
								<ChevronLeft className="size-4 mr-2" />
								{t("back", locale) || "Back"}
							</CommandItem>
						</CommandGroup>
					)}
					<CommandGroup className={cn(folders.length === 0 && "hidden")}>
						{folders.map((folder) => (
							<OptionItem
								key={`folder-${folder.id}`}
								option={folder}
								onToggle={handleToggle}
								onFolderClick={setActiveFolder}
							/>
						))}
					</CommandGroup>
					{folders.length > 0 && selectedOptions.length > 0 && (
						<CommandSeparator className="my-1" />
					)}
					<CommandGroup
						className={cn(selectedOptions.length === 0 && "hidden")}
					>
						{selectedOptions.map((option) => (
							<OptionItem
								key={option.value}
								option={option}
								onToggle={handleToggle}
							/>
						))}
					</CommandGroup>
					{selectedOptions.length > 0 && unselectedOptions.length > 0 && (
						<CommandSeparator className="my-1" />
					)}

					<CommandGroup
						heading={activeFolder ? "Category" : undefined}
						className={cn(mainItems.length === 0 && "hidden")}
					>
						{mainItems.map((option) => (
							<OptionItem
								key={option.value}
								option={option}
								onToggle={handleToggle}
							/>
						))}
					</CommandGroup>

					{mainItems.length > 0 && subItems.length > 0 && (
						<CommandSeparator className="my-1" />
					)}

					<CommandGroup
						heading={activeFolder ? "Subcategories" : undefined}
						className={cn(subItems.length === 0 && "hidden")}
					>
						{subItems.map((option) => (
							<OptionItem
								key={option.value}
								option={option}
								onToggle={handleToggle}
							/>
						))}
					</CommandGroup>
				</CommandList>
			</Command>
		</>
	);
}

let currentDateSnapshot: Date | undefined;

function subscribeToCurrentDateStore() {
	return () => {};
}

function getClientCurrentDateSnapshot() {
	currentDateSnapshot ??= new Date();
	return currentDateSnapshot;
}

function getServerCurrentDateSnapshot() {
	return undefined;
}

function useClientCurrentDate() {
	return useSyncExternalStore(
		subscribeToCurrentDateStore,
		getClientCurrentDateSnapshot,
		getServerCurrentDateSnapshot,
	);
}

export function FilterValueDateController<TData>({
	filter,
	column,
	actions,
	backButtonMode = "inside",
	onBack,
}: FilterValueControllerProps<TData, "date"> & { onBack?: () => void }) {
	const clientCurrentDate = useClientCurrentDate();
	const [date, setDate] = useState<DateRange | undefined>({
		from: filter?.values[0] ?? undefined,
		to: filter?.values[1] ?? undefined,
	});

	const filterValuesStr = JSON.stringify(filter?.values);

	useEffect(() => {
		setDate((prev) => {
			const newFrom = filter?.values[0] ?? undefined;
			const newTo = filter?.values[1] ?? undefined;

			if (prev?.from === newFrom && prev?.to === newTo) {
				return prev;
			}

			return {
				from: newFrom,
				to: newTo,
			};
		});
	}, [filterValuesStr]);

	function changeDateRange(value: DateRange | undefined) {
		const start = value?.from;
		const end =
			start && value?.to && !isEqual(start, value.to) ? value.to : undefined;

		setDate({ from: start, to: end });

		const isRange = !!start && !!end;
		const newValues = isRange ? [start, end] : start ? [start] : [];

		actions.setFilterValue(column, newValues);
	}

	const defaultMonth = date?.from ?? clientCurrentDate;

	return (
		<>
			{backButtonMode === "floating" && onBack && (
				<FloatingBackButton onClick={onBack} />
			)}
			<div className="flex flex-col">
				{backButtonMode === "inside" && onBack && (
					<div className="p-2 pb-0 border-b">
						<Button
							variant="ghost"
							className="w-full justify-start text-muted-foreground h-8"
							onClick={onBack}
						>
							<ChevronLeft className="size-4 mr-2" />
							{t("back", "en") || "Back"}
						</Button>
					</div>
				)}
				<Calendar
					mode="range"
					{...(defaultMonth ? { defaultMonth } : {})}
					selected={date}
					onSelect={changeDateRange}
					numberOfMonths={2}
				/>
			</div>
		</>
	);
}

export function FilterValueTextController<TData>({
	filter,
	column,
	actions,
	locale = "en",
	backButtonMode = "inside",
	onBack,
}: FilterValueControllerProps<TData, "text"> & { onBack?: () => void }) {
	const changeText = (value: string | number) => {
		actions.setFilterValue(column, [String(value)]);
	};

	return (
		<>
			{backButtonMode === "floating" && onBack && (
				<FloatingBackButton onClick={onBack} />
			)}
			<Command>
				<CommandList className="max-h-fit">
					{backButtonMode === "inside" && onBack && (
						<CommandGroup>
							<CommandItem
								onSelect={onBack}
								className="cursor-pointer text-muted-foreground font-medium"
							>
								<ChevronLeft className="size-4 mr-2" />
								{t("back", locale) || "Back"}
							</CommandItem>
						</CommandGroup>
					)}
					<CommandGroup>
						<CommandItem>
							<DebouncedInput
								placeholder={t("search", locale)}
								value={filter?.values[0] ?? ""}
								onChange={changeText}
							/>
						</CommandItem>
					</CommandGroup>
				</CommandList>
			</Command>
		</>
	);
}

export function FilterValueNumberController<TData>({
	filter,
	column,
	actions,
	locale = "en",
	backButtonMode = "inside",
	onBack,
}: FilterValueControllerProps<TData, "number"> & { onBack?: () => void }) {
	const minMax = useMemo(() => column.getFacetedMinMaxValues(), [column]);

	const [values, setValues] = useState<number[]>(() => {
		const init = filter?.values ?? [0, 0];
		return [Number(init[0] ?? 0), Number(init[1] ?? init[0] ?? 0)];
	});

	const isInitialized = useRef(false);
	const boundsRef = useRef<[number, number]>([0, 0]);

	const [sliderMin, sliderMax] = useMemo(() => {
		let min = minMax && minMax[0] !== undefined ? Number(minMax[0]) : 0;
		let max = minMax && minMax[1] !== undefined ? Number(minMax[1]) : 0;

		if (isNaN(min)) min = 0;
		if (isNaN(max)) max = 0;

		min = Math.min(min, values[0]);
		max = Math.max(max, values[1] ?? values[0]);

		if (min === max) {
			max = min + 100;
		}

		if (!isInitialized.current) {
			boundsRef.current = [min, max];
			isInitialized.current = true;
		} else {
			boundsRef.current = [
				Math.min(boundsRef.current[0], min),
				Math.max(boundsRef.current[1], max),
			];
		}

		return boundsRef.current;
	}, [minMax, values]);

	// TODO: Add accessibility hold to add remove numbers / InputGroupNumberInput

	// const filterValuesStr = JSON.stringify(filter?.values);

	useEffect(() => {
		const filterValues = filter?.values;

		if (!filterValues) return;

		const numValues = [
			Number(filterValues[0] ?? 0),
			Number(filterValues[1] ?? filterValues[0] ?? 0),
		];

		setValues((prevValues) => {
			const sameValues =
				numValues.length === prevValues.length &&
				numValues.every((value, index) => value === prevValues[index]);

			if (!sameValues) {
				return numValues;
			}
			return prevValues;
		});
	}, [filter?.values]);

	const isNumberRange =
		filter && numberFilterOperators[filter.operator].target === "multiple";

	const setFilterOperatorDebounced = useDebounceCallback(
		actions.setFilterOperator,
		500,
	);
	const setFilterValueDebounced = useDebounceCallback(
		actions.setFilterValue,
		500,
	);

	const changeNumber = (value: number[]) => {
		setValues(value);
		setFilterValueDebounced(column as any, value);
	};

	const changeMinNumber = (value: number) => {
		const newValues = createNumberRange([value, values[1]]);
		setValues(newValues);
		setFilterValueDebounced(column as any, newValues);
	};

	const changeMaxNumber = (value: number) => {
		const newValues = createNumberRange([values[0], value]);
		setValues(newValues);
		setFilterValueDebounced(column as any, newValues);
	};

	const changeType = useCallback(
		(type: "single" | "range") => {
			let newValues: number[] = [];

			if (type === "single") {
				newValues = [values[0]];
			} else if (!minMax) {
				newValues = createNumberRange([values[0], values[1] ?? 0]);
			} else {
				const value = values[0];
				const min = Number(minMax[0] ?? 0);
				const max = Number(minMax[1] ?? 0);
				newValues =
					value - min < max - value
						? createNumberRange([value, max])
						: createNumberRange([min, value]);
			}

			const newOperator = type === "single" ? "is" : "is between";

			setValues(newValues);

			setFilterOperatorDebounced.cancel();
			setFilterValueDebounced.cancel();

			actions.setFilterOperator(column.id, newOperator);
			actions.setFilterValue(column, newValues);
		},
		[
			actions,
			column,
			minMax,
			setFilterOperatorDebounced,
			setFilterValueDebounced,
			values,
		],
	);

	return (
		<>
			{backButtonMode === "floating" && onBack && (
				<FloatingBackButton onClick={onBack} />
			)}
			<Command>
				<CommandList className="w-[300px] p-2">
					{backButtonMode === "inside" && onBack && (
						<CommandGroup>
							<CommandItem
								onSelect={onBack}
								className="cursor-pointer text-muted-foreground font-medium"
							>
								<ChevronLeft className="size-4 mr-2" />
								{t("back", locale) || "Back"}
							</CommandItem>
						</CommandGroup>
					)}
					<CommandGroup>
						<div className="flex flex-col w-full">
							<Tabs
								value={isNumberRange ? "range" : "single"}
								onValueChange={(value) =>
									changeType(value as "single" | "range")
								}
							>
								<TabsList className="w-full *:text-xs">
									<TabsTrigger value="single">
										{t("single", locale)}
									</TabsTrigger>
									<TabsTrigger value="range">{t("range", locale)}</TabsTrigger>
								</TabsList>
								<TabsContent
									value="single"
									className="flex flex-col gap-4 mt-4 px-2 pb-1"
								>
									<div className="px-1">
										<Slider
											value={[values[0]]}
											onValueChange={(value) => changeNumber(value)}
											min={sliderMin}
											max={sliderMax}
											step={1}
											aria-orientation="horizontal"
										/>
									</div>
									<div className="flex items-center gap-2">
										<span className="text-xs font-medium">
											{t("value", locale)}
										</span>
										<InputGroup>
											<InputGroupNumberInput
												id="single"
												value={values[0]}
												onValueChange={(value) => changeNumber([value ?? 0])}
											/>
										</InputGroup>
									</div>
								</TabsContent>
								<TabsContent
									value="range"
									className="flex flex-col gap-4 mt-4 px-2 pb-1"
								>
									<div className="px-1">
										<Slider
											value={values}
											onValueChange={changeNumber}
											min={sliderMin}
											max={sliderMax}
											step={1}
											aria-orientation="horizontal"
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div className="flex items-center gap-2">
											<span className="text-xs font-medium">
												{t("min", locale)}
											</span>
											<InputGroup>
												<InputGroupNumberInput
													value={values[0]}
													max={values[1]}
													onValueChange={(value) => changeMinNumber(value ?? 0)}
												/>
											</InputGroup>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-xs font-medium">
												{t("max", locale)}
											</span>
											<InputGroup>
												<InputGroupNumberInput
													value={values[1]}
													min={values[0]}
													onValueChange={(value) => changeMaxNumber(value ?? 0)}
												/>
											</InputGroup>
										</div>
									</div>
								</TabsContent>
							</Tabs>
						</div>
					</CommandGroup>
				</CommandList>
			</Command>
		</>
	);
}
