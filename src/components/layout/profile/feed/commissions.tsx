import { ScrollShadow } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MarkdownDisplay } from "@/components/common/markdown-display";
import {
	OutlineBell,
	OutlineBookmark,
	OutlineChat,
	OutlineEyeOff,
	OutlineUser,
} from "@/components/icons/icons";
import {
	Reel,
	ReelContent,
	ReelImage,
	type ReelItem,
	ReelProgress,
} from "@/components/kibo-ui/reel";
import { EmptyPage } from "@/components/layout/empty-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBlurredImage } from "@/hooks/use-blurred-image";
import { useMediaQuery } from "@/hooks/use-media-query";
import { calculateCommissionPricing } from "@/lib/commission-utils";
import type { CommissionCategory, CommissionItem } from "@/types/commission";
import type { User } from "@/types/user";

import { ReviewsDialog } from "./reviews-dialog";

export type { CommissionCategory, CommissionItem };

interface ProfileCommissionsProps {
	categories: CommissionCategory[];
	artist: User;
}

function CommissionCard({
	item,
	status: categoryStatus,
	artist,
}: {
	item: CommissionItem;
	status: CommissionCategory["status"];
	artist: User;
}) {
	const { t } = useTranslation();
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const navigate = useNavigate();
	const [isContentRevealed, setIsContentRevealed] = useState(false);

	const isLgOrLower = useMediaQuery("(max-width: 1279px)");

	useEffect(() => {
		if (isLgOrLower) {
			setIsPlaying(true);
		} else {
			setIsPlaying(false);
		}
	}, [isLgOrLower]);

	// Use item status if available, otherwise fallback to category status
	const status = item.status || categoryStatus;

	const images =
		item.imageUrls && item.imageUrls.length > 0
			? item.imageUrls
			: ["https://placehold.co/600x400?text=No+Image"];

	const reelItems: ReelItem[] = images.map((url, index) => ({
		id: `${item.id}-${index}`,
		type: "image",
		src: url,
		duration: 1,
		alt: item.title,
	}));

	const hasMultipleImages = images.length > 1;
	const hasContentWarnings =
		item.contentWarnings && item.contentWarnings.length > 0;
	const shouldBlur = hasContentWarnings && !isContentRevealed;
	const blurredImageSrc = useBlurredImage(item.imageUrls?.[0], shouldBlur);

	// Platform fee and Discount logic via utility
	const {
		basePrice: discountedPrice,
		originalPrice,
		discountRate,
	} = calculateCommissionPricing(item.price, item.discountRate);

	return (
		// biome-ignore lint/a11y/useSemanticElements: <explanation>
		<article
			role="button"
			className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-border/50 bg-card p-2 transition-colors hover:border-foreground/10 hover:bg-accent/50 xl:flex-row sm:rounded-4xl"
			onMouseEnter={() => {
				if (isLgOrLower) return;
				setIsPlaying(true);
			}}
			onMouseLeave={() => {
				if (isLgOrLower) return;
				setIsPlaying(false);
				setCurrentImageIndex(0);
			}}
			onClick={() =>
				navigate({
					to: `/${artist.username}/commissions/${item.id}`,
					state: { item },
					replace: true,
				})
			}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					navigate({
						to: `/${artist.username}/commissions/${item.id}`,
						state: { item },
						replace: true,
					});
				}
			}}
			tabIndex={0}
		>
			{/* Image Section */}
			<div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-muted xl:w-2/5 sm:rounded-3xl">
				{shouldBlur ? (
					<div className="h-full w-full overflow-hidden bg-zinc-900">
						{blurredImageSrc ? (
							<div
								className="h-full w-full bg-cover bg-center opacity-80 blur-xl filter transition-all duration-500 hover:scale-110 hover:opacity-100"
								style={{ backgroundImage: `url(${blurredImageSrc})` }}
							/>
						) : artist.media?.avatar ? (
							<div
								className="h-full w-full bg-cover bg-center opacity-50 blur-3xl filter transition-all duration-500 hover:scale-110 hover:opacity-70"
								style={{ backgroundImage: `url(${artist.media.avatar})` }}
							/>
						) : (
							<div className="h-full w-full bg-linear-to-br from-zinc-800 to-zinc-950 opacity-50" />
						)}
					</div>
				) : (
					<div className="h-full w-full transition-all duration-500">
						<Reel
							className="aspect-video h-full w-full"
							data={reelItems}
							index={currentImageIndex}
							onIndexChange={setCurrentImageIndex}
							playing={isPlaying && hasMultipleImages}
							onPlayingChange={(playing) => {
								if (hasMultipleImages) setIsPlaying(playing);
							}}
							autoPlay={false}
							muted={true}
							resetOnPause={true}
						>
							{hasMultipleImages && (
								<>
									<div className="pointer-events-none absolute right-0 bottom-0 left-0 z-0 h-16 bg-linear-to-t from-black/60 to-transparent" />
									<ReelProgress className="top-auto right-auto bottom-2 left-1/2 z-10 w-1/2 -translate-x-1/2 px-1" />
								</>
							)}

							<ReelContent>
								{(reelItem) => (
									<ReelImage
										alt={reelItem.alt || ""}
										duration={reelItem.duration}
										src={reelItem.src}
										className="h-full w-full object-cover"
									/>
								)}
							</ReelContent>
						</Reel>
					</div>
				)}

				{/* Sensitive Content Overlay */}
				{shouldBlur && (
					<div className="absolute inset-0 z-10 flex flex-col justify-center bg-black/60 p-4 text-center backdrop-blur-sm">
						<OutlineEyeOff className="text-white mb-4" size={32} />
						<h4 className="mb-1 text-left font-bold text-white text-xl">
							{t("components.profile.commissions.card.sensitive_content")}
						</h4>
						<p className="mb-4 text-left text-sm text-white/70">
							{item.contentWarnings && item.contentWarnings.length > 0
								? t("components.profile.commissions.card.contains_tags", {
										tags: item.contentWarnings
											.map((w) => w.replace(/_/g, " ").toLowerCase())
											.join(", "),
									})
								: t("components.profile.commissions.card.content_warning")}
						</p>

						<Button
							size={"sm"}
							className="border-none w-fit bg-background hover:bg-background/90 text-foreground"
							onClick={(e) => {
								e.stopPropagation();
								setIsContentRevealed(true);
							}}
						>
							{/* <OutlineEye /> */}
							{t("components.profile.commissions.card.show_content")}
						</Button>
					</div>
				)}

				{/* Hide Content Button (when revealed) */}
				{hasContentWarnings && isContentRevealed && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant={"ghost"}
								size={"icon"}
								className="absolute right-2 top-2 z-20 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 hover:text-white"
								onClick={(e) => {
									e.stopPropagation();
									setIsContentRevealed(false);
								}}
							>
								<OutlineEyeOff className="size-4" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side={"left"}>
							{t("components.profile.commissions.card.hide_content")}
						</TooltipContent>
					</Tooltip>
				)}
			</div>

			{/* Content Section */}
			<div className="flex flex-1 flex-col gap-3 p-2 sm:gap-4 sm:p-1 xl:pl-6 xl:pr-2">
				<div className="space-y-1 sm:space-y-2">
					<div className="relative flex gap-10">
						<h3 className="line-clamp-2 text-start min-w-0 font-bold text-foreground text-lg leading-tight transition-colors group-hover:text-primary md:pr-14">
							{item.title}
						</h3>
						<Button
							size={"icon"}
							className="absolute hidden xl:flex top-0 right-0 z-0 shrink-0 bg-transparent text-primary shadow-none before:absolute before:bottom-0 before:-z-10 before:h-16 before:w-full before:rounded-b-full before:bg-primary/6 before:transition-all hover:bg-transparent hover:before:translate-y-1.5 hover:before:bg-primary/10 [&>svg]:transition-transform hover:[&>svg]:translate-y-1.5"
						>
							<OutlineBookmark />
						</Button>
					</div>

					<div className="relative">
						{/* TODO: replace USD to dynamic exchange */}
						<div className="flex items-center justify-between text-sm">
							<div className="flex items-baseline gap-2 text-left">
								<span className="font-medium text-muted-foreground">
									{t("components.profile.commissions.card.from")}
								</span>
								<span className="font-semibold text-primary">
									USD {discountedPrice.toFixed(2)}
								</span>
								{discountRate > 0 && (
									<span className="text-muted-foreground text-xs opacity-70 gap-2 flex">
										<span className="line-through">
											USD {originalPrice.toFixed(2)}
										</span>
										<span>(-{Math.round(discountRate * 100)}%)</span>
									</span>
								)}
							</div>
						</div>
						<ScrollShadow
							hideScrollBar
							className="mt-2 max-h-16 text-left overflow-hidden sm:mt-3"
						>
							<MarkdownDisplay
								className="[--tw-prose-body:var(--muted-foreground)] [--tw-prose-headings:var(--muted-foreground)] [--tw-prose-bold:var(--muted-foreground)] [--tw-prose-bullets:var(--muted-foreground)] [--tw-prose-counters:var(--muted-foreground)] text-sm"
								content={item.description}
							/>
						</ScrollShadow>
					</div>
				</div>

				<div className="flex w-full gap-2">
					{status === "open" && (
						<>
							<Button
								className="flex-1"
								onClick={(e) => {
									e.stopPropagation();
									if (shouldBlur) {
										setIsContentRevealed(true);
									} else {
										navigate({
											to: `/${artist.username}/commissions/${item.id}`,
											state: { item },
										});
									}
								}}
							>
								{shouldBlur
									? t(
											"components.profile.commissions.card.show_details_18_plus",
										)
									: t("components.profile.commissions.card.start_request")}
							</Button>
							<Button
								variant="secondary"
								size="icon"
								onClick={(e) => e.stopPropagation()}
							>
								<OutlineChat />
							</Button>
							<Button
								variant="secondary"
								size="icon"
								className="xl:hidden"
								onClick={(e) => e.stopPropagation()}
							>
								<OutlineBookmark />
							</Button>
						</>
					)}
					{status === "waitlist" && (
						<>
							<Button
								variant="secondary"
								className="flex-1"
								onClick={(e) => e.stopPropagation()}
							>
								{t("components.profile.commissions.card.join_waitlist")}
							</Button>
							<Button
								variant="secondary"
								size="icon"
								onClick={(e) => e.stopPropagation()}
							>
								<OutlineChat />
							</Button>
							<Button
								variant="secondary"
								size="icon"
								className="xl:hidden"
								onClick={(e) => e.stopPropagation()}
							>
								<OutlineBookmark />
							</Button>
						</>
					)}
					{status === "closed" && (
						<>
							<Button
								variant="secondary"
								className="flex-1"
								onClick={(e) => e.stopPropagation()}
							>
								{t("components.profile.commissions.card.get_notified")}
							</Button>
							<Button
								variant="secondary"
								size="icon"
								onClick={(e) => e.stopPropagation()}
							>
								<OutlineChat />
							</Button>
							<Button
								variant="secondary"
								size="icon"
								className="xl:hidden"
								onClick={(e) => e.stopPropagation()}
							>
								<OutlineBookmark />
							</Button>
						</>
					)}
				</div>
			</div>
		</article>
	);
}

