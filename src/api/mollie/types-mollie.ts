export type TMolliePaymentRequest = {
	amount: {
		currency: string;
		value: string; // Mollie requires string for amount value (e.g. "10.00")
	};
	description: string;
	redirectUrl: string;
	webhookUrl?: string;
	metadata?: Record<string, any>;
	method?: string | string[];
};

export type TMolliePaymentResponse = {
	id: string;
	mode: "live" | "test";
	createdAt: string;
	status:
		| "open"
		| "canceled"
		| "pending"
		| "authorized"
		| "expired"
		| "failed"
		| "paid";
	isCancelable: boolean;
	expiresAt: string;
	amount: {
		value: string;
		currency: string;
	};
	description: string;
	method: string | null;
	metadata: Record<string, any>;
	_links: {
		self: { href: string; type: string };
		checkout: { href: string; type: string };
		dashboard?: { href: string; type: string };
		documentation: { href: string; type: string };
	};
};
