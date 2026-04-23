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
				"flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent peer text-primary",
				"group-data-[variant=floating]/input-group:pt-4 group-data-[variant=floating]/input-group:pb-1 group-data-[variant=floating]/input-group:h-10",
				// Fix for floating labels: ensure the input acts as the peer correctly and handles placeholders
				"group-data-[variant=floating]/input-group:placeholder:text-transparent group-data-[variant=floating]/input-group:focus:placeholder:text-muted-foreground",
				className,
			)}
			{...props}
		/>
	);
}

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

		const handleBlur = () => {
			if (value !== undefined) {
				if (value < min) {
					setValue(min);
					(ref as React.RefObject<HTMLInputElement>).current!.value =
						String(min);
				} else if (value > max) {
					setValue(max);
					(ref as React.RefObject<HTMLInputElement>).current!.value =
						String(max);
				}
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

				<div className="flex flex-col overflow-hidden rounded-r-xl border-l">
					<Button
						type="button"
						size={"icon-xs"}
						aria-label="Increase value"
						className="h-5 rounded-none border-0 border-b border-border"
						variant="ghost"
						onClick={handleIncrement}
						disabled={value === max}
					>
						<OutlineChevronUp />
					</Button>
					<Button
						type="button"
						size={"icon-xs"}
						aria-label="Decrease value"
						className="h-5 rounded-none border-0"
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

export {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupNumberInput,
	InputGroupButton,
	InputGroupText,
	inputGroupVariants,
};
