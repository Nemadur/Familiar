import React from "react";
import { useTranslation } from "react-i18next";
import { OutlineCheck, OutlineChevronRight } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { STRIPE_SUPPORTED_CURRENCIES } from "@/lib/stripe-currencies";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/providers/currency";

type ButtonProps = React.ComponentProps<typeof Button>;
type PopoverContentProps = React.ComponentProps<typeof PopoverContent>;

type CurrencySelectDisplay = "compact" | "field";

type CurrencyOption = {
	value: string;
	name: string;
	symbol: string;
	label: string;
};

interface CurrencySelectProps {
	id?: string;
	value?: string;
	onValueChange?: (currencyCode: string) => void;
	disabled?: boolean;
	display?: CurrencySelectDisplay;
	variant?: ButtonProps["variant"];
	size?: ButtonProps["size"];
	align?: PopoverContentProps["align"];
	triggerClassName?: string;
	contentClassName?: string;
	"aria-invalid"?: boolean;
}

function normalizeCurrency(currencyCode: string) {
	return currencyCode.toUpperCase();
}

const CURRENCY_NAMES: Record<string, string> = {
	AED: "United Arab Emirates Dirham",
	AFN: "Afghan Afghani",
	ALL: "Albanian Lek",
	AMD: "Armenian Dram",
	ANG: "Netherlands Antillean Guilder",
	AOA: "Angolan Kwanza",
	ARS: "Argentine Peso",
	AUD: "Australian Dollar",
	AWG: "Aruban Florin",
	AZN: "Azerbaijani Manat",
	BAM: "Bosnia and Herzegovina Convertible Mark",
	BBD: "Barbadian Dollar",
	BDT: "Bangladeshi Taka",
	BGN: "Bulgarian Lev",
	BIF: "Burundian Franc",
	BMD: "Bermudian Dollar",
	BND: "Brunei Dollar",
	BOB: "Bolivian Boliviano",
	BRL: "Brazilian Real",
	BSD: "Bahamian Dollar",
	BWP: "Botswana Pula",
	BZD: "Belize Dollar",
	CAD: "Canadian Dollar",
	CDF: "Congolese Franc",
	CHF: "Swiss Franc",
	CLP: "Chilean Peso",
	CNY: "Chinese Yuan",
	COP: "Colombian Peso",
	CRC: "Costa Rican Colón",
	CVE: "Cape Verdean Escudo",
	CZK: "Czech Koruna",
	DJF: "Djiboutian Franc",
	DKK: "Danish Krone",
	DOP: "Dominican Peso",
	DZD: "Algerian Dinar",
	EGP: "Egyptian Pound",
	ETB: "Ethiopian Birr",
	EUR: "Euro",
	FJD: "Fijian Dollar",
	FKP: "Falkland Islands Pound",
	GBP: "British Pound",
	GEL: "Georgian Lari",
	GIP: "Gibraltar Pound",
	GMD: "Gambian Dalasi",
	GNF: "Guinean Franc",
	GTQ: "Guatemalan Quetzal",
	GYD: "Guyanese Dollar",
	HKD: "Hong Kong Dollar",
	HNL: "Honduran Lempira",
	HTG: "Haitian Gourde",
	HUF: "Hungarian Forint",
	IDR: "Indonesian Rupiah",
	ILS: "Israeli New Shekel",
	INR: "Indian Rupee",
	ISK: "Icelandic Króna",
	JMD: "Jamaican Dollar",
	JPY: "Japanese Yen",
	KES: "Kenyan Shilling",
	KGS: "Kyrgyzstani Som",
	KHR: "Cambodian Riel",
	KMF: "Comorian Franc",
	KRW: "South Korean Won",
	KYD: "Cayman Islands Dollar",
	KZT: "Kazakhstani Tenge",
	LAK: "Lao Kip",
	LBP: "Lebanese Pound",
	LKR: "Sri Lankan Rupee",
	LRD: "Liberian Dollar",
	LSL: "Lesotho Loti",
	MAD: "Moroccan Dirham",
	MDL: "Moldovan Leu",
	MGA: "Malagasy Ariary",
	MKD: "Macedonian Denar",
	MMK: "Myanmar Kyat",
	MNT: "Mongolian Tögrög",
	MOP: "Macanese Pataca",
	MUR: "Mauritian Rupee",
	MVR: "Maldivian Rufiyaa",
	MWK: "Malawian Kwacha",
	MXN: "Mexican Peso",
	MYR: "Malaysian Ringgit",
	MZN: "Mozambican Metical",
	NAD: "Namibian Dollar",
	NGN: "Nigerian Naira",
	NIO: "Nicaraguan Córdoba",
	NOK: "Norwegian Krone",
	NPR: "Nepalese Rupee",
	NZD: "New Zealand Dollar",
	PAB: "Panamanian Balboa",
	PEN: "Peruvian Sol",
	PGK: "Papua New Guinean Kina",
	PHP: "Philippine Peso",
	PKR: "Pakistani Rupee",
	PLN: "Polish Złoty",
	PYG: "Paraguayan Guaraní",
	QAR: "Qatari Riyal",
	RON: "Romanian Leu",
	RSD: "Serbian Dinar",
	RUB: "Russian Ruble",
	RWF: "Rwandan Franc",
	SAR: "Saudi Riyal",
	SBD: "Solomon Islands Dollar",
	SCR: "Seychellois Rupee",
	SEK: "Swedish Krona",
	SGD: "Singapore Dollar",
	SHP: "Saint Helena Pound",
	SLE: "Sierra Leonean Leone",
	SOS: "Somali Shilling",
	SRD: "Surinamese Dollar",
	STD: "São Tomé and Príncipe Dobra",
	SZL: "Swazi Lilangeni",
	THB: "Thai Baht",
	TJS: "Tajikistani Somoni",
	TOP: "Tongan Paʻanga",
	TRY: "Turkish Lira",
	TTD: "Trinidad and Tobago Dollar",
	TWD: "New Taiwan Dollar",
	TZS: "Tanzanian Shilling",
	UAH: "Ukrainian Hryvnia",
	UGX: "Ugandan Shilling",
	USD: "United States Dollar",
	UYU: "Uruguayan Peso",
	UZS: "Uzbekistani Som",
	VND: "Vietnamese Đồng",
	VUV: "Vanuatu Vatu",
	WST: "Samoan Tala",
	XAF: "Central African CFA Franc",
	XCD: "East Caribbean Dollar",
	XOF: "West African CFA Franc",
	XPF: "CFP Franc",
	YER: "Yemeni Rial",
	ZAR: "South African Rand",
	ZMW: "Zambian Kwacha",
};

