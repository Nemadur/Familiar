export type TMediaJobStatus =
	| "PENDING"
	| "PROCESSING"
	| "COMPLETED"
	| "FAILED"
	| "ERROR"
	| string;

export type TMediaProcessingJob = {
	jobId: string;
	status: TMediaJobStatus;
	fullSizeId: string | null;
	halfSizeId: string | null;
	thumbnailId: string | null;
	errorMessage: string | null;
	createdAt: string;
	updatedAt: string;
};
