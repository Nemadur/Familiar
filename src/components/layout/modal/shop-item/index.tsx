import { Chip, ScrollShadow, Typography } from "@heroui/react";
import { Check, Download, MessageCircle, Tag, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OutlineChat, OutlineClose, SolidStar } from "@/components/icons/icons";
import User from "@/components/layout/profile/user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldContent,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupNumberInput,
} from "@/components/ui/input-group";
import { MarkdownDisplay } from "@/components/ui/markdown-display";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useShopItem } from "@/hooks/shop";
import { Elevated } from "@/lib/elevated";
import { UniversalModalLayout } from "../universal-modal-layout";

export function ShopItemModal({
	itemId,
	open,
	onOpenChange,
}: {
	itemId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { t } = useTranslation();
	const { data: item, isLoading } = useShopItem(itemId);

	if (isLoading || !item) {
		return (
			<UniversalModalLayout
				open={open}
				onOpenChange={onOpenChange}
				title="Loading shop item..."
				mediaContent={<Skeleton className="w-full h-full min-h-[300px]" />}
				detailsContent={
					<div className="flex flex-col gap-4 p-4">
						<Skeleton className="h-8 w-3/4" />
						<Skeleton className="h-4 w-1/2" />
						<Skeleton className="h-4 w-full" />
					</div>
				}
			/>
		);
	}

	const displayImages =
		item.images && item.images.length > 0 ? item.images : [item.coverImage];

	return (
		<UniversalModalLayout
			open={open}
			onOpenChange={onOpenChange}
			title={item.title}
			showBookmark={true}
			isBookmarked={item.isBookmarked}
			mediaClassName="bg-transparent"
			mediaContent={
				<>
					{/* Mobile & Tablet View (< lg) */}
					<ScrollShadow
						orientation="horizontal"
						className="flex w-full gap-4 p-4 lg:hidden"
						hideScrollBar
					>
						{displayImages.map((src, index) => (
							<div
								key={`${src}-${index}`}
								className="relative flex h-[250px] w-3/4 shrink-0 items-center justify-center rounded-lg"
							>
								<img
									src={src}
									alt={`${item.title} - ${index + 1}`}
									className="h-full w-full rounded-lg object-cover shadow-sm"
								/>
							</div>
						))}
					</ScrollShadow>

					{/* Desktop View (>= lg) */}
					<div className="hidden flex-col gap-4 p-4 lg:flex">
						{displayImages.map((src, index) => (
							<div
								key={`${src}-${index}`}
								className="relative flex min-h-[40vh] w-full items-center justify-center rounded-lg"
							>
								<img
									src={src}
									alt={`${item.title} - ${index + 1}`}
									className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain shadow-sm"
								/>
							</div>
						))}
					</div>
				</>
			}
			detailsContent={
				<div className="flex h-full flex-col overflow-hidden">
					<div className="min-h-0 flex-1 overflow-y-auto">
						<div className="space-y-8 px-6 pt-6 pb-6">
							{/* Header Section */}
							<div className="space-y-4">
								<div className="flex items-center justify-between gap-3">
									<User
										user={item.author}
										showUsername={false}
										avatarSize="sm"
										buttonClassName="py-0 h-fit w-fit"
									/>
									<Button>Follow</Button>
								</div>

								{item.discountPct && (
									<Badge
										variant="secondary"
										className="bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-950/50 dark:text-fuchsia-400 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-950/50 px-2 py-0.5 w-fit"
									>
										<Tag className="size-3 mr-1" />
										{item.discountPct}% off
									</Badge>
								)}

								<Typography.Heading level={2}>{item.title}</Typography.Heading>

								<div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
									<div className="flex items-center gap-1">
										<SolidStar className="size-4 text-yellow-500 fill-yellow-500" />
										<Typography.Paragraph size={"sm"}>
											{item.rating.toFixed(1)}
										</Typography.Paragraph>
										<Typography.Paragraph size={"sm"}>
											• 1 review
										</Typography.Paragraph>
									</div>
									<div className="flex items-center gap-1.5">
										<Tag className="size-4" />
										<Typography.Paragraph
											size={"sm"}
											className="text-muted-foreground"
										>
											{item.salesCount} sold
										</Typography.Paragraph>
									</div>
								</div>
							</div>

							{/* Payment Section */}
							<div className="space-y-6">
								<Field className="space-y-4">
									<FieldLabel className="w-full justify-between">
										<Typography.Heading level={5}>
											How much would you like to pay?
										</Typography.Heading>
									</FieldLabel>
									<InputGroup>
										<InputGroupAddon className="font-bold text-lg">
											zł
										</InputGroupAddon>
										<InputGroupNumberInput placeholder="25.72 or more" />
									</InputGroup>
								</Field>

								{item.discountPct && (
									<div className="flex items-center gap-2 text-sm">
										<Badge
											variant="secondary"
											className="bg-transparent border-none text-fuchsia-500 p-0 font-bold"
										>
											<Tag className="size-4 mr-1.5" />
											Was {item.currencyCode} {item.originalPrice?.toFixed(2)} (
											{item.discountPct}% off)
										</Badge>
										<div className="flex items-center gap-1.5 text-muted-foreground ml-2">
											<MessageCircle className="size-4" />
											<span>
												{item.author.username} suggests {item.currencyCode}{" "}
												{item.price.toFixed(2)}
											</span>
										</div>
									</div>
								)}

								{/* License Options */}
								<FieldGroup className="gap-3">
									<Field orientation="horizontal" className="items-start">
										<Checkbox id="license-personal" checked disabled />
										<FieldContent className="flex-1">
											<div className="flex items-start justify-between">
												<FieldLabel
													htmlFor="license-personal"
													className="cursor-not-allowed font-normal text-muted-foreground/70"
												>
													Personal
												</FieldLabel>
												<div className="flex items-baseline gap-2 whitespace-nowrap">
													<Typography.Paragraph
														size={"xs"}
														className="font-semibold text-fuchsia-500"
													>
														PLN 25.72
													</Typography.Paragraph>
													<Typography.Paragraph
														size={"xs"}
														className="line-through text-muted-foreground"
													>
														PLN 36.74
													</Typography.Paragraph>
												</div>
											</div>
										</FieldContent>
									</Field>

									<Field orientation="horizontal" className="items-start">
										<Checkbox id="license-commercial" />
										<FieldContent className="flex-1">
											<div className="flex items-start justify-between">
												<FieldLabel
													htmlFor="license-commercial"
													className="cursor-pointer font-normal"
												>
													Commercial: Content
												</FieldLabel>
												<Typography.Paragraph
													size={"xs"}
													className="whitespace-nowrap text-muted-foreground"
												>
													+ PLN 73.48
												</Typography.Paragraph>
											</div>
										</FieldContent>
									</Field>

									<Field orientation="horizontal" className="items-start">
										<OutlineClose
											size={16}
											className="cursor-not-allowed text-muted-foreground/70"
										/>
										<FieldContent className="flex-1">
											<div className="flex items-start justify-between">
												<FieldLabel
													htmlFor="license-merch"
													className="cursor-not-allowed font-normal text-muted-foreground/70 line-through"
												>
													Commercial: Merchandising
												</FieldLabel>
											</div>
										</FieldContent>
									</Field>
								</FieldGroup>
							</div>

							<Separator />

							{/* Digital Download Info */}
							{/* TODO: add categories? */}
							<Elevated
								shadowLevel={0}
								className="flex items-start gap-4 p-4 rounded-2xl"
							>
								<div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
									<Download className="size-5" />
								</div>
								<div className="flex flex-col gap-1 flex-1">
									<h4 className="font-semibold">Digital download</h4>
									<p className="text-sm text-muted-foreground leading-relaxed">
										Files are instantly available after purchase. Returns and
										exchanges are not accepted.
									</p>
								</div>
							</Elevated>

							{/* Description Section */}
							<Elevated shadowLevel={0} className="p-6 rounded-3xl space-y-6">
								{/* TODO: remove mockup title and replace */}
								<div className="flex items-center justify-between">
									<h3 className="font-bold text-lg">Colour Palettes</h3>
									<span className="text-sm text-muted-foreground">3</span>
								</div>

								<div className="leading-relaxed text-[15px] space-y-4">
									{item.description ? (
										<MarkdownDisplay content={item.description} />
									) : (
										// TODO: remove mockup description and replace with empty message
										<>
											<p className="text-muted-foreground text-base">
												Get a new outfit for your OC, Sona, or Vtuber! Please
												purchase a commercial license for use on a Vtuber model!
											</p>

											<div className="space-y-3 mt-4">
												<div className="flex gap-2">
													<OutlineClose className="size-5 text-red-400 shrink-0 mt-1" />
													<p className="text-muted-foreground text-base">
														Please do not reupload/resell/distribute. Purchasing
														the outfit means you can use it for yourself and
														yourself solely. You may use the outfit for multiple
														of your own characters, but you cannot allow other
														individuals to use the outfit.
													</p>
												</div>
												<div className="flex gap-2 opacity-50">
													<OutlineClose className="size-5 text-red-400 shrink-0 mt-1" />
													<p className="text-muted-foreground text-base">
														Please do not use this as a base or directly edit
														the artwork provided
													</p>
												</div>
											</div>
										</>
									)}
								</div>

								<Button variant="ghost" className="w-full">
									Read more
								</Button>
							</Elevated>
						</div>
					</div>

					<div className="sticky bottom-0 z-20 bg-background border-t">
						<div className="space-y-4 p-6 pb-8 md:pb-6">
							<div className="flex flex-col gap-3">
								<div className="flex min-w-0 gap-3">
									<Button
										size="xl"
										className="min-w-0 flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
									>
										Buy now
									</Button>
									<Button
										size="icon-xl"
										variant="secondary"
										className="shrink-0"
									>
										<OutlineChat />
									</Button>
								</div>
								<Button
									size="xl"
									variant="default"
									className="w-full bg-foreground text-background hover:bg-foreground/90"
								>
									Add to basket
								</Button>
							</div>
						</div>
					</div>
				</div>
			}
		/>
	);
}
