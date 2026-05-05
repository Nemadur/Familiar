import { ScrollShadow } from "@heroui/react";
import {
	Info,
	Maximize2,
	MessageCircle,
	PartyPopper,
	RefreshCw,
	Sparkles,
	ThumbsUp,
	Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { MarkdownDisplay } from "@/components/common/markdown-display";
import { UserComment } from "@/components/common/user-comment";
import { OutlineChat, SolidStar } from "@/components/icons/icons";
import {
	type TabItem,
	TabSelector,
} from "@/components/layout/profile/feed/selector";
import { ReviewsPanel } from "@/components/layout/profile/reviews-panel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCommission } from "@/hooks/use-commisions";
import { useProfileTermsOfService } from "@/hooks/use-tos";
import { useUserById } from "@/hooks/use-user";
import {
	calculateCommissionPricing,
	calculateReviewStats,
} from "@/lib/commission-utils";
import type { TCommission } from "@/types/commissions";
import type { TUserProfile, TUserResponse } from "@/types/user";
import { CommissionRequestModal } from "../commission-request/modal";
import { InfoSelectionModal } from "../info-selection";
import { TermsModal } from "../terms";
import { UniversalModalLayout } from "../universal-modal-layout";

interface CommissionModalProps {
	commissionId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CommissionModal({
	commissionId,
	open,
	onOpenChange,
}: CommissionModalProps) {
	const { t } = useTranslation();

	const [requestModalOpen, setRequestModalOpen] = useState(false);
	const [termsAccepted, setTermsAccepted] = useState(false);
	const [activeTab, setActiveTab] = useState("description");
	const [infoModalState, setInfoModalState] = useState<{
		open: boolean;
		type: "service" | "communication" | "process" | null;
	}>({ open: false, type: null });
	const [termsModalOpen, setTermsModalOpen] = useState(false);

	const {
		data: commissionData,
		isPending,
		isFetching,
		isError,
		error,
	} = useCommission(commissionId);

	useEffect(() => {
		if (isError) {
			console.error("[CommissionModal] Error fetching commission:", error);
		}
	}, [isError, error]);

	const commission = commissionData;
	const isLoading = isPending;
	const isDetailsLoading = isFetching;

	// Fetch Artist data
	const {
		user: fetchedArtist,
		isPending: isArtistPending,
		error: artistError,
	} = useUserById(commission?.artistId ?? "");

	useEffect(() => {
		if (artistError) {
			console.error("[CommissionModal] Error fetching artist:", artistError);
		}
	}, [artistError]);

	// TODO: fetch reviews
	// const {
	// 	data: fetchedReviews,
	// 	isPending: isReviewsPending,
	// 	error: reviewsError,
	// } = useCommissionReviews(commissionId);

	// useEffect(() => {
	// 	if (reviewsError) {
	// 		console.error("[CommissionModal] Error fetching reviews:", reviewsError);
	// 	}
	// }, [reviewsError]);

	const fetchedReviews = null;

	const reviewStats = calculateReviewStats(fetchedReviews ?? []);

	const tabs: TabItem<string>[] = [
		{
			id: "description",
			label: t("components.profile.commissions.modal.tabs.description"),
		},
		{
			id: "reviews",
			label: reviewStats.formatted,
			icon: SolidStar,
			disabled: true,
		},
	];

	const { basePrice, originalPrice } = commission
		? calculateCommissionPricing(
				commission.basePrice,
				0, //TODO: commission.discountRate,
			)
		: { basePrice: 0, originalPrice: 0 };

	const totalPrice = basePrice;

	const handleRequestOpen = () => {
		setRequestModalOpen(true);
	};

	const handleRequestBack = () => {
		setRequestModalOpen(false);
	};

	const handlePreviewOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			setRequestModalOpen(false);
			onOpenChange(false);
		}
	};

	const handleRequestModalOpenChange = (nextOpen: boolean) => {
		setRequestModalOpen(nextOpen);

		if (!nextOpen) {
			onOpenChange(false);
		}
	};

	if (!commission && !isLoading) {
		return null;
	}

	return (
		<>
			<UniversalModalLayout
				open={open && !requestModalOpen}
				onOpenChange={handlePreviewOpenChange}
				title={t("components.profile.commissions.modal.title")}
				mediaClassName="bg-transparent"
				mediaContent={
					<>
						<ScrollShadow
							orientation="horizontal"
							className="flex w-full gap-4 p-4 lg:hidden"
						>
							{commission?.multimedia && commission.multimedia.length > 0 ? (
								commission.multimedia.map((media) => {
									const url = media.sizes.half;

									if (!url) return null;

									return (
										<div
											key={media.id}
											className="relative flex h-[250px] w-3/4 shrink-0 items-center justify-center rounded-lg"
										>
											<img
												src={url}
												alt={commission.title}
												className="h-full w-full rounded-lg object-cover shadow-sm"
											/>
										</div>
									);
								})
							) : isLoading ? (
								<div className="relative flex h-[250px] w-3/4 shrink-0 items-center justify-center rounded-lg bg-secondary/5">
									<Skeleton className="h-full w-full rounded-lg" />
								</div>
							) : (
								<div className="flex h-[250px] w-full items-center justify-center p-8 text-muted-foreground">
									{t("components.profile.commissions.modal.no_media")}
								</div>
							)}
						</ScrollShadow>

						<div className="hidden flex-col gap-4 p-4 lg:flex">
							{commission?.multimedia && commission.multimedia.length > 0 ? (
								commission.multimedia.map((media, index) => {
									const url = media.sizes.half;

									if (!url) return null;

									return (
										<div
											key={media.id}
											className="relative flex w-full items-center justify-center rounded-lg"
										>
											<img
												src={url}
												alt={`${commission.title} - ${index + 1}`}
												className="max-h-[60vh] w-auto max-w-full rounded-lg object-contain shadow-sm"
											/>
										</div>
									);
								})
							) : isLoading ? (
								<div className="relative flex w-full items-center justify-center rounded-lg bg-secondary/5">
									<Skeleton className="h-full w-full rounded-lg" />
								</div>
							) : (
								<div className="flex min-h-[40vh] items-center justify-center p-8 text-muted-foreground">
									{t("components.profile.commissions.modal.no_media")}
								</div>
							)}
						</div>
					</>
				}
				detailsContent={
					<div className="flex h-full flex-col overflow-hidden">
						<div className="min-h-0 flex-1 overflow-y-auto">
							<div className="space-y-6 px-4 pt-4 pb-6">
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
										{t("components.profile.commissions.modal.category_label")}
									</div>

									{commission ? (
										<h1 className="text-3xl font-bold leading-tight">
											{commission.title}
										</h1>
									) : (
										<Skeleton className="h-10 w-3/4" />
									)}

									<div className="flex items-baseline gap-2">
										{commission ? (
											<>
												<div className="text-2xl font-semibold text-primary">
													{t("components.profile.commissions.card.from")}{" "}
													{commission.currencyCode} {totalPrice.toFixed(2)}
												</div>
												{originalPrice > totalPrice && (
													<div className="text-lg line-through opacity-70 text-muted-foreground">
														{commission.currencyCode} {originalPrice.toFixed(2)}
													</div>
												)}
											</>
										) : (
											<Skeleton className="h-8 w-1/2" />
										)}
									</div>
								</div>

								<div className="-mx-4">
									<div className="px-4">
										<TabSelector
											items={tabs}
											value={activeTab}
											onValueChange={setActiveTab}
											className="mb-4"
											size="sm"
										/>
									</div>
									<Separator />
								</div>

								{activeTab === "description" && (
									<div className="space-y-6 pt-2">
										{commission?.description && !isLoading ? (
											<div className="leading-relaxed text-muted-foreground">
												{/* FIXME: add no description message */}
												{isLoading ? (
													<div className="space-y-2">
														<Skeleton className="h-4 w-full" />
														<Skeleton className="h-4 w-full" />
														<Skeleton className="h-4 w-3/4" />
													</div>
												) : null}

												{commission?.description.length > 0 ? (
													<MarkdownDisplay content={commission?.description} />
												) : (
													<div className="text-center text-muted-foreground">
														{t(
															"components.profile.commissions.modal.no_description",
														)}
													</div>
												)}
											</div>
										) : null}

										{commission?.artistTos ? (
											<div className="space-y-3">
												<div className="-mx-4">
													<Separator className="mb-4" />
												</div>

												<div className="flex items-start justify-between">
													<div className="space-y-0">
														<h4 className="text-lg font-bold">
															{t(
																"components.profile.commissions.modal.tos.title",
																{
																	artist_displayname:
																		fetchedArtist?.displayName,
																},
															)}
														</h4>
														<span className="text-xs text-muted-foreground">
															{t(
																"components.profile.commissions.modal.tos.updated_at",
																{
																	updated_at: new Date(
																		commission.artistTos.updatedAt,
																	).toLocaleDateString("en-US", {
																		month: "short",
																		day: "numeric",
																		year: "numeric",
																	}),
																},
															)}
														</span>
													</div>

													{/* <Button
														variant="ghost"
														size="icon-sm"
														onClick={() => setTermsModalOpen(true)}
													>
														<Maximize2 />
													</Button> */}
												</div>

												<ScrollShadow className="min-h-48 flex-1">
													<MarkdownDisplay
														content={commission.artistTos.tosText}
														className="text-sm"
													/>
												</ScrollShadow>
											</div>
										) : isDetailsLoading ? (
											<div className="space-y-3">
												<div className="-mx-4">
													<Separator className="mb-4" />
												</div>
												<Skeleton className="h-4 w-32" />
												<Skeleton className="h-32 w-full rounded-xl" />
											</div>
										) : (
											<div className="space-y-3">
												<div className="-mx-4">
													<Separator className="mb-4" />
												</div>
												<div className="text-xs italic text-muted-foreground">
													Terms of service not available.
												</div>
											</div>
										)}
									</div>
								)}
							</div>
						</div>

						<Separator />

						<div className="sticky bottom-0 z-20 bg-background">
							<div className="space-y-4 p-6 pb-8 md:pb-6">
								<div className="flex items-start gap-2">
									<Checkbox
										id="terms"
										checked={termsAccepted}
										onCheckedChange={(c) => setTermsAccepted(c === true)}
										className="mt-0.5"
									/>
									<div className="grid flex-1 gap-1.5">
										<label
											htmlFor="terms"
											className="text-sm font-medium leading-snug"
										>
											{t(
												"components.profile.commissions.modal.footer.accept_tos_label",
												{ artist: fetchedArtist?.displayName },
											)}
										</label>
									</div>
								</div>

								<div className="flex min-w-0 gap-3">
									<Button
										type="button"
										className="min-w-0 flex-1"
										size="xl"
										disabled={!termsAccepted}
										onClick={handleRequestOpen}
									>
										<span className="truncate px-2">
											{t(
												"components.profile.commissions.modal.footer.accept_start",
											)}
										</span>
									</Button>

									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												type="button"
												variant="secondary"
												size="icon-xl"
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
						</div>
					</div>
				}
			/>

			{commission?.artistId && (
				<CommissionRequestModal
					open={open && requestModalOpen}
					onOpenChange={handleRequestModalOpenChange}
					onBack={handleRequestBack}
					commissionId={commission.id}
					initialLicenses={[]}
				/>
			)}

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
							? commission?.service_type || ""
							: infoModalState.type === "communication"
								? commission?.communication_type || ""
								: commission?.requesting_process || ""
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

			{/* {commission?.artistTos && (
				<TermsModal
					open={termsModalOpen}
					onOpenChange={setTermsModalOpen}
					artistId={commission?.artistId || ""}
				/>
			)} */}
		</>
	);
}
