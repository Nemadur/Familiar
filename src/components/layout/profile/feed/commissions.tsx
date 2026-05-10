import { ScrollShadow, surfaceVariants } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";
import {
	FolderOpen,
	ListFilterIcon,
	Pause,
	Play,
	Tag,
	Wallet,
} from "lucide-react";
import {
	type ComponentProps,
	type Dispatch,
	type KeyboardEvent,
	type MouseEvent,
	type ReactNode,
	type SetStateAction,
	useMemo,
	useState,
} from "react";
import { useTranslation } from "react-i18next";
import { MarkdownDisplay } from "@/components/common/markdown-display";
import type { NumberFilterOperator } from "@/components/data-table-filter/core/types";
import {
	FilterBar,
	type FilterGroup,
	type FilterValue,
	type ManagedFilterValue,
} from "@/components/layout/filter-bar";
import {
	OutlineBookmark,
	OutlineChat,
	OutlineChevronLeft,
	OutlineChevronRight,
	OutlineEyeOff,
	OutlineFilter,
	OutlineUser,
} from "@/components/icons/icons";
import { EmptyPage } from "@/components/layout/empty-page";
import {
	Reel,
	ReelContent,
	ReelImage,
	type ReelItem,
	ReelProgress,
} from "@/components/kibo-ui/reel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBlurredImage } from "@/hooks/use-blurred-image";
import { useCurrencyConversion } from "@/hooks/use-currency-conversion";
import { useIsTablet } from "@/hooks/use-mobile";
import { calculateCommissionPricing } from "@/lib/commission-utils";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";
import {
	type TCommissionDetailResponse,
	TCommissionStatus,
	type TMultimediaItem,
} from "@/types/commissions";
import type { TUserProfile } from "@/types/user";

interface ProfileCommissionsProps {
	artist: TUserProfile;
	commissions: TCommissionDetailResponse[];
}

type CategoryFolder = {
	id: string;
	label: string;
	status: TCommissionStatus;
	items: TCommissionDetailResponse[];
	isClosed?: boolean;
};

type ManagedFiltersState = Record<string, ManagedFilterValue>;

type CommissionCardPricing = {
	discountedPrice: number;
	originalPrice: number;
	discountRate: number;
};

type CommissionBlurState = {
	shouldBlur: boolean;
	hasContentWarnings: boolean;
	warningTagNames: string;
};

type CommissionReelState = {
	currentImageIndex: number;
	hasMultipleImages: boolean;
	isPlaying: boolean;
	isTablet: boolean;
	isAutoPlayPaused: boolean;
};

type CommissionReelActions = {
	setCurrentImageIndex: Dispatch<SetStateAction<number>>;
	setHoverPlaying: Dispatch<SetStateAction<boolean>>;
	setIsAutoPlayPaused: Dispatch<SetStateAction<boolean>>;
};

type CategoryOption = {
	id: string;
	label: string;
	parentId?: string;
};

type SelectOption = {
	id: string;
	label: string;
};

const INITIAL_FILTER_STATE: ManagedFiltersState = {
	category: { value: [] },
	status: { value: [] },
	tags: { value: [] },
	price: { value: [] },
};

const FALLBACK_IMAGE_URL = "https://placehold.co/600x400?text=No+Image";

function getCommissionImages(multimedia: TMultimediaItem[]): string[] {
	const images: string[] = [];

	for (const item of multimedia) {
		if (item.sizes.half) {
			images.push(item.sizes.half);
		}
	}

	return images;
}

function getCommissionCategoryId(commission: TCommissionDetailResponse) {
	return commission.category?.id ?? "uncategorized";
}

function getCommissionCategoryLabel(commission: TCommissionDetailResponse) {
	if (!commission.category?.name) return "Uncategorized";

	return commission.category.parentName
		? `${commission.category.parentName} / ${commission.category.name}`
		: commission.category.name;
}

function formatCommissionStatus(status: TCommissionStatus | string) {
	const value = String(status);

	switch (value) {
		case "ACTIVE":
			return "Active";
		case "ONHOLD":
			return "On hold";
		case "PAUSED":
			return "Paused";
		case "ARCHIVED":
			return "Archived";
		case "DRAFT":
			return "Draft";
		default:
			return value
				.toLowerCase()
				.replace(/_/g, " ")
				.replace(/\b\w/g, (char) => char.toUpperCase());
	}
}

function getSelectedValues(value: FilterValue | undefined): string[] {
	if (Array.isArray(value)) {
		const values: string[] = [];

		for (const item of value) {
			if (typeof item === "string") {
				values.push(item);
			}
		}

		return values;
	}

	if (typeof value === "string") {
		return [value];
	}

	return [];
}

