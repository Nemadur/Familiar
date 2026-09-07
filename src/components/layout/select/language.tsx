import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	OutlineCheck,
	OutlineChevronDown,
} from "@/components/icons/icons";
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
import {
	languages,
	localizePath,
	stripLocaleFromPathname,
	syncLanguage,
} from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function LanguageSelect() {
	const { t, i18n } = useTranslation();
	const router = useRouter();
	const [open, setOpen] = useState(false);

	const selectedLanguage = languages.find((language) =>
		i18n.language.startsWith(language.value),
	);

	async function handleLanguageChange(languageValue: string) {
		if (i18n.language.startsWith(languageValue)) {
			setOpen(false);
			return;
		}

		await syncLanguage(languageValue);

		const nextPathname = localizePath(
			stripLocaleFromPathname(window.location.pathname),
			languageValue,
		);
		const nextHref = `${nextPathname}${window.location.search}${window.location.hash}`;

		setOpen(false);
		router.history.push(nextHref);
	}

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					role="combobox"
					variant="secondary"
					size="xl"
					aria-expanded={open}
				>
					{selectedLanguage ? (
						<>
							<span className="text-lg" aria-hidden="true">
								{selectedLanguage.flag}
							</span>
							<span className="hidden sm:inline-block">
								{selectedLanguage.label}
							</span>
						</>
					) : (
						t("components.language_switcher.select", "Select language")
					)}
					<OutlineChevronDown data-icon="inline-end" />
				</Button>
			</PopoverTrigger>

			<PopoverContent
				align="end"
				className="w-50 overflow-hidden rounded-(--command-content-radius) p-0"
			>
				<Command>
					<CommandInput
						placeholder={t(
							"components.language_select.search",
							"Search language",
						)}
					/>
					<CommandList>
						<CommandEmpty>
							{t(
								"components.language_select.no_results",
								"No language found",
							)}
						</CommandEmpty>
						<CommandGroup>
							{languages.map((language) => (
								<CommandItem
									key={language.value}
									value={language.label}
									onSelect={() => {
										void handleLanguageChange(language.value);
									}}
								>
									<span
										className="mr-2 text-lg leading-none"
										aria-hidden="true"
									>
										{language.flag}
									</span>
									{language.label}
									<OutlineCheck
										className={cn(
											"ml-auto",
											i18n.language.startsWith(language.value)
												? "opacity-100"
												: "opacity-0",
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}