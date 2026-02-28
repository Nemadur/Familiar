import { ScrollShadow } from "@heroui/react";
import {
	Check,
	Info,
	Maximize2,
	MessageCircle,
	PartyPopper,
	RefreshCw,
	Sparkles,
	ThumbsUp,
	X,
	Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MarkdownDisplay } from "@/components/common/markdown-display";
import {
	OutlineChat,
	OutlineQestionMarkCrFr,
	SolidStar,
} from "@/components/icons/icons";
import { ProfileBadge } from "@/components/layout/profile/badge";
import {
	type TabItem,
	TabSelector,
} from "@/components/layout/profile/feed/selector";
import { ReviewsPanel } from "@/components/layout/profile/reviews-panel";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	calculateCommissionPricing,
	calculateReviewStats,
} from "@/lib/commission-utils";
import { cn } from "@/lib/utils";
import type { CommissionItem } from "@/types/commission";
import type { User } from "@/types/user";
import { CommissionRequestModal } from "./commission-request-modal";
import { type InfoOption, InfoSelectionModal } from "./info-selection-modal";
import { LicenseInfoModal } from "./license-info-modal";
import { TermsModal } from "./terms-modal";
import { UniversalModalLayout } from "./universal-modal-layout";

interface CommissionModalProps {
	item?: CommissionItem;
	commissionId?: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	artist?: User;
	artistName?: string;
	artistHandle?: string;
	artistAvatar?: string;
	isLoading?: boolean;
	isDetailsLoading?: boolean;
	isError?: boolean;
	error?: unknown;
}