function getSelectedNumbers(value: FilterValue | undefined): number[] {
	if (!Array.isArray(value)) return [];

	const values: number[] = [];

	for (const item of value) {
		if (typeof item === "number") {
			values.push(item);
		}
	}

	return values;
}

function resolveOptionOperator(
	operator: ManagedFilterValue["operator"],
	valueCount: number,
) {
	if (operator) return operator as string;
	return valueCount <= 1 ? "is" : "is any of";
}

function matchSingleOrMulti(
	itemValue: string | string[],
	operator: string,
	selectedValues: string[],
) {
	if (selectedValues.length === 0) return true;

	const itemValues = Array.isArray(itemValue) ? itemValue : [itemValue];

	switch (operator) {
		case "is not":
		case "is none of":
			return selectedValues.every((value) => !itemValues.includes(value));
		case "is all of":
			return selectedValues.every((value) => itemValues.includes(value));
		case "is":
		case "is any of":
		default:
			return selectedValues.some((value) => itemValues.includes(value));
	}
}

function matchNumber(
	input: number,
	values: number[],
	operator?: ManagedFilterValue["operator"],
) {
	if (values.length === 0) return true;

	const op = (operator ?? (values.length > 1 ? "is between" : "is")) as
		| NumberFilterOperator
		| string;
	const first = values[0];
	const second = values[1] ?? values[0];
	const min = Math.min(first, second);
	const max = Math.max(first, second);

	switch (op) {
		case "is":
			return input === first;
		case "is not":
			return input !== first;
		case "is greater than":
			return input > first;
		case "is greater than or equal to":
		case "is at least":
			return input >= first;
		case "is less than":
			return input < first;
		case "is less than or equal to":
		case "is at most":
			return input <= first;
		case "is between":
			return input >= min && input <= max;
		case "is not between":
			return !(input >= min && input <= max);
		default:
			return true;
	}
}

function getCommissionBlurState(
	commission: TCommissionDetailResponse,
	isContentRevealed: boolean,
): CommissionBlurState {
	const warningTagNames: string[] = [];
	let hasAdultOnly = false;

	for (const tag of commission.tags) {
		if (tag.hasContentWarning) {
			warningTagNames.push(tag.name);
		}

		if (tag.isAdultOnly) {
			hasAdultOnly = true;
		}
	}

	const hasContentWarnings = warningTagNames.length > 0;

	return {
		shouldBlur:
			(hasContentWarnings && !isContentRevealed) ||
			(hasAdultOnly && !isContentRevealed),
		hasContentWarnings,
		warningTagNames: warningTagNames.join(", "),
	};
}

function buildReelItems(
	commission: TCommissionDetailResponse,
	images: string[],
): ReelItem[] {
	const items: ReelItem[] = [];

	for (const [index, src] of images.entries()) {
		items.push({
			id: `${commission.id}-${index}`,
			type: "image",
			src,
			duration: 1,
			alt: commission.title,
		});
	}

	return items;
}

function isEventActivationKey(event: KeyboardEvent<HTMLElement>) {
	return event.key === "Enter" || event.key === " ";
}

function useVisibleCommissions({
	commissions,
	isMe,
}: {
	commissions: TCommissionDetailResponse[];
	isMe: boolean;
}) {
	const { convert, userCurrency } = useCurrencyConversion();

	return useMemo(() => {
		const visibleCommissions: TCommissionDetailResponse[] = [];

		for (const commission of commissions) {
			if (!isMe && commission.commissionStatus === TCommissionStatus.Archived) {
				continue;
			}

			visibleCommissions.push({
				...commission,
				basePrice: convert(
					commission.basePrice,
					commission.currencyCode || "USD",
				),
				currencyCode: userCurrency,
			});
		}

		return visibleCommissions;
	}, [commissions, convert, isMe, userCurrency]);
}

