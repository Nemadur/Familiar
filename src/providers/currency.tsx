import { createClientOnlyFn } from "@tanstack/react-start";
import { createContext, use, useSyncExternalStore } from "react";
import { UserCurrencySchema } from "@/schemas/currency";
import type {
	CurrencyContextProps,
	CurrencyProviderProps,
	UserCurrency,
} from "@/types/currency";

const currencyStorageKey = "familiar-currency";
const defaultCurrency: UserCurrency = "USD";

let currencySnapshot: UserCurrency = defaultCurrency;
const listeners = new Set<() => void>();

function readStoredCurrency(): UserCurrency {
	if (typeof window === "undefined") {
		return defaultCurrency;
	}

	const stored = window.localStorage.getItem(currencyStorageKey);
	const parsed = UserCurrencySchema.safeParse(stored);

	return parsed.success ? parsed.data : defaultCurrency;
}

function emitCurrencyChange() {
	for (const listener of listeners) {
		listener();
	}
}

function subscribeToCurrencyStore(listener: () => void) {
	listeners.add(listener);

	const storedCurrency = readStoredCurrency();

	if (storedCurrency !== currencySnapshot) {
		currencySnapshot = storedCurrency;
		queueMicrotask(emitCurrencyChange);
	}

	return () => {
		listeners.delete(listener);
	};
}

function getCurrencySnapshot() {
	return currencySnapshot;
}

function getServerCurrencySnapshot() {
	return defaultCurrency;
}

const setStoredCurrency = createClientOnlyFn((currency: UserCurrency) => {
	const validatedCurrency = UserCurrencySchema.parse(currency);
	localStorage.setItem(currencyStorageKey, validatedCurrency);
});

const CurrencyContext = createContext<CurrencyContextProps | undefined>(
	undefined,
);

export function CurrencyProvider({ children }: CurrencyProviderProps) {
	const userCurrency = useSyncExternalStore(
		subscribeToCurrencyStore,
		getCurrencySnapshot,
		getServerCurrencySnapshot,
	);

	const setCurrency = (newUserCurrency: UserCurrency) => {
		const validatedCurrency = UserCurrencySchema.parse(newUserCurrency);

		currencySnapshot = validatedCurrency;
		setStoredCurrency(validatedCurrency);
		emitCurrencyChange();
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
