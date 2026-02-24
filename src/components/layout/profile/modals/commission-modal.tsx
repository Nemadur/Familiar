import { useQuery } from "@tanstack/react-query";
import {
	Check,
	Info,
	MessageCircle,
	Sparkles,
	ThumbsUp,
	X,
} from "lucide-react";
import { useState } from "react";
import { MarkdownDisplay } from "@/components/common/markdown-display";
import { OutlineChat, SolidStar } from "@/components/icons/icons";
import { ProfileBadge } from "@/components/layout/profile/badge";
import {
	type TabItem,
	TabSelector,
} from "@/components/layout/profile/feed/selector";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import { StarsRating } from "@/components/ui/stars-rating";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { getCommission } from "@/data/commissions";
import {
	calculateCommissionPricing,
	calculateReviewStats,
} from "@/lib/commission-utils";
import { cn } from "@/lib/utils";
import type { CommissionItem } from "@/types/commission";
import type { User } from "@/types/user";
import { CommissionRequestModal } from "./commission-request-modal";
import { LicenseInfoModal } from "./license-info-modal";
import { UniversalModalLayout } from "./universal-modal-layout";

interface CommissionModalProps {
	item: CommissionItem;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	artist?: User;
	artistName?: string;
	artistHandle?: string;
	artistAvatar?: string;
}

