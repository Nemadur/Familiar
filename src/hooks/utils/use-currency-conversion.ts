import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getStripeExchangeRates } from "@/api/stripe";
import { useCurrency } from "@/providers/currency";

function hasRates(rates: Record<string, number>) {
	return Object.keys(rates).length > 0;
}

function normalizeCurrency(currency?: string) {
	return currency?.toUpperCase() || "USD";
}

export function useCurrencyConversion() {
	const { userCurrency } = useCurrency();
	const { i18n } = useTranslation();

	const locale = i18n.language || "en-US";
	const normalizedUserCurrency = normalizeCurrency(userCurrency);

	// Fetch real Stripe exchange rates from backend
	const { data: exchangeRatesData, isLoading } = useQuery({
		queryKey: ["stripe", "exchangeRates", "usd"],
		queryFn: () => getStripeExchangeRates("usd"),
		staleTime: 1000 * 60 * 60, // 1 hour cache
	});

	const rates = useMemo(
		() => exchangeRatesData?.rates || {},
		[exchangeRatesData?.rates],
	);

	const convert = useMemo(() => {
		return (amount: number, fromCurrency: string) => {
			const sourceCurrency = normalizeCurrency(fromCurrency);

			if (
				sourceCurrency === normalizedUserCurrency ||
				!rates ||
				!hasRates(rates)
			) {
				return amount;
			}

			const fromRate =
				sourceCurrency === "USD" ? 1 : rates[sourceCurrency.toLowerCase()] || 1;
			const amountInUSD = amount / fromRate;

			const toRate =
				normalizedUserCurrency === "USD"
					? 1
					: rates[normalizedUserCurrency.toLowerCase()] || 1;

			return amountInUSD * toRate;
		};
	}, [normalizedUserCurrency, rates]);

	const format = useMemo(() => {
		return (amount: number, currency: string) => {
			const normalizedCurrency = normalizeCurrency(currency);

			try {
				return amount.toLocaleString(locale, {
					style: "currency",
					currency: normalizedCurrency,
				});
			} catch {
				return `${normalizedCurrency} ${amount.toFixed(2)}`;
			}
		};
	}, [locale]);

	const convertAndFormat = useMemo(() => {
		return (amount: number, fromCurrency: string) => {
			const converted = convert(amount, fromCurrency);
			const targetCurrency =
				!rates || !hasRates(rates)
					? normalizeCurrency(fromCurrency)
					: normalizedUserCurrency;

			return format(converted, targetCurrency);
		};
	}, [convert, format, normalizedUserCurrency, rates]);

	return {
		convert,
		format,
		convertAndFormat,
		userCurrency: normalizedUserCurrency,
		isLoading,
	};
}