function getCurrencyName(currencyCode: string) {
	return CURRENCY_NAMES[currencyCode] ?? currencyCode;
}

function getCurrencySymbol(locale: string, currencyCode: string) {
	try {
		const formatted = (0)
			.toLocaleString(locale, {
				style: "currency",
				currency: currencyCode,
				currencyDisplay: "narrowSymbol",
				minimumFractionDigits: 0,
				maximumFractionDigits: 0,
			})
			.trim();

		const symbol = formatted.replace(/[\d\s.,\u00a0\u202f]/g, "").trim();

		return symbol || currencyCode;
	} catch {
		return currencyCode;
	}
}

export default function CurrencySelect({
	id,
	value,
	onValueChange,
	disabled,
	display,
	variant,
	size = "xl",
	align,
	triggerClassName,
	contentClassName,
	"aria-invalid": ariaInvalid,
}: CurrencySelectProps) {
	const { t, i18n } = useTranslation();
	const { userCurrency, setCurrency } = useCurrency();
	const [open, setOpen] = React.useState(false);
	const listId = React.useId();

	const resolvedDisplay =
		display ?? (value || onValueChange ? "field" : "compact");
	const resolvedVariant =
		variant ?? (resolvedDisplay === "field" ? "secondary" : "ghost");
	const resolvedAlign =
		align ?? (resolvedDisplay === "field" ? "start" : "end");

	const currencies = React.useMemo<CurrencyOption[]>(() => {
		const locale = i18n.language || "en-US";

		return STRIPE_SUPPORTED_CURRENCIES.map((currencyCode) => {
			const normalizedCode = normalizeCurrency(currencyCode);
			const name = getCurrencyName(normalizedCode);
			const symbol = getCurrencySymbol(locale, normalizedCode);

			return {
				value: normalizedCode,
				name,
				symbol,
				label: `${normalizedCode} ${name} ${symbol}`,
			};
		}).sort((a, b) => a.name.localeCompare(b.name));
	}, [i18n.language]);

	const selectedValue = normalizeCurrency(value ?? userCurrency ?? "USD");
	const selectedCurrency = currencies.find(
		(currency) => currency.value === selectedValue,
	) ?? {
		value: selectedValue,
		name: selectedValue,
		symbol: selectedValue,
		label: selectedValue,
	};

	const handleSelect = (currencyCode: string) => {
		onValueChange?.(currencyCode);

		if (!onValueChange) {
			setCurrency(currencyCode as never);
		}

		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					variant={resolvedVariant}
					role="combobox"
					aria-controls={listId}
					aria-expanded={open}
					aria-invalid={ariaInvalid || undefined}
					disabled={disabled}
					size={size}
					className={cn(
						"justify-between",
						resolvedDisplay === "field" ? "w-full" : "w-auto",
						triggerClassName,
					)}
				>
					<span className="font-medium">{selectedCurrency.value}</span>
					<span
						className={cn(
							resolvedDisplay === "field" ? "hidden sm:inline" : "sr-only",
						)}
					>
						{selectedCurrency.name} ({selectedCurrency.symbol})
					</span>
					<OutlineChevronRight data-icon="inline-end" className="rotate-90" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align={resolvedAlign}
				side="bottom"
				sideOffset={8}
				collisionPadding={16}
				onWheel={(event) => event.stopPropagation()}
				onTouchMove={(event) => event.stopPropagation()}
				className={cn(
					"overflow-hidden rounded-(--command-content-radius) p-0",
					resolvedDisplay === "field"
						? "w-(--radix-popover-trigger-width) min-w-[320px]"
						: "w-[320px]",
					contentClassName,
				)}
			>
				<Command className="max-h-[min(420px,var(--radix-popover-content-available-height))]">
					<CommandInput
						placeholder={t(
							"components.currency_select.search",
							"Search currency...",
						)}
					/>
					<CommandList
						id={listId}
						className="max-h-[min(360px,calc(var(--radix-popover-content-available-height)-3rem))] overflow-y-auto overscroll-contain"
					>
						<CommandEmpty>
							{t("components.currency_select.no_results", "No results found.")}
						</CommandEmpty>
						<CommandGroup>
							{currencies.map((currency) => {
								const selected = selectedCurrency.value === currency.value;

								return (
									<CommandItem
										key={currency.value}
										value={currency.label}
										onSelect={() => handleSelect(currency.value)}
									>
										<span className="w-12 shrink-0 font-medium">
											{currency.value}
										</span>
										<span className="min-w-0 truncate text-muted-foreground">
											{currency.name} ({currency.symbol})
										</span>
										<OutlineCheck
											className={cn(
												"ml-auto",
												selected ? "opacity-100" : "opacity-0",
											)}
										/>
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
