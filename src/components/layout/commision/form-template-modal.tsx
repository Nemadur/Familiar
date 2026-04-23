import { useEffect, memo, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	InputGroup,
	InputGroupInput,
	InputGroupButton,
	InputGroupAddon,
	InputGroupNumberInput,
} from "@/components/ui/input-group";
import {
	useCreateFormTemplate,
	useUpdateFormTemplate,
} from "@/hooks/use-form-templates";
import type { FormFieldDto } from "@/types/commissions/templates";
import { toast } from "sonner";
import {
	Loader2,
	Plus,
	Trash2,
	GripVertical,
	Type,
	AlignLeft,
	Hash,
	Calendar,
	CircleDot,
	CheckSquare,
	List,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
	OutlineCalendar,
	OutlineCheck,
	OutlineClose,
	OutlineListBoxes,
	OutlinePlus,
	OutlineTrash,
} from "@/components/icons/icons";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Surface } from "@heroui/react";
import { Badge } from "@/components/ui/badge";
import useFormValidation from "@/hooks/use-form-validation";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import {
	Sortable,
	SortableItem,
	SortableItemHandle,
} from "@/components/reui/sortable";
import {
	formTemplateSchema,
	type FormTemplateData,
} from "@/schemas/commissions/templates";

const TYPE_LABELS: Record<string, string> = {
	TEXT_INPUT: "Short Text",
	TEXTAREA: "Long Text",
	NUMBER_INPUT: "Number",
	DATE_INPUT: "Date",
	RADIO: "Radio Buttons",
	CHECKBOX: "Checkboxes",
	SELECT: "Dropdown",
};

const TYPE_ICONS: Record<string, any> = {
	TEXT_INPUT: Type,
	TEXTAREA: AlignLeft,
	NUMBER_INPUT: Hash,
	DATE_INPUT: Calendar,
	RADIO: CircleDot,
	CHECKBOX: CheckSquare,
	SELECT: List,
};

