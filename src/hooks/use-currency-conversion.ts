import { getStripeExchangeRates } from "@/api/stripe";
import { useCurrency } from "@/providers/currency";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export function useCurrencyConversion() {
	const { userCurrency } = useCurrency();
	const { i18n } = useTranslation();

	// Fetch real Stripe exchange rates from backend
	const { data: exchangeRatesData, isLoading } = useQuery({
		queryKey: ["stripe", "exchangeRates", "usd"],
		queryFn: () => getStripeExchangeRates("usd"),
		staleTime: 1000 * 60 * 60, // 1 hour cache
	});

	const rates = exchangeRatesData?.rates || {};

	const convert = useMemo(() => {
		return (amount: number, fromCurrency: string) => {
			const sourceCurrency = fromCurrency?.toUpperCase() || "USD";

			if (
				sourceCurrency === userCurrency ||
				!rates ||
				Object.keys(rates).length === 0
			) {
				return amount;
			}

			const fromRate =
				sourceCurrency === "USD" ? 1 : rates[sourceCurrency.toLowerCase()] || 1;
			const amountInUSD = amount / fromRate;

			const toRate =
				userCurrency === "USD" ? 1 : rates[userCurrency.toLowerCase()] || 1;
			return amountInUSD * toRate;
		};
	}, [userCurrency, rates]);

	const format = useMemo(() => {
		return (amount: number, currency: string) => {
			const locale = i18n.language || "en-US";
			try {
				return new Intl.NumberFormat(locale, {
					style: "currency",
					currency,
				}).format(amount);
			} catch (e) {
				return `${currency} ${amount.toFixed(2)}`;
			}
		};
	}, [i18n.language]);

	const convertAndFormat = useMemo(() => {
		return (amount: number, fromCurrency: string) => {
			const converted = convert(amount, fromCurrency);
			const targetCurrency =
				!rates || Object.keys(rates).length === 0
					? fromCurrency?.toUpperCase() || "USD"
					: userCurrency;
			return format(converted, targetCurrency);
		};
	}, [convert, format, userCurrency, rates]);

	return {
		convert,
		format,
		convertAndFormat,
		userCurrency,
		isLoading,
	};
}
