import * as countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { languages } from "@/lib/i18n";
import type { SpokenLanguage } from "@/types/user";

// Register locale safely
try {
	countries.registerLocale(enLocale);
} catch (e) {
	console.warn("Failed to register countries locale:", e);
}

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
			name:
				new Intl.DisplayNames(["en"], { type: "language" }).of(code) ||
				defined.label,
		};

	try {
		const locale = new Intl.Locale(code);
		// If valid locale, get display name
		const name =
			new Intl.DisplayNames(["en"], { type: "language" }).of(code) || code;

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
				name: countries.getName(countryCode, "en") || code,
			};
		}
	} catch (e) {
		console.warn("Error looking up country code:", e);
	}

	return { flag: "🌐", name: code };
}

interface SpokenLanguageBadgeProps {
	language: SpokenLanguage;
	showSeparator?: boolean;
}

export function SpokenLanguageBadge({
	language,
	showSeparator,
}: SpokenLanguageBadgeProps) {
	const { flag, name } = getLanguageData(language.locale);

	return (
		<div className="flex items-center gap-1.5">
			<Tooltip>
				<TooltipTrigger asChild>
					<div className="flex items-center gap-1.5 cursor-default">
						<img
							src={getTwemojiUrl(flag)}
							alt={name}
							className="w-4 h-4 object-contain shrink-0"
						/>
					</div>
				</TooltipTrigger>
				<TooltipContent side="top">
					<p>
						{name} <span className="capitalize">({language.experience})</span>
					</p>
				</TooltipContent>
			</Tooltip>
			{showSeparator && <span className="text-muted-foreground/40">•</span>}
		</div>
	);
}