const FieldItem = memo(function FieldItem({
	field,
	index,
	isBusy,
	onRemove,
}: {
	field: any;
	index: number;
	isBusy: boolean;
	onRemove: (index: number) => void;
}) {
	const form = useFormContext<FormTemplateData>();
	const { control } = form;
	const fieldType = field.type;

	const {
		fields: optionFields,
		append,
		remove,
	} = useFieldArray({
		control,
		name: `fields.${index}.options`,
	});

	const [isDeleteFieldOpen, setIsDeleteFieldOpen] = useState(false);
	const [optionToDelete, setOptionToDelete] = useState<number | null>(null);

	const Icon = TYPE_ICONS[fieldType] || Type;

	return (
		// TODO: use sortable component
		<Surface className="flex flex-col gap-4 rounded-3xl border p-3">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<SortableItemHandle className="cursor-grab text-muted-foreground hover:text-foreground">
						<GripVertical className="size-4" />
					</SortableItemHandle>
					<FormField
						control={control}
						name={`fields.${index}.required`}
						render={({ field }) => (
							<FormItem className="flex flex-row items-center gap-3 space-y-0">
								<FormControl>
									<Switch
										checked={field.value || false}
										onCheckedChange={field.onChange}
										disabled={isBusy}
									/>
								</FormControl>
								<FormLabel className="cursor-pointer text-sm font-medium">
									Required field
								</FormLabel>
							</FormItem>
						)}
					/>
					<Badge variant={"secondary"} size={"sm"}>
						<Icon className="size-3" />
						{TYPE_LABELS[fieldType] || fieldType}
					</Badge>
				</div>
				<Button
					variant={"destructive"}
					size={"icon-xl"}
					onClick={() => setIsDeleteFieldOpen(true)}
					disabled={isBusy}
					type="button"
				>
					<OutlineTrash />
				</Button>
			</div>

			<ConfirmDialog
				open={isDeleteFieldOpen}
				onOpenChange={setIsDeleteFieldOpen}
				title="Delete Field"
				description="Are you sure you want to delete this field? This action cannot be undone."
				onConfirm={() => {
					setIsDeleteFieldOpen(false);
					onRemove(index);
				}}
				confirmText="Delete"
			/>

			<div className="space-y-4">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<FormField
						control={control}
						name={`fields.${index}.label`}
						render={({ field }) => (
							<FormItem className="relative space-y-0">
								<FormControl>
									<InputGroup variant="floating" className="peer">
										<InputGroupInput
											placeholder=" "
											disabled={isBusy}
											{...field}
										/>
									</InputGroup>
								</FormControl>
								<FormLabel className="absolute left-3 top-3 z-10 origin-left -translate-y-2 scale-75 transform text-muted-foreground duration-200 peer-has-placeholder-shown:translate-y-0 peer-has-placeholder-shown:scale-100 peer-focus-within:-translate-y-2! peer-focus-within:scale-75! cursor-text pointer-events-none">
									Field Label
								</FormLabel>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={control}
						name={`fields.${index}.description`}
						render={({ field }) => (
							<FormItem className="relative space-y-0">
								<FormControl>
									<InputGroup variant="floating" className="peer">
										<InputGroupInput
											placeholder=" "
											disabled={isBusy}
											{...field}
											value={field.value || ""}
										/>
									</InputGroup>
								</FormControl>
								<FormLabel className="absolute left-3 top-3 z-10 origin-left -translate-y-2 scale-75 transform text-muted-foreground duration-200 peer-has-placeholder-shown:translate-y-0 peer-has-placeholder-shown:scale-100 peer-focus-within:-translate-y-2! peer-focus-within:scale-75! cursor-text pointer-events-none">
									Description / Help Text
								</FormLabel>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				{fieldType === "NUMBER_INPUT" && (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
						<FormField
							control={control}
							name={`fields.${index}.minValue`}
							render={({ field }) => (
								<FormItem className="relative space-y-0">
									<FormControl>
										<InputGroup variant="floating" className="peer">
											<InputGroupNumberInput
												placeholder=" "
												disabled={isBusy}
												{...field}
												value={field.value ?? undefined}
												onChange={(e) =>
													field.onChange(
														e.target.value ? Number(e.target.value) : null,
													)
												}
											/>
										</InputGroup>
									</FormControl>
									<FormLabel className="absolute left-3 top-3 z-10 origin-left -translate-y-2 scale-75 transform text-muted-foreground duration-200 peer-has-placeholder-shown:translate-y-0 peer-has-placeholder-shown:scale-100 peer-focus-within:-translate-y-2! peer-focus-within:scale-75! cursor-text pointer-events-none">
										Minimum Value
									</FormLabel>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={control}
							name={`fields.${index}.maxValue`}
							render={({ field }) => (
								<FormItem className="relative space-y-0">
									<FormControl>
										<InputGroup variant="floating" className="peer">
											<InputGroupNumberInput
												placeholder=" "
												disabled={isBusy}
												{...field}
												value={field.value ?? undefined}
												onChange={(e) =>
													field.onChange(
														e.target.value ? Number(e.target.value) : null,
													)
												}
											/>
										</InputGroup>
									</FormControl>
									<FormLabel className="absolute left-3 top-3 z-10 origin-left -translate-y-2 scale-75 transform text-muted-foreground duration-200 peer-has-placeholder-shown:translate-y-0 peer-has-placeholder-shown:scale-100 peer-focus-within:-translate-y-2! peer-focus-within:scale-75! cursor-text pointer-events-none">
										Maximum Value
									</FormLabel>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				)}

				{["RADIO", "CHECKBOX", "SELECT"].includes(fieldType) && (
					<div className="mt-4 space-y-4 rounded-2xl border p-3">
						<FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
							Options
						</FormLabel>

						<div className="space-y-4">
							{optionFields.map((opt, optIndex) => (
								<div key={opt.id} className="flex items-start gap-2">
									<FormField
										control={control}
										name={`fields.${index}.options.${optIndex}.value`}
										render={({ field }) => <input type="hidden" {...field} />}
									/>
									<FormField
										control={control}
										name={`fields.${index}.options.${optIndex}.label`}
										render={({ field: labelField }) => (
											<FormItem className="flex-1 relative space-y-0">
												<FormControl>
													<InputGroup variant="floating" className="peer">
														<InputGroupInput
															placeholder=" "
															disabled={isBusy}
															{...labelField}
														/>
													</InputGroup>
												</FormControl>
												<FormLabel className="absolute left-3 top-3 z-10 origin-left -translate-y-2 scale-75 transform text-muted-foreground duration-200 peer-has-placeholder-shown:translate-y-0 peer-has-placeholder-shown:scale-100 peer-focus-within:-translate-y-2! peer-focus-within:scale-75! cursor-text pointer-events-none">
													Option Label
												</FormLabel>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={control}
										name={`fields.${index}.options.${optIndex}.priceModifier.type`}
										render={({ field: typeField }) => (
											<FormItem>
												<Select
													value={typeField.value || "NONE"}
													onValueChange={(val) => typeField.onChange(val)}
													disabled={isBusy}
												>
													<FormControl>
														<SelectTrigger className="w-[130px] text-sm">
															<SelectValue placeholder="Price Mod" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="NONE">No Price</SelectItem>
														<SelectItem value="FIXED">Fixed (+)</SelectItem>
														<SelectItem value="PERCENT">
															Percent (+%)
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										control={control}
										name={`fields.${index}.options.${optIndex}.priceModifier.type`}
										render={({ field: watchedTypeField }) => {
											if (
												watchedTypeField.value === "NONE" ||
												!watchedTypeField.value
											)
												return null;
											return (
												<FormField
													control={control}
													name={`fields.${index}.options.${optIndex}.priceModifier.value`}
													render={({ field: valField }) => (
														<FormItem className="relative space-y-0">
															<FormControl>
																<InputGroup
																	variant="floating"
																	className="w-28 peer"
																>
																	<InputGroupNumberInput
																		placeholder=" "
																		disabled={isBusy}
																		{...valField}
																		value={valField.value ?? ""}
																		min={0}
																		onChange={(e) => {
																			const val = e.target.value;
																			const numericVal =
																				typeof val === "string"
																					? Number(val)
																					: val || 0;

																			valField.onChange(
																				numericVal < 0 ? 0 : numericVal,
																			);

																			if (numericVal === 0) {
																				// When changing value to 0, automatically reset the type to NONE
																				const currentOptions =
																					form.getValues(
																						`fields.${index}.options`,
																					) || [];
																				const newOptions = [...currentOptions];
																				newOptions[optIndex] = {
																					...newOptions[optIndex],
																					priceModifier: {
																						...newOptions[optIndex]
																							?.priceModifier,
																						type: "NONE",
																						value: 0,
																					},
																				};
																				form.setValue(
																					`fields.${index}.options`,
																					newOptions,
																				);
																			}
																		}}
																	/>
																</InputGroup>
															</FormControl>
															<FormLabel className="absolute left-3 top-3 z-10 origin-left -translate-y-2 scale-75 transform text-muted-foreground duration-200 peer-has-placeholder-shown:translate-y-0 peer-has-placeholder-shown:scale-100 peer-focus-within:-translate-y-2! peer-focus-within:scale-75! cursor-text pointer-events-none">
																Value
															</FormLabel>
															<FormMessage />
														</FormItem>
													)}
												/>
											);
										}}
									/>

									<Button
										variant={"destructive"}
										size={"icon-xl"}
										type="button"
										onClick={() => setOptionToDelete(optIndex)}
										disabled={isBusy}
									>
										<OutlineTrash />
									</Button>
								</div>
							))}

							<ConfirmDialog
								open={optionToDelete !== null}
								onOpenChange={(open) => !open && setOptionToDelete(null)}
								title="Delete Option"
								description="Are you sure you want to delete this option? This action cannot be undone."
								onConfirm={() => {
									if (optionToDelete !== null) {
										remove(optionToDelete);
										setOptionToDelete(null);
									}
								}}
								confirmText="Delete"
							/>
						</div>

						<Button
							variant="secondary"
							type="button"
							onClick={() => {
								append({
									label: `Option ${optionFields.length + 1}`,
									value: `opt_${optionFields.length + 1}`,
									priceModifier: { type: "NONE", value: 0 },
								});
							}}
							disabled={isBusy}
						>
							<Plus /> Add Option
						</Button>
					</div>
				)}
			</div>
		</Surface>
	);
});

interface FormTemplateModalProps {
	open: boolean;
	onClose: () => void;
	template?: any;
}

export function FormTemplateModal({
	open,
	onClose,
	template,
}: FormTemplateModalProps) {
	const createMutation = useCreateFormTemplate();
	const updateMutation = useUpdateFormTemplate();
	const isBusy = createMutation.isPending || updateMutation.isPending;

	const form = useFormValidation<FormTemplateData>({
		schema: formTemplateSchema,
		initialData: {
			name: "",
			description: "",
			fields: [],
		},
	});

	const { handleSubmit, control, setFormData, formState, getValues, reset } =
		form;

	const {
		fields: fieldItems,
		append: appendField,
		remove: removeField,
		move: moveField,
	} = useFieldArray({
		control,
		name: "fields",
	});

	useEffect(() => {
		if (template) {
			setFormData(() => ({
				name: template.name || "",
				description: template.description || "",
				fields: template.fields || [],
			}));
		} else {
			setFormData(() => ({
				name: "",
				description: "",
				fields: [],
			}));
		}
	}, [template, setFormData]); // eslint-disable-line react-hooks/exhaustive-deps

	const onSubmit = async (data: FormTemplateData) => {
		try {
			const cleanData = {
				name: data.name,
				description: data.description || undefined,
				fields: data.fields.map((f: any) => ({
					type: f.type,
					label: f.label,
					description: f.description || undefined,
					required: f.required || false,
					minValue: f.minValue ?? undefined,
					maxValue: f.maxValue ?? undefined,
					systemKey: f.systemKey || undefined,
					priceModifier: f.priceModifier || { type: "NONE", value: 0 },
					options:
						["RADIO", "CHECKBOX", "SELECT"].includes(f.type) &&
						f.options?.length
							? f.options.map((o: any) => ({
									label: o.label,
									value: o.value,
									priceModifier: o.priceModifier || { type: "NONE", value: 0 },
									hasFollowupText: o.hasFollowupText ?? false,
									followupLabel: o.followupLabel ?? undefined,
									followupRequired: o.followupRequired ?? false,
								}))
							: undefined,
				})),
			};

			if (template) {
				await updateMutation.mutateAsync({
					templateId: template.id,
					data: {
						version: template.version,
						...cleanData,
					},
				});
				toast.success("Template updated successfully");
			} else {
				await createMutation.mutateAsync(cleanData as any);
				toast.success("Template created successfully");
			}
			onClose();
		} catch (error: any) {
			toast.error(error.message || "Failed to save template");
		}
	};

	const handleAddField = (type: FormFieldDto["type"]) => {
		appendField({
			type,
			label: "New Field",
			required: false,
			options: ["RADIO", "CHECKBOX", "SELECT"].includes(type)
				? [
						{
							label: "Option 1",
							value: "opt_1",
							priceModifier: { type: "NONE", value: 0 },
						},
					]
				: undefined,
		});
	};

	const handleFormSubmit = (e?: React.BaseSyntheticEvent) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		handleSubmit(
			(data) => {
				onSubmit(data);
			},
			(errors) => {
				console.error("Form validation failed:", errors);
				console.error(
					"Detailed validation errors:",
					JSON.stringify(errors, null, 2),
				);
			},
		)(e);
	};

	return (
		<Dialog open={open} onOpenChange={(val) => !val && !isBusy && onClose()}>
			<DialogContent
				showCloseButton={false}
				className="flex max-h-[70vh] min-w-5xl w-[95vw] flex-col overflow-hidden p-0"
			>
				<Form {...form}>
					<form
						onSubmit={handleFormSubmit}
						className="flex h-full min-h-[600px] overflow-hidden"
					>
						<div className="flex w-[320px] shrink-0 flex-col border-r bg-muted/20 p-6">
							<DialogHeader className="mb-6 space-y-1 text-left">
								<DialogTitle>
									{template ? "Edit Form Template" : "Create Form Template"}
								</DialogTitle>
								<DialogDescription className="text-xs">
									Define the fields that clients must fill out when requesting a
									commission.
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-6">
								<FormField
									control={control}
									name="name"
									render={({ field }) => (
										<FormItem className="relative space-y-0">
											<FormControl>
												<InputGroup variant="floating">
													<InputGroupInput disabled={isBusy} {...field} />
												</InputGroup>
											</FormControl>
											<FormLabel className="absolute left-3 top-3 z-10 origin-left -translate-y-2 scale-75 transform text-muted-foreground duration-200 peer-has-[:placeholder-shown]:translate-y-0 peer-has-[:placeholder-shown]:scale-100 peer-focus-within:!-translate-y-2 peer-focus-within:!scale-75 cursor-text pointer-events-none">
												Template Name{" "}
												<span className="text-destructive">*</span>
											</FormLabel>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={control}
									name="description"
									render={({ field }) => (
										<FormItem className="relative space-y-0">
											<FormControl>
												<InputGroup variant="floating" className="peer">
													<Textarea
														placeholder=" "
														disabled={isBusy}
														className="peer pt-6 pb-2 min-h-[120px] resize-none border-none"
														{...field}
														value={field.value || ""}
													/>
												</InputGroup>
											</FormControl>
											<FormLabel className="absolute left-3 top-3 z-10 origin-left -translate-y-2 scale-75 transform text-muted-foreground duration-200 peer-has-[:placeholder-shown]:translate-y-0 peer-has-[:placeholder-shown]:scale-100 peer-focus-within:!-translate-y-2 peer-focus-within:!scale-75 cursor-text pointer-events-none">
												Description
											</FormLabel>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className="mt-auto flex gap-2 pt-6">
								<Button
									variant="outline"
									onClick={onClose}
									disabled={isBusy}
									size="xl"
									type="button"
								>
									Cancel
								</Button>

								<Button
									type="button"
									onClick={handleFormSubmit}
									size="xl"
									disabled={isBusy}
									className="flex-1"
								>
									{isBusy ? (
										<span className="flex items-center gap-2">
											<Loader2 className="size-4 animate-spin" /> Saving...
										</span>
									) : (
										"Save"
									)}
								</Button>
							</div>
						</div>

						<div className="flex flex-1 flex-col overflow-hidden bg-background">
							<div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
								<h3 className="text-sm font-semibold">
									Form Fields ({fieldItems.length})
								</h3>

								<div className="flex gap-2">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="outline" disabled={isBusy} type="button">
												<OutlinePlus />
												Add Field
											</Button>
										</DropdownMenuTrigger>

										<DropdownMenuContent align="end" className="w-48">
											<DropdownMenuItem
												onClick={() => handleAddField("TEXT_INPUT")}
											>
												<Type /> Short Text
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleAddField("TEXTAREA")}
											>
												<AlignLeft /> Long Text
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleAddField("NUMBER_INPUT")}
											>
												<Hash /> Number
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleAddField("DATE_INPUT")}
											>
												<OutlineCalendar /> Date
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => handleAddField("RADIO")}>
												<CircleDot /> Radio Buttons
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleAddField("CHECKBOX")}
											>
												<OutlineCheck /> Checkboxes
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() => handleAddField("SELECT")}
											>
												<OutlineListBoxes /> Dropdown
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>

									<Button
										variant="ghost"
										size="icon"
										disabled={isBusy}
										onClick={onClose}
										type="button"
									>
										<OutlineClose />
									</Button>
								</div>
							</div>

							<div className="flex-1 overflow-y-auto bg-muted/5 p-6">
								{fieldItems.length === 0 ? (
									<div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
										<div className="mb-4 rounded-full bg-muted p-3">
											<Plus className="size-6" />
										</div>
										<p>No fields added yet.</p>
										<p>Click "Add Field" to start building your form.</p>
									</div>
								) : (
									<Sortable
										value={fieldItems as any[]}
										onValueChange={() => {}}
										getItemValue={(item) => item.id}
										onMove={({ activeIndex, overIndex }) => {
											moveField(activeIndex, overIndex);
										}}
										className="mx-auto max-w-3xl space-y-4"
									>
										{fieldItems.map((field, index) => (
											<SortableItem key={field.id} value={field.id}>
												<FieldItem
													field={field}
													index={index}
													isBusy={isBusy}
													onRemove={removeField}
												/>
											</SortableItem>
										))}
									</Sortable>
								)}
							</div>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
