import { createClientOnlyFn, createIsomorphicFn } from "@tanstack/react-start";
import { createContext, use, useState } from "react";
import { UserCurrencySchema } from "@/schemas/currency";
import type {
	CurrencyContextProps,
	CurrencyProviderProps,
	UserCurrency,
} from "@/types/currency";

const currencyStorageKey = "familiar-currency";

const getStoredUserCurrency = createIsomorphicFn()
	.server((): UserCurrency => "USD")
	.client((): UserCurrency => {
		const stored = localStorage.getItem(currencyStorageKey);
		return UserCurrencySchema.parse(stored);
	});

const setStoredCurrency = createClientOnlyFn((currency: UserCurrency) => {
	const validatedCurrency = UserCurrencySchema.parse(currency);
	localStorage.setItem(currencyStorageKey, validatedCurrency);
});

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

export function CurrencyProvider({ children }: CurrencyProviderProps) {
	const [userCurrency, setUserCurrency] = useState<UserCurrency>(getStoredUserCurrency);

	const setCurrency = (newUserCurrency: UserCurrency) => {
		const validatedCurrency = UserCurrencySchema.parse(newUserCurrency);
		setUserCurrency(validatedCurrency);
		setStoredCurrency(validatedCurrency);
	};

	return (
		<CurrencyContext value={{ userCurrency, setCurrency }}>
			{children}
		</CurrencyContext>
	);
}

export const useCurrency = () => {
	const context = use(CurrencyContext);
	if (!context) {
		throw new Error("useCurrency must be used within a CurrencyProvider");
	}
	return context;
};
