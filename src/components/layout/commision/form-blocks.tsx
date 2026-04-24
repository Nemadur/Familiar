import {
	type Control,
	Controller,
	type FieldValues,
	type Path,
} from "react-hook-form";
import { OutlineClose } from "@/components/icons/icons";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupInput,
	InputGroupAddon,
	InputGroupButton,
	InputGroupDateInput,
	InputGroupNumberInput,
} from "@/components/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import * as React from "react";
import { z } from "zod";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface Option {
	id: string;
	label: string;
	price?: number;
	pricePercentage?: number;
	description?: string;
	included?: boolean;
	hasInput?: boolean;
	disabled?: boolean;
}

export interface StaticFormBlockProps {
	label: string;
	description?: string;
	required?: boolean;
	className?: string;
	options?: Option[];
	disabled?: boolean;
	currencyCode?: string;
	placeholder?: string;
	min?: number;
	max?: number;
	minDate?: Date;
	maxDate?: Date;
}

export function StaticNumberInput({
	label,
	description,
	required,
	className,
	disabled = false,
	placeholder = "Enter a number",
	min,
	max,
}: StaticFormBlockProps) {
	const [value, setValue] = React.useState<number | undefined>(undefined);

	const { isInvalid, errorMessage } = React.useMemo(() => {
		if (value === undefined) return { isInvalid: false, errorMessage: null };

		let schema = z.number();
		if (min !== undefined) {
			schema = schema.min(min, `Value must be at least ${min}.`);
		}
		if (max !== undefined) {
			schema = schema.max(max, `Value must be at most ${max}.`);
		}

		const result = schema.safeParse(value);
		if (!result.success) {
			return {
				isInvalid: true,
				errorMessage: result.error.issues[0]?.message ?? "Invalid value",
			};
		}
		return { isInvalid: false, errorMessage: null };
	}, [value, min, max]);

	return (
		<FieldSet className={className}>
			<div className="flex items-center justify-between">
				<FieldLabel
					className={cn(
						"w-full justify-between",
						isInvalid && "text-destructive",
					)}
				>
					<span className="flex-1 w-full">{label}</span>
					{required && (
						<span className="w-fit text-destructive">Required *</span>
					)}
				</FieldLabel>
			</div>
			{description && <FieldDescription>{description}</FieldDescription>}
			<InputGroup className="h-10 w-full">
				<InputGroupNumberInput
					placeholder={placeholder}
					disabled={disabled}
					min={min}
					max={max}
					value={value}
					onValueChange={setValue}
					aria-invalid={isInvalid}
				/>
			</InputGroup>
			{isInvalid && errorMessage && (
				<p className="text-[0.8rem] font-medium text-destructive mt-2">
					{errorMessage}
				</p>
			)}
		</FieldSet>
	);
}

