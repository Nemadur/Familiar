import { useTranslation } from "react-i18next";

import { OutlineImage } from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import type { TUserProfile } from "@/types/user";
import { TRoles } from "@/types/user/roles";

export function hasArtistPortfolio(user: Pick<TUserProfile, "roles">) {
	return user.roles.includes(TRoles.Artist);
}

export function PortfolioUnavailable() {
	const { t } = useTranslation();

	return (
		<EmptyPage
			icon={OutlineImage}
			title={t(
				"components.profile.portfolio.unavailable.title",
				"No portfolio",
			)}
			description={t(
				"components.profile.portfolio.unavailable.description",
				"This account doesn't have an artist portfolio.",
			)}
			className="min-h-80 px-6 py-12"
			iconContainerClassName="bg-surface-2"
			iconClassName="text-muted-foreground"
		/>
	);
}
