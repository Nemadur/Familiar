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

	// Mock data for now - replace with real data later
	const pinnedFeeds = [
		{
			id: "1",
			feedId: "following",
			name: "Following",
			description: "Posts from people you follow",
			type: "system" as const,
		},
		{
			id: "2",
			feedId: "discover",
			name: "Discover",
			description: "Discover new content",
			type: "system" as const,
		},
		{
			id: "3",
			feedId: "mutuals",
			name: "Mutuals",
			description: "Posts from mutual connections",
			type: "system" as const,
		},
	];

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