export function StaticDateInput({
	label,
	description,
	required,
	className,
	disabled = false,
	minDate,
	maxDate,
}: StaticFormBlockProps) {
	const [open, setOpen] = React.useState(false);
	const [date, setDate] = React.useState<Date | undefined>(undefined);
	const [month, setMonth] = React.useState<Date | undefined>(date);

	const { isInvalid, errorMessage } = React.useMemo(() => {
		if (!date) return { isInvalid: false, errorMessage: null };
		const d = new Date(date);
		d.setHours(0, 0, 0, 0);

		let schema = z.date();
		if (minDate) {
			const min = new Date(minDate);
			min.setHours(0, 0, 0, 0);
			schema = schema.min(min, `Date must be ${format(min, "PP")} or later.`);
		}
		if (maxDate) {
			const max = new Date(maxDate);
			max.setHours(0, 0, 0, 0);
			schema = schema.max(max, `Date must be ${format(max, "PP")} or earlier.`);
		}

		const result = schema.safeParse(d);
		if (!result.success) {
			return {
				isInvalid: true,
				errorMessage: result.error.issues[0]?.message ?? "Invalid value",
			};
		}
		return { isInvalid: false, errorMessage: null };
	}, [date, minDate, maxDate]);

	const disabledDays = React.useMemo(() => {
		const rules: any[] = [];
		if (minDate) rules.push({ before: minDate });
		if (maxDate) rules.push({ after: maxDate });
		return rules.length > 0 ? rules : undefined;
	}, [minDate, maxDate]);

	return (
		<FieldSet className={className}>
			<div className="flex items-center justify-between">
				<FieldLabel
					className={cn(
						"w-full justify-between",
						isInvalid && "text-destructive",
					)}
				>
					<span className="flex-1 w-full">{label}</span>
					{required && (
						<span className="w-fit text-destructive">Required *</span>
					)}
				</FieldLabel>
			</div>
			{description && <FieldDescription>{description}</FieldDescription>}
			<InputGroup className="h-10 w-full">
				<InputGroupDateInput
					value={date}
					disabled={disabled}
					minDate={minDate}
					maxDate={maxDate}
					aria-invalid={isInvalid}
					onValueChange={(d) => {
						setDate(d);
						setMonth(d);
					}}
					onKeyDown={(e) => {
						if (e.key === "ArrowDown" && !disabled) {
							e.preventDefault();
							setOpen(true);
						}
					}}
				/>
				<InputGroupAddon align="inline-end">
					<Popover open={open} onOpenChange={setOpen}>
						<PopoverTrigger asChild>
							<InputGroupButton
								id="date-picker"
								type="button"
								variant="ghost"
								size="icon-xs"
								aria-label="Select date"
								disabled={disabled}
							>
								<CalendarIcon />
								<span className="sr-only">Select date</span>
							</InputGroupButton>
						</PopoverTrigger>
						<PopoverContent
							className="w-auto overflow-hidden p-0"
							align="end"
							alignOffset={-8}
							sideOffset={10}
						>
							<Calendar
								mode="single"
								selected={date}
								month={month}
								onMonthChange={setMonth}
								disabled={disabledDays}
								onSelect={(d) => {
									setDate(d);
									setOpen(false);
								}}
								initialFocus
							/>
						</PopoverContent>
					</Popover>
				</InputGroupAddon>
			</InputGroup>
			{isInvalid && errorMessage && (
				<p className="text-[0.8rem] font-medium text-destructive mt-2">
					{errorMessage}
				</p>
			)}
		</FieldSet>
	);
}

export function StaticInput({
	label,
	description,
	required,
	className,
	disabled = false,
	placeholder = "Your answer",
}: StaticFormBlockProps) {
	return (
		<FieldSet className={className}>
			<div className="flex items-center justify-between">
				<FieldLabel className="w-full justify-between">
					<span className="flex-1 w-full">{label}</span>
					{required && (
						<span className="w-fit text-destructive">Required *</span>
					)}
				</FieldLabel>
			</div>
			{description && <FieldDescription>{description}</FieldDescription>}
			<InputGroup className="h-10">
				<InputGroupInput placeholder={placeholder} disabled={disabled} />
			</InputGroup>
		</FieldSet>
	);
}

export function StaticTextarea({
	label,
	description,
	required,
	className,
	disabled = false,
	placeholder = "Your answer",
}: StaticFormBlockProps) {
	return (
		<FieldSet className={className}>
			<div className="flex items-center justify-between">
				<FieldLabel className="w-full justify-between">
					<span className="flex-1 w-full">{label}</span>
					{required && (
						<span className="w-fit text-destructive">Required *</span>
					)}
				</FieldLabel>
			</div>
			{description && <FieldDescription>{description}</FieldDescription>}
			<InputGroup className="rounded-xl">
				<Textarea
					className="min-h-[100px] w-full resize-none"
					placeholder={placeholder}
					disabled={disabled}
				/>
			</InputGroup>
		</FieldSet>
	);
}

