import { cva } from "class-variance-authority";
import { AlertCircleIcon } from "lucide-react";
import type React from "react";
import {
	createContext,
	useCallback,
	use,
	useEffect,
	useId,
	useMemo,
	useReducer,
	useRef,
	useState,
} from "react";
import { Button } from "src/components/ui/button";
import { ButtonGroup, ButtonGroupText } from "src/components/ui/button-group";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "src/components/ui/dropdown-menu";
import { Input } from "src/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
	InputGroupText,
} from "src/components/ui/input-group";
import { Kbd } from "src/components/ui/kbd";
import { ScrollArea } from "src/components/ui/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "src/components/ui/tooltip";
import { cn } from "src/lib/utils";
import { OutlineCheck, OutlineClose, OutlinePlus } from "../icons/icons";

export interface FilterI18nConfig {
	addFilter: string;
	searchFields: string;
	noFieldsFound: string;
	noResultsFound: string;
	select: string;
	true: string;
	false: string;
	min: string;
	max: string;
	to: string;
	typeAndPressEnter: string;
	selected: string;
	selectedCount: string;
	percent: string;
	defaultCurrency: string;
	defaultColor: string;
	addFilterTitle: string;

	operators: {
		is: string;
		isNot: string;
		isAnyOf: string;
		isNotAnyOf: string;
		includesAll: string;
		excludesAll: string;
		before: string;
		after: string;
		between: string;
		notBetween: string;
		contains: string;
		notContains: string;
		startsWith: string;
		endsWith: string;
		isExactly: string;
		equals: string;
		notEquals: string;
		greaterThan: string;
		lessThan: string;
		overlaps: string;
		includes: string;
		excludes: string;
		includesAllOf: string;
		includesAnyOf: string;
		empty: string;
		notEmpty: string;
	};

	placeholders: {
		enterField: (fieldType: string) => string;
		selectField: string;
		searchField: (fieldName: string) => string;
		enterKey: string;
		enterValue: string;
	};

	helpers: {
		formatOperator: (operator: string) => string;
	};

	validation: {
		invalidEmail: string;
		invalidUrl: string;
		invalidTel: string;
		invalid: string;
	};
}

export const DEFAULT_I18N: FilterI18nConfig = {
	addFilter: "Filter",
	searchFields: "Filter...",
	noFieldsFound: "No filters found.",
	noResultsFound: "No results found.",
	select: "Select...",
	true: "True",
	false: "False",
	min: "Min",
	max: "Max",
	to: "to",
	typeAndPressEnter: "Type and press Enter to add tag",
	selected: "selected",
	selectedCount: "selected",
	percent: "%",
	defaultCurrency: "$",
	defaultColor: "#000000",
	addFilterTitle: "Add filter",

	operators: {
		is: "is",
		isNot: "is not",
		isAnyOf: "is any of",
		isNotAnyOf: "is not any of",
		includesAll: "includes all",
		excludesAll: "excludes all",
		before: "before",
		after: "after",
		between: "between",
		notBetween: "not between",
		contains: "contains",
		notContains: "does not contain",
		startsWith: "starts with",
		endsWith: "ends with",
		isExactly: "is exactly",
		equals: "equals",
		notEquals: "not equals",
		greaterThan: "greater than",
		lessThan: "less than",
		overlaps: "overlaps",
		includes: "includes",
		excludes: "excludes",
		includesAllOf: "includes all of",
		includesAnyOf: "includes any of",
		empty: "is empty",
		notEmpty: "is not empty",
	},

	placeholders: {
		enterField: (fieldType: string) => `Enter ${fieldType}...`,
		selectField: "Select...",
		searchField: (fieldName: string) => `Search ${fieldName.toLowerCase()}...`,
		enterKey: "Enter key...",
		enterValue: "Enter value...",
	},

	helpers: {
		formatOperator: (operator: string) => operator.replace(/_/g, " "),
	},

	validation: {
		invalidEmail: "Invalid email format",
		invalidUrl: "Invalid URL format",
		invalidTel: "Invalid phone format",
		invalid: "Invalid input format",
	},
};

interface FilterContextValue {
	variant: "solid" | "default";
	size: "sm" | "default" | "lg";
	radius: "default" | "full";
	i18n: FilterI18nConfig;
	className?: string;
	showSearchInput?: boolean;
	trigger?: React.ReactNode;
	allowMultiple?: boolean;
}

const FilterContext = createContext<FilterContextValue>({
	variant: "default",
	size: "default",
	radius: "default",
	i18n: DEFAULT_I18N,
	className: undefined,
	showSearchInput: true,
	trigger: undefined,
	allowMultiple: true,
});

const useFilterContext = () => use(FilterContext);

const filtersContainerVariants = cva("flex flex-wrap items-center", {
	variants: {
		variant: {
			solid: "gap-2",
			default: "",
		},
		size: {
			sm: "gap-1.5",
			default: "gap-2.5",
			lg: "gap-3.5",
		},
	},
	defaultVariants: {
		variant: "default",
		size: "default",
	},
});

function scrollHighlightedItemIntoView(baseId: string, index: number) {
	if (index < 0) return;

	requestAnimationFrame(() => {
		document
			.getElementById(`${baseId}-item-${index}`)
			?.scrollIntoView({ block: "nearest" });
	});
}

function FilterInput<T = unknown>({
	field,
	onBlur,
	onKeyDown,
	className,
	...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
	className?: string;
	field?: FilterFieldConfig<T>;
}) {
	const context = useFilterContext();
	const [isValid, setIsValid] = useState(true);
	const [validationMessage, setValidationMessage] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const validateInput = (value: string, pattern?: string): boolean => {
		if (!pattern || !value) return true;
		const regex = new RegExp(pattern);
		return regex.test(value);
	};

	const validateFilterInputOnBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		const value = e.target.value;
		const pattern = field?.pattern || props.pattern;

		if (value && (pattern || field?.validation)) {
			let valid = true;
			let customMessage = "";

			if (field?.validation) {
				const result = field.validation(value);

				if (typeof result === "boolean") {
					valid = result;
				} else {
					valid = result.valid;
					customMessage = result.message || "";
				}
			} else if (pattern) {
				valid = validateInput(value, pattern);
			}

			setIsValid(valid);
			setValidationMessage(
				valid ? "" : customMessage || context.i18n.validation.invalid,
			);
		} else {
			setIsValid(true);
			setValidationMessage("");
		}

		onBlur?.(e);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (
			!isValid &&
			![
				"Tab",
				"Escape",
				"Enter",
				"ArrowUp",
				"ArrowDown",
				"ArrowLeft",
				"ArrowRight",
			].includes(e.key)
		) {
			setIsValid(true);
			setValidationMessage("");
		}

		onKeyDown?.(e);
	};

	return (
		<InputGroup
			className={cn(
				"w-36",
				context.size === "sm" && "h-7!",
				context.size === "default" && "h-8!",
				context.size === "lg" && "h-9!",
				className,
			)}
		>
			{field?.prefix && (
				<InputGroupAddon>
					<InputGroupText>{field.prefix}</InputGroupText>
				</InputGroupAddon>
			)}

			<InputGroupInput
				ref={inputRef}
				aria-invalid={!isValid}
				aria-describedby={
					!isValid && validationMessage
						? `${field?.key || "input"}-error`
						: undefined
				}
				onBlur={validateFilterInputOnBlur}
				onKeyDown={handleKeyDown}
				className={cn(
					context.size === "sm" && "h-7! text-xs",
					context.size === "default" && "h-8!",
					context.size === "lg" && "h-9!",
				)}
				{...props}
			/>

			{!isValid && validationMessage && (
				<InputGroupAddon align="inline-end">
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<InputGroupButton size="icon-xs">
									<AlertCircleIcon className="text-destructive size-3.5" />
								</InputGroupButton>
							</TooltipTrigger>
							<TooltipContent>
								<p className="text-sm">{validationMessage}</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</InputGroupAddon>
			)}

			{field?.suffix && (
				<InputGroupAddon align="inline-end">
					<InputGroupText>{field.suffix}</InputGroupText>
				</InputGroupAddon>
			)}
		</InputGroup>
	);
}

interface FilterRemoveButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	icon?: React.ReactNode;
}

