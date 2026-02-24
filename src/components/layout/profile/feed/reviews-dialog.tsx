import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Star } from "lucide-react";
import { OutlineChevronRight, SolidStar } from "@/components/icons/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StarsRating } from "@/components/ui/stars-rating";
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

	// Calculate rating distribution
	const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
		const countForStar = reviews.filter(
			(r) => Math.round(r.rating) === stars,
		).length;
		const percentage = count > 0 ? (countForStar / count) * 100 : 0;
		return { stars, percentage, count: countForStar };
	});

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

					<div className="px-6 pb-5 space-y-1">
						{ratingDistribution.map(({ stars, percentage }) => (
							<div key={stars} className="flex items-center gap-2 text-xs">
								<div className="flex gap-0.5 w-24">
									{Array.from({ length: 5 }).map((_, i) => (
										<Star
											key={i}
											size={16}
											className={
												i < stars
													? "fill-amber-400 text-amber-400"
													: "text-secondary"
											}
										/>
									))}
								</div>
								<Progress
									value={percentage}
									className="h-1.5 flex-1 bg-secondary"
								/>
								<span className="w-8 text-right text-muted-foreground">
									{Math.round(percentage)}%
								</span>
							</div>
						))}
					</div>
				</div>

				<ScrollArea className="flex-1 p-2 w-full">
					<div className="space-y-4">
						{reviews.map((review) => (
							<div key={review.id} className="p-4 rounded-2xl space-y-3">
								<div className="flex items-start justify-between">
									<div className="flex items-center gap-3">
										<Avatar className="size-10">
											<AvatarImage
												src={
													review.authorAvatar ||
													`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.authorName}`
												}
											/>
											<AvatarFallback>{review.authorName[0]}</AvatarFallback>
										</Avatar>
										<div className="flex flex-col">
											<span className="font-semibold text-sm">
												{review.authorName}
											</span>
											<span className="text-[10px] text-muted-foreground uppercase tracking-wide">
												Verified Purchase
											</span>
										</div>
									</div>
									<span className="text-xs text-muted-foreground whitespace-nowrap">
										{new Date(review.createdAt).toLocaleDateString("en-US", {
											month: "short",
											year: "numeric",
										})}
									</span>
								</div>

								<StarsRating rating={review.rating} />

								{review.comment && (
									<p className="text-sm leading-relaxed">{review.comment}</p>
								)}

								<Button
									variant="outline"
									size="sm"
									className="w-full justify-between h-8 text-xs font-normal text-muted-foreground hover:text-foreground"
								>
									<span>Item: {review.itemName}</span>
									<ChevronRight size={12} />
								</Button>
							</div>
						))}
						{reviews.length === 0 && (
							<div className="py-10 text-center text-muted-foreground">
								No reviews yet
							</div>
						)}

						{reviews.length > 0 && (
							<Pagination className="mt-4">
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											href="#"
											onClick={(e) => e.preventDefault()}
										/>
									</PaginationItem>
									<PaginationItem>
										<PaginationLink
											href="#"
											isActive
											onClick={(e) => e.preventDefault()}
										>
											1
										</PaginationLink>
									</PaginationItem>
									<PaginationItem>
										<PaginationNext
											href="#"
											onClick={(e) => e.preventDefault()}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						)}
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
