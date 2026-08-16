import { ScrollShadow } from "@heroui/react";
import type { LucideIcon } from "lucide-react";
import {
	MessageCircle,
	PartyPopper,
	RefreshCw,
	Sparkles,
	ThumbsUp,
	Zap,
} from "lucide-react";
import { useReducer } from "react";
import { useTranslation } from "react-i18next";
import { OutlineChat, SolidStar } from "@/components/icons/icons";
import {
	type TabItem,
	TabSelector,
} from "@/components/layout/profile/feed/selector";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MarkdownDisplay } from "@/components/ui/markdown-display";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCommission } from "@/hooks/commissions/use-commissions";
import { useUserById } from "@/hooks/user/use-user";
import {
	calculateCommissionPricing,
	calculateReviewStats,
} from "@/lib/commission-utils";
import { CommissionRequestModal } from "../commission-request/modal";
import { InfoSelectionModal } from "../info-selection";
import { UniversalModalLayout } from "../universal-modal-layout";

interface CommissionModalProps {
	commissionId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

type CommissionModalTab = "description" | "reviews";
type InfoModalType = "service" | "communication" | "process";

interface CommissionModalUiState {
	requestModalOpen: boolean;
	termsAccepted: boolean;
	activeTab: CommissionModalTab;
	infoModalState: {
		open: boolean;
		type: InfoModalType | null;
	};
}

type CommissionModalUiAction =
	| { type: "openRequestModal" }
	| { type: "closeRequestModal" }
	| { type: "setRequestModalOpen"; open: boolean }
	| { type: "setTermsAccepted"; accepted: boolean }
	| { type: "setActiveTab"; tab: CommissionModalTab }
	| { type: "setInfoModalOpen"; open: boolean }
	| { type: "openInfoModal"; modalType: InfoModalType }
	| { type: "closeInfoModal" }
	| { type: "closePreview" };

type CommissionLike = NonNullable<ReturnType<typeof useCommission>["data"]>;
type ArtistLike = NonNullable<ReturnType<typeof useUserById>["user"]>;

type InfoSelectionOption = {
	id: string;
	label: string;
	description: string;
	icon: LucideIcon;
};

const INITIAL_COMMISSION_MODAL_UI_STATE: CommissionModalUiState = {
	requestModalOpen: false,
	termsAccepted: false,
	activeTab: "description",
	infoModalState: {
		open: false,
		type: null,
	},
};

function commissionModalUiReducer(
	state: CommissionModalUiState,
	action: CommissionModalUiAction,
): CommissionModalUiState {
	switch (action.type) {
		case "openRequestModal":
			return {
				...state,
				requestModalOpen: true,
			};

		case "closeRequestModal":
			return {
				...state,
				requestModalOpen: false,
			};

		case "setRequestModalOpen":
			return {
				...state,
				requestModalOpen: action.open,
			};

		case "setTermsAccepted":
			return {
				...state,
				termsAccepted: action.accepted,
			};

		case "setActiveTab":
			return {
				...state,
				activeTab: action.tab,
			};

		case "setInfoModalOpen":
			return {
				...state,
				infoModalState: {
					...state.infoModalState,
					open: action.open,
				},
			};

		case "openInfoModal":
			return {
				...state,
				infoModalState: {
					open: true,
					type: action.modalType,
				},
			};

		case "closeInfoModal":
			return {
				...state,
				infoModalState: {
					open: false,
					type: null,
				},
			};

		case "closePreview":
			return {
				...state,
				requestModalOpen: false,
			};

		default:
			return state;
	}
}

function formatTosUpdatedAt(value: string) {
	return new Date(value).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

function CommissionMediaGallery({
	commission,
	isLoading,
}: {
	commission?: CommissionLike;
	isLoading: boolean;
}) {
	const { t } = useTranslation();

	return (
		<>
			<MobileCommissionMedia commission={commission} isLoading={isLoading} />
			<DesktopCommissionMedia commission={commission} isLoading={isLoading} />
		</>
	);
}

function MobileCommissionMedia({
	commission,
	isLoading,
}: {
	commission?: CommissionLike;
	isLoading: boolean;
}) {
	const { t } = useTranslation();

	return (
		<ScrollShadow
			orientation="horizontal"
			className="flex w-full gap-4 p-4 lg:hidden"
		>
			{commission?.multimedia?.length ? (
				commission.multimedia.map((media) => {
					const url = media.sizes.half;

					if (!url) return null;

					return (
						<div
							key={media.id}
							className="relative flex h-62.5 w-3/4 shrink-0 items-center justify-center rounded-lg"
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
				<div className="relative flex h-62.5 w-3/4 shrink-0 items-center justify-center rounded-lg bg-secondary/5">
					<Skeleton className="h-full w-full rounded-lg" />
				</div>
			) : (
				<div className="flex h-62.5 w-full items-center justify-center p-8 text-muted-foreground">
					{t("components.profile.commissions.modal.no_media")}
				</div>
			)}
		</ScrollShadow>
	);
}

function DesktopCommissionMedia({
	commission,
	isLoading,
}: {
	commission?: CommissionLike;
	isLoading: boolean;
}) {
	const { t } = useTranslation();

	return (
		<div className="hidden flex-col gap-4 p-4 lg:flex">
			{commission?.multimedia?.length ? (
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
	);
}

function CommissionSummary({
	commission,
	isLoading,
	totalPrice,
	originalPrice,
}: {
	commission?: CommissionLike;
	isLoading: boolean;
	totalPrice: number;
	originalPrice: number;
}) {
	const { t } = useTranslation();

	return (
		<div className="space-y-2">
			<div className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
				{t("components.profile.commissions.modal.category_label")}
			</div>

			{commission ? (
				<h1 className="text-3xl font-semibold leading-tight">
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
	);
}

function CommissionTabs({
	tabs,
	activeTab,
	onActiveTabChange,
}: {
	tabs: TabItem<CommissionModalTab>[];
	activeTab: CommissionModalTab;
	onActiveTabChange: (tab: CommissionModalTab) => void;
}) {
	return (
		<div className="-mx-4">
			<div className="px-4">
				<TabSelector
					items={tabs}
					value={activeTab}
					onValueChange={onActiveTabChange}
					className="mb-4"
					size="sm"
				/>
			</div>
			<Separator />
		</div>
	);
}

function CommissionDescriptionTab({
	commission,
	fetchedArtist,
	isLoading,
	isDetailsLoading,
}: {
	commission?: CommissionLike;
	fetchedArtist?: ArtistLike;
	isLoading: boolean;
	isDetailsLoading: boolean;
}) {
	if (isLoading) {
		return (
			<div className="space-y-6 pt-2">
				<div className="space-y-2">
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-3/4" />
				</div>
				<CommissionTermsSection
					commission={commission}
					fetchedArtist={fetchedArtist}
					isDetailsLoading={isDetailsLoading}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6 pt-2">
			<CommissionDescriptionContent commission={commission} />
			<CommissionTermsSection
				commission={commission}
				fetchedArtist={fetchedArtist}
				isDetailsLoading={isDetailsLoading}
			/>
		</div>
	);
}

function CommissionDescriptionContent({
	commission,
}: {
	commission?: CommissionLike;
}) {
	const { t } = useTranslation();

	if (!commission?.description) return null;

	return (
		<div className="leading-relaxed text-muted-foreground">
			{commission.description.length > 0 ? (
				<MarkdownDisplay content={commission.description} />
			) : (
				<div className="text-center text-muted-foreground">
					{t("components.profile.commissions.modal.no_description")}
				</div>
			)}
		</div>
	);
}

function CommissionTermsSection({
	commission,
	fetchedArtist,
	isDetailsLoading,
}: {
	commission?: CommissionLike;
	fetchedArtist?: ArtistLike;
	isDetailsLoading: boolean;
}) {
	const { t } = useTranslation();

	if (commission?.artistTos) {
		return (
			<div className="space-y-3">
				<div className="-mx-4">
					<Separator className="mb-4" />
				</div>

				<div className="flex items-start justify-between">
					<div className="space-y-0">
						<h4 className="text-lg font-semibold">
							{t("components.profile.commissions.modal.tos.title", {
								artist_displayname: fetchedArtist?.displayName,
							})}
						</h4>
						<span className="text-xs text-muted-foreground">
							{t("components.profile.commissions.modal.tos.updated_at", {
								updated_at: formatTosUpdatedAt(commission.artistTos.updatedAt),
							})}
						</span>
					</div>
				</div>

				<ScrollShadow className="min-h-48 flex-1">
					<MarkdownDisplay
						content={commission.artistTos.tosText}
						className="text-sm"
					/>
				</ScrollShadow>
			</div>
		);
	}

	if (isDetailsLoading) {
		return (
			<div className="space-y-3">
				<div className="-mx-4">
					<Separator className="mb-4" />
				</div>
				<Skeleton className="h-4 w-32" />
				<Skeleton className="h-32 w-full rounded-xl" />
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<div className="-mx-4">
				<Separator className="mb-4" />
			</div>
			<div className="text-xs italic text-muted-foreground">
				Terms of service not available.
			</div>
		</div>
	);
}

function CommissionDetailsContent({
	commission,
	fetchedArtist,
	isLoading,
	isDetailsLoading,
	tabs,
	activeTab,
	onActiveTabChange,
	totalPrice,
	originalPrice,
}: {
	commission?: CommissionLike;
	fetchedArtist?: ArtistLike;
	isLoading: boolean;
	isDetailsLoading: boolean;
	tabs: TabItem<CommissionModalTab>[];
	activeTab: CommissionModalTab;
	onActiveTabChange: (tab: CommissionModalTab) => void;
	totalPrice: number;
	originalPrice: number;
}) {
	return (
		<div className="min-h-0 flex-1 overflow-y-auto">
			<div className="space-y-6 px-4 pt-4 pb-6">
				<CommissionSummary
					commission={commission}
					isLoading={isLoading}
					totalPrice={totalPrice}
					originalPrice={originalPrice}
				/>

				<CommissionTabs
					tabs={tabs}
					activeTab={activeTab}
					onActiveTabChange={onActiveTabChange}
				/>

				{activeTab === "description" && (
					<CommissionDescriptionTab
						commission={commission}
						fetchedArtist={fetchedArtist}
						isLoading={isLoading}
						isDetailsLoading={isDetailsLoading}
					/>
				)}
			</div>
		</div>
	);
}

function CommissionFooterActions({
	termsAccepted,
	artistDisplayName,
	onTermsAcceptedChange,
	onRequestClick,
}: {
	termsAccepted: boolean;
	artistDisplayName?: string;
	onTermsAcceptedChange: (accepted: boolean) => void;
	onRequestClick: () => void;
}) {
	const { t } = useTranslation();

	return (
		<div className="sticky bottom-0 z-20 bg-background">
			<div className="space-y-4 p-6 pb-8 md:pb-6">
				<div className="flex items-start gap-2">
					<Checkbox
						id="terms"
						checked={termsAccepted}
						onCheckedChange={(checked) =>
							onTermsAcceptedChange(checked === true)
						}
						className="mt-0.5"
					/>
					<div className="grid flex-1 gap-1.5">
						<label htmlFor="terms" className="text-sm font-medium leading-snug">
							{t(
								"components.profile.commissions.modal.footer.accept_tos_label",
								{
									artist: artistDisplayName,
								},
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
						onClick={onRequestClick}
					>
						<span className="truncate px-2">
							{t("components.profile.commissions.modal.footer.accept_start")}
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
	);
}

function CommissionPreviewDetails({
	commission,
	fetchedArtist,
	isLoading,
	isDetailsLoading,
	tabs,
	activeTab,
	termsAccepted,
	totalPrice,
	originalPrice,
	dispatchUi,
	onRequestClick,
}: {
	commission?: CommissionLike;
	fetchedArtist?: ArtistLike;
	isLoading: boolean;
	isDetailsLoading: boolean;
	tabs: TabItem<CommissionModalTab>[];
	activeTab: CommissionModalTab;
	termsAccepted: boolean;
	totalPrice: number;
	originalPrice: number;
	dispatchUi: React.Dispatch<CommissionModalUiAction>;
	onRequestClick: () => void;
}) {
	return (
		<div className="flex h-full flex-col overflow-hidden">
			<CommissionDetailsContent
				commission={commission}
				fetchedArtist={fetchedArtist}
				isLoading={isLoading}
				isDetailsLoading={isDetailsLoading}
				tabs={tabs}
				activeTab={activeTab}
				onActiveTabChange={(tab) =>
					dispatchUi({
						type: "setActiveTab",
						tab,
					})
				}
				totalPrice={totalPrice}
				originalPrice={originalPrice}
			/>

			<Separator />

			<CommissionFooterActions
				termsAccepted={termsAccepted}
				artistDisplayName={fetchedArtist?.displayName}
				onTermsAcceptedChange={(accepted) =>
					dispatchUi({
						type: "setTermsAccepted",
						accepted,
					})
				}
				onRequestClick={onRequestClick}
			/>
		</div>
	);
}

function getInfoSelectionOptions(
	type: InfoModalType,
	t: ReturnType<typeof useTranslation>["t"],
): InfoSelectionOption[] {
	if (type === "service") {
		return [
			{
				id: "custom_service",
				label: t("components.profile.commissions.modal.service.custom.title"),
				description: t(
					"components.profile.commissions.modal.service.custom.description",
				),
				icon: Sparkles,
			},
			{
				id: "personalized_ych",
				label: t("components.profile.commissions.modal.service.ych.title"),
				description: t(
					"components.profile.commissions.modal.service.ych.description",
				),
				icon: RefreshCw,
			},
		];
	}

	if (type === "communication") {
		return [
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
				label: t("components.profile.commissions.modal.service.surprise.title"),
				description: t(
					"components.profile.commissions.modal.service.surprise.description",
				),
				icon: PartyPopper,
			},
		];
	}

	return [
		{
			id: "custom_proposal",
			label: t("components.profile.commissions.modal.service.proposal.title"),
			description: t(
				"components.profile.commissions.modal.service.proposal.description",
			),
			icon: ThumbsUp,
		},
		{
			id: "instant_order",
			label: t("components.profile.commissions.modal.service.instant.title"),
			description: t(
				"components.profile.commissions.modal.service.instant.description",
			),
			icon: Zap,
		},
	];
}

function getInfoSelectionSelectedId(
	type: InfoModalType,
	commission?: CommissionLike,
) {
	if (type === "service") return commission?.service_type || "";
	if (type === "communication") return commission?.communication_type || "";
	return commission?.requesting_process || "";
}

function CommissionInfoModal({
	commission,
	infoModalState,
	onOpenChange,
}: {
	commission?: CommissionLike;
	infoModalState: CommissionModalUiState["infoModalState"];
	onOpenChange: (open: boolean) => void;
}) {
	const { t } = useTranslation();

	if (!infoModalState.type) return null;

	return (
		<InfoSelectionModal
			open={infoModalState.open}
			onOpenChange={onOpenChange}
			title={t(
				`components.profile.commissions.modal.info_selection_modal.${infoModalState.type}.title`,
			)}
			description={t(
				`components.profile.commissions.modal.info_selection_modal.${infoModalState.type}.description`,
			)}
			selectedId={getInfoSelectionSelectedId(infoModalState.type, commission)}
			options={getInfoSelectionOptions(infoModalState.type, t)}
		/>
	);
}

export function CommissionModal({
	commissionId,
	open,
	onOpenChange,
}: CommissionModalProps) {
	const { t } = useTranslation();

	const [uiState, dispatchUi] = useReducer(
		commissionModalUiReducer,
		INITIAL_COMMISSION_MODAL_UI_STATE,
	);

	const { requestModalOpen, termsAccepted, activeTab, infoModalState } =
		uiState;

	const {
		data: commissionData,
		isPending,
		isFetching,
	} = useCommission(commissionId);

	const commission = commissionData;
	const isLoading = isPending;
	const isDetailsLoading = isFetching;
	const { user: fetchedArtist } = useUserById(commission?.artistId ?? "");

	const reviewStats = calculateReviewStats([]);
	const tabs: TabItem<CommissionModalTab>[] = [
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
			0, // TODO: commission.discountRate
		)
		: { basePrice: 0, originalPrice: 0 };

	function openRequestModal() {
		dispatchUi({ type: "openRequestModal" });
	}

	function updatePreviewOpen(nextOpen: boolean) {
		if (!nextOpen) {
			dispatchUi({ type: "closePreview" });
		}

		onOpenChange(nextOpen);
	}

	function updateRequestModalOpen(nextOpen: boolean) {
		dispatchUi({ type: "setRequestModalOpen", open: nextOpen });

		if (!nextOpen) {
			onOpenChange(false);
		}
	}

	function updateInfoModalOpen(nextOpen: boolean) {
		dispatchUi(
			nextOpen
				? { type: "setInfoModalOpen", open: true }
				: { type: "closeInfoModal" },
		);
	}

	if (!commission && !isLoading) {
		return null;
	}

	return (
		<>
			<UniversalModalLayout
				open={open && !requestModalOpen}
				onOpenChange={updatePreviewOpen}
				title={t("components.profile.commissions.modal.title")}
				mediaClassName="bg-transparent"
				mediaContent={
					<CommissionMediaGallery
						commission={commission}
						isLoading={isLoading}
					/>
				}
				detailsContent={
					<CommissionPreviewDetails
						commission={commission}
						fetchedArtist={fetchedArtist}
						isLoading={isLoading}
						isDetailsLoading={isDetailsLoading}
						tabs={tabs}
						activeTab={activeTab}
						termsAccepted={termsAccepted}
						totalPrice={basePrice}
						originalPrice={originalPrice}
						dispatchUi={dispatchUi}
						onRequestClick={openRequestModal}
					/>
				}
			/>

			{commission?.artistId && (
				<CommissionRequestModal
					open={open && requestModalOpen}
					onOpenChange={updateRequestModalOpen}
					onBack={() => dispatchUi({ type: "closeRequestModal" })}
					commissionId={commission.id}
					initialLicenses={[]}
				/>
			)}

			<CommissionInfoModal
				commission={commission}
				infoModalState={infoModalState}
				onOpenChange={updateInfoModalOpen}
			/>
		</>
	);
}
