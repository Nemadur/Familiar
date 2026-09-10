import { memo } from "react";
import { useTranslation } from "react-i18next";
import { SolidCheckmarkSeal, SolidCrown } from "@/components/icons/icons";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TUserProfile } from "@/types/user";
import { ProfileDetailsContent } from "./profile-details";

const ProfileBadge = memo(function ProfileBadge({
	user,
}: {
	user: TUserProfile;
}) {
	const { t } = useTranslation();
	const badges = [
		user.isVerified
			? {
					label: t("components.profile.badges.verified", "Verified"),
					icon: SolidCheckmarkSeal,
					className: "text-primary",
				}
			: null,
		user.isPremium
			? {
					label: t("components.profile.badges.supporter", "Supporter"),
					icon: SolidCrown,
					className: "text-amber-500",
				}
			: null,
	].filter((badge) => badge !== null);

	if (badges.length === 0) return null;

	return (
		<Dialog>
			<div className="flex items-center gap-1">
				<TooltipProvider>
					{badges.map((badge) => {
						const Icon = badge.icon;

						return (
							<Tooltip key={badge.label}>
								<TooltipTrigger asChild>
									<DialogTrigger className="outline-none">
										<Icon className={`size-[1.25em] ${badge.className}`} />
									</DialogTrigger>
								</TooltipTrigger>
								<TooltipContent side="bottom">{badge.label}</TooltipContent>
							</Tooltip>
						);
					})}
				</TooltipProvider>
			</div>
			<ProfileDetailsContent user={user} />
		</Dialog>
	);
});

export { ProfileBadge };
