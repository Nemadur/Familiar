import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { OutlineChevronRight, SolidStar } from "@/components/icons/icons";
import { ReviewsPanel } from "@/components/layout/profile/reviews-panel";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getUserReviews } from "@/data/reviews";
import { calculateReviewStats } from "@/lib/commission-utils";

interface ReviewsDialogProps {
	username?: string;
}

export function ReviewsDialog({ username }: ReviewsDialogProps) {
	const { data: reviews = [] } = useQuery({
		queryKey: ["userReviews", username],
		queryFn: () => getUserReviews({ data: { username } }),
	});

	const { average, count } = calculateReviewStats(reviews);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="secondary">
					<SolidStar />
					<span className="font-bold">{average}</span>
					<span className="text-muted-foreground text-xs">
						({count} reviews)
					</span>
					<OutlineChevronRight className="text-muted-foreground" size={14} />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-md max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-3xl">
				<div className="shrink-0 bg-background z-10 border-b">
					<DialogHeader className="px-6 pt-5 pb-3 flex flex-row items-center justify-between">
						<div className="flex items-center gap-2">
							<Star className="fill-foreground text-foreground" size={20} />
							<span className="font-bold text-2xl">{average}</span>
							<span className="text-muted-foreground">{count} reviews</span>
						</div>
					</DialogHeader>
				</div>

				<ScrollArea className="flex-1 p-0 w-full">
					<ReviewsPanel
						reviews={reviews}
						className="p-4"
						showSummary={true}
						showAverageScore={true}
					/>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
