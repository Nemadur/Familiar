import type * as React from "react";
import { useTranslation } from "react-i18next";
import {
	OutlineCalendar,
	OutlineClock03,
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
import { userJoinDate, userLocalTime } from "@/lib/profile";
import { cn, numberFormat } from "@/lib/utils";
import type { User } from "@/types/user";
import type { UserBadge } from "@/types/user/badge";
import { ProfileBio } from "./bio";
import { getSocialIcon } from "./socials";
import { SpokenLanguageRow } from "./spoken-languages";

// ─── Constants ───────────────────────────────────────────────────────────────

export const BADGE_ICONS: Record<string, React.ElementType> = {
	star: SolidStar,
	receipt: SolidReceipt,
	twitter: SolidTwitter,
	heart: SolidHeart,
	crown: SolidCrown,
	check: SolidCheckmarkSeal,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getUserBadges(user: User): UserBadge[] {
	return (user.badges ?? []).map((badge) => ({
		uuid: badge.uuid,
		label: badge.label,
		description: badge.description,
		color: badge.color,
		icon: badge.icon,
	}));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<h4 className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
			{children}
		</h4>
	);
}

export function BadgeIcon({
	badge,
	className,
	fontSize: _fontSize, // kept for backwards compat
}: {
	badge: UserBadge;
	className?: string;
	fontSize?: string;
}) {
	const Icon = BADGE_ICONS[badge.icon];
	if (!Icon) return null;
	return <Icon className={cn(className)} style={{ color: badge.color }} />;
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

// ─── Main component ───────────────────────────────────────────────────────────

export function ProfileDetailsContent({ user }: { user: User }) {
	const badges = getUserBadges(user);
	const joinDate = userJoinDate({ createdAt: user.created_at });
	const localTime = userLocalTime({ timeZone: user.timezone });
	const { t } = useTranslation();

	const stats = [
		{
			label: t("components.profile.details.stats.followers"),
			value: user.followers_count,
		},
		{
			label: t("components.profile.details.stats.following"),
			value: user.following_count,
		},
		{
			label: t("components.profile.details.stats.works"),
			value: user.works_count,
		},
	];

	return (
		<DialogContent className="max-w-sm! p-4 gap-3 border-border rounded-2xl">
			<DialogHeader>
				<DialogTitle className="text-base leading-4 font-semibold tracking-tight">
					{user.display_name}
				</DialogTitle>
				<div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
					<span>@{user.username}</span>
					{user.pronouns && (
						<>
							<span>·</span>
							<span>{user.pronouns}</span>
						</>
					)}
				</div>
			</DialogHeader>

			<Separator />

			{/* Meta + Stats + Badges */}
			<div>
				<div className="flex gap-1 mb-4">
					{joinDate && (
						<Badge variant="secondary">
							<OutlineCalendar />
							{t("components.profile.details.joined")} {joinDate}
						</Badge>
					)}
					{localTime && (
						<Badge variant="secondary">
							<OutlineClock03 />
							{localTime} {t("components.profile.details.local")}
						</Badge>
					)}
				</div>

				<div className="grid grid-cols-3 gap-1 mb-4">
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

				{badges.length > 0 && (
					<TooltipProvider>
						<div className="grid grid-cols-4 gap-1 mb-4">
							{badges.map((badge) => (
								<Tooltip key={badge.uuid}>
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
				<div className="mb-4">
					<SectionLabel>{t("components.profile.details.bio")}</SectionLabel>
					<div className="line-clamp-10 text-primary/80 leading-relaxed">
						<ProfileBio user={user} className="text-xs" />
					</div>
				</div>
			)}

			{/* Languages */}
			{user.spoken_languages && user.spoken_languages.length > 0 && (
				<div className="mb-4">
					<SectionLabel>
						{t("components.profile.details.languages")}
					</SectionLabel>
					<div className="flex flex-col gap-0.5">
						{user.spoken_languages.map((lang) => (
							<SpokenLanguageRow key={lang.locale} language={lang} />
						))}
					</div>
				</div>
			)}

			{/* Social links */}
			{user.social_links && user.social_links.length > 0 && (
				<>
					<Separator />
					<div className="flex flex-col gap-1">
						{user.social_links.map((link) => {
							const Icon = getSocialIcon(link.url);
							return (
								<a
									key={link.url}
									href={link.url}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center w-fit gap-2.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground font-medium hover:text-foreground hover:bg-muted/50 transition-colors [&>span>svg]:size-3.5"
								>
									<span className="text-zinc-600">
										<Icon />
									</span>
									{link.label}
								</a>
							);
						})}
					</div>
				</>
			)}
		</DialogContent>
	);
}
