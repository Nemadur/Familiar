import { Typography } from "@heroui/react";
import { Link } from "@tanstack/react-router";
import { Bookmark, CheckCircle2, Star } from "lucide-react";
import { SolidStar } from "@/components/icons/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MockShopItem } from "@/types/shop";
import { BookmarkButton } from "../bookmark";
import User from "../profile/user";

export function ShopItemCard({ item }: { item: MockShopItem }) {
	return (
		<Link
			to={`/shop/${item.id}` as any}
			className="group relative flex w-full h-full flex-col gap-2 shrink-0"
		>
			{/* Image container */}
			<div className="relative aspect-square w-full overflow-hidden rounded-[24px] bg-muted">
				<img
					src={item.coverImage}
					alt={item.title}
					className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
				/>

				{/* Badges on top left */}
				{/* <div className="absolute top-2 left-2 flex flex-col gap-1">
					{item.badges.map((badge, i) => (
						<div
							key={i}
							className="rounded-full bg-pink-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm flex items-center gap-1"
						>
							<Star className="size-3 fill-white" />
							{badge}
						</div>
					))}
				</div> */}

				{/* Bookmark on top right */}
				<BookmarkButton className="absolute top-2 right-2 z-0" />
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
