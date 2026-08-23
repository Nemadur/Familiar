import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
	OutlineBookmark,
	OutlineCrown,
	OutlineDribbble,
	OutlineFolder,
	OutlineHeart,
	OutlineUser,
} from "@/components/icons/icons";
import type { TUserProfile } from "@/types/user";

export function useAvailableFeeds(user: TUserProfile, isMe: boolean) {
	const { t } = useTranslation();

	const availableFeeds = useMemo(() => {
		const feeds = [];
		// Use counts from user object instead of fetching content
		// if (isMe || user.stats.commissionsCount > 0)
		// feeds.push({
		// 	id: "commissions",
		// 	label: t("components.profile.tabs.commissions", "Commissions"),
		// 	icon: OutlineCrown,
		// });
		// if (isMe || user.stats.worksCount > 0)
		feeds.push({
			id: "portfolio",
			label: t("components.profile.tabs.portfolio", "Portfolio"),
			icon: OutlineDribbble,
		});
		// if (isMe || user.stats.charactersCount > 0)
		// feeds.push({
		// 	id: "characters",
		// 	label: t("components.profile.tabs.characters", "Characters"),
		// 	icon: OutlineUser,
		// });
		// Add shop tab as requested
		// feeds.push({
		// 	id: "shop",
		// 	label: t("components.profile.tabs.shop", "Shop"),
		// 	icon: OutlineFolder, // Temporary icon
		// });
		if (isMe) {
			feeds.push({
				id: "saved",
				label: t("components.profile.tabs.saved", "Saved"),
				icon: OutlineBookmark,
			});
			feeds.push({
				id: "liked",
				label: t("components.profile.tabs.liked", "Liked"),
				icon: OutlineHeart,
			});
		}
		return feeds;
	}, [isMe, t]);

	return availableFeeds;
}
