import type * as React from "react";
import {
	OutlineCalendar,
	OutlineDiscord,
	OutlineDribbble,
	OutlineInstagram,
	OutlineLink,
	OutlineTwitter,
	SolidCheckmarkSeal,
	SolidCrown,
	SolidHeart,
	SolidReceipt,
	SolidStar,
	SolidTwitter,
} from "@/components/icons/icons";
import { Badge } from "@/components/ui/badge";
import {
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { languages } from "@/lib/i18n";
import { userJoinDate, userLocalTime } from "@/lib/profile";
import { cn, numberFormat } from "@/lib/utils";
import type { User } from "@/types/user";
import { ProfileBio } from "./bio";

export const BADGE_ICONS: Record<string, React.ElementType> = {
	star: SolidStar,
	receipt: SolidReceipt,
	twitter: SolidTwitter,
	heart: SolidHeart,
	crown: SolidCrown,
	check: SolidCheckmarkSeal,
};

const levelColors: Record<string, string> = {
	native: "#22c55e", // green-500
	fluent: "#3b82f6", // blue-500
	communicative: "#eab308", // yellow-500
	learning: "#f97316", // orange-500
};

export interface UserBadge {
	id: string;
	label: string;
	description?: string | null;
	color: string;
	icon: string;
}

export function getUserBadges(user: User): UserBadge[] {
	const badges: UserBadge[] = [];

	if (user.is_verified) {
		badges.push({
			id: "verified",
			label: "Verified",
			description: "Trusted artist with a proven track record of quality work.",
			color: "text-blue-400",
			icon: "check",
		});
	}

	if (user.is_premium) {
		badges.push({
			id: "premium",
			label: "Premium",
			description: "Premium member supporting the platform.",
			color: "text-amber-400",
			icon: "crown",
		});
	}

	if (user.badges) {
		for (const badge of user.badges) {
			badges.push({
				id: badge.uuid,
				label: badge.label,
				description: badge.description,
				color: badge.color,
				icon: "star",
			});
		}
	}

	return badges;
}

export function ProfileDetailsContent({ user }: { user: User }) {
	const badges = getUserBadges(user);
	const joinDate = userJoinDate({ createdAt: user.created_at });
	const localTime = userLocalTime({ timeZone: user.timezone });

	const stats = [
		{
			label: "Followers",
			value: 18_324,
		},
		{
			label: "Following",
			value: 341,
		},
		{
			label: "Works",
			value: 1_234, //TODO: get posts count
		},
	];

	return (
		<DialogContent className="max-w-sm! p-4 gap-3 border-border rounded-2xl">
			{/* Header */}
			<DialogHeader>
				<DialogTitle className="text-base leading-4 font-semibold tracking-tight">
					{user.display_name}
				</DialogTitle>
				<div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
					<span>@{user.username}</span>
					<span>·</span>
					<span>{user.pronouns}</span>
				</div>
			</DialogHeader>

			{/* Divider */}
			<Separator />

			<div>
				{/* Meta */}
				<div className={"flex gap-1 mb-4"}>
					<Badge variant={"secondary"}>
						<OutlineCalendar />
						Joined {joinDate}
					</Badge>
					<Badge variant={"secondary"}>
						<OutlineCalendar />
						{localTime} local
					</Badge>
				</div>

				{/* Stats */}
				{stats.length > 0 && (
					<div className={"grid grid-cols-3 gap-1 mb-4"}>
						{stats.map((stat) => (
							<div
								key={stat.label}
								className="flex flex-col bg-secondary items-center px-2 py-3 rounded-xl"
							>
								<span className="text-sm font-semibold text-foreground">
									{numberFormat(stat.value)}
								</span>
								<span className="text-[10px] text-muted-foreground">
									{stat.label}
								</span>
							</div>
						))}
					</div>
				)}

				{/* Badges */}
				{badges.length > 0 && (
					<TooltipProvider>
						<div className="grid grid-cols-4 gap-1 mb-4">
							{badges.map((badge) => (
								<Tooltip key={badge.id}>
									<TooltipTrigger asChild>
										<div className="flex aspect-square cursor-default flex-col items-center justify-center gap-1.5 rounded-xl bg-secondary transition-colors hover:bg-secondary/90">
											<BadgeIcon badge={badge} className="size-5" />
											<span className="line-clamp-1 text-center text-[10px] font-medium text-muted-foreground leading-tight px-1">
												{badge.label}
											</span>
										</div>
									</TooltipTrigger>
									<TooltipContent side="bottom">
										<BadgeTooltipContent badge={badge} />
									</TooltipContent>
								</Tooltip>
							))}
						</div>
					</TooltipProvider>
				)}
			</div>

			{/* Bio */}
			{user.bio && (
				<div className="line-clamp-10 text-primary/80 leading-relaxed mb-4">
					<ProfileBio user={user} className={"text-xs"} />
				</div>
			)}

			{/* Languages */}
			{/* {user.spoken_languages && user.spoken_languages.length > 0 && (
				<div className="mb-4">
					<h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
						Languages
					</h4>
					<div className="flex flex-col gap-2">
						{user.spoken_languages.map((lang) => {
							const langInfo = languages.find((l) => l.value === lang.code);
							if (!langInfo) return null;
							const color = levelColors[lang.experience] || "#888";

							// Extract region code from flag emoji (e.g. 🇫🇷 -> FR)
							const regionCode = Array.from(langInfo.flag)
								.map((c) => String.fromCharCode(c.codePointAt(0)! - 127397))
								.join("");

							return (
								<div
									key={lang.code}
									className="flex items-center justify-between py-1"
								>
									<div className="flex items-center gap-3">
										<span className="text-sm font-bold text-foreground w-6">
											{regionCode}
										</span>
										<span className="text-sm text-muted-foreground">
											{langInfo.label}
										</span>
									</div>
									<div className="flex items-center gap-2">
										<div
											className="w-1.5 h-1.5 rounded-full"
											style={{ backgroundColor: color }}
										/>
										<span
											className="text-xs font-medium capitalize"
											style={{ color }}
										>
											{lang.experience}
										</span>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)} */}

			<Separator />

			{/* Social links */}
			{user.social_links && user.social_links.length > 0 && (
				<>
					<div className="flex flex-col gap-1">
						{user.social_links.map((link) => (
							<a
								key={link.url}
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground font-medium hover:text-foreground hover:bg-muted/50 transition-colors"
							>
								<span className="text-zinc-600 [&>svg]:size-3.5">
									{getLinkIcon(link.url)}
								</span>
								{link.label || getLinkLabel(link.url)}
							</a>
						))}
					</div>
				</>
			)}
		</DialogContent>
	);
}

function getLinkIcon(url: string) {
	if (url.includes("twitter.com") || url.includes("x.com"))
		return <OutlineTwitter />;
	if (url.includes("instagram.com")) return <OutlineInstagram />;
	if (url.includes("discord.gg") || url.includes("discord.com"))
		return <OutlineDiscord />;
	if (url.includes("dribbble.com")) return <OutlineDribbble />;
	return <OutlineLink />;
}

function getLinkLabel(url: string) {
	if (url.includes("twitter.com") || url.includes("x.com")) return "Twitter";
	if (url.includes("instagram.com")) return "Instagram";
	if (url.includes("discord.gg")) return "Discord";
	if (url.includes("dribbble.com")) return "Dribbble";
	return "Website";
}

export function BadgeTooltipContent({ badge }: { badge: UserBadge }) {
	return (
		<div className="flex flex-col gap-1.5">
			<div className="flex items-center gap-1">
				<BadgeIcon badge={badge} className="size-[1.5em]" />
				<span className="font-semibold">{badge.label}</span>
			</div>
			{badge.description && (
				<p className="leading-snug text-muted-foreground">
					{badge.description}
				</p>
			)}
		</div>
	);
}

export function BadgeIcon({
	badge,
	className,
}: {
	badge: UserBadge;
	className?: string;
	fontSize?: string; // kept for backwards compat, unused
}) {
	const Icon = BADGE_ICONS[badge.icon];
	if (!Icon) return null;
	return <Icon className={cn(className, badge.color)} />;
}
