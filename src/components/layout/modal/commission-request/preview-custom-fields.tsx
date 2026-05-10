import { useSyncExternalStore } from "react";
import type { FormFieldDto } from "@/types/commissions/templates";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
	StaticCheckboxGroup,
	StaticDateInput,
	StaticInput,
	StaticNumberInput,
	StaticRadioGroup,
	StaticSelect,
	StaticTextarea,
	type Option,
} from "@/components/layout/commision/form-blocks";
import { cn } from "@/lib/utils";

let clientTodaySnapshot: Date | undefined;

function subscribeToClientDateStore(_onStoreChange: () => void) {
	return () => {};
}

function getClientTodaySnapshot() {
	clientTodaySnapshot ??= new Date();
	return clientTodaySnapshot;
}

function getServerTodaySnapshot() {
	return undefined;
}

function useClientToday() {
	return useSyncExternalStore(
		subscribeToClientDateStore,
		getClientTodaySnapshot,
		getServerTodaySnapshot,
	);
}

function isStaticFieldType(type: FormFieldDto["type"]) {
	return (
		type === "RADIO" ||
		type === "CHECKBOX" ||
		type === "SELECT" ||
		type === "TEXT_INPUT" ||
		type === "TEXTAREA" ||
		type === "NUMBER_INPUT" ||
		type === "DATE_INPUT"
	);
}

function getFieldLabel(field: FormFieldDto) {
	return field.label || "Untitled Field";
}

function getOptionId(
	option: NonNullable<FormFieldDto["options"]>[number],
	index: number,
) {
	if ("optionId" in option && typeof option.optionId === "string") {
		return option.optionId;
	}

	if ("id" in option && typeof option.id === "string") {
		return option.id;
	}

	return String(index);
}

function getStaticOptions(field: FormFieldDto): Option[] {
	if (!field.options?.length) {
		return [];
	}

	return field.options.map((option, index) => ({
		id: getOptionId(option, index),
		label: option.label,
		price:
			option.priceModifier?.type === "FIXED"
				? option.priceModifier.value
				: undefined,
		pricePercentage:
			option.priceModifier?.type === "PERCENT"
				? option.priceModifier.value
				: undefined,
	}));
}

function GenericFieldHeader({ field }: { field: FormFieldDto }) {
	if (isStaticFieldType(field.type)) {
		return null;
	}

	return (
		<>
			<FieldLabel className="font-medium text-base flex items-center justify-between w-full">
				<span className="flex-1 w-full">{getFieldLabel(field)}</span>
				{field.required && (
					<span className="w-fit text-destructive text-sm font-normal">
						Required *
					</span>
				)}
			</FieldLabel>

			{field.description && (
				<FieldDescription>{field.description}</FieldDescription>
			)}
		</>
	);
}

function PreviewField({
	field,
	minDate,
}: {
	field: FormFieldDto;
	minDate?: Date;
}) {
	const options = getStaticOptions(field);

	return (
		<Field
			className={cn("space-y-3", isStaticFieldType(field.type) && "space-y-0")}
		>
			<GenericFieldHeader field={field} />

			{field.type === "TEXT_INPUT" && (
				<StaticInput
					label={getFieldLabel(field)}
					description={field.description}
					required={field.required}
					placeholder="Your answer"
				/>
			)}

			{field.type === "TEXTAREA" && (
				<StaticTextarea
					label={getFieldLabel(field)}
					description={field.description}
					required={field.required}
					placeholder="Your answer"
				/>
			)}

			{field.type === "NUMBER_INPUT" && (
				<StaticNumberInput
					label={getFieldLabel(field)}
					description={field.description}
					required={field.required}
					min={field.minValue ?? undefined}
					max={field.maxValue ?? undefined}
				/>
			)}

			{field.type === "DATE_INPUT" && (
				<StaticDateInput
					label={getFieldLabel(field)}
					description={field.description}
					required={field.required}
					minDate={minDate}
				/>
			)}

			{field.type === "RADIO" && field.options && (
				<StaticRadioGroup
					label={getFieldLabel(field)}
					description={field.description}
					required={field.required}
					options={options}
				/>
			)}

			{field.type === "CHECKBOX" && field.options && (
				<StaticCheckboxGroup
					label={getFieldLabel(field)}
					description={field.description}
					required={field.required}
					options={options}
				/>
			)}

			{field.type === "SELECT" && field.options && (
				<StaticSelect
					label={getFieldLabel(field)}
					description={field.description}
					required={field.required}
					options={options}
				/>
			)}
		</Field>
	);
}

export function PreviewCustomFields({ fields }: { fields: FormFieldDto[] }) {
	const clientToday = useClientToday();

	return (
		<div className="space-y-10">
			{fields.map((field, index) => {
				const fieldKey =
					field.fieldId ||
					`${field.type}-${field.label || "untitled"}-${field.options?.length ?? 0}-${index}`;

				return (
					<PreviewField key={fieldKey} field={field} minDate={clientToday} />
				);
			})}
		</div>
	);
}
