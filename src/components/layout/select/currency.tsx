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

function getCurrencySymbol(locale: string, currencyCode: string) {
	const parts = new Intl.NumberFormat(locale, {
		style: "currency",
		currency: currencyCode,
	}).formatToParts(0);

	return parts.find((part) => part.type === "currency")?.value ?? currencyCode;
}

export default function CurrencySelect({
	id,
	value,
	onValueChange,
	disabled,
	display,
	variant,
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
	// const resolvedVariant =
	// 	variant ?? (resolvedDisplay === "field" ? "secondary" : "ghost");
	const resolvedAlign =
		align ?? (resolvedDisplay === "field" ? "start" : "end");

	const currencies = React.useMemo<CurrencyOption[]>(() => {
		const locale = i18n.language || "en-US";
		const displayNames = new Intl.DisplayNames([locale], { type: "currency" });

		return STRIPE_SUPPORTED_CURRENCIES.map((currencyCode) => {
			const normalizedCode = currencyCode.toUpperCase();
			const name = displayNames.of(normalizedCode) || normalizedCode;
			const symbol = getCurrencySymbol(locale, normalizedCode);

			return {
				value: normalizedCode,
				name,
				symbol,
				label: `${normalizedCode} ${name} ${symbol}`,
			};
		}).sort((a, b) => a.name.localeCompare(b.name));
	}, [i18n.language]);

	const selectedValue = (value ?? userCurrency ?? "USD").toUpperCase();
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
					variant={"secondary"}
					role="combobox"
					aria-controls={listId}
					aria-expanded={open}
					aria-invalid={ariaInvalid || undefined}
					disabled={disabled}
					size={"xl"}
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