export function CommissionModal({
	item: itemData,
	commissionId: propCommissionId,
	open,
	onOpenChange,
	artist: propArtist,
	artistAvatar: propArtistAvatar,
	isLoading,
	isDetailsLoading,
	isError,
	error,
}: CommissionModalProps) {
	const { t } = useTranslation();
	const [licenseModalOpen, setLicenseModalOpen] = useState(false);
	const [requestModalOpen, setRequestModalOpen] = useState(false);
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [activeTab, setActiveTab] = useState("description");
	const [reviewsPage, setReviewsPage] = useState(1);
	const REVIEWS_PER_PAGE = 3;

	// Info Modals State
	const [infoModalState, setInfoModalState] = useState<{
		open: boolean;
		type: "service" | "communication" | "process" | null;
	}>({ open: false, type: null });

	const [termsModalOpen, setTermsModalOpen] = useState(false);

	useEffect(() => {
		if (isError) {
			console.error(`[CommissionModal] Error fetching commission:`, error);
		}
	}, [isError, error]);

	const artistData = itemData?.artist || propArtist;

	// User data should be available from props or fetched item
	const userData: User | undefined = artistData;

	const licenseOptions = itemData?.licenseOptions || [];

	const SYSTEM_LICENSE_KEYS = ["personal", "monetized", "commercial"] as const;

	const systemLicenses = SYSTEM_LICENSE_KEYS.map((key) => {
		const option = licenseOptions.find((l) => l.id === key);
		return {
			key,
			option,
			isAvailable: !!option,
		};
	});

	const customLicenses = licenseOptions.filter(
		(l) => !SYSTEM_LICENSE_KEYS.includes(l.id as any),
	);

	const [selectedLicenses, setSelectedLicenses] = useState<string[]>(() =>
		licenseOptions.filter((l) => l.included === true).map((l) => l.id),
	);

	// Update selected licenses when fetched data arrives
	useEffect(() => {
		if (itemData?.licenseOptions) {
			setSelectedLicenses(
				itemData.licenseOptions
					.filter((l) => l.included === true)
					.map((l) => l.id),
			);
		}
	}, [itemData]);

	if (!itemData && !isLoading) {
		return null;
	}

	const artistName = userData?.display_name;
	const artistHandle = userData?.username ? `@${userData.username}` : "";
	const artistAvatar = userData?.media?.avatar || propArtistAvatar;

	const reviewStats = calculateReviewStats(itemData?.reviews);

	const tabs: TabItem<string>[] = [
		{
			id: "description",
			label: t("components.profile.commissions.modal.tabs.description"),
		},
		{
			id: "reviews",
			label: reviewStats.formatted,
			icon: SolidStar,
		},
	];

	const { basePrice, originalPrice } = itemData
		? calculateCommissionPricing(itemData.price, itemData.discountRate)
		: { basePrice: 0, originalPrice: 0 };

	const getLicensePrice = (license: (typeof licenseOptions)[0]) => {
		if (license.price !== undefined) return license.price;
		if (license.pricePercentage !== undefined)
			return basePrice * (license.pricePercentage / 100);
		return 0;
	};

	const totalPrice = useMemo(() => {
		const licensesPrice = selectedLicenses.reduce((acc, licenseId) => {
			const license = licenseOptions.find((l) => l.id === licenseId);
			if (license && !license.included) {
				return acc + getLicensePrice(license);
			}
			return acc;
		}, 0);
		return basePrice + licensesPrice;
	}, [basePrice, selectedLicenses, licenseOptions]);

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
				title={t("components.profile.commissions.modal.title")}
				mediaContent={
					<div className="flex flex-col gap-4 p-4">
						{itemData?.imageUrls && itemData.imageUrls.length > 0 ? (
							itemData.imageUrls.map((url, index) => (
								<div
									key={url}
									className="relative flex min-h-[40vh] w-full items-center justify-center rounded-lg bg-secondary/5"
								>
									<img
										src={url}
										alt={`${itemData.title} - ${index + 1}`}
										className="max-h-[60vh] w-auto max-w-full rounded-lg object-contain shadow-sm"
									/>
								</div>
							))
						) : isLoading ? (
							<div className="relative flex min-h-[40vh] w-full items-center justify-center rounded-lg bg-secondary/5">
								<Skeleton className="h-full w-full rounded-lg" />
							</div>
						) : (
							<div className="flex min-h-[40vh] items-center justify-center p-8 text-muted-foreground">
								{t("components.profile.commissions.modal.no_media")}
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
									{t("components.profile.commissions.modal.category_label")}
								</div>
								{/* TODO: replace USD to dynamic exchange */}
								{itemData ? (
									<h1 className="text-3xl font-bold leading-tight">
										{itemData.title}
									</h1>
								) : (
									<Skeleton className="h-10 w-3/4" />
								)}
								<div className="flex items-baseline gap-2">
									{itemData ? (
										<>
											<div className="font-semibold text-2xl text-primary">
												{t("components.profile.commissions.card.from")} USD{" "}
												{totalPrice.toFixed(2)}
											</div>
											<div className="text-lg text-muted-foreground line-through opacity-70">
												USD {originalPrice.toFixed(2)}
											</div>
										</>
									) : (
										<Skeleton className="h-8 w-1/2" />
									)}
								</div>
							</div>

							{/* License Selector */}
							<div className="space-y-3 rounded-xl bg-secondary/20 p-4 border">
								<div className="flex items-center justify-between">
									<h4 className="font-semibold text-sm">
										{t(
											"components.profile.commissions.modal.license.title",
											"License Options",
										)}
									</h4>
									<Button
										variant={"ghost"}
										size={"icon-sm"}
										className="text-muted-foreground"
										onClick={() => setLicenseModalOpen(true)}
									>
										<OutlineQestionMarkCrFr />
									</Button>
								</div>

								<div className="grid gap-2">
									{/* System Licenses */}
									{systemLicenses.map(({ key, option, isAvailable }) => {
										if (isAvailable && option) {
											return (
												<div
													key={key}
													className={cn(
														"flex items-start gap-3 rounded-lg border bg-background/50 p-3 transition-colors",
														(option.included ||
															selectedLicenses.includes(key)) &&
															"border-primary/50 bg-primary/5",
													)}
												>
													{option.included ? (
														<div className="flex h-4 w-4 shrink-0 items-center justify-center">
															<Check className="h-4 w-4 text-primary" />
														</div>
													) : (
														<Checkbox
															id={key}
															checked={selectedLicenses.includes(key)}
															onCheckedChange={(checked) => {
																if (checked) {
																	setSelectedLicenses((prev) => [...prev, key]);
																} else {
																	setSelectedLicenses((prev) =>
																		prev.filter((id) => id !== key),
																	);
																}
															}}
														/>
													)}
													<div className="flex flex-1 items-center justify-between gap-2">
														<div className="flex items-center gap-2">
															<label
																htmlFor={key}
																className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
															>
																{t(
																	`components.profile.commissions.modal.license.${key}`,
																	option.label,
																)}
															</label>
														</div>
														{option.included ? (
															<span className="font-medium text-primary text-xs">
																{t(
																	"components.profile.commissions.modal.license.included",
																)}
															</span>
														) : (
															<span className="font-medium text-primary text-xs">
																{option.pricePercentage !== undefined
																	? `+ ${option.pricePercentage}%`
																	: `+ USD ${getLicensePrice(option).toFixed(2)}`}
															</span>
														)}
													</div>
												</div>
											);
										}

										// Unavailable System License
										return (
											<div
												key={key}
												className="flex items-start gap-3 rounded-lg border border-dashed bg-muted/20 p-3 opacity-60"
											>
												<div className="flex h-4 w-4 shrink-0 items-center justify-center">
													<X className="h-4 w-4 text-muted-foreground" />
												</div>
												<div className="grid gap-1">
													<div className="flex items-center gap-2">
														<span className="font-medium text-muted-foreground text-sm leading-none line-through">
															{t(
																`components.profile.commissions.modal.license.${key}`,
															)}
														</span>
													</div>
												</div>
											</div>
										);
									})}

									{/* Custom Licenses Accordion */}
									{customLicenses.length > 0 && (
										<Accordion type="single" collapsible className="w-full">
											<AccordionItem
												value="custom-licenses"
												className="border-none"
											>
												<AccordionTrigger className="py-2 text-sm text-muted-foreground hover:no-underline">
													{t(
														"components.profile.commissions.modal.license.other_licenses_count",
														{ count: customLicenses.length },
													)}
												</AccordionTrigger>
												<AccordionContent>
													<div className="grid gap-2 pt-2">
														{customLicenses.map((license) => (
															<div
																key={license.id}
																className={cn(
																	"flex items-start gap-3 rounded-lg border bg-background/50 p-3 transition-colors",
																	selectedLicenses.includes(license.id) &&
																		"border-primary/50 bg-primary/5",
																)}
															>
																<Checkbox
																	id={license.id}
																	checked={selectedLicenses.includes(
																		license.id,
																	)}
																	disabled={license.included}
																	onCheckedChange={(checked) => {
																		if (checked) {
																			setSelectedLicenses((prev) => [
																				...prev,
																				license.id,
																			]);
																		} else {
																			setSelectedLicenses((prev) =>
																				prev.filter((id) => id !== license.id),
																			);
																		}
																	}}
																/>
																<div className="flex flex-1 items-center justify-between gap-2">
																	<div className="flex items-center gap-2">
																		<label
																			htmlFor={license.id}
																			className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
																		>
																			{license.label}
																		</label>
																	</div>
																	{license.included ? (
																		<span className="font-medium text-primary text-xs">
																			{t(
																				"components.profile.commissions.modal.license.included",
																			)}
																		</span>
																	) : (
																		<span className="font-medium text-primary text-xs">
																			{license.pricePercentage !== undefined
																				? `+ ${license.pricePercentage}%`
																				: `+ USD ${getLicensePrice(license).toFixed(2)}`}
																		</span>
																	)}
																</div>
															</div>
														))}
													</div>
												</AccordionContent>
											</AccordionItem>
										</Accordion>
									)}

									{isDetailsLoading && (
										<div className="space-y-2">
											<Skeleton className="h-12 w-full" />
											<Skeleton className="h-12 w-full" />
										</div>
									)}
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
										<AvatarFallback>
											{artistName ? artistName[0] : "?"}
										</AvatarFallback>
									</Avatar>
									<div className="flex flex-col">
										<div className="flex items-center gap-1">
											{artistName ? (
												<span className="font-semibold text-sm">
													{artistName}
												</span>
											) : (
												<Skeleton className="h-4 w-24" />
											)}
											{userData && <ProfileBadge user={userData} />}
										</div>
										{artistHandle ? (
											<span className="text-muted-foreground text-xs">
												{artistHandle}
											</span>
										) : (
											<Skeleton className="h-3 w-16" />
										)}
									</div>
								</div>

								{/* Artist note */}
								{itemData?.artistNote && (
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
											{itemData ? (
												<div className="space-y-4">
													{/* Service Type */}
													<div className="flex items-start gap-4 rounded-2xl border bg-card p-4">
														<div className="mt-1 rounded-full bg-primary/10 p-2 text-primary">
															<Sparkles className="h-5 w-5" />
														</div>
														<div className="flex-1 space-y-1">
															<div className="flex items-center justify-between">
																<h4 className="font-semibold text-base">
																	{t(
																		`components.profile.commissions.modal.service.${
																			itemData.serviceType ===
																			"personalized_ych"
																				? "ych"
																				: "custom"
																		}.title`,
																	)}
																</h4>
																<Button
																	variant="ghost"
																	size="icon"
																	className="h-6 w-6 text-muted-foreground"
																	onClick={() =>
																		setInfoModalState({
																			open: true,
																			type: "service",
																		})
																	}
																>
																	<Info className="size-4" />
																</Button>
															</div>
															<p className="text-muted-foreground text-sm">
																{t(
																	`components.profile.commissions.modal.service.${
																		itemData.serviceType === "personalized_ych"
																			? "ych"
																			: "custom"
																	}.description`,
																)}
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
																	{t(
																		`components.profile.commissions.modal.service.${
																			itemData.communicationType ===
																			"surprise_me"
																				? "surprise"
																				: "communication"
																		}.title`,
																	)}
																</h4>
																<Button
																	variant="ghost"
																	size="icon"
																	className="h-6 w-6 text-muted-foreground"
																	onClick={() =>
																		setInfoModalState({
																			open: true,
																			type: "communication",
																		})
																	}
																>
																	<Info className="size-4" />
																</Button>
															</div>
															<p className="text-muted-foreground text-sm">
																{t(
																	`components.profile.commissions.modal.service.${
																		itemData.communicationType === "surprise_me"
																			? "surprise"
																			: "communication"
																	}.description`,
																)}
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
																	{t(
																		`components.profile.commissions.modal.service.${
																			itemData.requestingProcess ===
																			"instant_order"
																				? "instant"
																				: "proposal"
																		}.title`,
																	)}
																</h4>
																<Button
																	variant="ghost"
																	size="icon"
																	className="h-6 w-6 text-muted-foreground"
																	onClick={() =>
																		setInfoModalState({
																			open: true,
																			type: "process",
																		})
																	}
																>
																	<Info className="size-4" />
																</Button>
															</div>
															<p className="text-muted-foreground text-sm">
																{t(
																	`components.profile.commissions.modal.service.${
																		itemData.requestingProcess ===
																		"instant_order"
																			? "instant"
																			: "proposal"
																	}.description`,
																)}
															</p>
														</div>
													</div>
												</div>
											) : (
												<div className="space-y-4">
													<Skeleton className="h-24 w-full rounded-2xl" />
													<Skeleton className="h-24 w-full rounded-2xl" />
													<Skeleton className="h-24 w-full rounded-2xl" />
												</div>
											)}

											{/* Details Section */}
											<div className="text-muted-foreground leading-relaxed">
												{itemData?.description ? (
													<MarkdownDisplay content={itemData.description} />
												) : (
													<div className="space-y-2">
														<Skeleton className="h-4 w-full" />
														<Skeleton className="h-4 w-full" />
														<Skeleton className="h-4 w-3/4" />
													</div>
												)}
											</div>

											{/* Artist TOS Section */}
											{itemData?.artistTerms?.tosMd ? (
												<div className="space-y-3 border-t pt-4">
													<div className="flex items-center justify-between">
														<h4 className="font-semibold text-sm">
															{t(
																"components.profile.commissions.modal.tos.title",
															)}{" "}
															{artistName && `(${artistName})`}
														</h4>
														<Button
															variant={"ghost"}
															size={"icon-sm"}
															onClick={() => setTermsModalOpen(true)}
														>
															<Maximize2 />
														</Button>
													</div>
													<div className="text-sm">
														<ScrollShadow className="max-h-48">
															<MarkdownDisplay
																content={itemData.artistTerms.tosMd}
																className="text-sm"
															/>
														</ScrollShadow>
													</div>
												</div>
											) : isDetailsLoading ? (
												<div className="space-y-3 border-t pt-4">
													<Skeleton className="h-4 w-32" />
													<Skeleton className="h-32 w-full rounded-xl" />
												</div>
											) : (
												<div className="border-t pt-4 text-muted-foreground text-xs italic">
													Terms of service not available.
												</div>
											)}
										</div>
									)}

									{activeTab === "reviews" && (
										<ReviewsPanel
											reviews={itemData?.reviews || []}
											isLoading={isDetailsLoading}
											itemsPerPage={3}
											showSummary={true}
											showAverageScore={false}
											variant="clean"
										/>
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
										{t(
											"components.profile.commissions.modal.footer.accept_tos_label",
											{ artist: userData?.display_name },
										)}
									</label>
									<p className="text-muted-foreground text-xs">
										{t(
											"components.profile.commissions.modal.footer.tos_disclaimer",
										)}
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
											<p className="mb-1 font-semibold">
												{t(
													"components.profile.commissions.modal.footer.terms_summary",
												)}
											</p>
											<p className="text-xs">
												{itemData.artistTerms?.tosMd ? (
													<MarkdownDisplay
														content={itemData.artistTerms.tosMd}
														isShort
														className="text-xs"
													/>
												) : (
													t(
														"components.profile.commissions.modal.footer.no_terms",
													)
												)}
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
									{t(
										"components.profile.commissions.modal.footer.accept_start",
									)}
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
									<TooltipContent>
										{t(
											"components.profile.commissions.modal.footer.feature_disabled",
										)}
									</TooltipContent>
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
				customLicenses={customLicenses}
			/>
			<CommissionRequestModal
				open={requestModalOpen}
				onOpenChange={setRequestModalOpen}
				onBack={handleRequestBack}
				item={itemData}
				artist={userData}
				initialLicenses={selectedLicenses}
			/>

			{infoModalState.type && (
				<InfoSelectionModal
					open={infoModalState.open}
					onOpenChange={(open) =>
						setInfoModalState((prev) => ({ ...prev, open }))
					}
					title={t(
						`components.profile.commissions.modal.info_selection_modal.${infoModalState.type}.title`,
					)}
					description={t(
						`components.profile.commissions.modal.info_selection_modal.${infoModalState.type}.description`,
					)}
					selectedId={
						infoModalState.type === "service"
							? itemData?.serviceType || ""
							: infoModalState.type === "communication"
								? itemData?.communicationType || ""
								: itemData?.requestingProcess || ""
					}
					options={
						infoModalState.type === "service"
							? [
									{
										id: "custom_service",
										label: t(
											"components.profile.commissions.modal.service.custom.title",
										),
										description: t(
											"components.profile.commissions.modal.service.custom.description",
										),
										icon: Sparkles,
									},
									{
										id: "personalized_ych",
										label: t(
											"components.profile.commissions.modal.service.ych.title",
										),
										description: t(
											"components.profile.commissions.modal.service.ych.description",
										),
										icon: RefreshCw,
									},
								]
							: infoModalState.type === "communication"
								? [
										{
											id: "open_communication",
											label: t(
												"components.profile.commissions.modal.service.communication.title",
											),
											description: t(
												"components.profile.commissions.modal.service.communication.description",
											),
											icon: MessageCircle,
										},
										{
											id: "surprise_me",
											label: t(
												"components.profile.commissions.modal.service.surprise.title",
											),
											description: t(
												"components.profile.commissions.modal.service.surprise.description",
											),
											icon: PartyPopper,
										},
									]
								: [
										{
											id: "custom_proposal",
											label: t(
												"components.profile.commissions.modal.service.proposal.title",
											),
											description: t(
												"components.profile.commissions.modal.service.proposal.description",
											),
											icon: ThumbsUp,
										},
										{
											id: "instant_order",
											label: t(
												"components.profile.commissions.modal.service.instant.title",
											),
											description: t(
												"components.profile.commissions.modal.service.instant.description",
											),
											icon: Zap,
										},
									]
					}
				/>
			)}

			{itemData?.artistTerms?.tosMd && (
				<TermsModal
					open={termsModalOpen}
					onOpenChange={setTermsModalOpen}
					artistName={artistName || ""}
					tosMd={itemData.artistTerms.tosMd}
					date={itemData.artistTerms.createdAt}
				/>
			)}
		</>
	);
}
