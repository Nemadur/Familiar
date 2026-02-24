import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
	OutlineBookmark,
	OutlineCrown,
	OutlineDribbble,
	OutlineHeart,
	OutlineUser,
} from "@/components/icons/icons";
import { useSuspenseProfileContent } from "@/hooks/use-profile-content";
import type { User } from "@/types/user";

export function useAvailableFeeds(user: User, isMe: boolean) {
	const { t } = useTranslation();
	const { commissions, posts, characters } = useSuspenseProfileContent(
		user.uuid,
	);

	const availableFeeds = useMemo(() => {
		const feeds = [];
		if (isMe || commissions.length > 0)
			feeds.push({
				id: "commissions",
				label: t("components.profile.tabs.commissions"),
				icon: OutlineCrown,
			});
		if (isMe || posts.length > 0)
			feeds.push({
				id: "portfolio",
				label: t("components.profile.tabs.portfolio"),
				icon: OutlineDribbble,
			});
		if (isMe || characters.length > 0)
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
	}, [commissions, posts, characters, isMe, t]);

	return availableFeeds;
}
