export type TTermsOfServiceResponse = {
	id: string; //uuid
	userId: string; //uuid
	tosText: string;
	version: number; //int32
	createdAt: string; // date-time
	updatedAt: string; // date-time
};

export type TTermsOfService = {
	tosId: string; //uuid
	version: number; //int32
	tosText: string;
	updatedAt: string; // date-time
};

export type TTermsOfServiceAcceptance = {
	tosId: string; //uuid
	tosVersion: number; //int32
};
