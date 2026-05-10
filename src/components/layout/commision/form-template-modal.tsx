import { Surface } from "@heroui/react";
import { memo, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import {
	AlignLeft,
	Calendar,
	CheckSquare,
	CircleDot,
	GripVertical,
	Hash,
	List,
	Loader2,
	Plus,
	Type,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/layout/confirm-dialog";
import { CommissionRequestModal } from "@/components/layout/modal/commission-request/modal";
import {
	OutlineCalendar,
	OutlineCheck,
	OutlineClose,
	OutlineEye,
	OutlineListBoxes,
	OutlinePlus,
	OutlineTrash,
} from "@/components/icons/icons";
import {
	Sortable,
	SortableItem,
	SortableItemHandle,
} from "@/components/reui/sortable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
	InputGroupNumberInput,
} from "@/components/ui/input-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
	useCreateFormTemplate,
	useUpdateFormTemplate,
} from "@/hooks/use-form-templates";
import useFormValidation from "@/hooks/use-form-validation";
import {
	formTemplateSchema,
	type FormTemplateData,
} from "@/schemas/commissions/templates";
import type { FormFieldDto } from "@/types/commissions/templates";

const FLOATING_LABEL_CLASSES =
	"absolute left-3 top-3 z-10 origin-left -translate-y-2 scale-75 transform text-muted-foreground duration-200 peer-has-placeholder-shown:translate-y-0 peer-has-placeholder-shown:scale-100 peer-focus-within:-translate-y-2! peer-focus-within:scale-75! cursor-text pointer-events-none";

const FIELD_TYPES_WITH_OPTIONS = ["RADIO", "CHECKBOX", "SELECT"];

const TYPE_LABELS: Record<string, string> = {
	TEXT_INPUT: "Short Text",
	TEXTAREA: "Long Text",
	NUMBER_INPUT: "Number",
	DATE_INPUT: "Date",
	RADIO: "Radio Buttons",
	CHECKBOX: "Checkboxes",
	SELECT: "Dropdown",
};

const TYPE_ICONS: Record<string, typeof Type> = {
	TEXT_INPUT: Type,
	TEXTAREA: AlignLeft,
	NUMBER_INPUT: Hash,
	DATE_INPUT: Calendar,
	RADIO: CircleDot,
	CHECKBOX: CheckSquare,
	SELECT: List,
};

interface FormTemplateModalProps {
	open: boolean;
	onClose: () => void;
	template?: any;
}

type FormTemplateField = FormTemplateData["fields"][number];
type FormTemplateOption = NonNullable<FormTemplateField["options"]>[number];
type RemoveByIndex = (index: number) => void;

function getTemplateInitialData(template?: any): FormTemplateData {
	return {
		name: template?.name || "",
		description: template?.description || "",
		fields: template?.fields || [],
	};
}

function fieldTypeHasOptions(type: string) {
	return FIELD_TYPES_WITH_OPTIONS.includes(type);
}

function buildDefaultOption(nextIndex: number): FormTemplateOption {
	return {
		label: `Option ${nextIndex}`,
		value: `opt_${nextIndex}`,
		priceModifier: { type: "NONE", value: 0 },
	};
}

function buildDefaultField(type: FormFieldDto["type"]): FormTemplateField {
	return {
		type,
		label: "New Field",
		required: false,
		options: fieldTypeHasOptions(type) ? [buildDefaultOption(1)] : undefined,
	};
}

function buildTemplatePayload(data: FormTemplateData) {
	return {
		name: data.name,
		description: data.description || undefined,
		fields: data.fields.map((field: any) => ({
			type: field.type,
			label: field.label,
			description: field.description || undefined,
			required: field.required || false,
			minValue: field.minValue ?? undefined,
			maxValue: field.maxValue ?? undefined,
			systemKey: field.systemKey || undefined,
			priceModifier: field.priceModifier || { type: "NONE", value: 0 },
			options:
				fieldTypeHasOptions(field.type) && field.options?.length
					? field.options.map((option: any) => ({
							label: option.label,
							value: option.value,
							priceModifier: option.priceModifier || {
								type: "NONE",
								value: 0,
							},
							hasFollowupText: option.hasFollowupText ?? false,
							followupLabel: option.followupLabel ?? undefined,
							followupRequired: option.followupRequired ?? false,
						}))
					: undefined,
		})),
	};
}

