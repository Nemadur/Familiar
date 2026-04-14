import { useState } from "react";
import { FeedSelector, type FeedType } from "./selector";
import { Feed } from ".";
import { TooltipProvider } from "@/components/ui/tooltip";

export function MainFeed() {
  const [feedType, setFeedType] = useState<FeedType>("following");
  const [currentRabbitHole, setCurrentRabbitHole] = useState<string | undefined>();

  const handleFeedChange = (type: FeedType, rabbitHole?: string) => {
    setFeedType(type);
    setCurrentRabbitHole(rabbitHole);
  };

  const getFeedProps = () => {
    switch (feedType) {
      case "following":
        return { feedType: "following" as const };
      case "discover":
        return { feedType: "explore" as const };
      case "mutuals":
        return { feedType: "following" as const }; // Map to existing feed type
      case "rabbit-hole":
        return { feedType: "explore" as const }; // Map to existing feed type
      default:
        return { feedType: "following" as const };
    }
  };

  const getEmptyStateVariant = () => {
    switch (feedType) {
      case "following":
        return "following" as const;
      case "discover":
        return "explore" as const;
      case "mutuals":
        return "following" as const;
      case "rabbit-hole":
        return "explore" as const;
      default:
        return "following" as const;
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <FeedSelector
              currentFeed={feedType}
              currentRabbitHole={currentRabbitHole}
              onFeedChange={handleFeedChange}
            />
          </div>
        </div>

        <Feed
          {...getFeedProps()}
          emptyStateVariant={getEmptyStateVariant()}
        />
      </div>
    </TooltipProvider>
  );
}
