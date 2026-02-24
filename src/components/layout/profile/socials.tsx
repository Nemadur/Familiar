import {
	OutlineDiscord,
	OutlineDribbble,
	OutlineInstagram,
	OutlineLink,
	OutlineTwitter,
} from "@/components/icons/icons";
import type { SocialLink } from "@/types/user";

const SOCIAL_PLATFORMS = [
	{ domains: ["twitter.com", "x.com"], icon: OutlineTwitter },
	{ domains: ["instagram.com"], icon: OutlineInstagram },
	{ domains: ["discord.gg", "discord.com"], icon: OutlineDiscord },
	{ domains: ["dribbble.com"], icon: OutlineDribbble },
] as const;

export function getSocialIcon(url: string) {
	const lowerUrl = url.toLowerCase();
	const platform = SOCIAL_PLATFORMS.find((p) =>
		p.domains.some((d) => lowerUrl.includes(d)),
	);
	return platform?.icon ?? OutlineLink;
}

interface ProfileSocialsProps {
	links: SocialLink[];
}

export function ProfileSocials({ links }: ProfileSocialsProps) {
	if (!links || links.length === 0) return null;

	return (
		<div className="w-full overflow-x-auto pb-1 md:pb-0 whitespace-nowrap md:whitespace-normal">
			<div className="flex w-max flex-row items-center gap-5 pt-2 md:w-full md:flex-col md:items-start md:gap-2">
				{links.map((link) => {
					const Icon = getSocialIcon(link.url);
					return (
						<a
							key={link.url}
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-2 text-muted-foreground text-sm transition-colors hover:text-foreground"
						>
							<Icon size={16} />
							<span>{link.label}</span>
						</a>
					);
				})}
			</div>
		</div>
	);
}
