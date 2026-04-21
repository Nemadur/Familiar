import { useState, useEffect, useCallback, useRef, memo } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	useCreateFormTemplate,
	useUpdateFormTemplate,
} from "@/hooks/use-form-templates";
import type { FormFieldDto } from "@/types/commissions/templates";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { OutlineClose, OutlinePlus } from "@/components/icons/icons";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const TYPE_LABELS: Record<string, string> = {
	TEXT_INPUT: "Short Text",
	TEXTAREA: "Long Text",
	NUMBER_INPUT: "Number",
	DATE_INPUT: "Date",
	RADIO: "Radio Buttons",
	CHECKBOX: "Checkboxes",
	SELECT: "Dropdown",
};

type FormFieldOption = NonNullable<FormFieldDto["options"]>[number];

const FIELD_COMMIT_DEBOUNCE_MS = 150;

const FieldItem = memo(
	({
		field,
		index,
		isBusy,
		onCommit,
		onRemove,
	}: {
		field: FormFieldDto;
		index: number;
		isBusy: boolean;
		onCommit: (index: number, nextField: FormFieldDto) => void;
		onRemove: (index: number) => void;
	}) => {
		const [draftField, setDraftField] = useState<FormFieldDto>(field);
		const commitTimerRef = useRef<number | null>(null);

		useEffect(() => {
			setDraftField(field);
		}, [field]);

		useEffect(() => {
			return () => {
				if (commitTimerRef.current !== null) {
					window.clearTimeout(commitTimerRef.current);
				}
			};
		}, []);

		const commitNow = useCallback(
			(nextField?: FormFieldDto) => {
				if (commitTimerRef.current !== null) {
					window.clearTimeout(commitTimerRef.current);
					commitTimerRef.current = null;
				}

				onCommit(index, nextField ?? draftField);
			},
			[draftField, index, onCommit],
		);

		const scheduleCommit = useCallback(
			(nextField: FormFieldDto) => {
				if (commitTimerRef.current !== null) {
					window.clearTimeout(commitTimerRef.current);
				}

				commitTimerRef.current = window.setTimeout(() => {
					onCommit(index, nextField);
					commitTimerRef.current = null;
				}, FIELD_COMMIT_DEBOUNCE_MS);
			},
			[index, onCommit],
		);

		const updateDraft = useCallback(
			(updates: Partial<FormFieldDto>) => {
				setDraftField((prev) => {
					const nextField = { ...prev, ...updates };
					scheduleCommit(nextField);
					return nextField;
				});
			},
			[scheduleCommit],
		);

		const updateOptions = useCallback(
			(updater: (prev: FormFieldOption[]) => FormFieldOption[]) => {
				setDraftField((prev) => {
					const nextOptions = updater([...(prev.options ?? [])]);
					const nextField = { ...prev, options: nextOptions };
					scheduleCommit(nextField);
					return nextField;
				});
			},
			[scheduleCommit],
		);

		return (
			<div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="cursor-grab text-muted-foreground hover:text-foreground">
							<GripVertical className="size-5" />
						</div>
						<div className="inline-flex items-center rounded-full border border-transparent bg-foreground px-2.5 py-0.5 text-xs font-semibold text-background">
							{TYPE_LABELS[draftField.type] || draftField.type}
						</div>
					</div>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
						onClick={() => onRemove(index)}
						disabled={isBusy}
					>
						<Trash2 className="size-4" />
					</Button>
				</div>

				<div className="space-y-4 pl-8">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="relative">
							<Input
								id={`label-${index}`}
								value={draftField.label}
								onChange={(e) => updateDraft({ label: e.target.value })}
								onBlur={() => commitNow()}
								placeholder=" "
								disabled={isBusy}
								className="peer pt-5 pb-1 h-12"
							/>
							<Label
								htmlFor={`label-${index}`}
								className="absolute left-3 top-4 z-10 origin-left -translate-y-2.5 scale-75 transform text-muted-foreground duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 cursor-text"
							>
								Field Label
							</Label>
						</div>

						<div className="relative">
							<Input
								id={`desc-${index}`}
								value={draftField.description || ""}
								onChange={(e) =>
									updateDraft({
										description: e.target.value,
									})
								}
								onBlur={() => commitNow()}
								placeholder=" "
								disabled={isBusy}
								className="peer pt-5 pb-1 h-12"
							/>
							<Label
								htmlFor={`desc-${index}`}
								className="absolute left-3 top-4 z-10 origin-left -translate-y-2.5 scale-75 transform text-muted-foreground duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 cursor-text"
							>
								Description / Help Text
							</Label>
						</div>
					</div>

					{draftField.type === "NUMBER_INPUT" && (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
							<div className="relative">
								<Input
									id={`min-${index}`}
									type="number"
									value={draftField.minValue ?? ""}
									onChange={(e) =>
										updateDraft({
											minValue: e.target.value
												? Number(e.target.value)
												: undefined,
										})
									}
									onBlur={() => commitNow()}
									placeholder=" "
									disabled={isBusy}
									className="peer pt-5 pb-1 h-12"
								/>
								<Label
									htmlFor={`min-${index}`}
									className="absolute left-3 top-4 z-10 origin-left -translate-y-2.5 scale-75 transform text-muted-foreground duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 cursor-text"
								>
									Minimum Value
								</Label>
							</div>
							<div className="relative">
								<Input
									id={`max-${index}`}
									type="number"
									value={draftField.maxValue ?? ""}
									onChange={(e) =>
										updateDraft({
											maxValue: e.target.value
												? Number(e.target.value)
												: undefined,
										})
									}
									onBlur={() => commitNow()}
									placeholder=" "
									disabled={isBusy}
									className="peer pt-5 pb-1 h-12"
								/>
								<Label
									htmlFor={`max-${index}`}
									className="absolute left-3 top-4 z-10 origin-left -translate-y-2.5 scale-75 transform text-muted-foreground duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 cursor-text"
								>
									Maximum Value
								</Label>
							</div>
						</div>
					)}

					<div className="flex items-center gap-3 pt-1">
						<Switch
							id={`req-${index}`}
							checked={draftField.required || false}
							onCheckedChange={(checked) => {
								const nextField = {
									...draftField,
									required: checked,
								};
								setDraftField(nextField);
								commitNow(nextField);
							}}
							disabled={isBusy}
						/>
						<Label
							htmlFor={`req-${index}`}
							className="cursor-pointer text-sm font-medium"
						>
							Required field
						</Label>
					</div>

					{["RADIO", "CHECKBOX", "SELECT"].includes(draftField.type) && (
						<div className="mt-4 space-y-4 rounded-xl border p-4">
							<Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Options
							</Label>

							<div className="space-y-4">
								{(draftField.options || []).map((opt, optIndex) => (
									<div
										key={`${opt.value ?? "option"}-${optIndex}`}
										className="flex flex-col gap-2"
									>
										<div className="flex items-center gap-2">
											<Input
												value={opt.label}
												onChange={(e) => {
													const nextLabel = e.target.value;
													updateOptions((prev) => {
														prev[optIndex] = {
															...prev[optIndex],
															label: nextLabel,
															value: nextLabel
																.toLowerCase()
																.replace(/\s+/g, "_"),
														};
														return prev;
													});
												}}
												onBlur={() => commitNow()}
												placeholder="Option Label"
												className="h-9 text-sm"
												disabled={isBusy}
											/>

											<Button
												variant="ghost"
												size="icon"
												className="h-9 w-9 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
												onClick={() => {
													updateOptions((prev) => {
														prev.splice(optIndex, 1);
														return prev;
													});
													commitNow();
												}}
												disabled={isBusy}
											>
												<Trash2 className="size-4" />
											</Button>
										</div>
										<div className="flex items-center gap-2">
											<Select
												value={opt.priceModifier?.type || "NONE"}
												onValueChange={(val) => {
													updateOptions((prev) => {
														prev[optIndex] = {
															...prev[optIndex],
															priceModifier: {
																type: val as "NONE" | "FIXED" | "PERCENT",
																value: prev[optIndex].priceModifier?.value || 0,
															},
														};
														return prev;
													});
													commitNow();
												}}
												disabled={isBusy}
											>
												<SelectTrigger className="h-9 w-[130px] text-sm">
													<SelectValue placeholder="Price Mod" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="NONE">No Price</SelectItem>
													<SelectItem value="FIXED">Fixed (+)</SelectItem>
													<SelectItem value="PERCENT">Percent (+%)</SelectItem>
												</SelectContent>
											</Select>

											{opt.priceModifier?.type &&
												opt.priceModifier.type !== "NONE" && (
													<Input
														type="number"
														className="h-9 w-28 text-sm"
														placeholder="Value"
														value={opt.priceModifier.value || ""}
														onChange={(e) => {
															updateOptions((prev) => {
																prev[optIndex] = {
																	...prev[optIndex],
																	priceModifier: {
																		type: prev[optIndex].priceModifier!.type,
																		value: parseFloat(e.target.value) || 0,
																	},
																};
																return prev;
															});
														}}
														onBlur={() => commitNow()}
														disabled={isBusy}
													/>
												)}
										</div>
									</div>
								))}
							</div>

							<Button
								variant="secondary"
								size="sm"
								className="h-9 text-xs"
								onClick={() => {
									updateOptions((prev) => {
										prev.push({
											label: `Option ${prev.length + 1}`,
											value: `opt_${prev.length + 1}`,
										});
										return prev;
									});
								}}
								disabled={isBusy}
							>
								<Plus className="mr-1 size-3" /> Add Option
							</Button>
						</div>
					)}
				</div>
			</div>
		);
	},
);

