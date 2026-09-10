import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import {
	Fragment,
	useCallback,
	useEffect,
	useEffectEvent,
	useMemo,
	useRef,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import { NumericFormat, type NumericFormatProps } from "react-number-format";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { cn } from "src/lib/utils";
import { OutlineChevronDown, OutlineChevronUp } from "../icons/icons";

const inputGroupVariants = cva(
	"group/input-group relative flex w-full items-center border border-input outline-none transition-[color,box-shadow] bg-input",
	{
		variants: {
			variant: {
				default: "rounded-full",
				floating: "rounded-2xl",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface InputGroupProps
	extends React.ComponentProps<"div">,
		VariantProps<typeof inputGroupVariants> {}

function assignRef<T>(targetRef: React.Ref<T> | undefined, value: T | null) {
	if (!targetRef) return;

	if (typeof targetRef === "function") {
		targetRef(value);
		return;
	}

	(targetRef as React.MutableRefObject<T | null>).current = value;
}

function useMergedRef<T>(
	firstRef: React.Ref<T> | undefined,
	secondRef: React.Ref<T> | undefined,
) {
	return useCallback(
		(value: T | null) => {
			assignRef(firstRef, value);
			assignRef(secondRef, value);
		},
		[firstRef, secondRef],
	);
}

function InputGroup({ className, variant, ...props }: InputGroupProps) {
	return (
		<div
			data-slot="input-group"
			data-variant={variant || "default"}
			className={cn(
				inputGroupVariants({ variant }),
				"h-10 min-w-0 has-[>textarea]:h-auto peer",

				// Focus state.
				"has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-primary/40",
				"has-[button:focus-visible]:ring-3 has-[button:focus-visible]:ring-primary/40",

				// Error state.
				"aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
				"has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",

				className,
			)}
			{...props}
		/>
	);
}

const inputGroupAddonVariants = cva(
	"flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium text-muted-foreground select-none transition-colors [&>svg]:mt-0.5 [&>svg:not([class*='size-'])]:size-4 [&>kbd]:rounded-[calc(var(--radius)-5px)] group-data-[disabled=true]/input-group:opacity-50 group-has-[[data-slot=input-group-control][aria-invalid=true]]/input-group:text-destructive",
	{
		variants: {
			align: {
				"inline-start":
					"order-first pl-3 has-[>button]:ml-[-0.5rem] has-[>kbd]:ml-[-0.35rem]",
				"inline-end":
					"order-last pr-3 has-[>button]:mr-[-0.5rem] has-[>kbd]:mr-[-0.35rem]",
				"block-start":
					"order-first w-full justify-start px-3 pt-3 [.border-b]:pb-3 group-has-[>input]/input-group:pt-2.5",
				"block-end":
					"order-last w-full justify-start px-3 pb-3 [.border-t]:pt-3 group-has-[>input]/input-group:pb-2.5",
			},
		},
		defaultVariants: {
			align: "inline-start",
		},
	},
);

function InputGroupAddon({
	className,
	align = "inline-start",
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const focusGroupedInputOnAddonMouseDown = (event: MouseEvent) => {
			if ((event.target as HTMLElement).closest("button")) {
				return;
			}

			const input = element.parentElement?.querySelector(
				"input,textarea",
			) as HTMLElement | null;

			event.preventDefault();
			input?.focus();
		};

		element.addEventListener("mousedown", focusGroupedInputOnAddonMouseDown);

		return () => {
			element.removeEventListener(
				"mousedown",
				focusGroupedInputOnAddonMouseDown,
			);
		};
	}, []);

	return (
		<div
			ref={ref}
			data-slot="input-group-addon"
			data-align={align}
			className={cn(inputGroupAddonVariants({ align }), className)}
			{...props}
		/>
	);
}

const inputGroupButtonVariants = cva(
	"text-sm shadow-none flex gap-2 items-center rounded-full",
	{
		variants: {
			size: {
				xs: "h-7 gap-1 px-2 [&>svg:not([class*='size-'])]:size-3.5 has-[>svg]:px-2",
				sm: "h-8 px-2.5 gap-1.5 has-[>svg]:px-2.5",
				"icon-xs": "size-8 p-0 has-[>svg:first-child]:p-0",
				"icon-sm": "size-9 p-0 has-[>svg:first-child]:p-0",
			},
		},
		defaultVariants: {
			size: "xs",
		},
	},
);

function InputGroupButton({
	className,
	type = "button",
	variant = "ghost",
	size = "xs",
	...props
}: Omit<React.ComponentProps<typeof Button>, "size"> &
	VariantProps<typeof inputGroupButtonVariants>) {
	return (
		<Button
			type={type}
			data-size={size}
			variant={variant}
			className={cn(inputGroupButtonVariants({ size }), className)}
			{...props}
		/>
	);
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
	return (
		<span
			data-slot="input-group-text"
			className={cn(
				"text-muted-foreground pointer-events-none select-none text-xs",
				className,
			)}
			{...props}
		/>
	);
}

function InputGroupInput({
	className,
	...props
}: React.ComponentProps<"input">) {
	return (
		<Input
			data-slot="input-group-control"
			className={cn(
				"peer flex-1 rounded-none border-0 bg-transparent text-primary shadow-none transition-colors placeholder:text-muted-foreground focus-visible:ring-0 dark:bg-transparent",
				"group-has-[[data-slot=input-group-addon][data-align=inline-start]_[data-slot=input-group-text]]/input-group:pl-1",
				"aria-invalid:text-destructive aria-invalid:caret-destructive aria-invalid:placeholder:text-destructive/60",
				"group-data-[variant=floating]/input-group:h-10 group-data-[variant=floating]/input-group:pt-4 group-data-[variant=floating]/input-group:pb-1",
				"group-data-[variant=floating]/input-group:placeholder:text-transparent group-data-[variant=floating]/input-group:focus:placeholder:text-muted-foreground",
				"group-data-[variant=floating]/input-group:aria-invalid:focus:placeholder:text-destructive/60",
				className,
			)}
			{...props}
		/>
	);
}

import { Textarea } from "src/components/ui/textarea";

function InputGroupTextarea({
	className,
	...props
}: React.ComponentProps<typeof Textarea>) {
	return (
		<Textarea
			data-slot="input-group-control"
			className={cn(
				"flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent peer text-primary aria-invalid:text-destructive resize-none py-2",
				"group-has-[[data-slot=input-group-addon][data-align=inline-start]_[data-slot=input-group-text]]/input-group:pl-0",
				"group-data-[variant=floating]/input-group:pt-4 group-data-[variant=floating]/input-group:pb-1",
				"group-data-[variant=floating]/input-group:placeholder:text-transparent group-data-[variant=floating]/input-group:focus:placeholder:text-muted-foreground",
				"aria-invalid:text-destructive aria-invalid:caret-destructive aria-invalid:placeholder:text-destructive/60",
				className,
			)}
			{...props}
		/>
	);
}

export interface NumberInputProps
	extends Omit<
		NumericFormatProps,
		"value" | "onValueChange" | "defaultValue" | "min" | "max" | "getInputRef"
	> {
	ref?: React.Ref<HTMLInputElement>;
	stepper?: number;
	thousandSeparator?: string;
	placeholder?: string;
	defaultValue?: number;
	min?: number;
	max?: number;
	value?: number;
	suffix?: string;
	prefix?: string;
	onValueChange?: (value: number | undefined) => void;
	fixedDecimalScale?: boolean;
	decimalScale?: number;
}

function InputGroupNumberInput({
	ref,
	stepper,
	thousandSeparator,
	placeholder,
	defaultValue,
	min = -Infinity,
	max = Infinity,
	onValueChange,
	fixedDecimalScale = false,
	decimalScale = 0,
	suffix,
	prefix,
	value: controlledValue,
	...props
}: NumberInputProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const mergedInputRef = useMergedRef(inputRef, ref);

	const [value, setValue] = useState<number | undefined>(
		controlledValue ?? defaultValue,
	);

	// TODO: Add accessibility hold to add remove numbers / InputGroupNumberInput

	const handleIncrement = useCallback(() => {
		const currentValue =
			value === undefined || Number.isNaN(Number(value)) ? 0 : Number(value);
		const nextValue =
			value === undefined
				? (stepper ?? 1)
				: Math.min(currentValue + (stepper ?? 1), max);

		setValue(nextValue);
		onValueChange?.(nextValue);
	}, [value, stepper, max, onValueChange]);

	const handleDecrement = useCallback(() => {
		const currentValue =
			value === undefined || Number.isNaN(Number(value)) ? 0 : Number(value);
		const nextValue =
			value === undefined
				? -(stepper ?? 1)
				: Math.max(currentValue - (stepper ?? 1), min);

		setValue(nextValue);
		onValueChange?.(nextValue);
	}, [value, stepper, min, onValueChange]);

	const handleIncrementEvent = useEffectEvent(() => {
		handleIncrement();
	});

	const handleDecrementEvent = useEffectEvent(() => {
		handleDecrement();
	});

	useEffect(() => {
		const incrementOrDecrementFocusedNumberInput = (event: KeyboardEvent) => {
			if (document.activeElement !== inputRef.current) {
				return;
			}

			if (event.key === "ArrowUp") {
				event.preventDefault();
				handleIncrementEvent();
			} else if (event.key === "ArrowDown") {
				event.preventDefault();
				handleDecrementEvent();
			}
		};

		window.addEventListener("keydown", incrementOrDecrementFocusedNumberInput);

		return () => {
			window.removeEventListener(
				"keydown",
				incrementOrDecrementFocusedNumberInput,
			);
		};
	}, []);

	useEffect(() => {
		if (controlledValue !== undefined) {
			setValue(controlledValue);
		} else {
			setValue(defaultValue);
		}
	}, [controlledValue, defaultValue]);

	const updateNumberInputValue = (values: {
		value: string;
		floatValue: number | undefined;
	}) => {
		const nextValue =
			values.floatValue === undefined ? undefined : values.floatValue;

		setValue(nextValue);
		onValueChange?.(nextValue);
	};

	const notifyNumberInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
		props.onBlur?.(event);
	};

	return (
		<div className="flex w-full items-center">
			<NumericFormat
				value={value}
				onValueChange={updateNumberInputValue}
				thousandSeparator={thousandSeparator}
				decimalScale={decimalScale}
				fixedDecimalScale={fixedDecimalScale}
				allowNegative={min < 0}
				valueIsNumericString
				onBlur={notifyNumberInputBlur}
				max={max}
				min={min}
				suffix={suffix}
				prefix={prefix}
				customInput={InputGroupInput}
				placeholder={placeholder}
				className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-r-none relative text-primary"
				getInputRef={mergedInputRef}
				{...props}
			/>

			<div className="flex flex-col rounded-r-xl border-l border-primary/10">
				<Button
					type="button"
					size="icon-sm"
					aria-label="Increase value"
					className="h-5 rounded-none rounded-tr-xl border-0 border-b border-primary/10 pr-1 focus-visible:z-10"
					variant="ghost"
					onClick={handleIncrement}
					disabled={value !== undefined && value >= max}
				>
					<OutlineChevronUp />
				</Button>

				<Button
					type="button"
					size="icon-sm"
					aria-label="Decrease value"
					className="h-5 rounded-none rounded-br-xl border-0 pr-1 focus-visible:z-10"
					variant="ghost"
					onClick={handleDecrement}
					disabled={value !== undefined && value <= min}
				>
					<OutlineChevronDown />
				</Button>
			</div>
		</div>
	);
}

export interface DateInputProps
	extends Omit<
		React.ComponentProps<"fieldset">,
		"value" | "onChange" | "defaultValue" | "ref"
	> {
	ref?: React.Ref<HTMLFieldSetElement>;
	value?: Date;
	onValueChange?: (date: Date | undefined) => void;
	disabled?: boolean;
	minDate?: Date;
	maxDate?: Date;
}

type DatePart = "month" | "day" | "year";

type DateParts = {
	month: string;
	day: string;
	year: string;
};

type DateInputRefs = Record<DatePart, React.RefObject<HTMLInputElement | null>>;

type DateInputController = {
	dateParts: DateParts;
	focused: DatePart | null;
	refs: DateInputRefs;
	valuesRef: React.RefObject<DateParts>;
	focusSegment: (type: DatePart | null) => void;
	handleSegmentBlur: () => void;
	handleSegmentChange: (
		type: DatePart,
		event: React.ChangeEvent<HTMLInputElement>,
	) => void;
	handleSegmentFocus: (type: DatePart) => void;
	handleSegmentKeyDown: (
		type: DatePart,
		event: React.KeyboardEvent<HTMLInputElement>,
	) => void;
};

const emptyDateParts: DateParts = {
	month: "",
	day: "",
	year: "",
};

const FALLBACK_DATE_ORDER: DatePart[] = ["month", "day", "year"];

const DAY_FIRST_LANGUAGE_CODES = new Set([
	"ar",
	"bg",
	"cs",
	"da",
	"de",
	"el",
	"en-gb",
	"es",
	"et",
	"fi",
	"fr",
	"he",
	"hi",
	"hr",
	"hu",
	"id",
	"it",
	"lt",
	"lv",
	"ms",
	"nl",
	"no",
	"pl",
	"pt",
	"ro",
	"ru",
	"sk",
	"sl",
	"sv",
	"th",
	"tr",
	"uk",
	"vi",
]);

const YEAR_FIRST_LANGUAGE_CODES = new Set(["ja", "ko", "zh"]);

const DATE_SEGMENT_PLACEHOLDERS: Record<DatePart, string> = {
	month: "mm",
	day: "dd",
	year: "yyyy",
};

function getDateOrderForLanguage(language: string): DatePart[] {
	const normalizedLanguage = language.toLowerCase().replace("_", "-");
	const baseLanguage = normalizedLanguage.split("-")[0] ?? normalizedLanguage;

	if (
		YEAR_FIRST_LANGUAGE_CODES.has(normalizedLanguage) ||
		YEAR_FIRST_LANGUAGE_CODES.has(baseLanguage)
	) {
		return ["year", "month", "day"];
	}

	if (
		DAY_FIRST_LANGUAGE_CODES.has(normalizedLanguage) ||
		DAY_FIRST_LANGUAGE_CODES.has(baseLanguage)
	) {
		return ["day", "month", "year"];
	}

	return FALLBACK_DATE_ORDER;
}

function getDatePartsFromValue(value: Date | undefined): DateParts | undefined {
	if (value === undefined) {
		return undefined;
	}

	if (value && !Number.isNaN(value.getTime())) {
		return {
			month: String(value.getMonth() + 1).padStart(2, "0"),
			day: String(value.getDate()).padStart(2, "0"),
			year: String(value.getFullYear()),
		};
	}

	return emptyDateParts;
}

function createDateFromParts({ month, day, year }: DateParts) {
	if (month.length !== 2 || day.length !== 2 || year.length !== 4) {
		return undefined;
	}

	const date = new Date(Number(year), Number(month) - 1, Number(day));

	return Number.isNaN(date.getTime()) ? undefined : date;
}

function getNormalizedDateParts(date: Date): DateParts {
	return {
		month: String(date.getMonth() + 1).padStart(2, "0"),
		day: String(date.getDate()).padStart(2, "0"),
		year: String(date.getFullYear()),
	};
}

function isFullyReplacedSegment(
	event: React.ChangeEvent<HTMLInputElement>,
	maxLength: number,
) {
	return (
		event.target.selectionStart === 1 &&
		event.target.selectionEnd === 1 &&
		event.target.value.replace(/\D/g, "").length > maxLength
	);
}

function normalizeDateSegmentInput(
	type: DatePart,
	event: React.ChangeEvent<HTMLInputElement>,
) {
	let value = event.target.value.replace(/\D/g, "");

	if (type === "year") {
		if (isFullyReplacedSegment(event, 4)) {
			return value.slice(0, 1);
		}

		return value.length > 4 ? value.slice(-1) : value;
	}

	if (isFullyReplacedSegment(event, 2)) {
		value = value.slice(0, 1);
	} else if (value.length > 2) {
		value = value.slice(-1);
	}

	if (type === "month") {
		if (value.length === 1 && Number(value) > 1) return `0${value}`;
		if (value.length === 2 && Number(value) > 12) return "12";
		if (value.length === 2 && Number(value) < 1) return "01";

		return value;
	}

	if (value.length === 1 && Number(value) > 3) return `0${value}`;
	if (value.length === 2 && Number(value) > 31) return "31";
	if (value.length === 2 && Number(value) < 1) return "01";

	return value;
}

function getSegmentMaxLength(type: DatePart) {
	return type === "year" ? 4 : 2;
}

function isSegmentComplete(type: DatePart, value: string) {
	return value.length === getSegmentMaxLength(type);
}

function getNextSegment(
	dateOrder: DatePart[],
	current: DatePart,
): DatePart | null {
	const index = dateOrder.indexOf(current);

	return index < dateOrder.length - 1 ? dateOrder[index + 1] : null;
}

function getPrevSegment(
	dateOrder: DatePart[],
	current: DatePart,
): DatePart | null {
	const index = dateOrder.indexOf(current);

	return index > 0 ? dateOrder[index - 1] : null;
}

function isDateOutsideBounds(
	value: Date | undefined,
	minDate: Date | undefined,
	maxDate: Date | undefined,
) {
	if (!value) return false;

	const date = new Date(value);
	date.setHours(0, 0, 0, 0);

	if (minDate) {
		const min = new Date(minDate);
		min.setHours(0, 0, 0, 0);

		if (date < min) return true;
	}

	if (maxDate) {
		const max = new Date(maxDate);
		max.setHours(0, 0, 0, 0);

		if (date > max) return true;
	}

	return false;
}

function isDateAriaInvalid(ariaInvalid: React.AriaAttributes["aria-invalid"]) {
	return (
		ariaInvalid === true ||
		ariaInvalid === "true" ||
		ariaInvalid === "grammar" ||
		ariaInvalid === "spelling"
	);
}

function useDateInputRefs(): DateInputRefs {
	const month = useRef<HTMLInputElement>(null);
	const day = useRef<HTMLInputElement>(null);
	const year = useRef<HTMLInputElement>(null);

	return useMemo(
		() => ({
			month,
			day,
			year,
		}),
		[],
	);
}

function useDateInputController({
	value,
	onValueChange,
	dateOrder,
}: {
	value?: Date;
	onValueChange?: (date: Date | undefined) => void;
	dateOrder: DatePart[];
}): DateInputController {
	const refs = useDateInputRefs();
	const valuesRef = useRef<DateParts>(emptyDateParts);
	const [dateParts, setDateParts] = useState<DateParts>(emptyDateParts);
	const [focused, setFocused] = useState<DatePart | null>(null);

	const setDatePartsAndRefs = useCallback(
		(next: DateParts | ((previousDateParts: DateParts) => DateParts)) => {
			setDateParts((previousDateParts) => {
				const resolved =
					typeof next === "function" ? next(previousDateParts) : next;

				valuesRef.current = resolved;
				return resolved;
			});
		},
		[],
	);

	const emitDateChange = useCallback(
		(nextParts: DateParts) => {
			const date = createDateFromParts(nextParts);

			if (!date) {
				onValueChange?.(undefined);
				return;
			}

			const normalizedParts = getNormalizedDateParts(date);

			if (
				normalizedParts.month !== nextParts.month ||
				normalizedParts.day !== nextParts.day ||
				normalizedParts.year !== nextParts.year
			) {
				setDatePartsAndRefs(normalizedParts);
			}

			onValueChange?.(date);
		},
		[onValueChange, setDatePartsAndRefs],
	);

	const focusSegment = useCallback(
		(type: DatePart | null) => {
			if (!type) return;

			refs[type].current?.focus();
		},
		[refs],
	);

	useEffect(() => {
		const controlledParts = getDatePartsFromValue(value);

		if (!controlledParts) {
			// Don't reset internal state if value is explicitly set to undefined.
			// This prevents clearing all segments when only one segment is invalid/incomplete.
			return;
		}

		setDatePartsAndRefs(controlledParts);
	}, [setDatePartsAndRefs, value]);

	const handleSegmentChange = useCallback(
		(type: DatePart, event: React.ChangeEvent<HTMLInputElement>) => {
			const previousValue = valuesRef.current[type];
			const nextValue = normalizeDateSegmentInput(type, event);
			const nextParts = {
				...valuesRef.current,
				[type]: nextValue,
			};

			setDatePartsAndRefs(nextParts);
			emitDateChange(nextParts);

			if (isSegmentComplete(type, nextValue) && nextValue !== previousValue) {
				focusSegment(getNextSegment(dateOrder, type));
			}
		},
		[dateOrder, emitDateChange, focusSegment, setDatePartsAndRefs],
	);

	const clearSegment = useCallback(
		(type: DatePart) => {
			const nextParts = {
				...valuesRef.current,
				[type]: "",
			};

			setDatePartsAndRefs(nextParts);
			emitDateChange(nextParts);
		},
		[emitDateChange, setDatePartsAndRefs],
	);

	const handleSegmentKeyDown = useCallback(
		(type: DatePart, event: React.KeyboardEvent<HTMLInputElement>) => {
			if (event.key === "Backspace") {
				const isCaretAtStart =
					event.currentTarget.value === "" ||
					(event.currentTarget.selectionStart === 0 &&
						event.currentTarget.selectionEnd === 0);
				const isWholeSegmentSelected =
					event.currentTarget.selectionStart !==
						event.currentTarget.selectionEnd &&
					event.currentTarget.selectionStart === 0 &&
					event.currentTarget.selectionEnd === event.currentTarget.value.length;

				if (isCaretAtStart) {
					event.preventDefault();
					focusSegment(getPrevSegment(dateOrder, type));
					return;
				}

				if (isWholeSegmentSelected) {
					event.preventDefault();
					clearSegment(type);
				}

				return;
			}

			if (
				event.key === "ArrowRight" &&
				event.currentTarget.selectionStart === event.currentTarget.value.length
			) {
				focusSegment(getNextSegment(dateOrder, type));
				return;
			}

			if (
				event.key === "ArrowLeft" &&
				event.currentTarget.selectionStart === 0
			) {
				focusSegment(getPrevSegment(dateOrder, type));
			}
		},
		[clearSegment, dateOrder, focusSegment],
	);

	const handleSegmentFocus = useCallback((type: DatePart) => {
		setFocused(type);
	}, []);

	const handleSegmentBlur = useCallback(() => {
		setFocused(null);
	}, []);

	return {
		dateParts,
		focused,
		refs,
		valuesRef,
		focusSegment,
		handleSegmentBlur,
		handleSegmentChange,
		handleSegmentFocus,
		handleSegmentKeyDown,
	};
}

function useDateInputInvalidState({
	value,
	minDate,
	maxDate,
	ariaInvalid,
}: {
	value?: Date;
	minDate?: Date;
	maxDate?: Date;
	ariaInvalid: React.AriaAttributes["aria-invalid"];
}) {
	return useMemo(() => {
		if (isDateAriaInvalid(ariaInvalid)) {
			return true;
		}

		return isDateOutsideBounds(value, minDate, maxDate);
	}, [ariaInvalid, maxDate, minDate, value]);
}

function useDateInputMouseDown({
	dateOrder,
	valuesRef,
	focusSegment,
	onMouseDown,
}: {
	dateOrder: DatePart[];
	valuesRef: React.RefObject<DateParts>;
	focusSegment: (type: DatePart | null) => void;
	onMouseDown?: React.MouseEventHandler<HTMLFieldSetElement>;
}) {
	return useCallback(
		(event: React.MouseEvent<HTMLFieldSetElement>) => {
			onMouseDown?.(event);

			if (event.defaultPrevented) return;
			if ((event.target as HTMLElement).tagName === "INPUT") return;

			event.preventDefault();

			const values = valuesRef.current;

			for (const type of dateOrder) {
				if (!values[type]) {
					focusSegment(type);
					return;
				}
			}

			focusSegment(dateOrder[dateOrder.length - 1] ?? "year");
		},
		[dateOrder, focusSegment, onMouseDown, valuesRef],
	);
}

function DateSeparator({ isInvalid }: { isInvalid: boolean }) {
	return (
		<span
			className={cn(
				"select-none",
				isInvalid ? "text-destructive" : "text-muted-foreground/50",
			)}
		>
			/
		</span>
	);
}

interface DateSegmentProps {
	ref?: React.Ref<HTMLInputElement>;
	val: string;
	placeholder: string;
	focused: boolean;
	disabled?: boolean;
	"aria-invalid"?: boolean | "true" | "false";
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
	onFocus: () => void;
	onBlur: () => void;
}

function DateSegment({
	ref,
	val,
	placeholder,
	focused,
	disabled,
	"aria-invalid": ariaInvalid,
	onChange,
	onKeyDown,
	onFocus,
	onBlur,
}: DateSegmentProps) {
	return (
		<span
			className={cn(
				"relative inline-flex items-center justify-center rounded-sm px-0.75 py-px transition-colors select-none",
				focused ? "bg-primary/15" : "bg-transparent",
			)}
		>
			<span
				aria-hidden
				className="invisible select-none text-sm leading-normal"
				style={{ whiteSpace: "pre" }}
			>
				{val || placeholder}
			</span>

			<input
				ref={ref}
				data-slot="input-group-control"
				aria-invalid={ariaInvalid}
				type="text"
				inputMode="numeric"
				placeholder={placeholder}
				disabled={disabled}
				className="absolute inset-0 w-full bg-transparent p-0 text-center text-sm leading-normal outline-none caret-transparent placeholder:text-muted-foreground/70 focus-visible:ring-0 selection:bg-transparent selection:text-primary aria-invalid:text-destructive"
				value={val}
				onChange={onChange}
				onKeyDown={onKeyDown}
				onFocus={(event) => {
					setTimeout(() => event.target.select(), 0);
					onFocus();
				}}
				onBlur={onBlur}
			/>
		</span>
	);
}

function DateSegments({
	controller,
	dateOrder,
	disabled,
	isInvalid,
}: {
	controller: DateInputController;
	dateOrder: DatePart[];
	disabled?: boolean;
	isInvalid: boolean;
}) {
	return (
		<>
			{dateOrder.map((segmentType, index) => {
				const isLast = index === dateOrder.length - 1;

				return (
					<Fragment key={segmentType}>
						<DateSegment
							ref={controller.refs[segmentType]}
							val={controller.dateParts[segmentType]}
							placeholder={DATE_SEGMENT_PLACEHOLDERS[segmentType]}
							focused={controller.focused === segmentType}
							disabled={disabled}
							aria-invalid={isInvalid}
							onChange={(event) =>
								controller.handleSegmentChange(segmentType, event)
							}
							onKeyDown={(event) =>
								controller.handleSegmentKeyDown(segmentType, event)
							}
							onFocus={() => controller.handleSegmentFocus(segmentType)}
							onBlur={controller.handleSegmentBlur}
						/>

						{!isLast && <DateSeparator isInvalid={isInvalid} />}
					</Fragment>
				);
			})}
		</>
	);
}

function InputGroupDateInput({
	ref,
	className,
	value,
	onValueChange,
	disabled,
	minDate,
	maxDate,
	onMouseDown,
	...props
}: DateInputProps) {
	const { i18n } = useTranslation();
	const lang = i18n.language || "en";
	const dateOrder = useMemo(() => getDateOrderForLanguage(lang), [lang]);

	const controller = useDateInputController({
		value,
		onValueChange,
		dateOrder,
	});

	const isDateInvalid = useDateInputInvalidState({
		value,
		minDate,
		maxDate,
		ariaInvalid: props["aria-invalid"],
	});

	const handleMouseDown = useDateInputMouseDown({
		dateOrder,
		valuesRef: controller.valuesRef,
		focusSegment: controller.focusSegment,
		onMouseDown,
	});

	return (
		<fieldset
			ref={ref}
			{...props}
			aria-invalid={isDateInvalid}
			className={cn(
				"flex min-h-9 flex-1 cursor-text select-none items-center bg-transparent px-3 text-sm text-primary",
				disabled && "cursor-not-allowed opacity-50",
				className,
			)}
			onMouseDown={handleMouseDown}
		>
			<DateSegments
				controller={controller}
				dateOrder={dateOrder}
				disabled={disabled}
				isInvalid={isDateInvalid}
			/>
		</fieldset>
	);
}

export {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupDateInput,
	InputGroupInput,
	InputGroupNumberInput,
	InputGroupText,
	InputGroupTextarea as InputGroupTextArea,
	inputGroupVariants,
};