function HiddenOptionValueField({
	fieldIndex,
	optionIndex,
}: {
	fieldIndex: number;
	optionIndex: number;
}) {
	const { control } = useFormContext<FormTemplateData>();

	return (
		<FormField
			control={control}
			name={`fields.${fieldIndex}.options.${optionIndex}.value`}
			render={({ field }) => <input type="hidden" {...field} />}
		/>
	);
}

function OptionLabelField({
	fieldIndex,
	optionIndex,
	isBusy,
}: {
	fieldIndex: number;
	optionIndex: number;
	isBusy: boolean;
}) {
	const { control } = useFormContext<FormTemplateData>();

	return (
		<FormField
			control={control}
			name={`fields.${fieldIndex}.options.${optionIndex}.label`}
			render={({ field }) => (
				<FormItem className="relative flex-1 space-y-0">
					<FormControl>
						<InputGroup variant="floating" className="peer">
							<InputGroupInput placeholder=" " disabled={isBusy} {...field} />
						</InputGroup>
					</FormControl>
					<FormLabel className={FLOATING_LABEL_CLASSES}>Option Label</FormLabel>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

function OptionPriceValueField({
	fieldIndex,
	optionIndex,
	isBusy,
}: {
	fieldIndex: number;
	optionIndex: number;
	isBusy: boolean;
}) {
	const { control } = useFormContext<FormTemplateData>();

	return (
		<FormField
			control={control}
			name={`fields.${fieldIndex}.options.${optionIndex}.priceModifier.value`}
			render={({ field }) => (
				<FormItem className="relative space-y-0">
					<FormControl>
						<InputGroup variant="floating" className="w-28 peer">
							<InputGroupNumberInput
								placeholder=" "
								disabled={isBusy}
								{...field}
								value={field.value ?? undefined}
								min={0}
								onChange={(event) => {
									const value = event.target.value;
									const numericValue =
										typeof value === "string" ? Number(value) : value || 0;

									field.onChange(numericValue < 0 ? 0 : numericValue);
								}}
							/>
						</InputGroup>
					</FormControl>
					<FormLabel className={FLOATING_LABEL_CLASSES}>Value</FormLabel>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

function OptionPriceTypeField({
	fieldIndex,
	optionIndex,
	isBusy,
}: {
	fieldIndex: number;
	optionIndex: number;
	isBusy: boolean;
}) {
	const { control } = useFormContext<FormTemplateData>();

	return (
		<FormField
			control={control}
			name={`fields.${fieldIndex}.options.${optionIndex}.priceModifier.type`}
			render={({ field }) => (
				<FormItem>
					<Select
						value={field.value || "NONE"}
						onValueChange={field.onChange}
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
							<SelectItem value="PERCENT">Percent (+%)</SelectItem>
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

function DeleteOptionAction({
	fieldIndex,
	optionIndex,
	isBusy,
	onRemove,
}: {
	fieldIndex: number;
	optionIndex: number;
	isBusy: boolean;
	onRemove: RemoveByIndex;
}) {
	const { getValues } = useFormContext<FormTemplateData>();
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	return (
		<>
			<Button
				variant="destructive"
				size="icon-xl"
				type="button"
				onClick={() => setIsDeleteOpen(true)}
				disabled={isBusy}
			>
				<OutlineTrash />
			</Button>

			<ConfirmDialog
				open={isDeleteOpen}
				onOpenChange={setIsDeleteOpen}
				title="Delete Option"
				description={
					<>
						Are you sure you want to delete the option{" "}
						<span className="font-semibold text-foreground">
							"
							{getValues(`fields.${fieldIndex}.options.${optionIndex}.label`) ||
								"Unnamed Option"}
							"
						</span>
						? This action cannot be undone.
					</>
				}
				onConfirm={() => {
					onRemove(optionIndex);
					setIsDeleteOpen(false);
				}}
				confirmText="Delete"
			/>
		</>
	);
}

const OptionItem = memo(function OptionItem({
	fieldIndex,
	optionIndex,
	option,
	isBusy,
	onRemove,
}: {
	fieldIndex: number;
	optionIndex: number;
	option: any;
	isBusy: boolean;
	onRemove: RemoveByIndex;
}) {
	const { control } = useFormContext<FormTemplateData>();
	const priceModifierType = useWatch({
		control,
		name: `fields.${fieldIndex}.options.${optionIndex}.priceModifier.type`,
	});

	return (
		<SortableItem value={option.id} className="outline-none" tabIndex={-1}>
			<div className="flex items-start gap-2">
				<SortableItemHandle className="mt-3 cursor-grab text-muted-foreground hover:text-foreground">
					<GripVertical className="size-4" />
				</SortableItemHandle>

				<HiddenOptionValueField
					fieldIndex={fieldIndex}
					optionIndex={optionIndex}
				/>

				<OptionLabelField
					fieldIndex={fieldIndex}
					optionIndex={optionIndex}
					isBusy={isBusy}
				/>

				{priceModifierType && priceModifierType !== "NONE" && (
					<OptionPriceValueField
						fieldIndex={fieldIndex}
						optionIndex={optionIndex}
						isBusy={isBusy}
					/>
				)}

				<OptionPriceTypeField
					fieldIndex={fieldIndex}
					optionIndex={optionIndex}
					isBusy={isBusy}
				/>

				<DeleteOptionAction
					fieldIndex={fieldIndex}
					optionIndex={optionIndex}
					isBusy={isBusy}
					onRemove={onRemove}
				/>
			</div>
		</SortableItem>
	);
});

function FieldRequiredSwitch({
	fieldIndex,
	isBusy,
}: {
	fieldIndex: number;
	isBusy: boolean;
}) {
	const { control } = useFormContext<FormTemplateData>();

	return (
		<FormField
			control={control}
			name={`fields.${fieldIndex}.required`}
			render={({ field }) => (
				<FormItem className="flex flex-row items-center gap-3">
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
	);
}

function FieldTypeBadge({ fieldType }: { fieldType: string }) {
	const Icon = TYPE_ICONS[fieldType] || Type;

	return (
		<Badge variant="secondary" size="sm">
			<Icon className="size-3" />
			{TYPE_LABELS[fieldType] || fieldType}
		</Badge>
	);
}

function DeleteFieldAction({
	isBusy,
	onRemove,
}: {
	isBusy: boolean;
	onRemove: () => void;
}) {
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);

	return (
		<>
			<Button
				variant="destructive"
				size="icon-xl"
				onClick={() => setIsDeleteOpen(true)}
				disabled={isBusy}
				type="button"
			>
				<OutlineTrash />
			</Button>

			<ConfirmDialog
				open={isDeleteOpen}
				onOpenChange={setIsDeleteOpen}
				title="Delete Field"
				description="Are you sure you want to delete this field? This action cannot be undone."
				onConfirm={() => {
					setIsDeleteOpen(false);
					onRemove();
				}}
				confirmText="Delete"
			/>
		</>
	);
}

function FieldHeader({
	fieldType,
	fieldIndex,
	isBusy,
	onRemove,
}: {
	fieldType: string;
	fieldIndex: number;
	isBusy: boolean;
	onRemove: () => void;
}) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center gap-3">
				<SortableItemHandle className="cursor-grab text-muted-foreground hover:text-foreground">
					<GripVertical className="size-4" />
				</SortableItemHandle>
				<FieldRequiredSwitch fieldIndex={fieldIndex} isBusy={isBusy} />
				<FieldTypeBadge fieldType={fieldType} />
			</div>

			<DeleteFieldAction isBusy={isBusy} onRemove={onRemove} />
		</div>
	);
}

function FieldTextInput({
	name,
	label,
	isBusy,
	textarea = false,
}: {
	name: any;
	label: React.ReactNode;
	isBusy: boolean;
	textarea?: boolean;
}) {
	const { control } = useFormContext<FormTemplateData>();

	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className="relative space-y-0">
					<FormControl>
						<InputGroup variant="floating" className="peer">
							{textarea ? (
								<Textarea
									placeholder=" "
									disabled={isBusy}
									className="peer min-h-[120px] resize-none border-none pt-6 pb-2"
									{...field}
									value={field.value || ""}
								/>
							) : (
								<InputGroupInput
									placeholder=" "
									disabled={isBusy}
									{...field}
									value={field.value || ""}
								/>
							)}
						</InputGroup>
					</FormControl>
					<FormLabel className={FLOATING_LABEL_CLASSES}>{label}</FormLabel>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

function FieldBasicSettings({
	fieldIndex,
	isBusy,
}: {
	fieldIndex: number;
	isBusy: boolean;
}) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<FieldTextInput
				name={`fields.${fieldIndex}.label`}
				label="Field Label"
				isBusy={isBusy}
			/>
			<FieldTextInput
				name={`fields.${fieldIndex}.description`}
				label="Description / Help Text"
				isBusy={isBusy}
			/>
		</div>
	);
}

function NumberFieldLimit({
	fieldIndex,
	name,
	label,
	isBusy,
}: {
	fieldIndex: number;
	name: "minValue" | "maxValue";
	label: string;
	isBusy: boolean;
}) {
	const { control } = useFormContext<FormTemplateData>();

	return (
		<FormField
			control={control}
			name={`fields.${fieldIndex}.${name}`}
			render={({ field }) => (
				<FormItem className="relative space-y-0">
					<FormControl>
						<InputGroup variant="floating" className="peer">
							<InputGroupNumberInput
								placeholder=" "
								disabled={isBusy}
								{...field}
								value={field.value ?? undefined}
								onChange={(event) =>
									field.onChange(
										event.target.value ? Number(event.target.value) : null,
									)
								}
							/>
						</InputGroup>
					</FormControl>
					<FormLabel className={FLOATING_LABEL_CLASSES}>{label}</FormLabel>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}

function NumberFieldSettings({
	fieldIndex,
	isBusy,
}: {
	fieldIndex: number;
	isBusy: boolean;
}) {
	return (
		<div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
			<NumberFieldLimit
				fieldIndex={fieldIndex}
				name="minValue"
				label="Minimum Value"
				isBusy={isBusy}
			/>
			<NumberFieldLimit
				fieldIndex={fieldIndex}
				name="maxValue"
				label="Maximum Value"
				isBusy={isBusy}
			/>
		</div>
	);
}

function FieldOptionsSection({
	fieldIndex,
	isBusy,
}: {
	fieldIndex: number;
	isBusy: boolean;
}) {
	const { control } = useFormContext<FormTemplateData>();

	const {
		fields: optionFields,
		append,
		remove,
		move,
	} = useFieldArray({
		control,
		name: `fields.${fieldIndex}.options`,
	});

	return (
		<div className="mt-4 space-y-4 rounded-2xl border p-3">
			<FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
				Options
			</FormLabel>

			<Sortable
				value={optionFields as any[]}
				onValueChange={() => {}}
				getItemValue={(item) => item.id}
				onMove={({ activeIndex, overIndex }) => {
					move(activeIndex, overIndex);
				}}
				className="space-y-4"
			>
				{optionFields.map((option, optionIndex) => (
					<OptionItem
						key={option.id}
						fieldIndex={fieldIndex}
						optionIndex={optionIndex}
						option={option}
						isBusy={isBusy}
						onRemove={remove as RemoveByIndex}
					/>
				))}
			</Sortable>

			<Button
				variant="secondary"
				type="button"
				onClick={() => append(buildDefaultOption(optionFields.length + 1))}
				disabled={isBusy}
			>
				<Plus /> Add Option
			</Button>
		</div>
	);
}

const FieldItem = memo(function FieldItem({
	field,
	index,
	isBusy,
	onRemove,
}: {
	field: any;
	index: number;
	isBusy: boolean;
	onRemove: RemoveByIndex;
}) {
	const fieldType = field.type;

	return (
		<Surface className="flex flex-col gap-4 rounded-3xl border p-3">
			<FieldHeader
				fieldType={fieldType}
				fieldIndex={index}
				isBusy={isBusy}
				onRemove={() => onRemove(index)}
			/>

			<div className="space-y-4">
				<FieldBasicSettings fieldIndex={index} isBusy={isBusy} />

				{fieldType === "NUMBER_INPUT" && (
					<NumberFieldSettings fieldIndex={index} isBusy={isBusy} />
				)}

				{fieldTypeHasOptions(fieldType) && (
					<FieldOptionsSection fieldIndex={index} isBusy={isBusy} />
				)}
			</div>
		</Surface>
	);
});

function TemplateSidebar({
	template,
	isBusy,
	onClose,
	onSubmitClick,
}: {
	template?: any;
	isBusy: boolean;
	onClose: () => void;
	onSubmitClick: (event?: React.BaseSyntheticEvent) => void;
}) {
	return (
		<div className="flex w-[320px] shrink-0 flex-col border-r bg-muted/20 p-6">
			<TemplateSidebarHeader template={template} />
			<TemplateSidebarFields isBusy={isBusy} />
			<TemplateSidebarActions
				isBusy={isBusy}
				onClose={onClose}
				onSubmitClick={onSubmitClick}
			/>
		</div>
	);
}

function TemplateSidebarHeader({ template }: { template?: any }) {
	return (
		<DialogHeader className="mb-6 space-y-1 text-left">
			<DialogTitle>
				{template ? "Edit Form Template" : "Create Form Template"}
			</DialogTitle>
			<DialogDescription className="text-xs">
				Define the fields that clients must fill out when requesting a
				commission.
			</DialogDescription>
		</DialogHeader>
	);
}

function TemplateSidebarFields({ isBusy }: { isBusy: boolean }) {
	return (
		<div className="space-y-6">
			<FieldTextInput
				name="name"
				label={
					<>
						Template Name <span className="text-destructive">*</span>
					</>
				}
				isBusy={isBusy}
			/>

			<FieldTextInput
				name="description"
				label="Description"
				isBusy={isBusy}
				textarea
			/>
		</div>
	);
}

function TemplateSidebarActions({
	isBusy,
	onClose,
	onSubmitClick,
}: {
	isBusy: boolean;
	onClose: () => void;
	onSubmitClick: (event?: React.BaseSyntheticEvent) => void;
}) {
	return (
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
				onClick={onSubmitClick}
				size="xl"
				disabled={isBusy}
				className="flex-1"
			>
				{isBusy ? (
					<span className="flex items-center gap-2">
						<Loader2 className="size-4 animate-spin" /> Saving&hellip;
					</span>
				) : (
					"Save"
				)}
			</Button>
		</div>
	);
}

function FieldTypeMenuItem({
	type,
	icon,
	label,
	onAdd,
}: {
	type: FormFieldDto["type"];
	icon: React.ReactNode;
	label: string;
	onAdd: (type: FormFieldDto["type"]) => void;
}) {
	return (
		<DropdownMenuItem onClick={() => onAdd(type)}>
			{icon}
			{label}
		</DropdownMenuItem>
	);
}

function AddFieldMenu({
	isBusy,
	onAdd,
}: {
	isBusy: boolean;
	onAdd: (type: FormFieldDto["type"]) => void;
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="secondary" disabled={isBusy} type="button">
					<OutlinePlus />
					Add Field
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-48">
				<FieldTypeMenuItem
					type="TEXT_INPUT"
					icon={<Type />}
					label="Short Text"
					onAdd={onAdd}
				/>
				<FieldTypeMenuItem
					type="TEXTAREA"
					icon={<AlignLeft />}
					label="Long Text"
					onAdd={onAdd}
				/>
				<FieldTypeMenuItem
					type="NUMBER_INPUT"
					icon={<Hash />}
					label="Number"
					onAdd={onAdd}
				/>
				<FieldTypeMenuItem
					type="DATE_INPUT"
					icon={<OutlineCalendar />}
					label="Date"
					onAdd={onAdd}
				/>
				<FieldTypeMenuItem
					type="RADIO"
					icon={<CircleDot />}
					label="Radio Buttons"
					onAdd={onAdd}
				/>
				<FieldTypeMenuItem
					type="CHECKBOX"
					icon={<OutlineCheck />}
					label="Checkboxes"
					onAdd={onAdd}
				/>
				<FieldTypeMenuItem
					type="SELECT"
					icon={<OutlineListBoxes />}
					label="Dropdown"
					onAdd={onAdd}
				/>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function FieldsTopbar({
	fieldCount,
	isBusy,
	onPreview,
	onAddField,
	onClose,
}: {
	fieldCount: number;
	isBusy: boolean;
	onPreview: () => void;
	onAddField: (type: FormFieldDto["type"]) => void;
	onClose: () => void;
}) {
	return (
		<div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
			<h3 className="text-sm font-semibold">Form Fields ({fieldCount})</h3>

			<div className="flex gap-2">
				<Button
					variant="secondary"
					disabled={isBusy}
					type="button"
					onClick={onPreview}
				>
					<OutlineEye />
					Preview
				</Button>

				<AddFieldMenu isBusy={isBusy} onAdd={onAddField} />

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
	);
}

function EmptyFieldsState() {
	return (
		<div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
			<div className="mb-4 rounded-full bg-muted p-3">
				<Plus className="size-6" />
			</div>
			<p>No fields added yet.</p>
			<p>Click "Add Field" to start building your form.</p>
		</div>
	);
}

function FieldsSortableList({
	fieldItems,
	isBusy,
	onMove,
	onRemove,
}: {
	fieldItems: any[];
	isBusy: boolean;
	onMove: (activeIndex: number, overIndex: number) => void;
	onRemove: RemoveByIndex;
}) {
	return (
		<Sortable
			value={fieldItems}
			onValueChange={() => {}}
			getItemValue={(item) => item.id}
			onMove={({ activeIndex, overIndex }) => onMove(activeIndex, overIndex)}
			className="mx-auto max-w-3xl space-y-4"
		>
			{fieldItems.map((field, index) => (
				<SortableItem
					key={field.id}
					value={field.id}
					className="outline-none"
					tabIndex={-1}
				>
					<FieldItem
						field={field}
						index={index}
						isBusy={isBusy}
						onRemove={onRemove}
					/>
				</SortableItem>
			))}
		</Sortable>
	);
}

function FieldsCanvas({
	fieldItems,
	isBusy,
	onMove,
	onRemove,
}: {
	fieldItems: any[];
	isBusy: boolean;
	onMove: (activeIndex: number, overIndex: number) => void;
	onRemove: RemoveByIndex;
}) {
	return (
		<div
			className="flex-1 overflow-y-auto bg-muted/5 p-6 outline-none"
			tabIndex={-1}
		>
			{fieldItems.length === 0 ? (
				<EmptyFieldsState />
			) : (
				<FieldsSortableList
					fieldItems={fieldItems}
					isBusy={isBusy}
					onMove={onMove}
					onRemove={onRemove}
				/>
			)}
		</div>
	);
}

function FieldsBuilderPanel({
	fieldItems,
	isBusy,
	onPreview,
	onAddField,
	onClose,
	onMoveField,
	onRemoveField,
}: {
	fieldItems: any[];
	isBusy: boolean;
	onPreview: () => void;
	onAddField: (type: FormFieldDto["type"]) => void;
	onClose: () => void;
	onMoveField: (activeIndex: number, overIndex: number) => void;
	onRemoveField: RemoveByIndex;
}) {
	return (
		<div className="flex flex-1 flex-col overflow-hidden bg-background">
			<FieldsTopbar
				fieldCount={fieldItems.length}
				isBusy={isBusy}
				onPreview={onPreview}
				onAddField={onAddField}
				onClose={onClose}
			/>
			<FieldsCanvas
				fieldItems={fieldItems}
				isBusy={isBusy}
				onMove={onMoveField}
				onRemove={onRemoveField}
			/>
		</div>
	);
}

function PreviewModal({
	open,
	onOpenChange,
	fields,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	fields: FormFieldDto[];
}) {
	if (!open) return null;

	return (
		<CommissionRequestModal
			open={open}
			onOpenChange={onOpenChange}
			onBack={() => onOpenChange(false)}
			commissionId=""
			previewFields={fields}
			isPreview
		/>
	);
}

export function FormTemplateModal(props: FormTemplateModalProps) {
	const formKey = props.template
		? `edit-${props.template.id}-${props.template.version ?? 0}`
		: "create";

	return <FormTemplateModalContent key={formKey} {...props} />;
}

function FormTemplateModalContent({
	open,
	onClose,
	template,
}: FormTemplateModalProps) {
	const createMutation = useCreateFormTemplate();
	const updateMutation = useUpdateFormTemplate();
	const isBusy = createMutation.isPending || updateMutation.isPending;
	const [previewOpen, setPreviewOpen] = useState(false);

	const form = useFormValidation<FormTemplateData>({
		schema: formTemplateSchema,
		initialData: getTemplateInitialData(template),
	});

	const { control, handleSubmit, getValues } = form;

	const {
		fields: fieldItems,
		append: appendField,
		remove: removeField,
		move: moveField,
	} = useFieldArray({
		control,
		name: "fields",
	});

	async function saveTemplate(data: FormTemplateData) {
		try {
			const cleanData = buildTemplatePayload(data);

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
	}

	function handleAddField(type: FormFieldDto["type"]) {
		appendField(buildDefaultField(type));
	}

	function handleFormSubmit(event?: React.BaseSyntheticEvent) {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}

		handleSubmit(
			(data) => {
				saveTemplate(data);
			},
			(errors) => {
				console.error("Form validation failed:", errors);
				console.error(
					"Detailed validation errors:",
					JSON.stringify(errors, null, 2),
				);
			},
		)(event);
	}

	return (
		<>
			<Dialog
				open={open}
				onOpenChange={(value) => !value && !isBusy && onClose()}
			>
				<DialogContent
					showCloseButton={false}
					className="flex max-h-[70vh] min-w-5xl w-[95vw] flex-col overflow-hidden p-0"
				>
					<Form {...form}>
						<form
							onSubmit={handleFormSubmit}
							className="flex h-full min-h-[600px] overflow-hidden"
						>
							<TemplateSidebar
								template={template}
								isBusy={isBusy}
								onClose={onClose}
								onSubmitClick={handleFormSubmit}
							/>

							<FieldsBuilderPanel
								fieldItems={fieldItems as any[]}
								isBusy={isBusy}
								onPreview={() => setPreviewOpen(true)}
								onAddField={handleAddField}
								onClose={onClose}
								onMoveField={moveField}
								onRemoveField={removeField as RemoveByIndex}
							/>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			<PreviewModal
				open={previewOpen}
				onOpenChange={setPreviewOpen}
				fields={getValues("fields") as FormFieldDto[]}
			/>
		</>
	);
}
