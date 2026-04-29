import { apiFetch } from "@/lib/fetch";
import { STRIPE_SUPPORTED_CURRENCIES } from "@/lib/stripe-currencies";

export type ExchangeRatesResponse = {
	id: string;
	object: "exchange_rate";
	rates: Record<string, number>;
};

/**
 * Fetches real exchange rates from the backend or directly from Stripe using FX Quotes.
 * Maps the FX Quotes response back to the legacy Exchange Rates API format for compatibility.
 */
export async function getStripeExchangeRates(baseCurrency = "usd") {
	const stripeKey = import.meta.env.VITE_STRIPE_SECRET_KEY;

	if (stripeKey) {
		try {
			// Get quotes for all supported currencies into the baseCurrency
			const params = new URLSearchParams();
			params.append("to_currency", baseCurrency.toLowerCase());

			// To avoid URL length limits, we might just want to fetch top currencies,
			// but POST body handles large sizes fine.
			for (const currency of STRIPE_SUPPORTED_CURRENCIES) {
				if (currency.toLowerCase() !== baseCurrency.toLowerCase()) {
					params.append("from_currencies[]", currency.toLowerCase());
				}
			}
			params.append("lock_duration", "none"); // We just need current rates for display

			const response = await fetch("https://api.stripe.com/v1/fx_quotes", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${stripeKey}`,
					"Content-Type": "application/x-www-form-urlencoded",
					"Stripe-Version": "2025-07-30.preview",
				},
				body: params.toString(),
			});

			if (response.ok) {
				const data = (await response.json()) as FxQuoteResponse;

				// Map the fx_quote format (base per foreign) back to the exchange_rate format (foreign per base)
				// e.g. fx_quote gives EUR: 1.10 (meaning 1 EUR = 1.10 USD).
				// We want exchange_rate format EUR: 0.90 (meaning 1 USD = 0.90 EUR)
				const legacyRates: Record<string, number> = {};

				for (const [currency, rateInfo] of Object.entries(data.rates)) {
					if (rateInfo?.exchange_rate) {
						legacyRates[currency] = 1 / rateInfo.exchange_rate;
					}
				}

				// Ensure the base currency itself is 1
				legacyRates[baseCurrency.toLowerCase()] = 1;

				return {
					id: baseCurrency.toLowerCase(),
					object: "exchange_rate",
					rates: legacyRates,
				} as ExchangeRatesResponse;
			}

			console.error("Stripe FX Quote fetch error:", await response.text());
		} catch (error) {
			console.error(
				"Failed to fetch exchange rates directly from Stripe",
				error,
			);
		}
	}

	return apiFetch<ExchangeRatesResponse>(
		`/api/stripe/exchange-rates?base=${baseCurrency.toLowerCase()}`,
	);
}

export type FxQuoteResponse = {
	id: string;
	object: "fx_quote";
	to_currency: string;
	from_currencies: string[];
	lock_duration: string;
	expires_at: number;
	rates: Record<string, { exchange_rate: number; rate_details?: any }>;
};

/**
 * Creates an FX Quote for locked exchange rates.
 * https://docs.stripe.com/payments/currencies/localize-prices/fx-quotes-api
 */
export async function createStripeFxQuote(
	toCurrency: string,
	fromCurrencies: string[],
	lockDuration: "hour" | "day" = "hour",
) {
	const stripeKey = import.meta.env.VITE_STRIPE_SECRET_KEY;

	if (stripeKey) {
		try {
			const params = new URLSearchParams();
			params.append("to_currency", toCurrency.toLowerCase());
			for (const currency of fromCurrencies) {
				params.append("from_currencies[]", currency.toLowerCase());
			}
			params.append("lock_duration", lockDuration);

			const response = await fetch("https://api.stripe.com/v1/fx_quotes", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${stripeKey}`,
					"Content-Type": "application/x-www-form-urlencoded",
					"Stripe-Version": "2025-07-30.preview",
				},
				body: params.toString(),
			});

			if (response.ok) {
				return (await response.json()) as FxQuoteResponse;
			}

			console.error("Stripe FX Quote error:", await response.text());
		} catch (error) {
			console.error("Failed to create FX quote directly from Stripe", error);
		}
	}

	// Fallback to backend if implemented
	const params = new URLSearchParams();
	params.append("to", toCurrency.toLowerCase());
	for (const c of fromCurrencies) {
		params.append("from", c.toLowerCase());
	}
	params.append("lock_duration", lockDuration);

	return apiFetch<FxQuoteResponse>(
		`/api/stripe/fx-quotes?${params.toString()}`,
		{ method: "POST" },
	);
}

/**
 * Calculates the localized price using an FX Quote rate.
 * Example: baseAmount = 100 (GBP), rate = 0.8 (USD) -> returns 125 (USD)
 */
export function calculateLocalizedPrice(
	baseAmount: number,
	rate: number,
): number {
	if (!rate || rate === 0) return baseAmount;
	return baseAmount / rate;
}

/**
 * List of zero-decimal currencies supported by Stripe
 */
export const ZERO_DECIMAL_CURRENCIES = [
	"bif",
	"clp",
	"djf",
	"gnf",
	"jpy",
	"kmf",
	"krw",
	"mga",
	"pyg",
	"rwf",
	"ugx",
	"vnd",
	"vuv",
	"xaf",
	"xof",
	"xpf",
];

/**
 * Converts a standard amount to Stripe's minor units.
 * E.g., 125 USD -> 12500, 100 JPY -> 100.
 */
export function toStripeMinorUnits(amount: number, currency: string): number {
	const lowerCurrency = currency.toLowerCase();

	// Handle special cases (three decimal currencies)
	const THREE_DECIMAL_CURRENCIES = ["bhd", "jod", "kwd", "omr", "tnd"];

	if (ZERO_DECIMAL_CURRENCIES.includes(lowerCurrency)) {
		return Math.round(amount);
	}

	if (THREE_DECIMAL_CURRENCIES.includes(lowerCurrency)) {
		return Math.round(amount * 1000);
	}

	// Default to 2 decimal places
	return Math.round(amount * 100);
}