function useCommissionFilterOptions(
	visibleCommissions: TCommissionDetailResponse[],
) {
	const categoryOptions = useMemo<CategoryOption[]>(() => {
		const optionsById = new Map<string, CategoryOption>();

		for (const commission of visibleCommissions) {
			const id = getCommissionCategoryId(commission);
			const parentName = commission.category?.parentName;
			const name = commission.category?.name || "Uncategorized";

			if (!optionsById.has(id)) {
				optionsById.set(id, {
					id,
					label: name,
					...(parentName ? { parentId: parentName } : {}),
				});
			}
		}

		return Array.from(optionsById.values()).toSorted((a, b) =>
			a.label.localeCompare(b.label),
		);
	}, [visibleCommissions]);

	const statusOptions = useMemo<SelectOption[]>(() => {
		const optionsById = new Map<string, SelectOption>();

		for (const commission of visibleCommissions) {
			const id = String(commission.commissionStatus);

			if (!optionsById.has(id)) {
				optionsById.set(id, {
					id,
					label: formatCommissionStatus(commission.commissionStatus),
				});
			}
		}

		return Array.from(optionsById.values());
	}, [visibleCommissions]);

	const tagOptions = useMemo<SelectOption[]>(() => {
		const optionsById = new Map<string, SelectOption>();

		for (const commission of visibleCommissions) {
			for (const tag of commission.tags) {
				if (!optionsById.has(tag.id)) {
					optionsById.set(tag.id, { id: tag.id, label: tag.name });
				}
			}
		}

		return Array.from(optionsById.values()).toSorted((a, b) =>
			a.label.localeCompare(b.label),
		);
	}, [visibleCommissions]);

	return {
		categoryOptions,
		statusOptions,
		tagOptions,
	};
}

function useCommissionFilterGroups({
	categoryOptions,
	statusOptions,
	tagOptions,
}: {
	categoryOptions: CategoryOption[];
	statusOptions: SelectOption[];
	tagOptions: SelectOption[];
}) {
	return useMemo<FilterGroup<TCommissionDetailResponse>[]>(
		() => [
			{
				id: "category",
				label: "Category",
				type: "select",
				icon: FolderOpen,
				getItemValue: (commission) => getCommissionCategoryId(commission),
				options: categoryOptions,
			},
			{
				id: "status",
				label: "Status",
				type: "select",
				icon: ListFilterIcon,
				getItemValue: (commission) => String(commission.commissionStatus),
				options: statusOptions,
			},
			{
				id: "tags",
				label: "Tags",
				type: "multiselect",
				icon: Tag,
				getItemValue: (commission) => {
					const tagIds: string[] = [];

					for (const tag of commission.tags) {
						tagIds.push(tag.id);
					}

					return tagIds;
				},
				options: tagOptions,
			},
			{
				id: "price",
				label: "Price",
				type: "range",
				icon: Wallet,
				getItemValue: (commission) => commission.basePrice,
			},
		],
		[categoryOptions, statusOptions, tagOptions],
	);
}

function useFilteredCommissions({
	visibleCommissions,
	filterState,
	searchQuery,
}: {
	visibleCommissions: TCommissionDetailResponse[];
	filterState: ManagedFiltersState;
	searchQuery: string;
}) {
	return useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		const selectedCategories = getSelectedValues(filterState.category?.value);
		const selectedStatuses = getSelectedValues(filterState.status?.value);
		const selectedTags = getSelectedValues(filterState.tags?.value);
		const selectedPrice = getSelectedNumbers(filterState.price?.value);

		return visibleCommissions.filter((commission) => {
			const categoryId = getCommissionCategoryId(commission);
			const categoryLabel = getCommissionCategoryLabel(commission);
			const tagIds: string[] = [];
			const tagNames: string[] = [];

			for (const tag of commission.tags) {
				tagIds.push(tag.id);
				tagNames.push(tag.name);
			}

			const statusValue = String(commission.commissionStatus);

			const matchesSearch = query
				? [
						commission.title,
						commission.description ?? "",
						categoryLabel,
						statusValue,
						...tagNames,
					]
						.join(" ")
						.toLowerCase()
						.includes(query)
				: true;

			const matchesCategory =
				selectedCategories.length === 0
					? true
					: matchSingleOrMulti(
							categoryId,
							resolveOptionOperator(
								filterState.category?.operator,
								selectedCategories.length,
							),
							selectedCategories,
						);

			const matchesStatus =
				selectedStatuses.length === 0
					? true
					: matchSingleOrMulti(
							statusValue,
							resolveOptionOperator(
								filterState.status?.operator,
								selectedStatuses.length,
							),
							selectedStatuses,
						);

			const matchesTags =
				selectedTags.length === 0
					? true
					: matchSingleOrMulti(
							tagIds,
							resolveOptionOperator(
								filterState.tags?.operator,
								selectedTags.length,
							),
							selectedTags,
						);

			const matchesPrice = matchNumber(
				commission.basePrice,
				selectedPrice,
				filterState.price?.operator,
			);

			return (
				matchesSearch &&
				matchesCategory &&
				matchesStatus &&
				matchesTags &&
				matchesPrice
			);
		});
	}, [filterState, searchQuery, visibleCommissions]);
}

