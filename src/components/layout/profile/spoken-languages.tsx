import * as countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { OutlineTrash } from "@/components/icons/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { languages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { SpokenLanguage } from "@/types/user";

// Register locale safely
try {
	countries.registerLocale(enLocale);
} catch (e) {
	console.warn("Failed to register countries locale:", e);
}

export const levelColors: Record<string, string> = {
	native: "bg-emerald-500/12 text-emerald-600",
	fluent: "bg-blue-500/12 text-blue-600",
	communicative: "bg-amber-500/12 text-amber-600",
	learning: "bg-orange-500/12 text-orange-600",
};

const getTwemojiUrl = (emoji: string) => {
	try {
		const codePoints = Array.from(emoji)
			.map((c) => c.codePointAt(0)?.toString(16))
			.join("-");
		return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${codePoints}.png`;
	} catch {
		return "";
	}
};

function getFlagEmoji(countryCode: string) {
	const codePoints = countryCode
		.toUpperCase()
		.split("")
		.map((char) => 127397 + char.charCodeAt(0));
	return String.fromCodePoint(...codePoints);
}

function getLanguageData(code: string) {
	if (!code) return { flag: "🌐", name: "Unknown" };

	// Check explicit overrides first
	const defined = languages.find((l) => l.value === code);
	if (defined)
		return {
			flag: defined.flag,
			name: defined.label,
		};

	try {
		const locale = new Intl.Locale(code);
		// If valid locale, get display name in NATIVE language
		const name =
			new Intl.DisplayNames([code], { type: "language" }).of(code) || code;

		// If the locale already has a region (e.g. "en-US", "zh-TW"), use it directly
		if (locale.region) return { flag: getFlagEmoji(locale.region), name };

		// For language-only codes, try to maximize the locale to get a likely region.
		const maximized = locale.maximize();
		if (maximized.region) return { flag: getFlagEmoji(maximized.region), name };
	} catch {
		// Ignore errors and try countries fallback
	}

	// Check countries library (handles "japan" -> "JP", "United States" -> "US")
	try {
		const countryCode = countries.getAlpha2Code(code, "en");
		if (countryCode) {
			return {
				flag: getFlagEmoji(countryCode),
				name:
					new Intl.DisplayNames([code], { type: "language" }).of(code) ||
					countries.getName(countryCode, "en") ||
					code,
			};
		}
	} catch (e) {
		console.warn("Error looking up country code:", e);
	}

	return { flag: "🌐", name: code };
}

interface SpokenLanguageProps {
	language: SpokenLanguage;
	showSeparator?: boolean;
}

export function SpokenLanguageBadge({
	language,
	showSeparator,
}: SpokenLanguageProps) {
	const { t } = useTranslation();
	const { flag, name } = getLanguageData(language.locale);

	return (
		<div className="flex items-center gap-1.5">
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex items-center gap-1.5 cursor-default">
						<img
							src={getTwemojiUrl(flag)}
							alt={name}
							className="h-[1.333em] w-fit object-contain shrink-0"
						/>
					</div>
				</TooltipTrigger>
				<TooltipContent side="top">
					<p>
						{name}{" "}
						<span className="capitalize">
							({t(`components.profile.languages.levels.${language.experience}`)}
							)
						</span>
					</p>
				</TooltipContent>
			</Tooltip>
			{showSeparator && <span className="text-muted-foreground/40">/</span>}
		</div>
	);
}

export function SpokenLanguageSelect({
	language,
	onLevelChange,
	onRemove,
}: {
	language: SpokenLanguage;
	onLevelChange?: (level: SpokenLanguage["experience"]) => void;
	onRemove?: () => void;
}) {
	const { t } = useTranslation();
	const { flag, name } = getLanguageData(language.locale);
	const [isOpen, setIsOpen] = useState(false);

	const levels: {
		value: SpokenLanguage["experience"];
		label: string;
		color: string;
	}[] = [
		{
			value: "native",
			label: t("components.profile.languages.levels.native"),
			color: "bg-emerald-500",
		},
		{
			value: "fluent",
			label: t("components.profile.languages.levels.fluent"),
			color: "bg-blue-500",
		},
		{
			value: "communicative",
			label: t("components.profile.languages.levels.communicative"),
			color: "bg-amber-500",
		},
		{
			value: "learning",
			label: t("components.profile.languages.levels.learning"),
			color: "bg-orange-500",
		},
		{
			value: "basic",
			label: t("components.profile.languages.levels.basic"),
			color: "bg-gray-500",
		},
	];

	return (
		<div className="flex items-center justify-between py-1 group w-full">
			<div className="flex items-center gap-3">
				<img
					src={getTwemojiUrl(flag)}
					alt={name}
					className="h-[1.333em] w-fit object-contain shrink-0"
				/>
				<span className="text-sm text-foreground/90 font-medium">{name}</span>
			</div>
			<div className="flex items-center">
				<Select
					value={language.experience}
					onValueChange={(val) =>
						onLevelChange?.(val as SpokenLanguage["experience"])
					}
					onOpenChange={setIsOpen}
				>
					<SelectTrigger className="w-[140px] h-8! rounded-full text-xs shadow-none border-0 hover:bg-secondary">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{levels.map((level) => (
							<SelectItem
								key={level.value}
								value={level.value}
								className="text-xs"
							>
								<div className="flex items-center gap-2">
									<div
										className={cn("w-1.5 h-1.5 rounded-full", level.color)}
									/>
									<span>{level.label}</span>
								</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{onRemove && (
					<div
						className={cn(
							"flex items-center justify-end overflow-hidden transition-all duration-200 ease-in-out",
							isOpen
								? "w-9 opacity-100"
								: "w-0 opacity-0 group-hover:w-9 group-hover:opacity-100",
						)}
					>
						<Button
							variant={"ghost"}
							size={"icon-sm"}
							className={
								"ml-1 text-muted-foreground hover:text-destructive hover:bg-destructive/12 shrink-0"
							}
							onClick={(e) => {
								e.preventDefault();
								onRemove();
							}}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

export function SpokenLanguageRow({ language }: { language: SpokenLanguage }) {
	const { t } = useTranslation();
	const { flag, name } = getLanguageData(language.locale);
	const colorClass =
		levelColors[language.experience] ||
		"bg-muted text-muted-foreground hover:bg-muted/80";

	return (
		<div className="flex items-center justify-between py-1 group">
			<div className="flex items-center gap-3">
				<img
					src={getTwemojiUrl(flag)}
					alt={name}
					className="h-[1.333em] w-fit object-contain shrink-0"
				/>
				<span className="text-sm text-foreground/90 font-medium">{name}</span>
			</div>
			<Badge
				className={cn("capitalize font-medium transition-colors", colorClass)}
			>
				{t(`components.profile.languages.levels.${language.experience}`)}
			</Badge>
		</div>
	);
}
