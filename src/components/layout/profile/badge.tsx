import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { User } from "@/types/user";
import {
	BadgeIcon,
	BadgeTooltipContent,
	getUserBadges,
	ProfileDetailsContent,
} from "./profile-details";

function ProfileBadge({ user }: { user: User }) {
	const badges = getUserBadges(user);

	if (badges.length === 0) return null;

	const displayBadges = badges.slice(0, 3);

	return (
		<Dialog>
			<div className="flex items-center gap-1">
				<TooltipProvider>
					{displayBadges.map((badge) => (
						<Tooltip key={badge.uuid}>
							<TooltipTrigger asChild>
								<DialogTrigger className="outline-none">
									<BadgeIcon badge={badge} className="size-[1.25em]" />
								</DialogTrigger>
							</TooltipTrigger>
							<TooltipContent side="bottom" className="max-w-[240px] p-3">
								<BadgeTooltipContent badge={badge} />
							</TooltipContent>
						</Tooltip>
					))}
				</TooltipProvider>
			</div>
			<ProfileDetailsContent user={user} />
		</Dialog>
	);
}

export { ProfileBadge };
