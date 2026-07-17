import React from "react";
import { useTranslation } from "react-i18next";
import {
	OutlineCheck,
	OutlineChevronDown,
	OutlineChevronRight,
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
import { Elevated } from "@/lib/elevated";
import { languages, localizePath, stripLocaleFromPathname, syncLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function LanguageSelect() {
	const { t, i18n } = useTranslation();
	const [open, setOpen] = React.useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button role={"combobox"} variant={"secondary"} size={"xl"}>
					{i18n.language
						? (() => {
								const selectedLanguage = languages.find((language) =>
									i18n.language.startsWith(language.value),
								);
								return selectedLanguage ? (
									<>
										{/* TODO: replace with svg icons (twittermoji?) */}
										<span className={"text-lg"}>{selectedLanguage.flag}</span>
										<span className={"hidden sm:inline-block"}>
											{selectedLanguage.label}
										</span>
									</>
								) : (
									t("components.language_switcher.select")
								);
							})()
						: t("components.language_switcher.select")}
					<OutlineChevronDown />
				</Button>
			</PopoverTrigger>
			{/* CONTENT */}
			<PopoverContent
				align="end"
				className={
					"w-[200px] p-0 rounded-(--command-content-radius) overflow-hidden"
				}
			>
				<Command>
					<CommandInput placeholder={t("components.language_select.search")} />
					<CommandList>
						<CommandEmpty>
							{t("components.language_select.no_results")}
						</CommandEmpty>
						<CommandGroup>
							{languages.map((language) => (
								<CommandItem
									key={language.value}
									value={language.label}
									onSelect={async () => {
										await syncLanguage(language.value);
										const nextPathname = localizePath(
											stripLocaleFromPathname(window.location.pathname),
											language.value,
										);
										window.location.assign(
											`${nextPathname}${window.location.search}${window.location.hash}`,
										);
										setOpen(false);
									}}
								>
									<span className={"mr-2 text-lg leading-none"}>
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

export default LanguageSelect;