function useGroupedCommissions(
	filteredCommissions: TCommissionDetailResponse[],
) {
	return useMemo<CategoryFolder[]>(() => {
		const folderMap = new Map<string, CategoryFolder>();

		for (const commission of filteredCommissions) {
			const categoryLabel = getCommissionCategoryLabel(commission);
			const folderId = categoryLabel;

			if (!folderMap.has(folderId)) {
				folderMap.set(folderId, {
					id: folderId,
					label: categoryLabel,
					status: commission.commissionStatus,
					items: [],
				});
			}

			folderMap.get(folderId)?.items.push(commission);
		}

		const folders: CategoryFolder[] = [];

		for (const folder of folderMap.values()) {
			folders.push(resolveFolderStatus(folder));
		}

		return folders.toSorted((a, b) => a.label.localeCompare(b.label));
	}, [filteredCommissions]);
}

function resolveFolderStatus(folder: CategoryFolder): CategoryFolder {
	const allPaused =
		folder.items.length > 0 &&
		folder.items.every(
			(commission) => commission.commissionStatus === TCommissionStatus.Paused,
		);

	if (allPaused) {
		return { ...folder, isClosed: true };
	}

	const hasActive = folder.items.some(
		(commission) => commission.commissionStatus === TCommissionStatus.Active,
	);

	return {
		...folder,
		isClosed: false,
		status: hasActive
			? TCommissionStatus.Active
			: folder.items[0].commissionStatus,
	};
}

function getCommissionPricing(
	commission: TCommissionDetailResponse,
): CommissionCardPricing {
	const {
		basePrice: discountedPrice,
		originalPrice,
		discountRate,
	} = calculateCommissionPricing(commission.basePrice, 0);

	return {
		discountedPrice,
		originalPrice,
		discountRate,
	};
}

function CommissionCard({
	commission,
	artist,
}: {
	commission: TCommissionDetailResponse;
	artist: TUserProfile;
}) {
	const navigate = useNavigate();
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [hoverPlaying, setHoverPlaying] = useState(false);
	const [isContentRevealed, setIsContentRevealed] = useState(false);
	const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);
	const isTablet = useIsTablet();

	const status = commission.commissionStatus;
	const images = getCommissionImages(commission.multimedia);
	const displayImages = images.length > 0 ? images : [FALLBACK_IMAGE_URL];
	const reelItems = buildReelItems(commission, displayImages);
	const hasMultipleImages = displayImages.length > 1;
	const isPlaying = (isTablet || hoverPlaying) && !isAutoPlayPaused;
	const blurState = getCommissionBlurState(commission, isContentRevealed);
	const pricing = getCommissionPricing(commission);

	const reelState = useMemo<CommissionReelState>(
		() => ({
			currentImageIndex,
			hasMultipleImages,
			isPlaying,
			isTablet,
			isAutoPlayPaused,
		}),
		[
			currentImageIndex,
			hasMultipleImages,
			isPlaying,
			isTablet,
			isAutoPlayPaused,
		],
	);

	const reelActions = useMemo<CommissionReelActions>(
		() => ({
			setCurrentImageIndex,
			setHoverPlaying,
			setIsAutoPlayPaused,
		}),
		[],
	);

	function navigateToCommission() {
		navigate({
			to: `/${artist.username}/commissions/${commission.id}`,
		});
	}

	function handleNavigate(
		event?: MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>,
	) {
		if (blurState.shouldBlur) {
			event?.preventDefault();
			event?.stopPropagation();
			setIsContentRevealed(true);
			return;
		}

		if (status !== TCommissionStatus.Active) return;

		navigateToCommission();
	}

	function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
		if (isEventActivationKey(event)) {
			event.preventDefault();
			handleNavigate(event);
		}
	}

	return (
		<article
			className={cn(
				"group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-3xl p-2 text-left transition-colors xl:flex-row",
				surfaceVariants({ variant: "secondary" }),
			)}
			onMouseEnter={() => {
				if (!isTablet) setHoverPlaying(true);
			}}
			onMouseLeave={() => {
				if (!isTablet) {
					setHoverPlaying(false);
					setCurrentImageIndex(0);
				}
			}}
			onClick={handleNavigate}
			onKeyDown={handleKeyDown}
		>
			<CommissionCardMedia
				artist={artist}
				commission={commission}
				blurState={blurState}
				reelItems={reelItems}
				reelState={reelState}
				reelActions={reelActions}
				setIsContentRevealed={setIsContentRevealed}
			/>

			<CommissionCardContent
				item={commission}
				status={status}
				artist={artist}
				pricing={pricing}
				shouldBlur={blurState.shouldBlur}
				setIsContentRevealed={setIsContentRevealed}
			/>
		</article>
	);
}

