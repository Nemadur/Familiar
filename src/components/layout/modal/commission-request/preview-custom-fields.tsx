import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { FormFieldDto } from "@/types/commissions/templates";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	StaticRadioGroup,
	StaticCheckboxGroup,
	StaticSelect,
	StaticInput,
	StaticTextarea,
	StaticNumberInput,
	StaticDateInput,
	type Option,
} from "@/components/layout/commision/form-blocks";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export function PreviewCustomFields({ fields }: { fields: FormFieldDto[] }) {
	return (
		<div className="space-y-10">
			{fields.map((field, index) => {
				const fieldId = field.fieldId || `field-${index}`;

				return (
					<Field
						key={fieldId}
						className={cn(
							"space-y-3",
							field.type === "RADIO" ||
								field.type === "CHECKBOX" ||
								field.type === "SELECT" ||
								field.type === "TEXT_INPUT" ||
								field.type === "TEXTAREA" ||
								field.type === "NUMBER_INPUT" ||
								field.type === "DATE_INPUT"
								? "space-y-0"
								: "",
						)}
					>
						{field.type !== "RADIO" &&
							field.type !== "CHECKBOX" &&
							field.type !== "SELECT" &&
							field.type !== "TEXT_INPUT" &&
							field.type !== "TEXTAREA" &&
							field.type !== "NUMBER_INPUT" &&
							field.type !== "DATE_INPUT" && (
								<>
									<FieldLabel className="font-medium text-base flex items-center justify-between w-full">
										<span className="flex-1 w-full">
											{field.label || "Untitled Field"}
										</span>
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
							)}

						{field.type === "TEXT_INPUT" && (
							<StaticInput
								label={field.label || "Untitled Field"}
								description={field.description}
								required={field.required}
								placeholder="Your answer"
							/>
						)}

						{field.type === "TEXTAREA" && (
							<StaticTextarea
								label={field.label || "Untitled Field"}
								description={field.description}
								required={field.required}
								placeholder="Your answer"
							/>
						)}

						{field.type === "NUMBER_INPUT" && (
							<StaticNumberInput
								label={field.label || "Untitled Field"}
								description={field.description}
								required={field.required}
								min={field.minValue ?? undefined}
								max={field.maxValue ?? undefined}
							/>
						)}

						{field.type === "DATE_INPUT" && (
							<StaticDateInput
								label={field.label || "Untitled Field"}
								description={field.description}
								required={field.required}
								minDate={new Date()}
							/>
						)}

						{field.type === "RADIO" && field.options && (
							<StaticRadioGroup
								label={field.label || "Untitled Field"}
								description={field.description}
								required={field.required}
								options={field.options.map((opt, i) => ({
									id: opt.id || String(i),
									label: opt.label,
									price:
										opt.priceModifier?.type === "FIXED"
											? opt.priceModifier.value
											: undefined,
									pricePercentage:
										opt.priceModifier?.type === "PERCENT"
											? opt.priceModifier.value
											: undefined,
								}))}
							/>
						)}

						{field.type === "CHECKBOX" && field.options && (
							<StaticCheckboxGroup
								label={field.label || "Untitled Field"}
								description={field.description}
								required={field.required}
								options={field.options.map((opt, i) => ({
									id: opt.id || String(i),
									label: opt.label,
									price:
										opt.priceModifier?.type === "FIXED"
											? opt.priceModifier.value
											: undefined,
									pricePercentage:
										opt.priceModifier?.type === "PERCENT"
											? opt.priceModifier.value
											: undefined,
								}))}
							/>
						)}

						{field.type === "SELECT" && field.options && (
							<StaticSelect
								label={field.label || "Untitled Field"}
								description={field.description}
								required={field.required}
								options={field.options.map((opt, i) => ({
									id: opt.id || String(i),
									label: opt.label,
									price:
										opt.priceModifier?.type === "FIXED"
											? opt.priceModifier.value
											: undefined,
									pricePercentage:
										opt.priceModifier?.type === "PERCENT"
											? opt.priceModifier.value
											: undefined,
								}))}
							/>
						)}
					</Field>
				);
			})}
		</div>
	);
}
