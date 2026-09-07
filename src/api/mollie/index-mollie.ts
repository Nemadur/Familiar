import { apiFetch } from "@/lib/fetch";
import type {
	TMolliePaymentRequest,
	TMolliePaymentResponse,
} from "./types-mollie";

/**
 * Creates a payment in Mollie.
 * We prioritize calling our backend which should proxy to Mollie to keep the API key secure.
 */
export async function createMolliePayment(request: TMolliePaymentRequest) {
	return apiFetch<TMolliePaymentResponse>("/api/mollie/payments", {
		method: "POST",
		body: JSON.stringify(request),
	});
}

/**
 * Gets a payment status from Mollie via our backend.
 */
export async function getMolliePayment(paymentId: string) {
	return apiFetch<TMolliePaymentResponse>(`/api/mollie/payments/${paymentId}`);
}

/**
 * Helper to format amount for Mollie (e.g., 10 -> "10.00")
 */
// TODO: move to or create helpers functions

export function formatMollieAmount(amount: number): string {
	return amount.toFixed(2);
}

export function clientRegistrationMollie() {}
