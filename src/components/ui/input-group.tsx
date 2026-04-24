import { useTranslation } from "react-i18next";
import { cva, type VariantProps } from "class-variance-authority";
import { NumericFormat, type NumericFormatProps } from "react-number-format";
import * as React from "react";
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
	extends React.ComponentProps<"fieldset">,
		VariantProps<typeof inputGroupVariants> {}

function InputGroup({ className, variant, ...props }: InputGroupProps) {
	return (
		<fieldset
			data-slot="input-group"
			data-variant={variant || "default"}
			className={cn(
				inputGroupVariants({ variant }),
				"h-10 min-w-0 has-[>textarea]:h-auto peer",

				// Focus state.
				"has-[[data-slot=input-group-control]:focus-visible]:ring-3 has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50",
				"has-[button:focus-visible]:ring-3 has-[button:focus-visible]:ring-ring/50",

				// Error state.
				"has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",

				// Variant-specific overrides
				// variant === "floating" && "h-10",

				className,
			)}
			{...props}
		/>
	);
}

const inputGroupAddonVariants = cva(
	"text-muted-foreground flex h-auto [&>svg]:mt-0.5 cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium select-none [&>svg:not([class*='size-'])]:size-4 [&>kbd]:rounded-[calc(var(--radius)-5px)] group-data-[disabled=true]/input-group:opacity-50",
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
	const ref = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const element = ref.current;
		if (!element) return;

		const handleMouseDown = (e: MouseEvent) => {
			if ((e.target as HTMLElement).closest("button")) {
				return;
			}
			const input = element.parentElement?.querySelector(
				"input,textarea",
			) as HTMLElement;
			// Prevent the div from stealing focus
			e.preventDefault();
			input?.focus();
		};

		element.addEventListener("mousedown", handleMouseDown);
		return () => {
			element.removeEventListener("mousedown", handleMouseDown);
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
				"flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent peer text-primary aria-invalid:text-destructive",
				"group-data-[variant=floating]/input-group:pt-4 group-data-[variant=floating]/input-group:pb-1 group-data-[variant=floating]/input-group:h-10",
				// Fix for floating labels: ensure the input acts as the peer correctly and handles placeholders
				"group-data-[variant=floating]/input-group:placeholder:text-transparent group-data-[variant=floating]/input-group:focus:placeholder:text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

// TODO: add focus style state for buttons
export interface NumberInputProps
	extends Omit<
		NumericFormatProps,
		"value" | "onValueChange" | "defaultValue" | "min" | "max"
	> {
	stepper?: number;
	thousandSeparator?: string;
	placeholder?: string;
	defaultValue?: number;
	min?: number;
	max?: number;
	value?: number; // Controlled value
	suffix?: string;
	prefix?: string;
	onValueChange?: (value: number | undefined) => void;
	fixedDecimalScale?: boolean;
	decimalScale?: number;
}

const InputGroupNumberInput = React.forwardRef<
	HTMLInputElement,
	NumberInputProps
>(
	(
		{
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
		},
		ref,
	) => {
		const [value, setValue] = React.useState<number | undefined>(
			controlledValue ?? defaultValue,
		);

		const handleIncrement = React.useCallback(() => {
			setValue((prev) =>
				prev === undefined
					? (stepper ?? 1)
					: Math.min(prev + (stepper ?? 1), max),
			);
		}, [stepper, max]);

		const handleDecrement = React.useCallback(() => {
			setValue((prev) =>
				prev === undefined
					? -(stepper ?? 1)
					: Math.max(prev - (stepper ?? 1), min),
			);
		}, [stepper, min]);

		React.useEffect(() => {
			const handleKeyDown = (e: KeyboardEvent) => {
				if (
					document.activeElement ===
					(ref as React.RefObject<HTMLInputElement>).current
				) {
					if (e.key === "ArrowUp") {
						handleIncrement();
					} else if (e.key === "ArrowDown") {
						handleDecrement();
					}
				}
			};

			window.addEventListener("keydown", handleKeyDown);

			return () => {
				window.removeEventListener("keydown", handleKeyDown);
			};
		}, [handleIncrement, handleDecrement, ref]);

		React.useEffect(() => {
			if (controlledValue !== undefined) {
				setValue(controlledValue);
			}
		}, [controlledValue]);

		const handleChange = (values: {
			value: string;
			floatValue: number | undefined;
		}) => {
			const newValue =
				values.floatValue === undefined ? undefined : values.floatValue;
			setValue(newValue);
			if (onValueChange) {
				onValueChange(newValue);
			}
		};

		const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
			if (props.onBlur) {
				props.onBlur(e);
			}
		};

		return (
			<div className="flex w-full items-center">
				<NumericFormat
					value={value}
					onValueChange={handleChange}
					thousandSeparator={thousandSeparator}
					decimalScale={decimalScale}
					fixedDecimalScale={fixedDecimalScale}
					allowNegative={min < 0}
					valueIsNumericString
					onBlur={handleBlur}
					max={max}
					min={min}
					suffix={suffix}
					prefix={prefix}
					customInput={InputGroupInput}
					placeholder={placeholder}
					className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-r-none relative text-primary"
					getInputRef={ref}
					{...props}
				/>

				{/* TODO: maybe use left to right not top to bottom */}
				<div className="flex flex-col rounded-r-xl border-l border-primary/10">
					<Button
						type="button"
						size={"icon-sm"}
						aria-label="Increase value"
						className="h-5 rounded-none rounded-tr-xl border-0 border-b border-primary/10 pr-1 focus-visible:z-10"
						variant="ghost"
						onClick={handleIncrement}
						disabled={value === max}
					>
						<OutlineChevronUp />
					</Button>
					<Button
						type="button"
						size={"icon-sm"}
						aria-label="Decrease value"
						className="h-5 rounded-none rounded-br-xl border-0 pr-1 focus-visible:z-10"
						variant="ghost"
						onClick={handleDecrement}
						disabled={value === min}
					>
						<OutlineChevronDown />
					</Button>
				</div>
			</div>
		);
	},
);

export interface DateInputProps
	extends Omit<
		React.ComponentProps<"fieldset">,
		"value" | "onChange" | "defaultValue"
	> {
	value?: Date;
	onValueChange?: (date: Date | undefined) => void;
	disabled?: boolean;
	minDate?: Date;
	maxDate?: Date;
}

interface DateSegmentProps {
	type: "month" | "day" | "year";
	val: string;
	placeholder: string;
	focused: boolean;
	disabled?: boolean;
	"aria-invalid"?: boolean | "true" | "false";
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
	onFocus: () => void;
	onBlur: () => void;
}

const DateSegment = React.forwardRef<HTMLInputElement, DateSegmentProps>(
	(props, ref) => {
		const {
			val,
			placeholder,
			focused,
			disabled,
			"aria-invalid": ariaInvalid,
			onChange,
			onKeyDown,
			onFocus,
			onBlur,
		} = props;
		return (
			<span
				className={cn(
					"relative inline-flex items-center justify-center rounded-sm px-[3px] py-px transition-colors select-none",
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
					onFocus={(e) => {
						// Small delay ensures select() happens after browser default focus behavior
						setTimeout(() => e.target.select(), 0);
						onFocus();
					}}
					onBlur={onBlur}
				/>
			</span>
		);
	},
);
DateSegment.displayName = "DateSegment";

const InputGroupDateInput = React.forwardRef<
	HTMLFieldSetElement,
	DateInputProps
>(
	(
		{ className, value, onValueChange, disabled, minDate, maxDate, ...props },
		ref,
	) => {
		const { i18n } = useTranslation();
		const lang = i18n.language || "en";
		// Determine the order based on the current locale
		// By parsing a known date (e.g. 2023-11-22), we can check where the month/day/year end up
		const parts = new Intl.DateTimeFormat(lang).formatToParts(
			new Date(2023, 10, 22),
		);
		const order = parts
			.filter(
				(p) => p.type === "day" || p.type === "month" || p.type === "year",
			)
			.map((p) => p.type) as ("month" | "day" | "year")[];

		// Fallback to MM/DD/YYYY if format is somehow missing all parts
		const dateOrder = order.length === 3 ? order : ["month", "day", "year"];

		const [month, setMonth] = React.useState("");
		const [day, setDay] = React.useState("");
		const [year, setYear] = React.useState("");
		const [focused, setFocused] = React.useState<
			"month" | "day" | "year" | null
		>(null);

		const monthRef = React.useRef<HTMLInputElement>(null);
		const dayRef = React.useRef<HTMLInputElement>(null);
		const yearRef = React.useRef<HTMLInputElement>(null);

		// Refs to always have fresh values inside event handlers (avoids stale closures)
		const monthVal = React.useRef(month);
		const dayVal = React.useRef(day);
		const yearVal = React.useRef(year);

		React.useEffect(() => {
			monthVal.current = month;
		}, [month]);
		React.useEffect(() => {
			dayVal.current = day;
		}, [day]);
		React.useEffect(() => {
			yearVal.current = year;
		}, [year]);

		React.useEffect(() => {
			if (value === undefined) {
				// Don't reset internal state if value is explicitly set to undefined
				// This prevents clearing all segments when only one segment is invalid/incomplete
				return;
			}
			if (value && !Number.isNaN(value.getTime())) {
				setMonth(String(value.getMonth() + 1).padStart(2, "0"));
				setDay(String(value.getDate()).padStart(2, "0"));
				setYear(String(value.getFullYear()));
			} else {
				setMonth("");
				setDay("");
				setYear("");
			}
		}, [value]);

		const updateDate = (m: string, d: string, y: string) => {
			if (m.length === 2 && d.length === 2 && y.length === 4) {
				const date = new Date(Number(y), Number(m) - 1, Number(d));
				if (!Number.isNaN(date.getTime())) {
					const newM = String(date.getMonth() + 1).padStart(2, "0");
					const newD = String(date.getDate()).padStart(2, "0");
					const newY = String(date.getFullYear());

					if (m !== newM) setMonth(newM);
					if (d !== newD) setDay(newD);
					if (y !== newY) setYear(newY);

					onValueChange?.(date);
					return;
				}
			}
			onValueChange?.(undefined);
		};

		const getNextSegment = (
			current: "month" | "day" | "year",
		): "month" | "day" | "year" | null => {
			const idx = dateOrder.indexOf(current);
			return idx < 2 ? (dateOrder[idx + 1] as "month" | "day" | "year") : null;
		};

		const getPrevSegment = (
			current: "month" | "day" | "year",
		): "month" | "day" | "year" | null => {
			const idx = dateOrder.indexOf(current);
			return idx > 0 ? (dateOrder[idx - 1] as "month" | "day" | "year") : null;
		};

		const focusSegment = (type: "month" | "day" | "year" | null) => {
			if (type === "month") monthRef.current?.focus();
			else if (type === "day") dayRef.current?.focus();
			else if (type === "year") yearRef.current?.focus();
		};

		const handleKeyDown = (
			e: React.KeyboardEvent<HTMLInputElement>,
			type: "month" | "day" | "year",
		) => {
			if (e.key === "Backspace") {
				// If input is empty OR cursor is at the very beginning (selection start/end is 0)
				if (
					e.currentTarget.value === "" ||
					(e.currentTarget.selectionStart === 0 &&
						e.currentTarget.selectionEnd === 0)
				) {
					e.preventDefault();
					focusSegment(getPrevSegment(type));
				} else if (
					e.currentTarget.selectionStart !== e.currentTarget.selectionEnd &&
					e.currentTarget.selectionStart === 0 &&
					e.currentTarget.selectionEnd === e.currentTarget.value.length
				) {
					// If ALL text is fully selected and backspace is pressed, clear the input
					e.preventDefault();
					if (type === "month") {
						setMonth("");
						updateDate("", dayVal.current, yearVal.current);
					} else if (type === "day") {
						setDay("");
						updateDate(monthVal.current, "", yearVal.current);
					} else if (type === "year") {
						setYear("");
						updateDate(monthVal.current, dayVal.current, "");
					}
				}
			} else if (e.key === "ArrowRight") {
				if (e.currentTarget.selectionStart === e.currentTarget.value.length)
					focusSegment(getNextSegment(type));
			} else if (e.key === "ArrowLeft") {
				if (e.currentTarget.selectionStart === 0)
					focusSegment(getPrevSegment(type));
			}
		};

		const isDateInvalid = React.useMemo(() => {
			if (props["aria-invalid"]) return true;
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
		}, [value, minDate, maxDate, props["aria-invalid"]]);

		return (
			<fieldset
				ref={ref}
				aria-invalid={isDateInvalid}
				className={cn(
					"flex min-h-9 flex-1 cursor-text select-none items-center bg-transparent px-3 text-sm text-primary",
					disabled && "cursor-not-allowed opacity-50",
					className,
				)}
				onMouseDown={(e) => {
					if ((e.target as HTMLElement).tagName === "INPUT") return;
					e.preventDefault();

					// Focus the first empty segment based on the locale's order, or the first segment if all are empty
					if (!monthVal.current && !dayVal.current && !yearVal.current) {
						focusSegment(dateOrder[0] as "month" | "day" | "year");
					} else {
						for (const type of dateOrder) {
							if (type === "month" && !monthVal.current) {
								focusSegment("month");
								return;
							}
							if (type === "day" && !dayVal.current) {
								focusSegment("day");
								return;
							}
							if (type === "year" && !yearVal.current) {
								focusSegment("year");
								return;
							}
						}
						// If all are filled, focus the last one
						focusSegment(dateOrder[2] as "month" | "day" | "year");
					}
				}}
				{...props}
			>
				{dateOrder.map((segmentType, index) => {
					const isLast = index === dateOrder.length - 1;

					if (segmentType === "month") {
						return (
							<React.Fragment key="month">
								<DateSegment
									ref={monthRef}
									type="month"
									val={month}
									placeholder="mm"
									focused={focused === "month"}
									disabled={disabled}
									aria-invalid={isDateInvalid}
									onChange={(e) => {
										let val = e.target.value.replace(/\D/g, "");
										const isFullySelected =
											e.target.selectionStart === 1 &&
											e.target.selectionEnd === 1;
										if (isFullySelected && val.length > 2) {
											val = val.slice(0, 1);
										} else if (val.length > 2) {
											val = val.slice(-1);
										}
										if (val.length === 1 && Number(val) > 1) val = "0" + val;
										if (val.length === 2 && Number(val) > 12) val = "12";
										if (val.length === 2 && Number(val) < 1) val = "01";
										setMonth(val);
										if (
											val.length === 2 &&
											dayVal.current.length === 2 &&
											yearVal.current.length === 4
										) {
											updateDate(val, dayVal.current, yearVal.current);
										} else {
											onValueChange?.(undefined);
										}
										if (val.length === 2 && val !== monthVal.current)
											focusSegment(getNextSegment("month"));
									}}
									onKeyDown={(e) => handleKeyDown(e, "month")}
									onFocus={() => setFocused("month")}
									onBlur={() => setFocused(null)}
								/>
								{!isLast && (
									<span
										className={cn(
											"select-none",
											isDateInvalid
												? "text-destructive"
												: "text-muted-foreground/50",
										)}
									>
										/
									</span>
								)}
							</React.Fragment>
						);
					}
					if (segmentType === "day") {
						return (
							<React.Fragment key="day">
								<DateSegment
									ref={dayRef}
									type="day"
									val={day}
									placeholder="dd"
									focused={focused === "day"}
									disabled={disabled}
									aria-invalid={isDateInvalid}
									onChange={(e) => {
										let val = e.target.value.replace(/\D/g, "");
										const isFullySelected =
											e.target.selectionStart === 1 &&
											e.target.selectionEnd === 1;
										if (isFullySelected && val.length > 2) {
											val = val.slice(0, 1);
										} else if (val.length > 2) {
											val = val.slice(-1);
										}
										if (val.length === 1 && Number(val) > 3) val = `0${val}`;
										if (val.length === 2 && Number(val) > 31) val = "31";
										if (val.length === 2 && Number(val) < 1) val = "01";
										setDay(val);
										if (
											monthVal.current.length === 2 &&
											val.length === 2 &&
											yearVal.current.length === 4
										) {
											updateDate(monthVal.current, val, yearVal.current);
										} else {
											onValueChange?.(undefined);
										}
										if (val.length === 2 && val !== dayVal.current)
											focusSegment(getNextSegment("day"));
									}}
									onKeyDown={(e) => handleKeyDown(e, "day")}
									onFocus={() => setFocused("day")}
									onBlur={() => setFocused(null)}
								/>
								{!isLast && (
									<span
										className={cn(
											"select-none",
											isDateInvalid
												? "text-destructive"
												: "text-muted-foreground/50",
										)}
									>
										/
									</span>
								)}
							</React.Fragment>
						);
					}
					if (segmentType === "year") {
						return (
							<React.Fragment key="year">
								<DateSegment
									ref={yearRef}
									type="year"
									val={year}
									placeholder="yyyy"
									focused={focused === "year"}
									disabled={disabled}
									aria-invalid={isDateInvalid}
									onChange={(e) => {
										let val = e.target.value.replace(/\D/g, "");
										const isFullySelected =
											e.target.selectionStart === 1 &&
											e.target.selectionEnd === 1;
										if (isFullySelected && val.length > 4) {
											val = val.slice(0, 1);
										} else if (val.length > 4) {
											val = val.slice(-1);
										}
										setYear(val);
										if (
											monthVal.current.length === 2 &&
											dayVal.current.length === 2 &&
											val.length === 4
										) {
											updateDate(monthVal.current, dayVal.current, val);
										} else {
											onValueChange?.(undefined);
										}
										if (val.length === 4 && val !== yearVal.current)
											focusSegment(getNextSegment("year"));
									}}
									onKeyDown={(e) => handleKeyDown(e, "year")}
									onFocus={() => setFocused("year")}
									onBlur={() => setFocused(null)}
								/>
								{!isLast && (
									<span
										className={cn(
											"select-none",
											isDateInvalid
												? "text-destructive"
												: "text-muted-foreground/50",
										)}
									>
										/
									</span>
								)}
							</React.Fragment>
						);
					}

					return null;
				})}
			</fieldset>
		);
	},
);
InputGroupDateInput.displayName = "InputGroupDateInput";

export {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupNumberInput,
	InputGroupDateInput,
	InputGroupButton,
	InputGroupText,
	inputGroupVariants,
};
