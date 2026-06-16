import { Typography } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import { Bookmark, CheckCircle2, Pause, Play, Star } from "lucide-react";
import {
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useState,
} from "react";
import {
	OutlineChevronLeft,
	OutlineChevronRight,
	SolidStar,
} from "@/components/icons/icons";
import {
	Reel,
	ReelContent,
	ReelImage,
	type ReelItem,
	ReelProgress,
} from "@/components/kibo-ui/reel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsTablet } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { MockShopItem } from "@/types/shop";
import { BookmarkButton } from "../bookmark";
import User from "../profile/user";

export function ShopItemCard({ item }: { item: MockShopItem }) {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [hoverPlaying, setHoverPlaying] = useState(false);
	const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);
	const isTablet = useIsTablet();

	const displayImages =
		item.images && item.images.length > 0 ? item.images : [item.coverImage];
	const hasMultipleImages = displayImages.length > 1;
	const isPlaying = (isTablet || hoverPlaying) && !isAutoPlayPaused;

	const reelItems: ReelItem[] = displayImages.map((src, index) => ({
		id: `${item.id}-${index}`,
		type: "image",
		src,
		duration: 1,
		alt: `${item.title} - ${index + 1}`,
	}));

	return (
		<Link
			to={`/shop/${item.id}` as any}
			className="group relative flex w-full h-full flex-col gap-2"
			onMouseEnter={() => {
				if (!isTablet) setHoverPlaying(true);
			}}
			onMouseLeave={() => {
				if (!isTablet) {
					setHoverPlaying(false);
					setCurrentImageIndex(0);
				}
			}}
		>
			{/* Image container */}
			<div className="relative aspect-square w-full">
				<Reel
					className="h-full w-full overflow-hidden rounded-3xl bg-muted"
					data={reelItems}
					index={currentImageIndex}
					onIndexChange={setCurrentImageIndex}
					playing={hasMultipleImages ? isPlaying : false}
					onPlayingChange={(playing) => {
						if (hasMultipleImages) setHoverPlaying(playing);
					}}
					autoPlay={false}
					muted
					resetOnPause
				>
					{hasMultipleImages && (
						<>
							<div
								className="pointer-events-none absolute right-0 bottom-0 left-0 z-1 h-1/3 backdrop-blur-md"
								style={{
									maskImage:
										"linear-gradient(to top, black 0%, black 30%, transparent 100%)",
									WebkitMaskImage:
										"linear-gradient(to top, black 0%, black 30%, transparent 100%)",
								}}
							/>
							<ReelProgress className="top-auto right-auto bottom-2 left-1/2 z-20 w-1/2 -translate-x-1/2 px-1" />
						</>
					)}
					{/* Bookmark on top right */}
					<BookmarkButton className="absolute top-2 right-2 z-1" />
					<ReelContent>
						{(reelItem) => (
							<ReelImage
								alt={reelItem.alt || ""}
								duration={reelItem.duration}
								src={reelItem.src}
								className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
							/>
						)}
					</ReelContent>

					{hasMultipleImages && (
						<ShopReelControls
							itemTitle={item.title}
							isTablet={isTablet}
							isAutoPlayPaused={isAutoPlayPaused}
							totalItems={reelItems.length}
							setCurrentImageIndex={setCurrentImageIndex}
							setIsAutoPlayPaused={setIsAutoPlayPaused}
						/>
					)}
				</Reel>
			</div>

			{/* Info section */}
			<div className="flex flex-col flex-1 gap-1 px-1">
				<User
					showUsername={false}
					user={item.author}
					avatarSize="sm"
					buttonClassName="py-0 h-fit w-fit"
				/>
				{/* <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
					<div className="relative size-5 overflow-hidden rounded-full bg-muted">
						{item.author.avatarUrl && (
							<img
								src={item.author.avatarUrl}
								alt=""
								className="h-full w-full object-cover"
							/>
						)}
					</div>
					<span className="font-medium truncate">{item.author.username}</span>
				</div> */}

				<Typography className="text-sm font-medium leading-tight line-clamp-2 text-foreground/90 mt-0.5 min-h-10">
					{item.title}
				</Typography>

				<div className="mt-auto pt-1 flex flex-col gap-1 w-full">
					<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm min-h-6">
						<span className="font-bold text-foreground">
							{item.currencyCode} {item.price.toFixed(2)}+
						</span>
						{item.discountPct && (
							<Badge
								size={"sm"}
								variant={"success_ghost"}
								className="text-[10px]"
							>
								-{item.discountPct}%
							</Badge>
						)}
						{item.originalPrice && (
							<Typography.Paragraph className="text-[11px] text-muted-foreground line-through decoration-muted-foreground/50">
								{item.currencyCode} {item.originalPrice.toFixed(2)}
							</Typography.Paragraph>
						)}
					</div>
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						{item.salesCount} sold
						<div className="flex items-center gap-0.5 ml-auto">
							<SolidStar className="size-3 fill-yellow-400 text-yellow-400" />
							{item.rating.toFixed(1)}
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}

