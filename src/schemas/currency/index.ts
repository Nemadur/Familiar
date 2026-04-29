import { z } from "zod";
import { STRIPE_SUPPORTED_CURRENCIES } from "@/lib/stripe-currencies";

// The full 135+ list of currencies supported by Stripe.
export const UserCurrencySchema = z
	.enum(STRIPE_SUPPORTED_CURRENCIES)
	.catch("USD");