export function ProfileCommissions({
	categories,
	artist,
}: ProfileCommissionsProps) {
	const { t } = useTranslation();
	const [activeFilter, setActiveFilter] = useState("All");

	if (!categories?.length) {
		return (
			<div className="flex flex-1 flex-col items-center justify-center">
				<EmptyPage
					icon={OutlineUser}
					title={t("components.profile.commissions.empty.title")}
					description={t("components.profile.commissions.empty.description")}
				/>
			</div>
		);
	}

	const allCategories = ["All", ...categories.map((c) => c.title)];
	const filteredCategories =
		activeFilter === "All"
			? categories
			: categories.filter((c) => c.title === activeFilter);

	return (
		<div className="flex w-full flex-col gap-6">
			{/* Filter Bar */}
			<div className="flex items-center justify-between gap-4 pb-3">
				<ScrollShadow className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap">
					<div className="flex w-max space-x-2">
						{allCategories.map((cat) => (
							<Button
								key={cat}
								variant={activeFilter === cat ? "default" : "outline"}
								onClick={() => setActiveFilter(cat)}
								className="whitespace-nowrap rounded-full"
							>
								{cat}
							</Button>
						))}
					</div>
				</ScrollShadow>

				<ReviewsDialog username={artist.username} />
			</div>

			<div className="flex w-full flex-col gap-8">
				{filteredCategories.map((category) => (
					<div key={category.title} className="space-y-4">
						<div className="flex items-center gap-3">
							<h2 className="font-medium text-neutral-900 text-xl dark:text-neutral-100">
								{category.title}
							</h2>
							<Badge
								variant={category.status === "open" ? "default" : "secondary"}
							>
								{category.status}
							</Badge>
						</div>

						<div className="grid gap-4">
							{category.items.map((item) => (
								<CommissionCard
									key={item.id}
									item={item}
									status={category.status}
									artist={artist}
								/>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