FieldItem.displayName = "FieldItem";

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
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [fields, setFields] = useState<FormFieldDto[]>([]);

	const createMutation = useCreateFormTemplate();
	const updateMutation = useUpdateFormTemplate();

	useEffect(() => {
		if (template) {
			setName(template.name || "");
			setDescription(template.description || "");
			setFields(template.fields || []);
			return;
		}

		setName("");
		setDescription("");
		setFields([]);
	}, [template]);

	const handleSave = async () => {
		if (!name.trim()) {
			toast.error("Template name is required");
			return;
		}

		try {
			if (template) {
				await updateMutation.mutateAsync({
					templateId: template.id,
					data: {
						version: template.version,
						name,
						description,
						fields,
					},
				});
				toast.success("Template updated successfully");
			} else {
				await createMutation.mutateAsync({
					name,
					description,
					fields,
				});
				toast.success("Template created successfully");
			}

			onClose();
		} catch (error: any) {
			toast.error(error.message || "Failed to save template");
		}
	};

	const addField = useCallback((type: FormFieldDto["type"]) => {
		setFields((prev) => [
			...prev,
			{
				label: "New Field",
				type,
				required: false,
			},
		]);
	}, []);

	const removeField = useCallback((index: number) => {
		setFields((prev) =>
			prev.filter((_, currentIndex) => currentIndex !== index),
		);
	}, []);

	const commitField = useCallback((index: number, nextField: FormFieldDto) => {
		setFields((prev) =>
			prev.map((field, currentIndex) =>
				currentIndex === index ? nextField : field,
			),
		);
	}, []);

	const isBusy = createMutation.isPending || updateMutation.isPending;

	return (
		<Dialog open={open} onOpenChange={(val) => !val && !isBusy && onClose()}>
			<DialogContent
				showCloseButton={false}
				className="flex max-h-[70vh] min-w-5xl w-[95vw] flex-col overflow-hidden p-0"
			>
				<div className="flex h-full min-h-[600px] overflow-hidden">
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
							<div className="relative">
								<Input
									id="template-name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder=" "
									disabled={isBusy}
									className="peer pt-5 pb-1 h-12"
								/>
								<Label
									htmlFor="template-name"
									className="absolute left-3 top-4 z-10 origin-left -translate-y-2.5 scale-75 transform text-muted-foreground duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 cursor-text"
								>
									Template Name *
								</Label>
							</div>

							<div className="relative">
								<Textarea
									id="template-desc"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder=" "
									disabled={isBusy}
									className="peer pt-6 pb-2 min-h-[120px] resize-none"
								/>
								<Label
									htmlFor="template-desc"
									className="absolute left-3 top-4 z-10 origin-left -translate-y-2.5 scale-75 transform text-muted-foreground duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 cursor-text"
								>
									Description
								</Label>
							</div>
						</div>

						<div className="mt-auto flex gap-2 pt-6">
							<Button
								variant="outline"
								onClick={onClose}
								disabled={isBusy}
								size="xl"
							>
								Cancel
							</Button>

							<Button
								onClick={handleSave}
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
								Form Fields ({fields.length})
							</h3>

							<div className="flex gap-2">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											disabled={isBusy}
											className="gap-2"
										>
											<OutlinePlus />
											Add Field
										</Button>
									</DropdownMenuTrigger>

									<DropdownMenuContent align="end" className="w-48">
										<DropdownMenuItem onClick={() => addField("TEXT_INPUT")}>
											Short Text
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => addField("TEXTAREA")}>
											Long Text
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => addField("NUMBER_INPUT")}>
											Number
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => addField("DATE_INPUT")}>
											Date
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => addField("RADIO")}>
											Radio Buttons
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => addField("CHECKBOX")}>
											Checkboxes
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => addField("SELECT")}>
											Dropdown
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>

								<Button
									variant="ghost"
									size="icon"
									disabled={isBusy}
									onClick={onClose}
								>
									<OutlineClose />
								</Button>
							</div>
						</div>

						<div className="flex-1 overflow-y-auto bg-muted/5 p-6">
							{fields.length === 0 ? (
								<div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
									<div className="mb-4 rounded-full bg-muted p-3">
										<Plus className="size-6" />
									</div>
									<p>No fields added yet.</p>
									<p>Click "Add Field" to start building your form.</p>
								</div>
							) : (
								<div className="mx-auto max-w-3xl space-y-4">
									{fields.map((field, index) => (
										<FieldItem
											key={field.fieldId ?? `${field.type}-${index}`}
											field={field}
											index={index}
											isBusy={isBusy}
											onCommit={commitField}
											onRemove={removeField}
										/>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