function FilterRemoveButton({
	icon = <OutlineClose />,
	...props
}: FilterRemoveButtonProps) {
	const context = useFilterContext();

	return (
		<Button
			variant="outline"
			size={
				context.size === "sm"
					? "icon-sm"
					: context.size === "lg"
						? "icon-lg"
						: "icon"
			}
			{...props}
		>
			{icon}
		</Button>
	);
}

export interface FilterOption<T = unknown> {
	value: T;
	label: string;
	icon?: React.ReactNode;
	metadata?: Record<string, unknown>;
	className?: string;
}

export interface FilterOperator {
	value: string;
	label: string;
	supportsMultiple?: boolean;
}

export interface CustomRendererProps<T = unknown> {
	field: FilterFieldConfig<T>;
	values: T[];
	onChange: (values: T[]) => void;
	operator: string;
}

export interface FilterFieldGroup<T = unknown> {
	group?: string;
	fields: FilterFieldConfig<T>[];
}

export type FilterFieldsConfig<T = unknown> =
	| FilterFieldConfig<T>[]
	| FilterFieldGroup<T>[];

export interface FilterFieldConfig<T = unknown> {
	key?: string;
	label?: string;
	icon?: React.ReactNode;
	type?: "select" | "multiselect" | "text" | "custom" | "separator";
	group?: string;
	fields?: FilterFieldConfig<T>[];
	options?: FilterOption<T>[];
	operators?: FilterOperator[];
	customRenderer?: (props: CustomRendererProps<T>) => React.ReactNode;
	customValueRenderer?: (
		values: T[],
		options: FilterOption<T>[],
	) => React.ReactNode;
	placeholder?: string;
	searchable?: boolean;
	maxSelections?: number;
	min?: number;
	max?: number;
	step?: number;
	prefix?: string | React.ReactNode;
	suffix?: string | React.ReactNode;
	pattern?: string;
	validation?: (
		value: unknown,
	) => boolean | { valid: boolean; message?: string };
	allowCustomValues?: boolean;
	className?: string;
	menuPopupClassName?: string;
	groupLabel?: string;
	onLabel?: string;
	offLabel?: string;
	onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	defaultOperator?: string;
	value?: T[];
	onValueChange?: (values: T[]) => void;
}

const isFieldGroup = <T = unknown>(
	item: FilterFieldConfig<T> | FilterFieldGroup<T>,
): item is FilterFieldGroup<T> => {
	return "fields" in item && Array.isArray(item.fields);
};

const isGroupLevelField = <T = unknown>(
	field: FilterFieldConfig<T>,
): boolean => {
	return Boolean(field.group && field.fields);
};

const flattenFields = <T = unknown>(
	fields: FilterFieldsConfig<T>,
): FilterFieldConfig<T>[] => {
	return fields.reduce<FilterFieldConfig<T>[]>((acc, item) => {
		if (isFieldGroup(item)) {
			return [...acc, ...item.fields];
		}

		if (isGroupLevelField(item)) {
			return [...acc, ...item.fields!];
		}

		return [...acc, item];
	}, []);
};

const getFieldsMap = <T = unknown>(
	fields: FilterFieldsConfig<T>,
): Record<string, FilterFieldConfig<T>> => {
	const flatFields = flattenFields<T>(fields);

	return flatFields.reduce(
		(acc, field) => {
			if (field.key) {
				acc[field.key] = field;
			}

			return acc;
		},
		{} as Record<string, FilterFieldConfig<T>>,
	);
};

const createOperatorsFromI18n = (
	i18n: FilterI18nConfig,
): Record<string, FilterOperator[]> => ({
	select: [
		{ value: "is", label: i18n.operators.is },
		{ value: "is_not", label: i18n.operators.isNot },
		{ value: "empty", label: i18n.operators.empty },
		{ value: "not_empty", label: i18n.operators.notEmpty },
	],
	multiselect: [
		{ value: "is_any_of", label: i18n.operators.isAnyOf },
		{ value: "is_not_any_of", label: i18n.operators.isNotAnyOf },
		{ value: "includes_all", label: i18n.operators.includesAll },
		{ value: "excludes_all", label: i18n.operators.excludesAll },
		{ value: "empty", label: i18n.operators.empty },
		{ value: "not_empty", label: i18n.operators.notEmpty },
	],
	text: [
		{ value: "contains", label: i18n.operators.contains },
		{ value: "not_contains", label: i18n.operators.notContains },
		{ value: "starts_with", label: i18n.operators.startsWith },
		{ value: "ends_with", label: i18n.operators.endsWith },
		{ value: "is", label: i18n.operators.isExactly },
		{ value: "empty", label: i18n.operators.empty },
		{ value: "not_empty", label: i18n.operators.notEmpty },
	],
	custom: [
		{ value: "is", label: i18n.operators.is },
		{ value: "after", label: i18n.operators.after },
		{ value: "between", label: i18n.operators.between },
		{ value: "empty", label: i18n.operators.empty },
		{ value: "not_empty", label: i18n.operators.notEmpty },
	],
});

export const DEFAULT_OPERATORS: Record<string, FilterOperator[]> =
	createOperatorsFromI18n(DEFAULT_I18N);

const getOperatorsForField = <T = unknown>(
	field: FilterFieldConfig<T>,
	values: T[],
	i18n: FilterI18nConfig,
): FilterOperator[] => {
	if (field.operators) return field.operators;

	const operators = createOperatorsFromI18n(i18n);
	let fieldType = field.type || "select";

	if (fieldType === "select" && values.length > 1) {
		fieldType = "multiselect";
	}

	if (fieldType === "multiselect" || field.type === "multiselect") {
		return operators.multiselect;
	}

	return operators[fieldType] || operators.select;
};

interface FilterOperatorDropdownProps<T = unknown> {
	field: FilterFieldConfig<T>;
	operator: string;
	values: T[];
	onChange: (operator: string) => void;
}