export function CommissionModal({
	item: initialItem,
	open,
	onOpenChange,
	artist: propArtist,
	artistName: propArtistName,
	artistHandle: propArtistHandle,
	artistAvatar: propArtistAvatar,
}: CommissionModalProps) {
	const [licenseModalOpen, setLicenseModalOpen] = useState(false);
	const [requestModalOpen, setRequestModalOpen] = useState(false);
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [activeTab, setActiveTab] = useState("description");
	const [reviewsPage, setReviewsPage] = useState(1);
	const REVIEWS_PER_PAGE = 3;

	const { data: fetchedItem } = useQuery({
		queryKey: ["commission", initialItem.id],
		queryFn: () => getCommission({ id: initialItem.id }),
	});

	const itemData = fetchedItem || initialItem;
	const artistData = propArtist || (fetchedItem as any)?.artist;

	// Fallback user object if data is missing
	const userData: User = artistData || {
		display_name: propArtistName || "Unknown Artist",
		username: (propArtistHandle || "@unknown").replace("@", ""),
		media: { avatar: propArtistAvatar || null },
		roles: [],
		created_at: new Date(),
		uuid: "unknown",
		accent_color: "#000000",
		is_premium: false,
		is_verified: false,
	};

	const artistName = userData.display_name;
	const artistHandle = `@${userData.username}`;
	const artistAvatar = userData.media?.avatar || propArtistAvatar;

	const reviewStats = calculateReviewStats(itemData.reviews);
	const totalReviews = itemData.reviews?.length || 0;
	const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);

	const paginatedReviews = itemData.reviews
		? itemData.reviews.slice(
				(reviewsPage - 1) * REVIEWS_PER_PAGE,
				reviewsPage * REVIEWS_PER_PAGE,
			)
		: [];

	const tabs: TabItem<string>[] = [
		{
			id: "description",
			label: "Description",
		},
		{
			id: "reviews",
			label: reviewStats.formatted,
			icon: SolidStar,
		},
	];

	const { basePrice, originalPrice } = calculateCommissionPricing(
		itemData.price,
		itemData.discountRate,
	);

	const licenseOptions = itemData.licenseOptions || [
		{ id: "personal", label: "Personal", price: 0, included: true },
		{ id: "monetized", label: "Monetized content", price: 50 },
		{ id: "commercial", label: "Commercial", price: 150 },
	];

	const [selectedLicenses, setSelectedLicenses] = useState<string[]>(() =>
		licenseOptions.filter((l) => l.included === true).map((l) => l.id),
	);

	const handleLicenseToggle = (licenseId: string) => {
		const license = licenseOptions.find((l) => l.id === licenseId);
		if (license?.included !== undefined) return; // Cannot toggle included (true) or unavailable (false)

		setSelectedLicenses((prev) => {
			if (prev.includes(licenseId)) {
				return prev.filter((id) => id !== licenseId);
			} else {
				return [...prev, licenseId];
			}
		});
	};

	const getLicensePrice = (license: (typeof licenseOptions)[0]) => {
		if (license.price !== undefined) return license.price;
		if (license.pricePercentage !== undefined)
			return basePrice * (license.pricePercentage / 100);
		return 0;
	};

	// Calculate total price based on selected licenses
	const licensesCost = licenseOptions
		.filter((l) => selectedLicenses.includes(l.id) && !l.included)
		.reduce((acc, l) => acc + getLicensePrice(l), 0);

	const currentPrice = basePrice + licensesCost;

	const handleRequestOpen = () => {
		onOpenChange(false);
		setRequestModalOpen(true);
	};

	const handleRequestBack = () => {
		setRequestModalOpen(false);
		onOpenChange(true);
	};

	return (
		<>
			<UniversalModalLayout
				open={open}
				onOpenChange={onOpenChange}
				title="Commission Details"
				mediaContent={
					<div className="flex flex-col gap-4 p-4">
						{initialItem.imageUrls && initialItem.imageUrls.length > 0 ? (
							initialItem.imageUrls.map((url, index) => (
								<div key={index} className="w-full">
									<img
										src={url}
										alt={`${initialItem.title} - ${index + 1}`}
										className="block h-auto w-full rounded-lg object-contain shadow-sm"
									/>
								</div>
							))
						) : (
							<div className="flex min-h-[40vh] items-center justify-center p-8 text-muted-foreground">
								No media available
							</div>
						)}
					</div>
				}
				detailsContent={
					<>
						<div className="space-y-6 p-6">
							{/* Title & Price */}
							<div className="space-y-2">
								<div className="flex items-center gap-2 font-medium text-muted-foreground text-sm uppercase tracking-wide">
									{/* Could be category or tag */}
									Commission
								</div>
								{/* TODO: replace USD to dynamic exchange */}
								<h1 className="text-3xl font-bold leading-tight">
									{initialItem.title}
								</h1>
								<div className="flex items-baseline gap-2">
									<div className="font-semibold text-2xl text-primary">
										From USD {basePrice.toFixed(2)}
									</div>
									<div className="text-lg text-muted-foreground line-through opacity-70">
										USD {originalPrice.toFixed(2)}
									</div>
								</div>
							</div>

							{/* TODO: use real db licence types commission_listing_licenses */}
							{/* License Selector */}
							<div className="space-y-3 rounded-xl bg-secondary/20 p-4 border">
								<div className="flex items-center justify-between">
									<h3 className="font-semibold text-sm">License Type</h3>
									<Button
										variant="ghost"
										size="sm"
										className="h-6 gap-1 px-2 text-muted-foreground text-xs hover:text-foreground"
										onClick={() => setLicenseModalOpen(true)}
									>
										<Info className="h-3 w-3" />
										License Info
									</Button>
								</div>

								<div className="space-y-2">
									{licenseOptions.map((license) => {
										const price = getLicensePrice(license);
										const isSelected = selectedLicenses.includes(license.id);
										const isUnavailable = license.included === false;
										const isIncluded = license.included === true;

										return (
											<button
												key={license.id}
												type="button"
												className={cn(
													"flex w-full items-center justify-between rounded-lg border p-3 transition-all",
													isSelected
														? "border-primary bg-secondary ring-1 ring-primary"
														: "border-transparent bg-background",
													!isIncluded &&
														!isUnavailable &&
														"cursor-pointer hover:border-primary/50",
													(isIncluded || isUnavailable) &&
														"cursor-default opacity-80",
													isUnavailable && "opacity-50",
												)}
												onClick={() => handleLicenseToggle(license.id)}
											>
												<div className="flex items-center gap-3">
													<div
														className={cn(
															"flex size-4 items-center justify-center rounded-sm border transition-colors",
															isSelected
																? "border-primary bg-primary text-primary-foreground"
																: "border-muted-foreground",
															isUnavailable &&
																"border-destructive/50 bg-destructive/10 text-destructive",
														)}
													>
														{isSelected && <Check className="h-3 w-3" />}
														{isUnavailable && <X className="h-3 w-3" />}
													</div>
													<span
														className={cn(
															"font-medium text-sm",
															isUnavailable && "line-through",
														)}
													>
														{license.label}
													</span>
												</div>
												{/* TODO: replace USD to dynamic exchange */}
												<span className="text-muted-foreground text-sm">
													{isIncluded ? "Included" : `+USD ${price.toFixed(2)}`}
												</span>
											</button>
										);
									})}
								</div>
							</div>

							{/* Artist Info */}
							<div className="flex flex-col gap-1">
								<div className="flex items-center gap-3 py-2">
									<Avatar className="h-10 w-10 border">
										<AvatarImage
											src={
												artistAvatar ||
												`https://api.dicebear.com/7.x/avataaars/svg?seed=${artistHandle}`
											}
										/>
										<AvatarFallback>{artistName[0]}</AvatarFallback>
									</Avatar>
									<div className="flex flex-col">
										<div className="flex items-center gap-1">
											<span className="font-semibold text-sm">
												{artistName}
											</span>
											<ProfileBadge user={userData} />
										</div>
										<span className="text-muted-foreground text-xs">
											{artistHandle}
										</span>
									</div>
								</div>

								{/* Artist note */}
								{itemData.artistNote && (
									<div className="rounded-xl bg-secondary/30 p-4 text-muted-foreground text-sm">
										{itemData.artistNote}
									</div>
								)}
							</div>

							{/* Description & Tabs */}
							<div className="w-full">
								<TabSelector
									items={tabs}
									value={activeTab}
									onValueChange={setActiveTab}
									className="mb-4"
									size="sm"
								/>

								<div className="min-h-[400px]">
									{activeTab === "description" && (
										<div className="space-y-6">
											<div className="space-y-4">
												{/* Service Type */}
												<div className="flex items-start gap-4 rounded-2xl border bg-card p-4">
													<div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
														<Sparkles className="h-5 w-5" />
													</div>
													<div className="flex-1 space-y-1">
														<div className="flex items-center justify-between">
															<h4 className="font-semibold text-base">
																Custom service
															</h4>
															<TooltipProvider>
																<Tooltip>
																	<TooltipTrigger>
																		<Info className="size-4 text-muted-foreground" />
																	</TooltipTrigger>
																	<TooltipContent>
																		Made from scratch based on your requirements
																	</TooltipContent>
																</Tooltip>
															</TooltipProvider>
														</div>
														<p className="text-muted-foreground text-sm">
															Made from scratch
														</p>
													</div>
												</div>

												{/* Communication Style */}
												<div className="rounded-2xl border bg-card p-4 flex items-start gap-4">
													<div className="mt-1 rounded-full bg-orange-500/10 p-2 text-orange-500">
														<MessageCircle className="h-5 w-5" />
													</div>
													<div className="flex-1 space-y-1">
														<div className="flex items-center justify-between">
															<h4 className="font-semibold text-base">
																Open communication
															</h4>
															<TooltipProvider>
																<Tooltip>
																	<TooltipTrigger>
																		<Info className="h-4 w-4 text-muted-foreground" />
																	</TooltipTrigger>
																	<TooltipContent>
																		Regular updates and feedback loops
																	</TooltipContent>
																</Tooltip>
															</TooltipProvider>
														</div>
														<p className="text-muted-foreground text-sm">
															WIP updates + revisions available
														</p>
													</div>
												</div>

												{/* Process */}
												<div className="flex items-start gap-4 rounded-2xl border bg-card p-4">
													<div className="mt-1 rounded-full bg-blue-500/10 p-2 text-blue-500">
														<ThumbsUp className="h-5 w-5" />
													</div>
													<div className="flex-1 space-y-1">
														<div className="flex items-center justify-between">
															<h4 className="font-semibold text-base">
																Custom proposal
															</h4>
															<TooltipProvider>
																<Tooltip>
																	<TooltipTrigger>
																		<Info className="h-4 w-4 text-muted-foreground" />
																	</TooltipTrigger>
																	<TooltipContent>
																		Standard commission workflow
																	</TooltipContent>
																</Tooltip>
															</TooltipProvider>
														</div>
														<p className="text-muted-foreground text-sm">
															Request → proposal → commit (pay)
														</p>
													</div>
												</div>
											</div>

											{/* Details Section */}
											<div className="text-muted-foreground leading-relaxed">
												<MarkdownDisplay content={itemData.description} />
											</div>

											{/* Artist TOS Section */}
											<div className="space-y-3 border-t pt-4">
												<h3 className="font-bold text-lg">Terms of Service</h3>
												<div className="rounded-xl bg-muted/30 p-4 text-muted-foreground text-sm">
													<p className="mb-2 font-medium text-foreground">
														By commissioning me, you agree to:
													</p>
													{userData.tos ? (
														<div className="prose prose-sm dark:prose-invert max-w-none">
															<p>{userData.tos.summary}</p>
														</div>
													) : (
														// TODO: return nothing or "artist do not have TOS, please ask them, maybe they forget to add."
														<ul className="ml-1 list-inside list-disc space-y-1">
															<li>No refunds after sketches are approved</li>
															<li>
																Personal use only unless commercial license
																purchased
															</li>
															<li>Credit must be given when posting</li>
															<li>
																I retain the right to use the artwork for
																portfolio
															</li>
														</ul>
													)}
													<Button
														variant="link"
														className="mt-3 h-auto p-0 text-primary text-xs"
													>
														Read full Terms of Service
													</Button>
												</div>
											</div>
										</div>
									)}

									{activeTab === "reviews" && (
										<div className="space-y-4">
											{paginatedReviews.length > 0 ? (
												paginatedReviews.map((review) => (
													<div
														key={review.id}
														className="rounded-xl border bg-card p-4 space-y-2"
													>
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-2">
																<Avatar className="h-8 w-8">
																	<AvatarFallback>
																		{review.authorName[0]}
																	</AvatarFallback>
																</Avatar>
																<div className="flex flex-col">
																	<span className="font-semibold text-sm">
																		{review.authorName}
																	</span>
																	<span className="text-muted-foreground text-xs">
																		{new Date(
																			review.createdAt,
																		).toLocaleDateString()}
																	</span>
																</div>
															</div>
															<StarsRating rating={review.rating} size={14} />
														</div>
														{review.comment && (
															<p className="text-sm text-foreground/90">
																{review.comment}
															</p>
														)}
													</div>
												))
											) : (
												<div className="py-8 text-center text-muted-foreground text-sm">
													No reviews yet.
												</div>
											)}

											{totalPages > 1 && (
												<Pagination className="mt-4">
													<PaginationContent>
														<PaginationItem>
															<PaginationPrevious
																href="#"
																onClick={(e) => {
																	e.preventDefault();
																	setReviewsPage((p) => Math.max(1, p - 1));
																}}
																aria-disabled={reviewsPage === 1}
																className={
																	reviewsPage === 1
																		? "pointer-events-none opacity-50"
																		: ""
																}
															/>
														</PaginationItem>

														{Array.from({ length: totalPages }).map((_, i) => {
															const page = i + 1;
															return (
																<PaginationItem key={page}>
																	<PaginationLink
																		href="#"
																		isActive={reviewsPage === page}
																		onClick={(e) => {
																			e.preventDefault();
																			setReviewsPage(page);
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
																	setReviewsPage((p) =>
																		Math.min(totalPages, p + 1),
																	);
																}}
																aria-disabled={reviewsPage === totalPages}
																className={
																	reviewsPage === totalPages
																		? "pointer-events-none opacity-50"
																		: ""
																}
															/>
														</PaginationItem>
													</PaginationContent>
												</Pagination>
											)}
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Footer Actions */}
						<div className="sticky bottom-0 z-20 space-y-4 border-t bg-background p-6">
							{/* TOS Checkbox */}
							<div className="flex items-center space-x-2 rounded-lg border bg-secondary/10 p-3">
								<Checkbox
									id="terms"
									checked={termsAccepted}
									onCheckedChange={(c) => setTermsAccepted(c === true)}
								/>
								<div className="grid gap-1.5 leading-none">
									<label
										htmlFor="terms"
										className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										I accept {userData.display_name}'s Terms of Service
									</label>
									<p className="text-muted-foreground text-xs">
										By checking this box, you agree to the artist's terms.
									</p>
								</div>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="ml-auto h-6 w-6 text-muted-foreground"
											>
												<Info className="h-3 w-3" />
											</Button>
										</TooltipTrigger>
										<TooltipContent className="max-w-xs">
											<p className="mb-1 font-semibold">Terms Summary:</p>
											<p className="text-xs">
												{userData.tos?.summary || "No terms available"}
											</p>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>

							<div className="flex gap-3">
								<Button
									className="flex-1"
									size={"xl"}
									disabled={!termsAccepted}
									onClick={handleRequestOpen}
								>
									Accept terms to start request
								</Button>
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="secondary"
											size={"icon-xl"}
											className="shrink-0"
											disabled
										>
											<OutlineChat />
										</Button>
									</TooltipTrigger>
									<TooltipContent>Feature is temporary disabled</TooltipContent>
								</Tooltip>
							</div>
						</div>
						<div className="flex-1 bg-background" />
					</>
				}
			/>

			<LicenseInfoModal
				open={licenseModalOpen}
				onOpenChange={setLicenseModalOpen}
			/>
			<CommissionRequestModal
				open={requestModalOpen}
				onOpenChange={setRequestModalOpen}
				onBack={handleRequestBack}
				item={itemData}
				artist={userData}
				initialLicenses={selectedLicenses}
			/>
		</>
	);
}
