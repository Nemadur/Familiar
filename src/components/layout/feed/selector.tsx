import { MOCK_PINNED_FEEDS } from "#/mock/feed";
import { OutlineCompass, OutlineUser } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export type FeedType = "following" | "discover" | "mutuals" | "rabbit-hole";

interface FeedSelectorProps {
	currentFeed: FeedType;
	currentRabbitHole?: string;
	onFeedChange: (feed: FeedType, rabbitHole?: string) => void;
	className?: string;
}

export function FeedSelector({
	currentFeed,
	currentRabbitHole,
	onFeedChange,
}: FeedSelectorProps) {
	const getIconForFeed = (feedId: string) => {
		switch (feedId) {
			case "following":
				return OutlineUser;
			case "discover":
				return OutlineCompass;
			case "mutuals":
				return OutlineUser;
			default:
				return OutlineCompass;
		}
	};

	const pinnedFeeds = MOCK_PINNED_FEEDS;

	return (
		<>
			{/* All Feeds in Order (System + Custom) */}
			{pinnedFeeds?.map((feed) => {
				const IconComponent = getIconForFeed(feed.feedId);
				const isActive =
					feed.type === "system"
						? currentFeed === feed.feedId
						: currentFeed === "rabbit-hole" &&
							currentRabbitHole === feed.feedId;

				return (
					<Tooltip key={feed.id}>
						<TooltipTrigger asChild>
							<Button
								variant={isActive ? "default" : "ghost"}
								size="sm"
								onClick={() => onFeedChange(feed.feedId as FeedType, undefined)}
								className="flex items-center gap-2 rounded-full"
							>
								<IconComponent size={16} />
								{feed.name}
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">{feed.description}</TooltipContent>
					</Tooltip>
				);
			})}
		</>
	);
}