export function StaticRadioGroup({
	label,
	description,
	required,
	options = [],
	className,
	disabled = false,
	currencyCode = "USD",
}: StaticFormBlockProps) {
	const [value, setValue] = React.useState<string | undefined>(undefined);

	return (
		<FieldSet className={className}>
			<div className="flex items-center justify-between">
				<FieldLabel className="w-full justify-between">
					<span className="flex-1 w-full">{label}</span>
					<span className="text-muted-foreground/70 text-xs">(Choose 1)</span>
					{required && (
						<span className="w-fit text-destructive">Required *</span>
					)}
				</FieldLabel>
			</div>
			{description && <FieldDescription>{description}</FieldDescription>}
			<RadioGroup
				disabled={disabled}
				className="flex flex-col gap-3"
				value={value}
				onValueChange={setValue}
			>
				{options.map((option) => (
					<Field
						key={option.id}
						orientation="horizontal"
						className="items-start"
					>
						<RadioGroupItem
							value={option.id}
							id={`static-${option.id}`}
							disabled={disabled || option.disabled}
							onClick={(e) => {
								if (value === option.id) {
									setValue("");
								}
							}}
						/>
						<FieldContent className="flex-1 gap-2">
							<label
								htmlFor={`static-${option.id}`}
								className="cursor-pointer block w-full"
							>
								<div className="flex items-start justify-between">
									<span
										className={cn(
											"font-normal leading-tight",
											(disabled || option.disabled) &&
												"text-muted-foreground/70",
										)}
									>
										{option.label}
									</span>
									{option.price !== undefined && (
										<span className="ml-2 whitespace-nowrap text-muted-foreground text-xs">
											{option.price > 0
												? `+${currencyCode} ${option.price.toFixed(2)}`
												: "Free"}
										</span>
									)}
									{option.pricePercentage !== undefined && (
										<span className="ml-2 whitespace-nowrap text-muted-foreground text-xs">
											{option.pricePercentage > 0
												? `+${option.pricePercentage}%`
												: "Free"}
										</span>
									)}
								</div>
								{option.description && (
									<FieldDescription className="text-xs mt-1">
										{option.description}
									</FieldDescription>
								)}
							</label>
						</FieldContent>
					</Field>
				))}
			</RadioGroup>
		</FieldSet>
	);
}

export function FormSelect<T extends FieldValues>({
	control,
	name,
	label,
	description,
	required,
	options = [],
	className,
	currencyCode = "USD",
}: FormBlockProps<T>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<FieldSet className={className}>
					<div className="flex items-center justify-between">
						<FieldLabel className="w-full justify-between">
							<span className="flex-1 w-full">{label}</span>
							{required && (
								<span className="w-fit text-destructive">Required *</span>
							)}
						</FieldLabel>
					</div>
					{description && <FieldDescription>{description}</FieldDescription>}
					<Select onValueChange={field.onChange} defaultValue={field.value}>
						<SelectTrigger className="h-10 w-full">
							<SelectValue placeholder="Select an option" />
						</SelectTrigger>
						<SelectContent>
							{options.map((opt) => {
								let priceLabel = "";
								if (opt.pricePercentage !== undefined) {
									priceLabel =
										opt.pricePercentage > 0
											? ` (+${opt.pricePercentage}%)`
											: " (Free)";
								} else if (opt.price !== undefined) {
									priceLabel =
										opt.price > 0
											? ` (+${currencyCode} ${opt.price.toFixed(2)})`
											: " (Free)";
								}

								return (
									<SelectItem
										key={opt.id}
										value={opt.id}
										disabled={opt.disabled}
									>
										{opt.label}
										{priceLabel}
									</SelectItem>
								);
							})}
						</SelectContent>
					</Select>
					<FieldError errors={[fieldState.error]} />
				</FieldSet>
			)}
		/>
	);
}

export function StaticCheckboxGroup({
	label,
	description,
	required,
	options = [],
	className,
	disabled = false,
	currencyCode = "USD",
}: StaticFormBlockProps) {
	return (
		<FieldSet className={className}>
			<div className="flex items-center justify-between">
				<FieldLabel className="w-full justify-between">
					<span className="flex-1 w-full">{label}</span>
					{required && (
						<span className="w-fit text-destructive">Required *</span>
					)}
				</FieldLabel>
			</div>
			{description && <FieldDescription>{description}</FieldDescription>}
			<FieldGroup className="gap-3">
				{options.map((option) => {
					const isIncluded = option.included;
					const isUnavailable = option.disabled;

					return (
						<Field
							key={option.id}
							orientation="horizontal"
							className="items-start"
						>
							{isUnavailable ? (
								<OutlineClose
									size={16}
									className="cursor-not-allowed text-muted-foreground/70"
								/>
							) : (
								<Checkbox
									id={`static-check-${option.id}`}
									disabled={disabled || isIncluded || isUnavailable}
								/>
							)}

							<FieldContent className="flex-1">
								<div className="flex items-start justify-between">
									<FieldLabel
										htmlFor={`static-check-${option.id}`}
										className={cn(
											"cursor-pointer font-normal",
											(disabled || isIncluded || isUnavailable) &&
												"cursor-not-allowed text-muted-foreground/70",
											isUnavailable && "line-through",
										)}
									>
										{option.label}
									</FieldLabel>
									<span className="whitespace-nowrap text-muted-foreground text-xs">
										{isIncluded
											? "Included"
											: option.pricePercentage !== undefined
												? option.pricePercentage > 0
													? `+${option.pricePercentage}%`
													: "Free"
												: option.price !== undefined
													? option.price > 0
														? `+${currencyCode} ${option.price.toFixed(2)}`
														: "Free"
													: ""}
									</span>
								</div>
							</FieldContent>
						</Field>
					);
				})}
			</FieldGroup>
		</FieldSet>
	);
}

