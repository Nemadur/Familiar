import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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

export const levelColors: Record<string, string> = {
	native: "bg-success/12 text-success",
	fluent: "bg-accent/12 text-accent",
	communicative: "bg-warning/12 text-warning",
	learning: "bg-danger/12 text-danger",
};

const LANGUAGE_REGION_OVERRIDES: Record<string, string> = {
	ar: "SA",
	bg: "BG",
	cs: "CZ",
	da: "DK",
	de: "DE",
	el: "GR",
	en: "US",
	es: "ES",
	et: "EE",
	fi: "FI",
	fr: "FR",
	he: "IL",
	hi: "IN",
	hr: "HR",
	hu: "HU",
	id: "ID",
	it: "IT",
	ja: "JP",
	ko: "KR",
	lt: "LT",
	lv: "LV",
	ms: "MY",
	nl: "NL",
	no: "NO",
	pl: "PL",
	pt: "PT",
	ro: "RO",
	ru: "RU",
	sk: "SK",
	sl: "SI",
	sv: "SE",
	th: "TH",
	tr: "TR",
	uk: "UA",
	vi: "VN",
	zh: "CN",
};

const getTwemojiUrl = (emoji: string) => {
	try {
		const codePoints = Array.from(emoji)
			.map((char) => char.codePointAt(0)?.toString(16))
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

function getRegionFromLocaleCode(code: string) {
	const normalizedCode = code.replace("_", "-");
	const [, explicitRegion] =
		normalizedCode.match(/^[a-z]{2,3}-([a-z]{2}|\d{3})/i) ?? [];

	if (explicitRegion && /^[a-z]{2}$/i.test(explicitRegion)) {
		return explicitRegion.toUpperCase();
	}

	const languageCode = normalizedCode.split("-")[0]?.toLowerCase();

	return languageCode ? LANGUAGE_REGION_OVERRIDES[languageCode] : undefined;
}

function useLanguageData(code: string) {
	return useMemo(() => {
		if (!code) {
			return { flag: "🌐", name: "Unknown" };
		}

		const defined = languages.find((language) => language.value === code);
		if (defined) {
			return {
				flag: defined.flag,
				name: defined.label,
			};
		}

		const region = getRegionFromLocaleCode(code);

		return {
			flag: region ? getFlagEmoji(region) : "🌐",
			name: code,
		};
	}, [code]);
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
	const { flag, name } = useLanguageData(language.locale);

	return (
		<div className="flex items-center gap-1.5">
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex cursor-default items-center gap-1.5">
						<img
							src={getTwemojiUrl(flag)}
							alt={name}
							className="h-[1.333em] w-fit shrink-0 object-contain"
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
	const { flag, name } = useLanguageData(language.locale);
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
		<div className="group flex w-full items-center justify-between py-1">
			<div className="flex items-center gap-3">
				<img
					src={getTwemojiUrl(flag)}
					alt={name}
					className="h-[1.333em] w-fit shrink-0 object-contain"
				/>
				<span className="font-medium text-foreground/90 text-sm">{name}</span>
			</div>
			<div className="flex items-center">
				<Select
					value={language.experience}
					onValueChange={(value) =>
						onLevelChange?.(value as SpokenLanguage["experience"])
					}
					onOpenChange={setIsOpen}
				>
					<SelectTrigger className="h-8! w-[140px] rounded-full border-0 text-xs shadow-none hover:bg-secondary">
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
										className={cn("h-1.5 w-1.5 rounded-full", level.color)}
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
							variant="ghost"
							size="icon-sm"
							className="ml-1 shrink-0 text-muted-foreground hover:bg-destructive/12 hover:text-destructive"
							onClick={(event) => {
								event.preventDefault();
								onRemove();
							}}
						>
							<Trash2 className="size-4" />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

export function SpokenLanguageRow({ language }: { language: SpokenLanguage }) {
	const { t } = useTranslation();
	const { flag, name } = useLanguageData(language.locale);
	const colorClass =
		levelColors[language.experience] ||
		"bg-muted text-muted-foreground hover:bg-muted/80";

	return (
		<div className="group flex items-center justify-between py-1">
			<div className="flex items-center gap-3">
				<img
					src={getTwemojiUrl(flag)}
					alt={name}
					className="h-[1.333em] w-fit shrink-0 object-contain"
				/>
				<span className="font-medium text-foreground/90 text-sm">{name}</span>
			</div>
			<Badge
				className={cn("font-medium capitalize transition-colors", colorClass)}
			>
				{t(`components.profile.languages.levels.${language.experience}`)}
			</Badge>
		</div>
	);
}