function FilterOperatorDropdown<T = unknown>({
	field,
	operator,
	values,
	onChange,
}: FilterOperatorDropdownProps<T>) {
	const context = useFilterContext();
	const operators = getOperatorsForField(field, values, context.i18n);

	const operatorLabel =
		operators.find((op) => op.value === operator)?.label ||
		context.i18n.helpers.formatOperator(operator);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size={context.size}
					className="text-muted-foreground hover:text-foreground"
				>
					{operatorLabel}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="start" className="w-fit min-w-fit">
				{operators.map((op) => (
					<DropdownMenuItem
						key={op.value}
						onClick={() => onChange(op.value)}
						className="data-highlighted:bg-accent data-highlighted:text-accent-foreground flex items-center justify-between"
					>
						<span>{op.label}</span>
						<OutlineCheck
							className={cn(
								"text-primary ms-auto",
								op.value === operator ? "opacity-100" : "opacity-0",
							)}
						/>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

interface FilterValueSelectorProps<T = unknown> {
	field: FilterFieldConfig<T>;
	values: T[];
	onChange: (values: T[]) => void;
	operator: string;
}

interface SelectOptionsPopoverProps<T = unknown> {
	field: FilterFieldConfig<T>;
	values: T[];
	onChange: (values: T[]) => void;
	onClose?: () => void;
	inline?: boolean;
}

interface SelectOptionsModel<T = unknown> {
	allFilteredOptions: FilterOption<T>[];
	selectedOptions: FilterOption<T>[];
	filteredSelectedOptions: FilterOption<T>[];
	filteredUnselectedOptions: FilterOption<T>[];
	effectiveValues: T[];
	isMultiSelect: boolean;
	searchInput: string;
	highlightedIndex: number;
	baseId: string;
	inputRef: React.RefObject<HTMLInputElement | null>;
	setSearchInput: (value: string) => void;
	setHighlightedIndex: (index: number) => void;
	moveHighlight: (direction: 1 | -1) => void;
	toggleOption: (option: FilterOption<T>) => boolean;
}

function useSelectOptionsModel<T = unknown>({
	field,
	values,
	onChange,
	onClose,
}: SelectOptionsPopoverProps<T>): SelectOptionsModel<T> {
	const [searchInput, setSearchInput] = useState("");
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const baseId = useId();

	const effectiveValues = useMemo(
		() => (field.value !== undefined ? (field.value as T[]) : values) || [],
		[field.value, values],
	);

	const isMultiSelect =
		field.type === "multiselect" || effectiveValues.length > 1;

	const selectedOptions = useMemo(
		() =>
			field.options?.filter((option) =>
				effectiveValues.includes(option.value),
			) || [],
		[field.options, effectiveValues],
	);

	const filteredSelectedOptions = selectedOptions;

	const filteredUnselectedOptions = useMemo(
		() =>
			field.options?.filter((option) => {
				if (effectiveValues.includes(option.value)) {
					return false;
				}

				return option.label.toLowerCase().includes(searchInput.toLowerCase());
			}) || [],
		[field.options, effectiveValues, searchInput],
	);

	const allFilteredOptions = useMemo(
		() => [...filteredSelectedOptions, ...filteredUnselectedOptions],
		[filteredSelectedOptions, filteredUnselectedOptions],
	);

	const moveHighlight = useCallback(
		(direction: 1 | -1) => {
			if (allFilteredOptions.length === 0) return;

			const nextIndex =
				direction === 1
					? highlightedIndex < allFilteredOptions.length - 1
						? highlightedIndex + 1
						: 0
					: highlightedIndex > 0
						? highlightedIndex - 1
						: allFilteredOptions.length - 1;

			setHighlightedIndex(nextIndex);
			scrollHighlightedItemIntoView(baseId, nextIndex);
		},
		[allFilteredOptions.length, baseId, highlightedIndex],
	);

	const toggleOption = useCallback(
		(option: FilterOption<T>) => {
			const isSelected = effectiveValues.includes(option.value);

			const next = isSelected
				? (effectiveValues.filter((value) => value !== option.value) as T[])
				: isMultiSelect
					? ([...effectiveValues, option.value] as T[])
					: ([option.value] as T[]);

			if (
				!isSelected &&
				isMultiSelect &&
				field.maxSelections &&
				next.length > field.maxSelections
			) {
				return false;
			}

			if (field.onValueChange) {
				field.onValueChange(next);
			} else {
				onChange(next);
			}

			if (!isMultiSelect) {
				onClose?.();
			}

			return true;
		},
		[effectiveValues, field, isMultiSelect, onChange, onClose],
	);

	return {
		allFilteredOptions,
		selectedOptions,
		filteredSelectedOptions,
		filteredUnselectedOptions,
		effectiveValues,
		isMultiSelect,
		searchInput,
		highlightedIndex,
		baseId,
		inputRef,
		setSearchInput,
		setHighlightedIndex,
		moveHighlight,
		toggleOption,
	};
}

interface SelectOptionsSearchInputProps<T = unknown> {
	field: FilterFieldConfig<T>;
	model: SelectOptionsModel<T>;
	onClose: () => void;
}

function SelectOptionsSearchInput<T = unknown>({
	field,
	model,
	onClose,
}: SelectOptionsSearchInputProps<T>) {
	const context = useFilterContext();

	return (
		<Input
			ref={model.inputRef}
			role="combobox"
			aria-autocomplete="list"
			aria-expanded={true}
			aria-haspopup="listbox"
			aria-controls={`${model.baseId}-listbox`}
			aria-activedescendant={
				model.highlightedIndex >= 0
					? `${model.baseId}-item-${model.highlightedIndex}`
					: undefined
			}
			placeholder={context.i18n.placeholders.searchField(field.label || "")}
			className={cn(
				"border-input h-8 rounded-none border-0 bg-transparent! px-2 text-sm shadow-none",
				"focus-visible:border-border focus-visible:ring-0 focus-visible:ring-offset-0",
			)}
			value={model.searchInput}
			onChange={(event) => {
				model.setSearchInput(event.target.value);
				model.setHighlightedIndex(-1);
			}}
			onClick={(event) => event.stopPropagation()}
			onKeyDown={(event) => {
				if (event.key === "ArrowDown") {
					event.preventDefault();
					model.moveHighlight(1);
				} else if (event.key === "ArrowUp") {
					event.preventDefault();
					model.moveHighlight(-1);
				} else if (event.key === "ArrowLeft") {
					event.preventDefault();
					onClose();
				} else if (event.key === "Enter" && model.highlightedIndex >= 0) {
					event.preventDefault();

					const option = model.allFilteredOptions[model.highlightedIndex];

					if (option) {
						model.toggleOption(option);
					}
				}

				event.stopPropagation();
			}}
		/>
	);
}

interface SelectOptionsListProps<T = unknown> {
	field: FilterFieldConfig<T>;
	model: SelectOptionsModel<T>;
}

function SelectOptionsList<T = unknown>({
	field,
	model,
}: SelectOptionsListProps<T>) {
	const context = useFilterContext();
	const hasSelected = model.filteredSelectedOptions.length > 0;
	const hasUnselected = model.filteredUnselectedOptions.length > 0;

	return (
		<div className="relative flex max-h-full">
			<div
				className="flex max-h-[min(var(--radix-dropdown-menu-content-available-height),24rem)] w-full scroll-pt-2 scroll-pb-2 flex-col overscroll-contain"
				role="listbox"
				id={`${model.baseId}-listbox`}
			>
				<ScrollArea className="size-full min-h-0 **:data-[slot=scroll-area-scrollbar]:m-0 **:data-[slot=scroll-area-viewport]:h-full **:data-[slot=scroll-area-viewport]:overscroll-contain">
					{model.allFilteredOptions.length === 0 && (
						<div className="text-muted-foreground py-2 text-center text-sm">
							{context.i18n.noResultsFound}
						</div>
					)}

					{hasSelected && (
						<SelectOptionsGroup<T>
							field={field}
							model={model}
							options={model.filteredSelectedOptions}
							offset={0}
							selected={true}
						/>
					)}

					{hasSelected && hasUnselected && (
						<DropdownMenuSeparator className="mx-0" />
					)}

					{hasUnselected && (
						<SelectOptionsGroup<T>
							field={field}
							model={model}
							options={model.filteredUnselectedOptions}
							offset={model.filteredSelectedOptions.length}
							selected={false}
						/>
					)}
				</ScrollArea>
			</div>
		</div>
	);
}

interface SelectOptionsGroupProps<T = unknown> {
	field: FilterFieldConfig<T>;
	model: SelectOptionsModel<T>;
	options: FilterOption<T>[];
	offset: number;
	selected: boolean;
}

function SelectOptionsGroup<T = unknown>({
	field,
	model,
	options,
	offset,
	selected,
}: SelectOptionsGroupProps<T>) {
	return (
		<DropdownMenuGroup className="px-1">
			{options.map((option, index) => {
				const overallIndex = offset + index;
				const isHighlighted = model.highlightedIndex === overallIndex;
				const itemId = `${model.baseId}-item-${overallIndex}`;

				return (
					<DropdownMenuCheckboxItem
						key={String(option.value)}
						id={itemId}
						role="option"
						aria-selected={isHighlighted}
						data-highlighted={isHighlighted || undefined}
						onMouseEnter={() => model.setHighlightedIndex(overallIndex)}
						checked={selected}
						className={cn(
							"data-highlighted:bg-accent data-highlighted:text-accent-foreground",
							option.className,
						)}
						onSelect={(event) => {
							if (model.isMultiSelect) event.preventDefault();
						}}
						onCheckedChange={() => model.toggleOption(option)}
					>
						{option.icon && option.icon}
						<span className="truncate">{option.label}</span>
					</DropdownMenuCheckboxItem>
				);
			})}
		</DropdownMenuGroup>
	);
}

function SelectOptionsTriggerLabel<T = unknown>({
	field,
	model,
}: {
	field: FilterFieldConfig<T>;
	model: SelectOptionsModel<T>;
}) {
	const context = useFilterContext();

	if (field.customValueRenderer) {
		return field.customValueRenderer(
			model.effectiveValues,
			field.options || [],
		);
	}

	return (
		<>
			{model.selectedOptions.length > 0 && (
				<div className="flex items-center -gap-x-1.5">
					{model.selectedOptions.slice(0, 3).map((option) => (
						<div key={String(option.value)}>{option.icon}</div>
					))}
				</div>
			)}

			{model.selectedOptions.length === 1
				? model.selectedOptions[0].label
				: model.selectedOptions.length > 1
					? `${model.selectedOptions.length} ${context.i18n.selectedCount}`
					: context.i18n.select}
		</>
	);
}

function SelectOptionsContent<T = unknown>({
	field,
	model,
	onClose,
}: {
	field: FilterFieldConfig<T>;
	model: SelectOptionsModel<T>;
	onClose: () => void;
}) {
	return (
		<>
			{field.searchable !== false && (
				<>
					<SelectOptionsSearchInput<T>
						field={field}
						model={model}
						onClose={onClose}
					/>
					<DropdownMenuSeparator />
				</>
			)}

			<SelectOptionsList<T> field={field} model={model} />
		</>
	);
}

function SelectOptionsPopover<T = unknown>({
	field,
	values,
	onChange,
	onClose,
	inline = false,
}: SelectOptionsPopoverProps<T>) {
	const [open, setOpen] = useState(false);

	const closeValueSelector = useCallback(() => {
		setOpen(false);
		onClose?.();
	}, [onClose]);

	const model = useSelectOptionsModel<T>({
		field,
		values,
		onChange,
		onClose: closeValueSelector,
		inline,
	});

	const content = (
		<SelectOptionsContent<T>
			field={field}
			model={model}
			onClose={closeValueSelector}
		/>
	);

	const context = useFilterContext();

	if (inline) {
		return <div className="w-full">{content}</div>;
	}

	return (
		<DropdownMenu
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				model.setHighlightedIndex(-1);

				if (!nextOpen) {
					setTimeout(() => model.setSearchInput(""), 200);
				}
			}}
		>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size={context.size}>
					<div className="flex items-center gap-1.5">
						<SelectOptionsTriggerLabel<T> field={field} model={model} />
					</div>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="start"
				className={cn("w-[200px] px-0", field.className)}
			>
				{content}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function FilterValueSelector<T = unknown>({
	field,
	values,
	onChange,
	operator,
}: FilterValueSelectorProps<T>) {
	if (operator === "empty" || operator === "not_empty") {
		return null;
	}

	if (field.customRenderer) {
		return (
			<ButtonGroupText className="hover:bg-accent aria-expanded:bg-accent bg-background dark:bg-input/30 text-start whitespace-nowrap outline-hidden">
				{field.customRenderer({ field, values, onChange, operator })}
			</ButtonGroupText>
		);
	}

	if (field.type === "text") {
		return (
			<FilterInput
				type="text"
				value={(values[0] as string) || ""}
				onChange={(e) => onChange([e.target.value] as T[])}
				placeholder={field.placeholder}
				pattern={field.pattern}
				field={field}
				className={cn("w-36", field.className)}
			/>
		);
	}

	return (
		<SelectOptionsPopover<T>
			field={field}
			values={values}
			onChange={onChange}
		/>
	);
}

export interface Filter<T = unknown> {
	id: string;
	field: string;
	operator: string;
	values: T[];
}

export interface FilterGroup<T = unknown> {
	id: string;
	label?: string;
	filters: Filter<T>[];
	fields: FilterFieldConfig<T>[];
}

interface FiltersContentProps<T = unknown> {
	filters: Filter<T>[];
	fields: FilterFieldsConfig<T>;
	onChange: (filters: Filter<T>[]) => void;
}

export const FiltersContent = <T = unknown>({
	filters,
	fields,
	onChange,
}: FiltersContentProps<T>) => {
	const context = useFilterContext();
	const fieldsMap = useMemo(() => getFieldsMap<T>(fields), [fields]);
	const { updateFilter, removeFilter } = useFilterListActions<T>({
		filters,
		onChange,
	});

	return (
		<div
			className={cn(
				filtersContainerVariants({
					variant: context.variant,
					size: context.size,
				}),
				context.className,
			)}
		>
			<ActiveFilterChips<T>
				filters={filters}
				fieldsMap={fieldsMap}
				updateFilter={updateFilter}
				removeFilter={removeFilter}
			/>
		</div>
	);
};

interface FiltersProps<T = unknown> {
	filters: Filter<T>[];
	fields: FilterFieldsConfig<T>;
	onChange: (filters: Filter<T>[]) => void;
	className?: string;
	variant?: "solid" | "default";
	size?: "sm" | "default" | "lg";
	radius?: "default" | "full";
	i18n?: Partial<FilterI18nConfig>;
	showSearchInput?: boolean;
	trigger?: React.ReactNode;
	allowMultiple?: boolean;
	menuPopupClassName?: string;
	collapseAddButton?: boolean;
	enableShortcut?: boolean;
	shortcutKey?: string;
	shortcutLabel?: string;
}

interface FiltersMenuState {
	addFilterOpen: boolean;
	menuSearchInput: string;
	activeMenu: string;
	openSubMenu: string | null;
	highlightedIndex: number;
	sessionFilterIds: Record<string, string>;
}

type FiltersMenuAction =
	| {
			type: "setAddFilterOpen";
			open: boolean;
	  }
	| {
			type: "openAddFilter";
	  }
	| {
			type: "closeAddFilter";
	  }
	| {
			type: "setMenuSearchInput";
			value: string;
	  }
	| {
			type: "setActiveMenu";
			menu: string;
	  }
	| {
			type: "setOpenSubMenu";
			menu: string | null;
	  }
	| {
			type: "setHighlightedIndex";
			index: number;
	  }
	| {
			type: "moveRootHighlight";
			index: number;
	  }
	| {
			type: "resetMenuAfterAdd";
	  }
	| {
			type: "setSessionFilterId";
			fieldKey: string;
			filterId: string;
	  }
	| {
			type: "clearSessionFilterIds";
	  };

const INITIAL_FILTERS_MENU_STATE: FiltersMenuState = {
	addFilterOpen: false,
	menuSearchInput: "",
	activeMenu: "root",
	openSubMenu: null,
	highlightedIndex: -1,
	sessionFilterIds: {},
};

function filtersMenuReducer(
	state: FiltersMenuState,
	action: FiltersMenuAction,
): FiltersMenuState {
	switch (action.type) {
		case "setAddFilterOpen":
			return {
				...state,
				addFilterOpen: action.open,
				highlightedIndex: -1,
				menuSearchInput: action.open ? state.menuSearchInput : "",
				sessionFilterIds: action.open ? state.sessionFilterIds : {},
				activeMenu: action.open ? "root" : state.activeMenu,
			};

		case "openAddFilter":
			return {
				...state,
				addFilterOpen: true,
				highlightedIndex: -1,
				activeMenu: "root",
			};

		case "closeAddFilter":
			return {
				...state,
				addFilterOpen: false,
				menuSearchInput: "",
				highlightedIndex: -1,
				sessionFilterIds: {},
			};

		case "setMenuSearchInput":
			return {
				...state,
				menuSearchInput: action.value,
				highlightedIndex: -1,
			};

		case "setActiveMenu":
			return {
				...state,
				activeMenu: action.menu,
			};

		case "setOpenSubMenu":
			return {
				...state,
				openSubMenu: action.menu,
				activeMenu: action.menu ?? "root",
			};

		case "setHighlightedIndex":
		case "moveRootHighlight":
			return {
				...state,
				highlightedIndex: action.index,
			};

		case "resetMenuAfterAdd":
			return {
				...state,
				addFilterOpen: false,
				menuSearchInput: "",
				highlightedIndex: -1,
			};

		case "setSessionFilterId":
			return {
				...state,
				sessionFilterIds: {
					...state.sessionFilterIds,
					[action.fieldKey]: action.filterId,
				},
			};

		case "clearSessionFilterIds":
			return {
				...state,
				sessionFilterIds: {},
			};

		default:
			return state;
	}
}

function useRootHighlight<T = unknown>({
	filteredFields,
	highlightedIndex,
	rootId,
	dispatchMenu,
}: {
	filteredFields: FilterFieldConfig<T>[];
	highlightedIndex: number;
	rootId: string;
	dispatchMenu: React.Dispatch<FiltersMenuAction>;
}) {
	return useCallback(
		(direction: 1 | -1) => {
			if (filteredFields.length === 0) return;

			const nextIndex =
				direction === 1
					? highlightedIndex < filteredFields.length - 1
						? highlightedIndex + 1
						: 0
					: highlightedIndex > 0
						? highlightedIndex - 1
						: filteredFields.length - 1;

			dispatchMenu({ type: "moveRootHighlight", index: nextIndex });
			scrollHighlightedItemIntoView(rootId, nextIndex);
		},
		[dispatchMenu, filteredFields.length, highlightedIndex, rootId],
	);
}

interface FilterSubmenuContentProps<T = unknown> {
	field: FilterFieldConfig<T>;
	currentValues: T[];
	isMultiSelect: boolean;
	onToggle: (value: T, isSelected: boolean) => void;
	i18n: FilterI18nConfig;
	isActive?: boolean;
	onBack?: () => void;
	onClose?: () => void;
}

function useSubmenuOptions<T = unknown>({
	field,
	currentValues,
	isActive,
}: Pick<FilterSubmenuContentProps<T>, "field" | "currentValues" | "isActive">) {
	const [searchInput, setSearchInput] = useState("");
	const [highlightedIndex, setHighlightedIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const baseId = useId();

	const filteredOptions = useMemo(() => {
		return (
			field.options?.filter((option) => {
				const isSelected = currentValues.includes(option.value);

				if (isSelected) return true;
				if (!searchInput) return true;

				return option.label.toLowerCase().includes(searchInput.toLowerCase());
			}) || []
		);
	}, [field.options, searchInput, currentValues]);

	const moveHighlight = useCallback(
		(direction: 1 | -1) => {
			if (filteredOptions.length === 0) return;

			const nextIndex =
				direction === 1
					? highlightedIndex < filteredOptions.length - 1
						? highlightedIndex + 1
						: 0
					: highlightedIndex > 0
						? highlightedIndex - 1
						: filteredOptions.length - 1;

			setHighlightedIndex(nextIndex);
			scrollHighlightedItemIntoView(baseId, nextIndex);
		},
		[baseId, filteredOptions.length, highlightedIndex],
	);

	useEffect(() => {
		if (isActive && filteredOptions.length > 0) {
			setHighlightedIndex(0);
		}
	}, [isActive, filteredOptions.length]);

	return {
		searchInput,
		setSearchInput,
		highlightedIndex,
		setHighlightedIndex,
		filteredOptions,
		inputRef,
		baseId,
		moveHighlight,
	};
}

function FilterSubmenuContent<T = unknown>({
	field,
	currentValues,
	isMultiSelect,
	onToggle,
	i18n,
	isActive,
	onBack,
	onClose,
}: FilterSubmenuContentProps<T>) {
	const model = useSubmenuOptions<T>({ field, currentValues, isActive });

	const handleOptionToggle = useCallback(
		(option: FilterOption<T>) => {
			onToggle(option.value as T, currentValues.includes(option.value));

			if (!isMultiSelect) {
				onBack?.();
			}
		},
		[currentValues, isMultiSelect, onBack, onToggle],
	);

	return (
		<div className="flex flex-col">
			{field.searchable !== false && (
				<>
					<FilterSubmenuSearchInput<T>
						field={field}
						i18n={i18n}
						model={model}
						onBack={onBack}
						onClose={onClose}
						onSelectOption={handleOptionToggle}
					/>

					<DropdownMenuSeparator />
				</>
			)}

			<FilterSubmenuOptionsList<T>
				field={field}
				i18n={i18n}
				currentValues={currentValues}
				isMultiSelect={isMultiSelect}
				model={model}
				onBack={onBack}
				onClose={onClose}
				onSelectOption={handleOptionToggle}
			/>
		</div>
	);
}

interface SubmenuModel<T = unknown> {
	searchInput: string;
	setSearchInput: (value: string) => void;
	highlightedIndex: number;
	setHighlightedIndex: (index: number) => void;
	filteredOptions: FilterOption<T>[];
	inputRef: React.RefObject<HTMLInputElement | null>;
	baseId: string;
	moveHighlight: (direction: 1 | -1) => void;
}

function FilterSubmenuSearchInput<T = unknown>({
	field,
	i18n,
	model,
	onBack,
	onClose,
	onSelectOption,
}: {
	field: FilterFieldConfig<T>;
	i18n: FilterI18nConfig;
	model: SubmenuModel<T>;
	onBack?: () => void;
	onClose?: () => void;
	onSelectOption: (option: FilterOption<T>) => void;
}) {
	return (
		<Input
			ref={model.inputRef}
			role="combobox"
			aria-autocomplete="list"
			aria-expanded={true}
			aria-haspopup="listbox"
			aria-controls={`${model.baseId}-listbox`}
			aria-activedescendant={
				model.highlightedIndex >= 0
					? `${model.baseId}-item-${model.highlightedIndex}`
					: undefined
			}
			placeholder={i18n.placeholders.searchField(field.label || "")}
			className={cn(
				"h-8 rounded-none border-0 bg-transparent! px-2 text-sm shadow-none",
				"focus-visible:border-border focus-visible:ring-0 focus-visible:ring-offset-0",
			)}
			value={model.searchInput}
			onChange={(event) => {
				model.setSearchInput(event.target.value);
				model.setHighlightedIndex(-1);
			}}
			onClick={(event) => event.stopPropagation()}
			onKeyDown={(event) => {
				if (event.key === "ArrowDown") {
					event.preventDefault();
					model.moveHighlight(1);
				} else if (event.key === "ArrowUp") {
					event.preventDefault();
					model.moveHighlight(-1);
				} else if (event.key === "ArrowLeft") {
					event.preventDefault();
					onBack?.();
				} else if (event.key === "Enter" && model.highlightedIndex >= 0) {
					event.preventDefault();

					const option = model.filteredOptions[model.highlightedIndex];

					if (option) {
						onSelectOption(option);
					}
				} else if (event.key === "Escape") {
					event.preventDefault();
					onClose?.();
				}

				event.stopPropagation();
			}}
		/>
	);
}

function FilterSubmenuOptionsList<T = unknown>({
	field,
	i18n,
	currentValues,
	isMultiSelect,
	model,
	onBack,
	onClose,
	onSelectOption,
}: {
	field: FilterFieldConfig<T>;
	i18n: FilterI18nConfig;
	currentValues: T[];
	isMultiSelect: boolean;
	model: SubmenuModel<T>;
	onBack?: () => void;
	onClose?: () => void;
	onSelectOption: (option: FilterOption<T>) => void;
}) {
	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (field.searchable !== false) return;

		if (event.key === "ArrowDown") {
			event.preventDefault();
			model.moveHighlight(1);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			model.moveHighlight(-1);
		} else if (event.key === "ArrowLeft") {
			event.preventDefault();
			onBack?.();
		} else if (event.key === "Enter" && model.highlightedIndex >= 0) {
			event.preventDefault();

			const option = model.filteredOptions[model.highlightedIndex];

			if (option) {
				onSelectOption(option);
			}
		} else if (event.key === "Escape") {
			event.preventDefault();
			onClose?.();
		}

		event.stopPropagation();
	};

	return (
		<div className="relative flex max-h-full">
			<div
				className="flex max-h-[min(var(--radix-dropdown-menu-content-available-height),24rem)] w-full scroll-pt-2 scroll-pb-2 flex-col overscroll-contain outline-hidden"
				role="listbox"
				id={`${model.baseId}-listbox`}
				tabIndex={field.searchable === false ? 0 : -1}
				onKeyDown={handleKeyDown}
			>
				<ScrollArea className="size-full min-h-0 **:data-[slot=scroll-area-scrollbar]:m-0 **:data-[slot=scroll-area-viewport]:h-full **:data-[slot=scroll-area-viewport]:overscroll-contain">
					{model.filteredOptions.length === 0 ? (
						<div className="text-muted-foreground py-2 text-center text-sm">
							{i18n.noResultsFound}
						</div>
					) : (
						<DropdownMenuGroup>
							{model.filteredOptions.map((option, index) => (
								<FilterSubmenuOption<T>
									key={String(option.value)}
									option={option}
									index={index}
									baseId={model.baseId}
									isSelected={currentValues.includes(option.value)}
									isHighlighted={model.highlightedIndex === index}
									isMultiSelect={isMultiSelect}
									onHighlight={model.setHighlightedIndex}
									onSelectOption={onSelectOption}
								/>
							))}
						</DropdownMenuGroup>
					)}
				</ScrollArea>
			</div>
		</div>
	);
}

function FilterSubmenuOption<T = unknown>({
	option,
	index,
	baseId,
	isSelected,
	isHighlighted,
	isMultiSelect,
	onHighlight,
	onSelectOption,
}: {
	option: FilterOption<T>;
	index: number;
	baseId: string;
	isSelected: boolean;
	isHighlighted: boolean;
	isMultiSelect: boolean;
	onHighlight: (index: number) => void;
	onSelectOption: (option: FilterOption<T>) => void;
}) {
	return (
		<DropdownMenuCheckboxItem
			id={`${baseId}-item-${index}`}
			role="option"
			aria-selected={isHighlighted}
			data-highlighted={isHighlighted || undefined}
			onMouseEnter={() => onHighlight(index)}
			checked={isSelected}
			className={cn(
				"data-highlighted:bg-accent data-highlighted:text-accent-foreground",
				option.className,
			)}
			onSelect={(event) => {
				if (isMultiSelect) event.preventDefault();
			}}
			onCheckedChange={() => onSelectOption(option)}
		>
			{option.icon && option.icon}
			<span className="truncate">{option.label}</span>
		</DropdownMenuCheckboxItem>
	);
}

function useMergedI18n(i18n?: Partial<FilterI18nConfig>): FilterI18nConfig {
	return useMemo(
		() => ({
			...DEFAULT_I18N,
			...i18n,
			operators: { ...DEFAULT_I18N.operators, ...i18n?.operators },
			placeholders: { ...DEFAULT_I18N.placeholders, ...i18n?.placeholders },
			helpers: { ...DEFAULT_I18N.helpers, ...i18n?.helpers },
			validation: { ...DEFAULT_I18N.validation, ...i18n?.validation },
		}),
		[i18n],
	);
}

function useShortcutToOpenFilters({
	enabled,
	key,
	open,
	dispatchMenu,
}: {
	enabled: boolean;
	key: string;
	open: boolean;
	dispatchMenu: React.Dispatch<FiltersMenuAction>;
}) {
	useEffect(() => {
		if (!enabled) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (
				event.key.toLowerCase() === key.toLowerCase() &&
				!open &&
				!(document.activeElement instanceof HTMLInputElement) &&
				!(document.activeElement instanceof HTMLTextAreaElement)
			) {
				event.preventDefault();
				dispatchMenu({ type: "openAddFilter" });
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [dispatchMenu, enabled, key, open]);
}

function useSelectableFields<T = unknown>({
	fields,
	filters,
	allowMultiple,
	search,
}: {
	fields: FilterFieldsConfig<T>;
	filters: Filter<T>[];
	allowMultiple: boolean;
	search: string;
}) {
	const selectableFields = useMemo<FilterFieldConfig<T>[]>(() => {
		const flatFields = flattenFields<T>(fields);

		return flatFields.filter((field) => {
			if (!field.key || field.type === "separator") return false;
			if (allowMultiple) return true;

			return !filters.some((filter) => filter.field === field.key);
		});
	}, [fields, filters, allowMultiple]);

	const filteredFields = useMemo<FilterFieldConfig<T>[]>(() => {
		return selectableFields.filter(
			(field) =>
				!search || field.label?.toLowerCase().includes(search.toLowerCase()),
		);
	}, [selectableFields, search]);

	return { selectableFields, filteredFields };
}

function useFilterListActions<T = unknown>({
	filters,
	onChange,
}: {
	filters: Filter<T>[];
	onChange: (filters: Filter<T>[]) => void;
}) {
	const updateFilter = useCallback(
		(filterId: string, updates: Partial<Filter<T>>) => {
			onChange(
				filters.map((filter) => {
					if (filter.id === filterId) {
						const updatedFilter = { ...filter, ...updates };

						if (
							updates.operator === "empty" ||
							updates.operator === "not_empty"
						) {
							updatedFilter.values = [] as T[];
						}

						return updatedFilter;
					}

					return filter;
				}),
			);
		},
		[filters, onChange],
	);

	const removeFilter = useCallback(
		(filterId: string) => {
			onChange(filters.filter((filter) => filter.id !== filterId));
		},
		[filters, onChange],
	);

	return { updateFilter, removeFilter };
}

function useAddFilter<T = unknown>({
	fieldsMap,
	filters,
	onChange,
	dispatchMenu,
}: {
	fieldsMap: Record<string, FilterFieldConfig<T>>;
	filters: Filter<T>[];
	onChange: (filters: Filter<T>[]) => void;
	dispatchMenu: React.Dispatch<FiltersMenuAction>;
}) {
	return useCallback(
		(fieldKey: string) => {
			const field = fieldsMap[fieldKey];

			if (!field?.key) return;

			const defaultOperator =
				field.defaultOperator ||
				(field.type === "multiselect" ? "is_any_of" : "is");

			const defaultValues: unknown[] = field.type === "text" ? [""] : [];
			const newFilter = createFilter<T>(
				fieldKey,
				defaultOperator,
				defaultValues as T[],
			);

			onChange([...filters, newFilter]);
			dispatchMenu({ type: "resetMenuAfterAdd" });
		},
		[dispatchMenu, fieldsMap, filters, onChange],
	);
}

interface ActiveFilterChipsProps<T = unknown> {
	filters: Filter<T>[];
	fieldsMap: Record<string, FilterFieldConfig<T>>;
	updateFilter: (filterId: string, updates: Partial<Filter<T>>) => void;
	removeFilter: (filterId: string) => void;
}

function ActiveFilterChips<T = unknown>({
	filters,
	fieldsMap,
	updateFilter,
	removeFilter,
}: ActiveFilterChipsProps<T>) {
	return (
		<>
			{filters.map((filter) => {
				const field = fieldsMap[filter.field];

				if (!field) return null;

				return (
					<ActiveFilterChip<T>
						key={filter.id}
						filter={filter}
						field={field}
						updateFilter={updateFilter}
						removeFilter={removeFilter}
					/>
				);
			})}
		</>
	);
}

function ActiveFilterChip<T = unknown>({
	filter,
	field,
	updateFilter,
	removeFilter,
}: {
	filter: Filter<T>;
	field: FilterFieldConfig<T>;
	updateFilter: (filterId: string, updates: Partial<Filter<T>>) => void;
	removeFilter: (filterId: string) => void;
}) {
	return (
		<ButtonGroup>
			<ButtonGroupText className="bg-background dark:bg-input/30">
				{field.icon && field.icon}
				{field.label}
			</ButtonGroupText>

			<FilterOperatorDropdown<T>
				field={field}
				operator={filter.operator}
				values={filter.values}
				onChange={(operator) => updateFilter(filter.id, { operator })}
			/>

			<FilterValueSelector<T>
				field={field}
				values={filter.values}
				operator={filter.operator}
				onChange={(values) => updateFilter(filter.id, { values })}
			/>

			<FilterRemoveButton onClick={() => removeFilter(filter.id)} />
		</ButtonGroup>
	);
}

interface AddFilterDropdownProps<T = unknown> {
	filters: Filter<T>[];
	filteredFields: FilterFieldConfig<T>[];
	selectableFields: FilterFieldConfig<T>[];
	menuState: FiltersMenuState;
	dispatchMenu: React.Dispatch<FiltersMenuAction>;
	onChange: (filters: Filter<T>[]) => void;
	addFilter: (fieldKey: string) => void;
	menuPopupClassName?: string;
	enableShortcut: boolean;
	shortcutLabel: string;
}

function AddFilterDropdown<T = unknown>({
	filters,
	filteredFields,
	selectableFields,
	menuState,
	dispatchMenu,
	onChange,
	addFilter,
	menuPopupClassName,
	enableShortcut,
	shortcutLabel,
}: AddFilterDropdownProps<T>) {
	const context = useFilterContext();
	const rootInputRef = useRef<HTMLInputElement>(null);
	const rootId = useId();

	const moveRootHighlight = useRootHighlight<T>({
		filteredFields,
		highlightedIndex: menuState.highlightedIndex,
		rootId,
		dispatchMenu,
	});

	useEffect(() => {
		if (menuState.addFilterOpen && filteredFields.length > 0) {
			dispatchMenu({ type: "setHighlightedIndex", index: 0 });
		}
	}, [dispatchMenu, filteredFields.length, menuState.addFilterOpen]);

	if (selectableFields.length === 0) {
		return null;
	}

	return (
		<DropdownMenu
			open={menuState.addFilterOpen}
			onOpenChange={(open) => {
				dispatchMenu({ type: "setAddFilterOpen", open });
			}}
		>
			<DropdownMenuTrigger asChild>
				{context.trigger || (
					<Button variant="outline">
						<OutlinePlus />
						{context.i18n.addFilter}
					</Button>
				)}
			</DropdownMenuTrigger>

			<DropdownMenuContent
				className={cn("w-[220px]", menuPopupClassName)}
				align="start"
			>
				{context.showSearchInput && (
					<AddFilterSearch
						filteredFields={filteredFields}
						menuState={menuState}
						dispatchMenu={dispatchMenu}
						rootId={rootId}
						rootInputRef={rootInputRef}
						moveRootHighlight={moveRootHighlight}
						addFilter={addFilter}
						enableShortcut={enableShortcut}
						shortcutLabel={shortcutLabel}
					/>
				)}

				<AddFilterFieldList<T>
					filters={filters}
					filteredFields={filteredFields}
					menuState={menuState}
					dispatchMenu={dispatchMenu}
					onChange={onChange}
					addFilter={addFilter}
					rootId={rootId}
				/>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function AddFilterSearch<T = unknown>({
	filteredFields,
	menuState,
	dispatchMenu,
	rootId,
	rootInputRef,
	moveRootHighlight,
	addFilter,
	enableShortcut,
	shortcutLabel,
}: {
	filteredFields: FilterFieldConfig<T>[];
	menuState: FiltersMenuState;
	dispatchMenu: React.Dispatch<FiltersMenuAction>;
	rootId: string;
	rootInputRef: React.RefObject<HTMLInputElement | null>;
	moveRootHighlight: (direction: 1 | -1) => void;
	addFilter: (fieldKey: string) => void;
	enableShortcut: boolean;
	shortcutLabel: string;
}) {
	const context = useFilterContext();

	return (
		<>
			<div className="relative">
				<Input
					ref={rootInputRef}
					role="combobox"
					aria-expanded={true}
					aria-haspopup="listbox"
					aria-controls={`${rootId}-listbox`}
					aria-activedescendant={
						menuState.highlightedIndex >= 0
							? `${rootId}-item-${menuState.highlightedIndex}`
							: undefined
					}
					placeholder={context.i18n.searchFields}
					className={cn(
						"h-8 rounded-none border-0 bg-transparent! px-2 text-sm shadow-none",
						"focus-visible:border-border focus-visible:ring-0 focus-visible:ring-offset-0",
					)}
					value={menuState.menuSearchInput}
					onChange={(event) => {
						dispatchMenu({
							type: "setMenuSearchInput",
							value: event.target.value,
						});
					}}
					onClick={(event) => event.stopPropagation()}
					onKeyDown={(event) => {
						handleAddFilterSearchKeyDown<T>({
							event,
							filteredFields,
							highlightedIndex: menuState.highlightedIndex,
							openSubMenu: menuState.openSubMenu,
							dispatchMenu,
							moveRootHighlight,
							addFilter,
						});
					}}
				/>

				{enableShortcut && shortcutLabel && (
					<Kbd className="bg-background absolute top-1/2 right-2 -translate-y-1/2 border">
						{shortcutLabel}
					</Kbd>
				)}
			</div>

			<DropdownMenuSeparator />
		</>
	);
}

function handleAddFilterSearchKeyDown<T = unknown>({
	event,
	filteredFields,
	highlightedIndex,
	openSubMenu,
	dispatchMenu,
	moveRootHighlight,
	addFilter,
}: {
	event: React.KeyboardEvent<HTMLInputElement>;
	filteredFields: FilterFieldConfig<T>[];
	highlightedIndex: number;
	openSubMenu: string | null;
	dispatchMenu: React.Dispatch<FiltersMenuAction>;
	moveRootHighlight: (direction: 1 | -1) => void;
	addFilter: (fieldKey: string) => void;
}) {
	if (event.key === "ArrowDown") {
		event.preventDefault();
		moveRootHighlight(1);
	} else if (event.key === "ArrowUp") {
		event.preventDefault();
		moveRootHighlight(-1);
	} else if (
		(event.key === "ArrowRight" || event.key === "ArrowLeft") &&
		highlightedIndex >= 0
	) {
		handleAddFilterHorizontalKey<T>({
			event,
			filteredFields,
			highlightedIndex,
			openSubMenu,
			dispatchMenu,
		});
	} else if (event.key === "Enter" && highlightedIndex >= 0) {
		event.preventDefault();

		const field = filteredFields[highlightedIndex];

		if (field?.key) {
			const hasSubMenu = hasFieldSubMenu(field);

			if (!hasSubMenu) {
				addFilter(field.key);
			} else if (openSubMenu === field.key) {
				dispatchMenu({ type: "setOpenSubMenu", menu: null });
			} else {
				dispatchMenu({ type: "setOpenSubMenu", menu: field.key });
			}
		}
	} else if (event.key === "Escape") {
		dispatchMenu({ type: "closeAddFilter" });
	}

	event.stopPropagation();
}

function handleAddFilterHorizontalKey<T = unknown>({
	event,
	filteredFields,
	highlightedIndex,
	openSubMenu,
	dispatchMenu,
}: {
	event: React.KeyboardEvent<HTMLInputElement>;
	filteredFields: FilterFieldConfig<T>[];
	highlightedIndex: number;
	openSubMenu: string | null;
	dispatchMenu: React.Dispatch<FiltersMenuAction>;
}) {
	const field = filteredFields[highlightedIndex];
	const hasSubMenu = field && hasFieldSubMenu(field);

	if (event.key === "ArrowRight" && hasSubMenu) {
		event.preventDefault();
		dispatchMenu({ type: "setOpenSubMenu", menu: field.key || null });
	} else if (event.key === "ArrowLeft") {
		event.preventDefault();

		if (openSubMenu) {
			dispatchMenu({ type: "setOpenSubMenu", menu: null });
		}
	}
}

function hasFieldSubMenu<T = unknown>(field: FilterFieldConfig<T>) {
	return (
		(field.type === "select" || field.type === "multiselect") &&
		Boolean(field.options?.length)
	);
}

function AddFilterFieldList<T = unknown>({
	filters,
	filteredFields,
	menuState,
	dispatchMenu,
	onChange,
	addFilter,
	rootId,
}: {
	filters: Filter<T>[];
	filteredFields: FilterFieldConfig<T>[];
	menuState: FiltersMenuState;
	dispatchMenu: React.Dispatch<FiltersMenuAction>;
	onChange: (filters: Filter<T>[]) => void;
	addFilter: (fieldKey: string) => void;
	rootId: string;
}) {
	const context = useFilterContext();

	return (
		<div className="relative flex max-h-full">
			<div
				className="flex max-h-[min(var(--radix-dropdown-menu-content-available-height),24rem)] w-full scroll-pt-2 scroll-pb-2 flex-col overscroll-contain"
				role="listbox"
				id={`${rootId}-listbox`}
			>
				<ScrollArea className="**:data-[slot=scroll-area-scrollbar]:m-0">
					{filteredFields.length === 0 ? (
						<div className="text-muted-foreground py-2 text-center text-sm">
							{context.i18n.noFieldsFound}
						</div>
					) : (
						filteredFields.map((field, index) => (
							<AddFilterFieldItem<T>
								key={field.key}
								field={field}
								index={index}
								filters={filters}
								isHighlighted={menuState.highlightedIndex === index}
								rootId={rootId}
								menuState={menuState}
								dispatchMenu={dispatchMenu}
								onChange={onChange}
								addFilter={addFilter}
							/>
						))
					)}
				</ScrollArea>
			</div>
		</div>
	);
}

function AddFilterFieldItem<T = unknown>({
	field,
	index,
	filters,
	isHighlighted,
	rootId,
	menuState,
	dispatchMenu,
	onChange,
	addFilter,
}: {
	field: FilterFieldConfig<T>;
	index: number;
	filters: Filter<T>[];
	isHighlighted: boolean;
	rootId: string;
	menuState: FiltersMenuState;
	dispatchMenu: React.Dispatch<FiltersMenuAction>;
	onChange: (filters: Filter<T>[]) => void;
	addFilter: (fieldKey: string) => void;
}) {
	if (hasFieldSubMenu(field)) {
		return (
			<AddFilterSubmenu<T>
				field={field}
				index={index}
				filters={filters}
				isHighlighted={isHighlighted}
				rootId={rootId}
				menuState={menuState}
				dispatchMenu={dispatchMenu}
				onChange={onChange}
			/>
		);
	}

	return (
		<DropdownMenuItem
			id={`${rootId}-item-${index}`}
			role="option"
			aria-selected={isHighlighted}
			data-highlighted={isHighlighted || undefined}
			onMouseEnter={() =>
				dispatchMenu({
					type: "setHighlightedIndex",
					index,
				})
			}
			onClick={() => field.key && addFilter(field.key)}
			className="data-highlighted:bg-muted data-highlighted:text-muted-foreground"
		>
			{field.icon}
			<span>{field.label}</span>
		</DropdownMenuItem>
	);
}

function AddFilterSubmenu<T = unknown>({
	field,
	index,
	filters,
	isHighlighted,
	rootId,
	menuState,
	dispatchMenu,
	onChange,
}: {
	field: FilterFieldConfig<T>;
	index: number;
	filters: Filter<T>[];
	isHighlighted: boolean;
	rootId: string;
	menuState: FiltersMenuState;
	dispatchMenu: React.Dispatch<FiltersMenuAction>;
	onChange: (filters: Filter<T>[]) => void;
}) {
	const context = useFilterContext();
	const fieldKey = field.key as string;
	const isMultiSelect = field.type === "multiselect";
	const sessionFilterId = menuState.sessionFilterIds[fieldKey];

	const sessionFilter = sessionFilterId
		? filters.find((filter) => filter.id === sessionFilterId)
		: null;

	const currentValues = sessionFilter?.values || [];

	return (
		<DropdownMenuSub
			open={menuState.openSubMenu === fieldKey}
			onOpenChange={(open) => {
				if (open) {
					dispatchMenu({ type: "setOpenSubMenu", menu: fieldKey });
				} else if (menuState.openSubMenu === fieldKey) {
					dispatchMenu({ type: "setOpenSubMenu", menu: null });
				}
			}}
		>
			<DropdownMenuSubTrigger
				id={`${rootId}-item-${index}`}
				role="option"
				aria-selected={isHighlighted}
				data-highlighted={isHighlighted || undefined}
				onMouseEnter={() =>
					dispatchMenu({
						type: "setHighlightedIndex",
						index,
					})
				}
				className="data-[state=open]:bg-accent data-[state=open]:text-accent-foreground data-highlighted:bg-accent data-highlighted:text-accent-foreground"
			>
				{field.icon}
				<span>{field.label}</span>
			</DropdownMenuSubTrigger>

			<DropdownMenuSubContent
				className="w-[200px]"
				onMouseEnter={() => {
					if (field.searchable !== false) {
						dispatchMenu({ type: "setActiveMenu", menu: fieldKey });
					}
				}}
			>
				<FilterSubmenuContent<T>
					field={field}
					currentValues={currentValues}
					isMultiSelect={isMultiSelect}
					i18n={context.i18n}
					isActive={menuState.activeMenu === fieldKey}
					onBack={() => dispatchMenu({ type: "setOpenSubMenu", menu: null })}
					onClose={() => dispatchMenu({ type: "closeAddFilter" })}
					onToggle={(value, isSelected) =>
						handleSubmenuToggle<T>({
							value,
							isSelected,
							field,
							fieldKey,
							isMultiSelect,
							filters,
							currentValues,
							sessionFilter,
							onChange,
							dispatchMenu,
						})
					}
				/>
			</DropdownMenuSubContent>
		</DropdownMenuSub>
	);
}

function handleSubmenuToggle<T = unknown>({
	value,
	isSelected,
	field,
	fieldKey,
	isMultiSelect,
	filters,
	currentValues,
	sessionFilter,
	onChange,
	dispatchMenu,
}: {
	value: T;
	isSelected: boolean;
	field: FilterFieldConfig<T>;
	fieldKey: string;
	isMultiSelect: boolean;
	filters: Filter<T>[];
	currentValues: T[];
	sessionFilter: Filter<T> | null | undefined;
	onChange: (filters: Filter<T>[]) => void;
	dispatchMenu: React.Dispatch<FiltersMenuAction>;
}) {
	if (!isMultiSelect) {
		const newFilter = createFilter<T>(fieldKey, field.defaultOperator || "is", [
			value,
		] as T[]);

		onChange([...filters, newFilter]);
		dispatchMenu({ type: "closeAddFilter" });
		return;
	}

	const nextValues = isSelected
		? (currentValues.filter((currentValue) => currentValue !== value) as T[])
		: ([...currentValues, value] as T[]);

	if (sessionFilter) {
		if (nextValues.length === 0) {
			onChange(filters.filter((filter) => filter.id !== sessionFilter.id));

			dispatchMenu({
				type: "setSessionFilterId",
				fieldKey,
				filterId: "",
			});
		} else {
			onChange(
				filters.map((filter) =>
					filter.id === sessionFilter.id
						? {
								...filter,
								values: nextValues,
							}
						: filter,
				),
			);
		}

		return;
	}

	const newFilter = createFilter<T>(
		fieldKey,
		field.defaultOperator || "is_any_of",
		nextValues,
	);

	onChange([...filters, newFilter]);

	dispatchMenu({
		type: "setSessionFilterId",
		fieldKey,
		filterId: newFilter.id,
	});
}

export function Filters<T = unknown>({
	filters,
	fields,
	onChange,
	className,
	variant = "default",
	size = "default",
	radius = "default",
	i18n,
	showSearchInput = true,
	trigger,
	allowMultiple = true,
	menuPopupClassName,
	enableShortcut = false,
	shortcutKey = "f",
	shortcutLabel = "F",
}: FiltersProps<T>) {
	const [menuState, dispatchMenu] = useReducer(
		filtersMenuReducer,
		INITIAL_FILTERS_MENU_STATE,
	);

	const mergedI18n = useMergedI18n(i18n);
	const fieldsMap = useMemo(() => getFieldsMap<T>(fields), [fields]);
	const { selectableFields, filteredFields } = useSelectableFields<T>({
		fields,
		filters,
		allowMultiple,
		search: menuState.menuSearchInput,
	});
	const { updateFilter, removeFilter } = useFilterListActions<T>({
		filters,
		onChange,
	});
	const addFilter = useAddFilter<T>({
		fieldsMap,
		filters,
		onChange,
		dispatchMenu,
	});

	useShortcutToOpenFilters({
		enabled: enableShortcut,
		key: shortcutKey,
		open: menuState.addFilterOpen,
		dispatchMenu,
	});

	useEffect(() => {
		if (!menuState.addFilterOpen) {
			dispatchMenu({ type: "setOpenSubMenu", menu: null });
		}
	}, [menuState.addFilterOpen]);

	return (
		<FilterContext.Provider
			value={{
				variant,
				size,
				radius,
				i18n: mergedI18n,
				className,
				showSearchInput,
				trigger,
				allowMultiple,
			}}
		>
			<div
				className={cn(filtersContainerVariants({ variant, size }), className)}
			>
				<AddFilterDropdown<T>
					filters={filters}
					filteredFields={filteredFields}
					selectableFields={selectableFields}
					menuState={menuState}
					dispatchMenu={dispatchMenu}
					onChange={onChange}
					addFilter={addFilter}
					menuPopupClassName={menuPopupClassName}
					enableShortcut={enableShortcut}
					shortcutLabel={shortcutLabel}
				/>

				<ActiveFilterChips<T>
					filters={filters}
					fieldsMap={fieldsMap}
					updateFilter={updateFilter}
					removeFilter={removeFilter}
				/>
			</div>
		</FilterContext.Provider>
	);
}

export const createFilter = <T = unknown>(
	field: string,
	operator?: string,
	values: T[] = [],
): Filter<T> => ({
	id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
	field,
	operator: operator || "is",
	values,
});

export const createFilterGroup = <T = unknown>(
	id: string,
	label: string,
	fields: FilterFieldConfig<T>[],
	initialFilters: Filter<T>[] = [],
): FilterGroup<T> => ({
	id,
	label,
	filters: initialFilters,
	fields,
});
