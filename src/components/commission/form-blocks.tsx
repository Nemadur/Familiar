import { Control, FieldValues, Path, useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export interface Option {
	id: string;
	label: string;
	price?: number;
	pricePercentage?: number;
	description?: string;
	disabled?: boolean;
	included?: boolean;
	hasInput?: boolean;
}

interface FormCheckboxGroupProps<T extends FieldValues> {
	control: Control<T>;
	name: Path<T>;
	label: string;
	description?: string;
	required?: boolean;
	options: Option[];
	className?: string;
}

export function FormCheckboxGroup<T extends FieldValues>({
	control,
	name,
	label,
	description,
	required,
	options,
	className,
}: FormCheckboxGroupProps<T>) {
	return (
		<FormField
			control={control}
			name={name}
			render={() => (
				<FormItem className={className}>
					<div className="mb-4">
						<FormLabel className="text-base">
							{label} {required && <span className="text-destructive">*</span>}
						</FormLabel>
						{description && <FormDescription>{description}</FormDescription>}
					</div>
					<div className="space-y-3">
						{options.map((option) => (
							<FormField
								key={option.id}
								control={control}
								name={name}
								render={({ field }) => {
									return (
										<FormItem
											key={option.id}
											className="flex flex-row items-start space-x-3 space-y-0"
										>
											<FormControl>
												<Checkbox
													checked={field.value?.includes(option.id)}
													disabled={option.disabled}
													onCheckedChange={(checked) => {
														return checked
															? field.onChange([
																	...(field.value || []),
																	option.id,
																])
															: field.onChange(
																	field.value?.filter(
																		(value: string) => value !== option.id,
																	),
																);
													}}
												/>
											</FormControl>
											<div className="space-y-1 leading-none">
												<FormLabel className="font-normal text-sm">
													{option.label}
													{option.price !== undefined && option.price > 0 && (
														<span className="ml-2 font-medium text-muted-foreground text-xs">
															+${option.price}
														</span>
													)}
												</FormLabel>
												{option.description && (
													<p className="text-muted-foreground text-xs">
														{option.description}
													</p>
												)}
											</div>
										</FormItem>
									);
								}}
							/>
						))}
					</div>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

interface FormRadioGroupProps<T extends FieldValues> {
	control: Control<T>;
	name: Path<T>;
	label: string;
	description?: string;
	required?: boolean;
	options: Option[];
	otherFieldName?: Path<T>;
	className?: string;
}

export function FormRadioGroup<T extends FieldValues>({
	control,
	name,
	label,
	description,
	required,
	options,
	otherFieldName,
	className,
}: FormRadioGroupProps<T>) {
	const { watch } = useFormContext();
	const selectedValue = watch(name);

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className={className}>
					<div className="mb-4">
						<FormLabel className="text-base">
							{label} {required && <span className="text-destructive">*</span>}
						</FormLabel>
						{description && <FormDescription>{description}</FormDescription>}
					</div>
					<FormControl>
						<RadioGroup
							onValueChange={field.onChange}
							defaultValue={field.value}
							className="flex flex-col space-y-3"
						>
							{options.map((option) => (
								<FormItem
									key={option.id}
									className="flex items-start space-x-3 space-y-0"
								>
									<FormControl>
										<RadioGroupItem
											value={option.id}
											disabled={option.disabled}
										/>
									</FormControl>
									<div className="w-full space-y-1 leading-none">
										<FormLabel className="font-normal text-sm">
											{option.label}
											{option.price !== undefined && option.price > 0 && (
												<span className="ml-2 font-medium text-muted-foreground text-xs">
													+${option.price}
												</span>
											)}
										</FormLabel>
										{option.description && (
											<p className="text-muted-foreground text-xs">
												{option.description}
											</p>
										)}

										{/* Render input if this is the "Other" option and it's selected */}
										{option.hasInput &&
											otherFieldName &&
											selectedValue === option.id && (
												<div className="mt-2">
													<FormField
														control={control}
														name={otherFieldName}
														render={({ field: otherField }) => (
															<FormItem>
																<FormControl>
																	<Input
																		placeholder="Please specify..."
																		className="h-8 text-sm"
																		{...otherField}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
											)}
									</div>
								</FormItem>
							))}
						</RadioGroup>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
