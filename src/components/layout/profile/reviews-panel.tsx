import { useMemo, useState, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
import { UserComment } from "@/components/ui/user-comment";
import { OutlineStar, SolidStar } from "@/components/icons/icons";
import UserAvatar from "@/components/layout/profile/avatar";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { StarsRating } from "@/components/ui/stars-rating";
import { calculateReviewStats } from "@/lib/commission-utils";
import { cn, createStaticList } from "@/lib/utils";
// import type { Review } from "@/types/commission";

interface ReviewsPanelProps {
	reviews: any[];
	isLoading?: boolean;
	itemsPerPage?: number;
	className?: string;
	showSummary?: boolean;
	showAverageScore?: boolean;
	variant?: "default" | "clean";
}

type FormattedDateSnapshot = {
	formattedDate: string;
	dateTime: string;
} | null;

const RATING_STAR_ITEMS = createStaticList("rating-star", 5);
const SUMMARY_SKELETON_ITEMS = createStaticList("summary-skeleton", 5);
const REVIEW_SKELETON_ITEMS = createStaticList("review-skeleton", 3);

const formattedDateCache = new Map<string, FormattedDateSnapshot>();

function subscribeToFormattedDateStore() {
	return () => {};
}

function getDateCacheKey(value: string | number | Date) {
	return value instanceof Date ? value.toISOString() : String(value);
}

function getClientFormattedDateSnapshot(
	value: string | number | Date,
): FormattedDateSnapshot {
	const cacheKey = getDateCacheKey(value);
	const cached = formattedDateCache.get(cacheKey);

	if (cached !== undefined) {
		return cached;
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		formattedDateCache.set(cacheKey, null);
		return null;
	}

	const snapshot = {
		formattedDate: date.toLocaleDateString(),
		dateTime: date.toISOString(),
	};

	formattedDateCache.set(cacheKey, snapshot);

	return snapshot;
}

function getServerFormattedDateSnapshot(): FormattedDateSnapshot {
	return null;
}

function useClientFormattedDate(value: string | number | Date) {
	return useSyncExternalStore(
		subscribeToFormattedDateStore,
		() => getClientFormattedDateSnapshot(value),
		getServerFormattedDateSnapshot,
	);
}

function ClientDate({
	value,
	className,
}: {
	value: string | number | Date;
	className?: string;
}) {
	const snapshot = useClientFormattedDate(value);

	if (!snapshot) {
		return null;
	}

	return (
		<time className={className} dateTime={snapshot.dateTime}>
			{snapshot.formattedDate}
		</time>
	);
}

function getRatingDistribution(reviews: any[], totalReviews: number) {
	const distribution: Array<{
		stars: number;
		percentage: number;
		count: number;
	}> = [];

	for (const stars of [5, 4, 3, 2, 1]) {
		let countForStar = 0;

		for (const review of reviews) {
			if (Math.round(review.rating) === stars) {
				countForStar += 1;
			}
		}

		const percentage =
			totalReviews > 0 ? (countForStar / totalReviews) * 100 : 0;

		distribution.push({ stars, percentage, count: countForStar });
	}

	return distribution;
}

function RatingStarsRow({ stars }: { stars: number }) {
	return (
		<div className="flex gap-0.5 w-24">
			{RATING_STAR_ITEMS.map((item) => {
				const isFilled = item.index < stars;
				const key = `${stars}-${item.id}`;

				return isFilled ? (
					<SolidStar key={key} size={16} className="text-amber-400" />
				) : (
					<OutlineStar
						key={key}
						size={16}
						className="text-muted-foreground/40"
					/>
				);
			})}
		</div>
	);
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

		return getRatingDistribution(reviews, totalReviews);
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
							{SUMMARY_SKELETON_ITEMS.map((item) => (
								<Skeleton key={item.id} className="h-2 w-full" />
							))}
						</div>
					</div>
				</div>
				<div className="space-y-4">
					{REVIEW_SKELETON_ITEMS.map((item) => (
						<div
							key={item.id}
							className="rounded-xl border bg-card p-4 space-y-2"
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<Skeleton className="size-8 rounded-full" />
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
				{showSummary && (
					<div
						className={cn(
							"rounded-xl p-6 space-y-4",
							variant === "clean" ? "px-0" : "border bg-card",
						)}
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
										<RatingStarsRow stars={stars} />
										<div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
											<Progress
												value={percentage}
												className="[&>div]:bg-amber-400"
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

				<div className="space-y-4">
					{paginatedReviews.map((review) =>
						variant === "clean" ? (
							<UserComment
								key={review.id}
								author={review.author}
								rightSideContent={
									<div className="flex items-center gap-2">
										<ClientDate
											value={review.createdAt}
											className="text-muted-foreground text-xs"
										/>
										<StarsRating rating={review.rating} size={14} />
									</div>
								}
							>
								{review.title && (
									<h5 className="mb-1 font-semibold">{review.title}</h5>
								)}
								{review.comment && (
									<p className="text-foreground/90">{review.comment}</p>
								)}
							</UserComment>
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
											<ClientDate
												value={review.createdAt}
												className="text-muted-foreground text-xs"
											/>
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
									onClick={(event) => {
										event.preventDefault();
										setCurrentPage((page) => Math.max(1, page - 1));
									}}
									aria-disabled={currentPage === 1}
									className={
										currentPage === 1 ? "pointer-events-none opacity-50" : ""
									}
								/>
							</PaginationItem>

							{Array.from({ length: totalPages }).map((_, index) => {
								const page = index + 1;

								return (
									<PaginationItem key={page}>
										<PaginationLink
											href="#"
											isActive={currentPage === page}
											onClick={(event) => {
												event.preventDefault();
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
									onClick={(event) => {
										event.preventDefault();
										setCurrentPage((page) => Math.min(totalPages, page + 1));
									}}
									aria-disabled={currentPage === totalPages}
									className={cn(
										currentPage === totalPages &&
											"pointer-events-none opacity-50",
									)}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				)}
			</div>
		</div>
	);
}
