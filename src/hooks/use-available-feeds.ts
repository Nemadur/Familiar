import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
	OutlineBookmark,
	OutlineCrown,
	OutlineDribbble,
	OutlineHeart,
	OutlineUser,
} from "@/components/icons/icons";
import type { User } from "@/types/user";

export function useAvailableFeeds(user: User, isMe: boolean) {
	const { t } = useTranslation();

	const availableFeeds = useMemo(() => {
		const feeds = [];
		// Use counts from user object instead of fetching content
		if (isMe || user.commissions_count > 0)
			feeds.push({
				id: "commissions",
				label: t("components.profile.tabs.commissions"),
				icon: OutlineCrown,
			});
		if (isMe || user.works_count > 0)
			feeds.push({
				id: "portfolio",
				label: t("components.profile.tabs.portfolio"),
				icon: OutlineDribbble,
			});
		if (isMe || user.characters_count > 0)
			feeds.push({
				id: "characters",
				label: t("components.profile.tabs.characters"),
				icon: OutlineUser,
			});
		if (isMe) {
			feeds.push({
				id: "saved",
				label: t("components.profile.tabs.saved"),
				icon: OutlineBookmark,
			});
			feeds.push({
				id: "liked",
				label: t("components.profile.tabs.liked"),
				icon: OutlineHeart,
			});
		}
		return feeds;
	}, [user, isMe, t]);

	return availableFeeds;
}
