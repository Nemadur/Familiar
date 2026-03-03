import { useState } from "react";
import { useTranslation } from "react-i18next";
import { OutlineClearNight, OutlineSunny } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/providers/theme";

export default function ThemeToggle() {
	const { t } = useTranslation();
	const { userTheme, setTheme } = useTheme();
	const [open, setOpen] = useState(false);

	const toggleTheme = () => {
		if (userTheme === "dark") {
			setTheme("light");
		} else if (userTheme === "light") {
			setTheme("dark");
		} else {
			const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
			setTheme(isDark ? "light" : "dark");
		}
	};

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="secondary"
					size="icon"
					className="rounded-full"
					onClick={(event) => {
						// If menu is open, let it close naturally (don't toggle theme)
						if (open) return;

						// Toggle theme on primary click
						toggleTheme();
						event.preventDefault();
					}}
					onPointerDown={(event) => {
						// Prevent Radix from toggling the menu on left click
						if (event.button === 0) {
							event.preventDefault();
						}
					}}
					onContextMenu={(event) => {
						event.preventDefault();
						setOpen(true);
					}}
				>
					<OutlineSunny className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
					<OutlineClearNight className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
					<span className="sr-only">
						{t("components.theme_switcher.toggle", "Toggle theme")}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme("light")}>
					{t("components.theme_switcher.light", "Light")}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")}>
					{t("components.theme_switcher.dark", "Dark")}
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")}>
					{t("components.theme_switcher.system", "System")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