function CommissionCardMedia({
	artist,
	commission,
	blurState,
	reelItems,
	reelState,
	reelActions,
	setIsContentRevealed,
}: {
	artist: TUserProfile;
	commission: TCommissionDetailResponse;
	blurState: CommissionBlurState;
	reelItems: ReelItem[];
	reelState: CommissionReelState;
	reelActions: CommissionReelActions;
	setIsContentRevealed: Dispatch<SetStateAction<boolean>>;
}) {
	return (
		<div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-muted xl:w-2/5">
			{blurState.shouldBlur ? (
				<BlurredCommissionMedia
					artist={artist}
					commission={commission}
					blurState={blurState}
					setIsContentRevealed={setIsContentRevealed}
				/>
			) : (
				<CommissionReelMedia
					commission={commission}
					reelItems={reelItems}
					reelState={reelState}
					reelActions={reelActions}
				/>
			)}

			{blurState.hasContentWarnings && !blurState.shouldBlur && (
				<HideSensitiveContentButton
					setIsContentRevealed={setIsContentRevealed}
				/>
			)}
		</div>
	);
}

function BlurredCommissionMedia({
	artist,
	commission,
	blurState,
	setIsContentRevealed,
}: {
	artist: TUserProfile;
	commission: TCommissionDetailResponse;
	blurState: CommissionBlurState;
	setIsContentRevealed: Dispatch<SetStateAction<boolean>>;
}) {
	const firstImage = commission.multimedia[0]?.sizes?.half;
	const blurredImageSrc = useBlurredImage(firstImage, blurState.shouldBlur);

	return (
		<>
			<BlurredCommissionBackground
				artist={artist}
				blurredImageSrc={blurredImageSrc}
			/>
			<SensitiveContentOverlay
				blurState={blurState}
				setIsContentRevealed={setIsContentRevealed}
			/>
		</>
	);
}

function BlurredCommissionBackground({
	artist,
	blurredImageSrc,
}: {
	artist: TUserProfile;
	blurredImageSrc?: string | null;
}) {
	return (
		<div className="h-full w-full bg-zinc-900">
			{blurredImageSrc ? (
				<div
					className="h-full w-full bg-cover bg-center opacity-80 blur-xl filter transition-all duration-500 hover:scale-110 hover:opacity-100"
					style={{ backgroundImage: `url(${blurredImageSrc})` }}
				/>
			) : artist.avatarPath ? (
				<div
					className="h-full w-full bg-cover bg-center opacity-50 blur-3xl filter transition-all duration-500 hover:scale-110 hover:opacity-70"
					style={{ backgroundImage: `url(${artist.avatarPath})` }}
				/>
			) : (
				<div className="h-full w-full bg-linear-to-br from-zinc-800 to-zinc-950 opacity-50" />
			)}
		</div>
	);
}

function SensitiveContentOverlay({
	blurState,
	setIsContentRevealed,
}: {
	blurState: CommissionBlurState;
	setIsContentRevealed: Dispatch<SetStateAction<boolean>>;
}) {
	const { t } = useTranslation();

	return (
		<div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-y-4 bg-black/60 p-4 text-white backdrop-blur-sm">
			<OutlineEyeOff size={32} />
			<h4 className="mb-1 text-xl font-semibold text-white">
				{t("components.profile.commissions.card.sensitive_content")}
			</h4>
			<p className="text-center text-sm text-white/70">
				{blurState.hasContentWarnings
					? t("components.profile.commissions.card.contains_tags", {
							tags: blurState.warningTagNames,
						})
					: t("components.profile.commissions.card.content_warning")}
			</p>

			<Button
				size="sm"
				className="w-fit border-none bg-white text-black hover:bg-white/90"
				onClick={(event) => {
					event.stopPropagation();
					setIsContentRevealed(true);
				}}
			>
				{t("components.profile.commissions.card.show_content")}
			</Button>
		</div>
	);
}

function HideSensitiveContentButton({
	setIsContentRevealed,
}: {
	setIsContentRevealed: Dispatch<SetStateAction<boolean>>;
}) {
	const { t } = useTranslation();

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="absolute top-2 right-2 z-20 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 hover:text-white"
					onClick={(event) => {
						event.stopPropagation();
						setIsContentRevealed(false);
					}}
				>
					<OutlineEyeOff className="size-4" />
				</Button>
			</TooltipTrigger>
			<TooltipContent side="left">
				{t("components.profile.commissions.card.hide_content")}
			</TooltipContent>
		</Tooltip>
	);
}

