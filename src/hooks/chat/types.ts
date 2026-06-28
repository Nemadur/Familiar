export type TChatCommissionReferenceSummary = {
	requestId: string;
	commissionId?: string | null;
	title?: string | null;
	thumbnailUrl?: string | null;
	status?: string | null;
	price?: number | null;
	currencyCode?: string | null;
};

export type TChatCommissionPinData = {
	requestId: string;
	commissionId: string | null;
	title: string;
	thumbnailUrl: string | null;
	status: string | null;
	price: number | null;
	currencyCode: string | null;
};

export type TChatCommissionRequestStatus =
	| "PENDING"
	| "ACCEPTED"
	| "IN_PROGRESS"
	| "DELIVERED"
	| "COMPLETED"
	| "CANCELLED";

export type TChatCommissionReference = {
	requestId: string;
	commissionId: string | null;
	title: string;
	status: TChatCommissionRequestStatus | null;
	totalPrice: number | null;
	currencyCode: string | null;
	thumbnailUrl: string | null;
};

export type TChatCommissionReferenceRequest = {
	id: string;
	commissionId: string;
	status?: TChatCommissionRequestStatus | null;
	calculatedTotalPrice?: number | null;
	currencyCode?: string | null;
};
