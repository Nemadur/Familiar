import type { z } from "zod";
import type { UserCurrencySchema } from "@/schemas/currency";

export type UserCurrency = z.infer<typeof UserCurrencySchema>;

export interface CurrencyContextProps {
	userCurrency: UserCurrency;
	setCurrency: (currency: UserCurrency) => void;
}

export interface CurrencyProviderProps {
	children: React.ReactNode;
}