function CommissionReelMedia({
	commission,
	reelItems,
	reelState,
	reelActions,
}: {
	commission: TCommissionDetailResponse;
	reelItems: ReelItem[];
	reelState: CommissionReelState;
	reelActions: CommissionReelActions;
}) {
	const {
		currentImageIndex,
		hasMultipleImages,
		isPlaying,
		isTablet,
		isAutoPlayPaused,
	} = reelState;
	const { setCurrentImageIndex, setHoverPlaying, setIsAutoPlayPaused } =
		reelActions;

	return (
		<div className="h-full w-full overflow-hidden rounded-2xl transition-all duration-500">
			<Reel
				className="aspect-video h-full w-full overflow-hidden rounded-2xl"
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
				{hasMultipleImages && <CommissionReelProgress />}
				<ReelContent>
					{(reelItem) => (
						<ReelImage
							alt={reelItem.alt || ""}
							duration={reelItem.duration}
							src={reelItem.src}
							className="h-full w-full rounded-2xl object-cover"
						/>
					)}
				</ReelContent>

				{hasMultipleImages && (
					<CommissionReelControls
						commissionTitle={commission.title}
						isTablet={isTablet}
						isAutoPlayPaused={isAutoPlayPaused}
						totalItems={reelItems.length}
						setCurrentImageIndex={setCurrentImageIndex}
						setIsAutoPlayPaused={setIsAutoPlayPaused}
					/>
				)}
			</Reel>
		</div>
	);
}

function CommissionReelProgress() {
	return (
		<>
			<div
				className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-1/3 backdrop-blur-md"
				style={{
					maskImage:
						"linear-gradient(to top, black 0%, black 30%, transparent 100%)",
					WebkitMaskImage:
						"linear-gradient(to top, black 0%, black 30%, transparent 100%)",
				}}
			/>
			<ReelProgress className="top-auto right-auto bottom-2 left-1/2 z-10 w-1/2 -translate-x-1/2 px-1" />
		</>
	);
}

function CommissionReelControls({
	commissionTitle,
	isTablet,
	isAutoPlayPaused,
	totalItems,
	setCurrentImageIndex,
	setIsAutoPlayPaused,
}: {
	commissionTitle: string;
	isTablet: boolean;
	isAutoPlayPaused: boolean;
	totalItems: number;
	setCurrentImageIndex: Dispatch<SetStateAction<number>>;
	setIsAutoPlayPaused: Dispatch<SetStateAction<boolean>>;
}) {
	return (
		<>
			<CommissionImageNavigationButton
				label={`Previous image for ${commissionTitle}`}
				className="left-2"
				onClick={() =>
					setCurrentImageIndex((previous) =>
						previous > 0 ? previous - 1 : totalItems - 1,
					)
				}
			>
				<OutlineChevronLeft />
			</CommissionImageNavigationButton>

			<CommissionImageNavigationButton
				label={`Next image for ${commissionTitle}`}
				className="right-2"
				onClick={() =>
					setCurrentImageIndex((previous) =>
						previous < totalItems - 1 ? previous + 1 : 0,
					)
				}
			>
				<OutlineChevronRight />
			</CommissionImageNavigationButton>

			{isTablet && (
				<CommissionAutoPlayButton
					isAutoPlayPaused={isAutoPlayPaused}
					setIsAutoPlayPaused={setIsAutoPlayPaused}
				/>
			)}
		</>
	);
}

