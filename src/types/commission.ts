import type { User, UserSummary } from "./user";

export interface Review {
	id: string;
	author: UserSummary;
	title?: string;
	rating: number;
	comment?: string;
	createdAt: string | Date;
	itemName?: string;
}

export interface LicenseOption {
	id: string;
	label: string;
	price?: number;
	pricePercentage?: number;
	included?: boolean;
	description?: string;
	updatedAt?: string | Date;
}

export interface CommissionItem {
	id: string;
	title: string;
	description?: string; // Markdown supported
	price: number;
	discountRate?: number; // 0.0 to 1.0
	imageUrls?: string[];
	status?: "open" | "closed" | "waitlist";
	artistNote?: string;
	reviews?: Review[];
	licenseOptions?: LicenseOption[];
	tags?: string[];
	contentWarnings?: string[];
	serviceType?: "custom_service" | "personalized_ych";
	communicationType?: "open_communication" | "surprise_me";
	requestingProcess?: "custom_proposal" | "instant_order";
	artistTerms?: {
		version: number;
		createdAt: string | Date;
		tosMd: string;
		isActive: boolean;
	};
	artist?: User;
}

export interface CommissionCategory {
	id: string;
	title: string;
	description?: string;
	status: "open" | "closed" | "waitlist";
	items: CommissionItem[];
}