export function StaticSelect({
	label,
	description,
	required,
	options = [],
	className,
	disabled = false,
	currencyCode = "USD",
}: StaticFormBlockProps) {
	return (
		<FieldSet className={className}>
			<div className="flex items-center justify-between">
				<FieldLabel className="w-full justify-between">
					<span className="flex-1 w-full">{label}</span>
					{required && (
						<span className="w-fit text-destructive">Required *</span>
					)}
				</FieldLabel>
			</div>
			{description && <FieldDescription>{description}</FieldDescription>}
			<Select disabled={disabled}>
				<SelectTrigger className="h-10 w-full">
					<SelectValue placeholder="Select an option" />
				</SelectTrigger>
				<SelectContent>
					{options.map((opt) => {
						let priceLabel = "";
						if (opt.pricePercentage !== undefined) {
							priceLabel =
								opt.pricePercentage > 0
									? ` (+${opt.pricePercentage}%)`
									: " (Free)";
						} else if (opt.price !== undefined) {
							priceLabel =
								opt.price > 0
									? ` (+${currencyCode} ${opt.price.toFixed(2)})`
									: " (Free)";
						}

						return (
							<SelectItem key={opt.id} value={opt.id} disabled={opt.disabled}>
								{opt.label}
								{priceLabel}
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
		</FieldSet>
	);
}

interface FormBlockProps<T extends FieldValues> {
	control: Control<T>;
	name: Path<T>;
	label: string;
	description?: string;
	required?: boolean;
	className?: string;
	options: Option[];
	otherFieldName?: Path<T>;
	currencyCode?: string;
}

export function FormRadioGroup<T extends FieldValues>({
	control,
	name,
	label,
	description,
	required,
	options = [],
	className,
	otherFieldName,
	currencyCode = "USD",
}: FormBlockProps<T>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => (
				<FieldSet className={className}>
					<div className="flex items-center justify-between">
						<FieldLabel className="w-full justify-between">
							<span className="flex-1 w-full">{label}</span>
							{/* TODO: add translation */}
							<span className="text-muted-foreground/70 text-xs">
								(Choose 1)
							</span>
							{required && (
								<span className="w-fit text-destructive">Required *</span>
							)}
						</FieldLabel>
					</div>
					{description && <FieldDescription>{description}</FieldDescription>}
					<RadioGroup
						onValueChange={field.onChange}
						value={field.value}
						className="flex flex-col gap-3"
					>
						{options.map((option) => (
							<Field
								key={option.id}
								orientation="horizontal"
								className="items-start"
							>
								<RadioGroupItem
									value={option.id}
									id={`${name}-${option.id}`}
									disabled={option.disabled}
									onClick={(e) => {
										if (field.value === option.id) {
											field.onChange(undefined);
										}
									}}
								/>
								<FieldContent className="flex-1 gap-2">
									<label
										htmlFor={`${name}-${option.id}`}
										className="cursor-pointer block w-full"
									>
										<div className="flex items-start justify-between">
											<span
												className={cn(
													"font-normal leading-tight",
													option.disabled && "text-muted-foreground/70",
												)}
											>
												{option.label}
											</span>
											{option.price !== undefined && (
												// TODO: use commission currency or user preferendce surrency
												<span className="ml-2 whitespace-nowrap text-muted-foreground text-xs">
													{option.price > 0
														? `+${currencyCode} ${option.price.toFixed(2)}`
														: "Free"}
												</span>
											)}
											{option.pricePercentage !== undefined && (
												<span className="ml-2 whitespace-nowrap text-muted-foreground text-xs">
													{option.pricePercentage > 0
														? `+${option.pricePercentage}%`
														: "Free"}
												</span>
											)}
										</div>
										{option.description && (
											<FieldDescription className="text-xs mt-1">
												{option.description}
											</FieldDescription>
										)}
									</label>
									{option.hasInput &&
										field.value === option.id &&
										otherFieldName && (
											<Controller
												control={control}
												name={otherFieldName}
												render={({ field: otherField }) => (
													<Input
														placeholder="Please specify..."
														className="mt-1 h-10 border-transparent bg-secondary/20 focus:border-primary"
														{...otherField}
													/>
												)}
											/>
										)}
								</FieldContent>
							</Field>
						))}
					</RadioGroup>
					<FieldError errors={[fieldState.error]} />
				</FieldSet>
			)}
		/>
	);
}

export function FormCheckboxGroup<T extends FieldValues>({
	control,
	name,
	label,
	description,
	required,
	options = [],
	className,
	otherFieldName,
	currencyCode = "USD",
}: FormBlockProps<T>) {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field, fieldState }) => {
				const value = (field.value as string[]) || [];

				return (
					<FieldSet className={className}>
						<div className="flex items-center justify-between">
							<FieldLabel className="w-full justify-between">
								<span className="flex-1 w-full">{label}</span>
								{/* TODO: add translation */}
								{required && (
									<span className="w-fit text-destructive">Required *</span>
								)}
							</FieldLabel>
						</div>
						{description && <FieldDescription>{description}</FieldDescription>}
						<FieldGroup className="gap-3">
							{options.map((option) => {
								const isIncluded = option.included;
								const isUnavailable =
									!isIncluded &&
									(option.price === 0 || option.price === undefined) &&
									option.pricePercentage === undefined;

								const isChecked = value.includes(option.id) || isIncluded;

								return (
									<Field
										key={option.id}
										orientation="horizontal"
										className="items-start"
									>
										{isUnavailable ? (
											<OutlineClose
												size={16}
												className="cursor-not-allowed text-muted-foreground/70"
											/>
										) : (
											<Checkbox
												id={`${name}-${option.id}`}
												checked={isChecked}
												disabled={isIncluded || option.disabled}
												onCheckedChange={(checked) => {
													if (isIncluded || option.disabled) return;
													let newValue = [...value];
													if (checked) {
														newValue.push(option.id);
													} else {
														newValue = newValue.filter((v) => v !== option.id);
													}
													field.onChange(newValue);
												}}
											/>
										)}

										<FieldContent className="flex-1">
											<div className="flex items-start justify-between">
												<FieldLabel
													htmlFor={`${name}-${option.id}`}
													className={cn(
														"cursor-pointer font-normal",
														(isIncluded || option.disabled || isUnavailable) &&
															"cursor-not-allowed text-muted-foreground/70",
														isUnavailable && "line-through",
													)}
												>
													{option.label}
												</FieldLabel>
												<span className="whitespace-nowrap text-muted-foreground text-xs">
													{isIncluded
														? "Included"
														: option.pricePercentage !== undefined
															? option.pricePercentage > 0
																? `+${option.pricePercentage}%`
																: "Free"
															: option.price !== undefined
																? option.price > 0
																	? `+${currencyCode} ${option.price.toFixed(2)}`
																	: "Free"
																: ""}
												</span>
											</div>
											{/* {option.description && (
												<FieldDescription className="mt-1">
													{option.description}
												</FieldDescription>
											)} */}
											{option.hasInput && isChecked && otherFieldName && (
												<div className="mt-2 pl-2">
													<Controller
														control={control}
														name={otherFieldName}
														render={({ field: otherField }) => (
															<Input
																placeholder="Please specify..."
																className="h-10 border-transparent bg-secondary/20 focus:border-primary"
																{...otherField}
															/>
														)}
													/>
												</div>
											)}
										</FieldContent>
									</Field>
								);
							})}
						</FieldGroup>
						<FieldError errors={[fieldState.error]} />
					</FieldSet>
				);
			}}
		/>
	);
}