function CommissionImageNavigationButton({
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

function CommissionAutoPlayButton({
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

function CommissionCardContent({
	item,
	status,
	artist,
	pricing,
	shouldBlur,
	setIsContentRevealed,
}: {
	item: TCommissionDetailResponse;
	status: TCommissionStatus;
	artist: TUserProfile;
	pricing: CommissionCardPricing;
	shouldBlur: boolean;
	setIsContentRevealed: (value: boolean) => void;
}) {
	return (
		<div className="flex flex-1 flex-col gap-3 p-2 sm:gap-4 sm:p-1 xl:pl-6 xl:pr-2">
			<CommissionCardHeader item={item} pricing={pricing} />

			<CommissionCardActions
				item={item}
				status={status}
				artist={artist}
				shouldBlur={shouldBlur}
				setIsContentRevealed={setIsContentRevealed}
			/>
		</div>
	);
}

function CommissionCardHeader({
	item,
	pricing,
}: {
	item: TCommissionDetailResponse;
	pricing: CommissionCardPricing;
}) {
	const { t } = useTranslation();
	const { convertAndFormat } = useCurrencyConversion();
	const currency = item.currencyCode || "USD";

	return (
		<div className="space-y-1 sm:space-y-2">
			<div className="relative flex gap-10">
				<div className="flex w-full flex-col gap-2 md:pr-14">
					<div className="flex items-start gap-2">
						<h3 className="min-w-0 line-clamp-2 text-start text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
							{item.title}
						</h3>
					</div>
				</div>

				<BookmarkButton className="absolute top-0 right-0 z-0 hidden xl:flex" />
			</div>

			<div className="relative">
				<div className="flex items-center justify-between text-sm">
					<div className="flex items-baseline gap-2 text-left">
						<span className="font-medium text-muted-foreground">
							{t("components.profile.commissions.card.from")}
						</span>
						<span className="font-semibold text-primary">
							{convertAndFormat(pricing.discountedPrice, currency)}
						</span>
						{pricing.discountRate > 0 && (
							<span className="flex gap-2 text-xs text-muted-foreground opacity-70">
								<span className="line-through">
									{convertAndFormat(pricing.originalPrice, currency)}
								</span>
								<span>(-{Math.round(pricing.discountRate * 100)}%)</span>
							</span>
						)}
					</div>
				</div>

				<ScrollShadow
					hideScrollBar
					className="mt-2 max-h-16 overflow-hidden text-left opacity-50 sm:mt-3"
				>
					<MarkdownDisplay
						className="[--tw-prose-body:var(--muted-foreground)] [--tw-prose-headings:var(--muted-foreground)] [--tw-prose-bold:var(--muted-foreground)] [--tw-prose-bullets:var(--muted-foreground)] [--tw-prose-counters:var(--muted-foreground)] text-sm"
						content={item.description}
					/>
				</ScrollShadow>
			</div>
		</div>
	);
}

function BookmarkButton({ className }: { className?: string }) {
	return (
		<Button
			size="icon-xl"
			className={cn(
				"shrink-0 bg-transparent text-primary shadow-none before:absolute before:bottom-0 before:-z-10 before:h-16 before:w-full before:rounded-b-full before:bg-primary/6 before:transition-all hover:bg-transparent hover:before:translate-y-1.5 hover:before:bg-primary/10 hover:[&>svg]:translate-y-1.5 [&>svg]:transition-transform",
				className,
			)}
			onClick={(event) => event.stopPropagation()}
		>
			<OutlineBookmark />
		</Button>
	);
}

function CommissionCardActions({
	item,
	status,
	artist,
	shouldBlur,
	setIsContentRevealed,
}: {
	item: TCommissionDetailResponse;
	status: TCommissionStatus;
	artist: TUserProfile;
	shouldBlur: boolean;
	setIsContentRevealed: (value: boolean) => void;
}) {
	if (status === TCommissionStatus.Active) {
		return (
			<ActiveCommissionActions
				item={item}
				artist={artist}
				shouldBlur={shouldBlur}
				setIsContentRevealed={setIsContentRevealed}
			/>
		);
	}

	if (status === TCommissionStatus.OnHold) {
		return <PassiveCommissionActions actionLabelKey="join_waitlist" />;
	}

	if (status === TCommissionStatus.Paused) {
		return <PassiveCommissionActions actionLabelKey="get_notified" outline />;
	}

	return null;
}

function ActiveCommissionActions({
	item,
	artist,
	shouldBlur,
	setIsContentRevealed,
}: {
	item: TCommissionDetailResponse;
	artist: TUserProfile;
	shouldBlur: boolean;
	setIsContentRevealed: (value: boolean) => void;
}) {
	const { t } = useTranslation();
	const navigate = useNavigate();

	return (
		<div className="mt-auto flex w-full gap-2">
			<Button
				size="xl"
				className="flex-1"
				onClick={(event) => {
					event.stopPropagation();

					if (shouldBlur) {
						setIsContentRevealed(true);
						return;
					}

					navigate({
						to: `/${artist.username}/commissions/${item.id}`,
					});
				}}
			>
				{shouldBlur
					? t("components.profile.commissions.card.show_details_18_plus")
					: t("components.profile.commissions.card.start_request")}
			</Button>

			<CardIconAction>
				<OutlineChat />
			</CardIconAction>

			<CardIconAction className="xl:hidden">
				<OutlineBookmark />
			</CardIconAction>
		</div>
	);
}

function PassiveCommissionActions({
	actionLabelKey,
	outline = false,
}: {
	actionLabelKey: "join_waitlist" | "get_notified";
	outline?: boolean;
}) {
	const { t } = useTranslation();

	return (
		<div className="mt-auto flex w-full gap-2">
			<Button
				size="xl"
				variant={outline ? "outline" : "secondary"}
				className="flex-1"
				onClick={(event) => event.stopPropagation()}
			>
				{t(`components.profile.commissions.card.${actionLabelKey}`)}
			</Button>

			<CardIconAction size={outline ? "icon-xl" : "icon"}>
				<OutlineChat />
			</CardIconAction>

			<CardIconAction className="xl:hidden">
				<OutlineBookmark />
			</CardIconAction>
		</div>
	);
}

function CardIconAction({
	children,
	className,
	size = "icon-xl",
}: {
	children: ReactNode;
	className?: string;
	size?: ComponentProps<typeof Button>["size"];
}) {
	return (
		<Button
			variant="secondary"
			size={size}
			className={className}
			onClick={(event) => event.stopPropagation()}
		>
			{children}
		</Button>
	);
}

function CommissionFilters({
	visibleCommissions,
	filterGroups,
	filterValues,
	searchQuery,
	onFilterChange,
	onSearchChange,
	onClearAll,
}: {
	visibleCommissions: TCommissionDetailResponse[];
	filterGroups: FilterGroup<TCommissionDetailResponse>[];
	filterValues: Record<string, ManagedFilterValue>;
	searchQuery: string;
	onFilterChange: (
		groupId: string,
		value: FilterValue,
		operator?: ManagedFilterValue["operator"],
	) => void;
	onSearchChange: (value: string) => void;
	onClearAll: () => void;
}) {
	return (
		<FilterBar
			data={visibleCommissions}
			groups={filterGroups}
			values={filterValues}
			onFilterChange={onFilterChange}
			searchQuery={searchQuery}
			onSearchChange={onSearchChange}
			searchPlaceholder="Search by title, description, category, tag..."
			onClearAll={onClearAll}
		/>
	);
}

function CommissionFolders({
	folders,
	artist,
}: {
	folders: CategoryFolder[];
	artist: TUserProfile;
}) {
	if (folders.length === 0) {
		return (
			<EmptyPage
				icon={OutlineFilter}
				title="Not found"
				description="No commissions found matching your filters."
			/>
		);
	}

	return (
		<div className="flex flex-col gap-8">
			{folders.map((folder) => (
				<CommissionFolderSection
					key={folder.id}
					folder={folder}
					artist={artist}
				/>
			))}
		</div>
	);
}

function CommissionFolderSection({
	folder,
	artist,
}: {
	folder: CategoryFolder;
	artist: TUserProfile;
}) {
	return (
		<section className="space-y-6">
			<div className="flex items-center gap-2">
				<h2 className="text-xl font-semibold text-foreground">
					{folder.label}
				</h2>
				<Badge variant="secondary" className="whitespace-nowrap">
					{folder.isClosed ? "Closed" : formatCommissionStatus(folder.status)}
				</Badge>
			</div>

			<div className="grid gap-4">
				{folder.items.map((commission) => (
					<CommissionCard
						key={commission.id}
						commission={commission}
						artist={artist}
					/>
				))}
			</div>
		</section>
	);
}

function ProfileCommissionsEmpty() {
	const { t } = useTranslation();

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

export function ProfileCommissions({
	artist,
	commissions,
}: ProfileCommissionsProps) {
	const { user: currentUser } = useAuth();
	const isMe = currentUser?.username === artist.username;
	const [searchQuery, setSearchQuery] = useState("");
	const [filterState, setFilterState] =
		useState<ManagedFiltersState>(INITIAL_FILTER_STATE);

	const visibleCommissions = useVisibleCommissions({ commissions, isMe });
	const filterOptions = useCommissionFilterOptions(visibleCommissions);
	const filterGroups = useCommissionFilterGroups(filterOptions);
	const filteredCommissions = useFilteredCommissions({
		visibleCommissions,
		filterState,
		searchQuery,
	});
	const groupedCommissions = useGroupedCommissions(filteredCommissions);

	const filterValues = useMemo<Record<string, ManagedFilterValue>>(
		() => ({
			category: filterState.category,
			status: filterState.status,
			tags: filterState.tags,
			price: filterState.price,
		}),
		[filterState],
	);

	function handleFilterChange(
		groupId: string,
		value: FilterValue,
		operator?: ManagedFilterValue["operator"],
	) {
		setFilterState((previous) => ({
			...previous,
			[groupId]: {
				value,
				operator,
			},
		}));
	}

	function clearAllFilters() {
		setFilterState(INITIAL_FILTER_STATE);
		setSearchQuery("");
	}

	if (!visibleCommissions.length) {
		return <ProfileCommissionsEmpty />;
	}

	return (
		<div className="flex w-full flex-col gap-6">
			<CommissionFilters
				visibleCommissions={visibleCommissions}
				filterGroups={filterGroups}
				filterValues={filterValues}
				searchQuery={searchQuery}
				onFilterChange={handleFilterChange}
				onSearchChange={setSearchQuery}
				onClearAll={clearAllFilters}
			/>

			<CommissionFolders folders={groupedCommissions} artist={artist} />
		</div>
	);
}
