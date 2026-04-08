export enum TPaymentStatus {
	Pending = "PENDING",
	Completed = "COMPLETED",
	Failed = "FAILED",
	Refunded = "REFUNDED",
}

export type TPayment = {
	paymentStatus: TPaymentStatus;
	updatedAt: string;
};
