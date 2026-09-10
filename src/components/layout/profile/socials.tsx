import {
	OutlineInstagram,
	OutlineLink,
	OutlineTwitter,
} from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import type { UserSocial, UserSocials } from "@/types/user";

type SocialPlatformDetails = {
	label: string;
	icon: typeof OutlineLink;
	baseUrl?: string;
};

const SOCIAL_PLATFORM_DETAILS: Record<string, SocialPlatformDetails> = {
	TWITTER: {
		label: "Twitter",
		icon: OutlineTwitter,
		baseUrl: "https://x.com/",
	},
	X: {
		label: "X",
		icon: OutlineTwitter,
		baseUrl: "https://x.com/",
	},
	INSTAGRAM: {
		label: "Instagram",
		icon: OutlineInstagram,
		baseUrl: "https://instagram.com/",
	},
	FACEBOOK: {
		label: "Facebook",
		icon: OutlineLink,
		baseUrl: "https://facebook.com/",
	},
	WEBSITE: { label: "Website", icon: OutlineLink },
	WEBSITE_1: { label: "Website", icon: OutlineLink },
	WEBSITE_2: { label: "Website", icon: OutlineLink },
};

function isWebUrl(value: string) {
	return /^https?:\/\//i.test(value);
}

function getPlatformDetails(platform: string): SocialPlatformDetails {
	const normalizedPlatform = platform.trim().toUpperCase();

	return (
		SOCIAL_PLATFORM_DETAILS[normalizedPlatform] ?? {
			label: normalizedPlatform
				.toLowerCase()
				.replace(/_/g, " ")
				.replace(/^\w/, (character) => character.toUpperCase()),
			icon: OutlineLink,
		}
	);
}

function getSocialHref({ platform, value }: UserSocial) {
	const normalizedValue = value.trim();

	if (isWebUrl(normalizedValue)) {
		return normalizedValue;
	}

	const details = getPlatformDetails(platform);
	if (details.baseUrl) {
		return `${details.baseUrl}${normalizedValue.replace(/^@/, "")}`;
	}

	return `https://${normalizedValue.replace(/^\/+/, "")}`;
}

interface ProfileSocialsProps {
	socials: UserSocials;
}

export function ProfileSocials({ socials }: ProfileSocialsProps) {
	if (socials.length === 0) return null;

	return (
		<div className="flex flex-col items-start gap-2">
			{socials.map((social) => {
				const details = getPlatformDetails(social.platform);
				const Icon = details.icon;

				return (
					<Button
						asChild
						key={`${social.platform}-${social.value}`}
						variant="link"
						className="h-auto w-fit justify-start gap-2 p-0 text-xs text-muted-foreground no-underline hover:text-foreground"
						size="sm"
					>
						<a
							href={getSocialHref(social)}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={`${details.label}: ${social.value}`}
						>
							<Icon />
							{details.label}
						</a>
					</Button>
				);
			})}
		</div>
	);
}
