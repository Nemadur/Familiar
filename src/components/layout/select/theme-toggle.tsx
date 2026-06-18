import React from "react";
import { useTranslation } from "react-i18next";
import {
	OutlineCheck,
	OutlineChevronDown,
	OutlineChevronRight,
	OutlineClearNight,
	OutlineMonitor,
	OutlineSunny,
} from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Elevated } from "@/lib/elevated";
import { cn } from "@/lib/utils";
import { useTheme } from "@/providers/theme";

export default function ThemeToggle() {
	const { t } = useTranslation();
	const { userTheme, setTheme } = useTheme();
	const [open, setOpen] = React.useState(false);

	const themes = [
		{
			value: "light",
			label: t("components.theme_switcher.light", "Light"),
			icon: OutlineSunny,
		},
		{
			value: "dark",
			label: t("components.theme_switcher.dark", "Dark"),
			icon: OutlineClearNight,
		},
		{
			value: "oled",
			label: t("components.theme_switcher.oled", "OLED"),
			icon: OutlineClearNight,
		},
		{
			value: "system",
			label: t("components.theme_switcher.system", "System"),
			icon: OutlineMonitor,
		},
	] as const;

	const selectedTheme = themes.find((theme) => theme.value === userTheme);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					role="combobox"
					variant={"secondary"}
					aria-controls="theme-options"
					className="w-fit"
					aria-expanded={open}
					size={"xl"}
				>
					{selectedTheme ? (
						<>
							<selectedTheme.icon className="size-4" />
							<span className="hidden sm:inline-block">
								{selectedTheme.label}
							</span>
						</>
					) : (
						t("components.theme_switcher.toggle", "Toggle theme")
					)}
					<OutlineChevronDown className="ml-auto size-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-[150px] p-0 overflow-hidden">
				<Command>
					<CommandList id="theme-options">
						<CommandGroup>
							{themes.map((theme) => (
								<CommandItem
									key={theme.value}
									value={theme.value}
									onSelect={() => {
										setTheme(theme.value);
										setOpen(false);
									}}
								>
									<theme.icon />
									{theme.label}
									<OutlineCheck
										className={cn(
											"ml-auto size-4",
											userTheme === theme.value ? "opacity-100" : "opacity-0",
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