function ShopReelControls({
	itemTitle,
	isTablet,
	isAutoPlayPaused,
	totalItems,
	setCurrentImageIndex,
	setIsAutoPlayPaused,
}: {
	itemTitle: string;
	isTablet: boolean;
	isAutoPlayPaused: boolean;
	totalItems: number;
	setCurrentImageIndex: Dispatch<SetStateAction<number>>;
	setIsAutoPlayPaused: Dispatch<SetStateAction<boolean>>;
}) {
	return (
		<div className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
			<ShopImageNavigationButton
				label={`Previous image for ${itemTitle}`}
				className="left-2"
				onClick={() =>
					setCurrentImageIndex((previous) =>
						previous > 0 ? previous - 1 : totalItems - 1,
					)
				}
			>
				<OutlineChevronLeft />
			</ShopImageNavigationButton>

			<ShopImageNavigationButton
				label={`Next image for ${itemTitle}`}
				className="right-2"
				onClick={() =>
					setCurrentImageIndex((previous) =>
						previous < totalItems - 1 ? previous + 1 : 0,
					)
				}
			>
				<OutlineChevronRight />
			</ShopImageNavigationButton>

			{isTablet && (
				<ShopAutoPlayButton
					isAutoPlayPaused={isAutoPlayPaused}
					setIsAutoPlayPaused={setIsAutoPlayPaused}
				/>
			)}
		</div>
	);
}

function ShopImageNavigationButton({
	label,
	className,
	children,
	onClick,
}: {
	label: string;
	className: string;
	children: ReactNode;
	onClick: () => void;
}) {
	return (
		<div className={cn("absolute top-1/2 z-20 -translate-y-1/2", className)}>
			<Button
				size="icon"
				variant="blur_dark"
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();
					onClick();
				}}
			>
				<span className="sr-only">{label}</span>
				{children}
			</Button>
		</div>
	);
}

function ShopAutoPlayButton({
	isAutoPlayPaused,
	setIsAutoPlayPaused,
}: {
	isAutoPlayPaused: boolean;
	setIsAutoPlayPaused: Dispatch<SetStateAction<boolean>>;
}) {
	return (
		<div className="absolute top-2 left-2 z-20">
			<Button
				size="icon"
				variant="blur_dark"
				onClick={(event) => {
					event.preventDefault();
					event.stopPropagation();
					setIsAutoPlayPaused((previous) => !previous);
				}}
			>
				<span className="sr-only">
					{isAutoPlayPaused ? "Play auto" : "Pause auto"}
				</span>
				{isAutoPlayPaused ? (
					<Play className="size-4" />
				) : (
					<Pause className="size-4" />
				)}
			</Button>
		</div>
	);
}
