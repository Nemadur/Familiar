export interface FormFieldOptionDto {
	optionId?: string;
	label: string;
	value: string;
	priceModifier?: {
		type: "NONE" | "FIXED" | "PERCENT";
		value: number;
	};
	followup?: {
		label: string;
		required: boolean;
	};
}

export interface FormFieldDto {
	fieldId?: string;
	type:
		| "TEXT_INPUT"
		| "TEXTAREA"
		| "NUMBER_INPUT"
		| "DATE_INPUT"
		| "RADIO"
		| "CHECKBOX"
		| "SELECT";
	systemKey?: "CHARACTER_COUNT" | "BACKGROUND" | "DEADLINE";
	label: string;
	description?: string;
	required?: boolean;
	minValue?: number;
	maxValue?: number;
	maxLength?: number;
	priceModifier?: {
		type: "NONE" | "FIXED" | "PERCENT";
		value: number;
	};
	options?: FormFieldOptionDto[];
}

export interface FormTemplateResponse {
	id: string;
	artistId: string;
	name: string;
	description?: string;
	version: number;
	fields: FormFieldDto[];
	createdAt: string;
	updatedAt: string;
}
