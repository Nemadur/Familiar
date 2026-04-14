export type ReuestFormBlockKind =
	| "requester_name"
	| "contact_email"
	| "social_handles"
	| "licenses"
	| "custom_option"
	| "references"
	| "sharing"
	| "deadline"
	| "extra_info"
	| "requester_terms"
	| "marketing_consent"
	| "text"
	| "textarea"
	| "radio"
	| "checkbox_group"
	| "note"
	| "divider";

export type RequestFormBlockSource = "prebuilt" | "custom";

export interface RequestFormOption {
	id: string;
	label: string;
	description?: string;
	price?: number;
	pricePercentage?: number;
	isDisabled?: boolean;
	isIncluded?: boolean;
	hasInput?: boolean;
}

interface RequestFormBlockBase {
	id: string;
	kind: ReuestFormBlockKind;
	source: RequestFormBlockSource;
	order: number;
	isEnabled: boolean;
	label?: string;
	description?: string;
	isRequired?: boolean;
	width?: "full" | "half";
}

export interface PrebuiltRequestFormBlock extends RequestFormBlockBase {
	source: "prebuilt";
	systemKey:
		| "name"
		| "email"
		| "socials"
		| "licenses"
		| "customOption"
		| "references"
		| "sharing"
		| "deadline"
		| "extraInfo"
		| "termsAccepted"
		| "marketing";
	options?: RequestFormOption[];
	settings?: Record<string, unknown>;
}

export interface CustomRequestFormBlock extends RequestFormBlockBase {
	source: "custom";
	fieldName: string;
	placeholder?: string;
	options?: RequestFormOption[];
	settings?: Record<string, unknown>;
}

export type RequestFormBlock =
	| PrebuildRequestFormBlock
	| CustomRequestFormBlock;

export interface CommissionRequestFormDefinition {
	id: string;
	version: number;
	artistId: string;
	commissionId: string;
	blocks: RequestFormBlock[];
}
