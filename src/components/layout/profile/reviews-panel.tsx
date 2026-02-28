import { ScrollShadow } from "@heroui/react";
import { Star } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import UserAvatar from "@/components/layout/profile/avatar";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { StarsRating } from "@/components/ui/stars-rating";
import { calculateReviewStats } from "@/lib/commission-utils";
import type { Review } from "@/types/commission";

interface ReviewsPanelProps {
	reviews: Review[];
	isLoading?: boolean;
	itemsPerPage?: number;
	className?: string;
	showSummary?: boolean;
	showAverageScore?: boolean;
	variant?: "default" | "clean";
}

export function ReviewsPanel({
	reviews,
	isLoading,
	itemsPerPage = 5,
	className,
	showSummary = false,
	showAverageScore = false,
	variant = "default",
}: ReviewsPanelProps) {
	const { t } = useTranslation();
	const [currentPage, setCurrentPage] = useState(1);

	const { average, count: totalReviews } = useMemo(
		() => calculateReviewStats(reviews),
		[reviews],
	);

	const ratingDistribution = useMemo(() => {
		if (!reviews.length) return [];
		return [5, 4, 3, 2, 1].map((stars) => {
			const countForStar = reviews.filter(
				(r) => Math.round(r.rating) === stars,
			).length;
			const percentage =
				totalReviews > 0 ? (countForStar / totalReviews) * 100 : 0;
			return { stars, percentage, count: countForStar };
		});
	}, [reviews, totalReviews]);

	const totalPages = Math.ceil(totalReviews / itemsPerPage);

	const paginatedReviews = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage;
		return reviews.slice(start, start + itemsPerPage);
	}, [reviews, currentPage, itemsPerPage]);

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="rounded-xl border bg-card p-6 space-y-4">
					<div className="flex items-center gap-4">
						<Skeleton className="h-16 w-20" />
						<div className="flex-1 space-y-2">
							{[1, 2, 3, 4, 5].map((i) => (
								<Skeleton key={i} className="h-2 w-full" />
							))}
						</div>
					</div>
				</div>
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="rounded-xl border bg-card p-4 space-y-2">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Skeleton className="h-8 w-8 rounded-full" />
									<div className="space-y-1">
										<Skeleton className="h-4 w-24" />
										<Skeleton className="h-3 w-16" />
									</div>
								</div>
								<Skeleton className="h-4 w-20" />
							</div>
							<Skeleton className="h-12 w-full" />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (totalReviews === 0) {
		return (
			<div className="py-8 text-center text-muted-foreground text-sm">
				{t(
					"components.profile.commissions.modal.reviews.empty",
					"No reviews yet",
				)}
			</div>
		);
	}

	return (
		<div className={className}>
			<div className="space-y-6">
				{/* Rating Distribution */}
				{showSummary && (
					<div
						className={
							variant === "clean"
								? "rounded-xl bg-secondary/5 p-6 px-0 space-y-4"
								: "rounded-xl border bg-card p-6 space-y-4"
						}
					>
						<div className="flex items-center gap-4">
							{showAverageScore && (
								<>
									<div className="flex flex-col items-center justify-center gap-1 min-w-[80px]">
										<span className="text-4xl font-bold">{average}</span>
										<StarsRating
											rating={Number.parseFloat(average)}
											size={16}
										/>
										<span className="text-xs text-muted-foreground">
											{t(
												"components.profile.commissions.modal.reviews.total_count",
												{
													count: totalReviews,
												},
											)}
										</span>
									</div>
									<div className="h-full w-px bg-border" />
								</>
							)}
							<div className="flex-1 space-y-2">
								{ratingDistribution.map(({ stars, percentage }) => (
									<div key={stars} className="flex items-center gap-3 text-xs">
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
										{/* Custom Progress Bar */}
										<div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
											<div
												className="h-full bg-amber-400 transition-all duration-500 ease-in-out"
												style={{ width: `${percentage}%` }}
											/>
										</div>
										<span className="w-8 text-right text-muted-foreground tabular-nums">
											{Math.round(percentage)}%
										</span>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

				{/* Reviews List */}
				<div className="space-y-4">
					{paginatedReviews.map((review) =>
						variant === "clean" ? (
							<div key={review.id} className="flex gap-4">
								<UserAvatar
									user={review.author}
									className="h-10 w-10 shrink-0"
								/>
								<div className="flex-1 space-y-1">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<span className="font-semibold text-sm">
												{review.author.display_name}
											</span>
											<span className="text-muted-foreground text-xs">
												{new Date(review.createdAt).toLocaleDateString()}
											</span>
										</div>
										<StarsRating rating={review.rating} size={14} />
									</div>
									<div className="rounded-2xl rounded-tl-none bg-secondary/30 px-4 py-3 text-sm">
										{review.title && (
											<h5 className="mb-1 font-semibold">{review.title}</h5>
										)}
										{review.comment && (
											<p className="text-foreground/90">{review.comment}</p>
										)}
									</div>
								</div>
							</div>
						) : (
							<div
								key={review.id}
								className="rounded-xl border bg-card p-4 space-y-2"
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<UserAvatar user={review.author} />
										<div className="flex flex-col">
											<span className="font-semibold text-sm">
												{review.author.display_name}
											</span>
											<span className="text-muted-foreground text-xs">
												{new Date(review.createdAt).toLocaleDateString()}
											</span>
										</div>
									</div>
									<StarsRating rating={review.rating} size={14} />
								</div>
								{review.title && (
									<h5 className="font-semibold text-sm">{review.title}</h5>
								)}
								{review.comment && (
									<p className="text-sm text-foreground/90">{review.comment}</p>
								)}
							</div>
						),
					)}
				</div>

				{totalPages > 1 && (
					<Pagination className="mt-4">
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									href="#"
									onClick={(e) => {
										e.preventDefault();
										setCurrentPage((p) => Math.max(1, p - 1));
									}}
									aria-disabled={currentPage === 1}
									className={
										currentPage === 1 ? "pointer-events-none opacity-50" : ""
									}
								/>
							</PaginationItem>

							{Array.from({ length: totalPages }).map((_, i) => {
								const page = i + 1;
								return (
									<PaginationItem key={page}>
										<PaginationLink
											href="#"
											isActive={currentPage === page}
											onClick={(e) => {
												e.preventDefault();
												setCurrentPage(page);
											}}
										>
											{page}
										</PaginationLink>
									</PaginationItem>
								);
							})}

							<PaginationItem>
								<PaginationNext
									href="#"
									onClick={(e) => {
										e.preventDefault();
										setCurrentPage((p) => Math.min(totalPages, p + 1));
									}}
									aria-disabled={currentPage === totalPages}
									className={
										currentPage === totalPages
											? "pointer-events-none opacity-50"
											: ""
									}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				)}
			</div>
		</div>
	);
}
