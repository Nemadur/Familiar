import type { ReactNode } from "react";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { OutlineCalendar } from "@/components/icons/icons";
import { Badge } from "@/components/ui/badge";
import {
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { userJoinDate } from "@/lib/profile";
import type { TUserProfile } from "@/types/user";
import { ProfileBio } from "./bio";
import { ProfileSocials } from "./socials";

function SectionLabel({ children }: { children: ReactNode }) {
	return (
		<h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
			{children}
		</h4>
	);
}

export const ProfileDetailsContent = memo(function ProfileDetailsContent({
	user,
}: {
	user: TUserProfile;
}) {
	const joinDate = userJoinDate({ createdAt: user.createdAt });
	const { t } = useTranslation();

	return (
		<DialogContent className="max-w-sm! gap-4 rounded-2xl border-border p-4">
			<DialogHeader>
				<DialogTitle className="text-base font-semibold leading-4 tracking-tight">
					{user.displayName || user.username}
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

			{joinDate && (
				<Badge variant="secondary" className="w-fit">
					<OutlineCalendar />
					{t("components.profile.details.joined")} {joinDate}
				</Badge>
			)}

			{user.bio && (
				<div>
					<SectionLabel>{t("components.profile.details.bio")}</SectionLabel>
					<div className="line-clamp-10 leading-relaxed text-primary/80">
						<ProfileBio user={user} className="text-xs" />
					</div>
				</div>
			)}

			{user.socials.length > 0 && (
				<>
					<Separator />
					<ProfileSocials socials={user.socials} />
				</>
			)}
		</DialogContent>
	);
});
