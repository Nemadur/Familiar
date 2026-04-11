import { ScrollShadow, surfaceVariants } from "@heroui/react";
import { useNavigate } from "@tanstack/react-router";
import {
	FolderOpen,
	ListFilterIcon,
	Tag,
	Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MarkdownDisplay } from "@/components/common/markdown-display";
import type { NumberFilterOperator } from "@/components/data-table-filter/core/types";
import {
	type FilterGroup,
	type FilterValue,
	type ManagedFilterValue,
	FilterBar,
} from "@/components/layout/filter-bar";
import {
	OutlineBookmark,
	OutlineChat,
	OutlineEyeOff,
	OutlineFilter,
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
import { useIsTablet } from "@/hooks/use-mobile";
import { calculateCommissionPricing } from "@/lib/commission-utils";
import { cn } from "@/lib/utils";
import {
	type TCommissionDetailResponse,
	TCommissionStatus,
	type TMultimediaItem,
} from "@/types/commissions";
import type { TUserProfile } from "@/types/user";

import { useAuth } from "@/providers/auth";

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

const INITIAL_FILTER_STATE: ManagedFiltersState = {
	category: { value: [] },
	status: { value: [] },
	tags: { value: [] },
	price: { value: [] },
};

function getCommissionImages(multimedia: TMultimediaItem[]): string[] {
	return [...multimedia]
		.map((item) => item.sizes.half)
		.filter((src): src is string => Boolean(src));
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
		return value.filter((item): item is string => typeof item === "string");
	}

	if (typeof value === "string") {
		return [value];
	}

	return [];
}

function getSelectedNumbers(value: FilterValue | undefined): number[] {
	if (!Array.isArray(value)) return [];

	return value.filter((item): item is number => typeof item === "number");
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

function CommissionCard({
	commission,
	artist,
}: {
	commission: TCommissionDetailResponse;
	artist: TUserProfile;
}) {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [hoverPlaying, setHoverPlaying] = useState(false);
	const [isContentRevealed, setIsContentRevealed] = useState(false);

	const isTablet = useIsTablet();
	const isPlaying = isTablet || hoverPlaying;

	const status = commission.commissionStatus;

	const images = getCommissionImages(commission.multimedia);
	const displayImages =
		images.length > 0 ? images : ["https://placehold.co/600x400?text=No+Image"];

	const reelItems: ReelItem[] = displayImages.map((src, index) => ({
		id: `${commission.id}-${index}`,
		type: "image",
		src,
		duration: 1,
		alt: commission.title,
	}));

	const hasMultipleImages = displayImages.length > 1;

	const warningTags = commission.tags.filter((tag) => tag.hasContentWarning);
	const hasContentWarnings = warningTags.length > 0;
	const adultOnlyTags = commission.tags.filter((tag) => tag.isAdultOnly);
	const hasAdultOnly = adultOnlyTags.length > 0;
	const shouldBlur =
		(hasContentWarnings && !isContentRevealed) ||
		(hasAdultOnly && !isContentRevealed);

	const firstImage = commission.multimedia[0]?.fileName;
	const blurredImageSrc = useBlurredImage(firstImage, shouldBlur);

	const {
		basePrice: discountedPrice,
		originalPrice,
		discountRate,
	} = calculateCommissionPricing(commission.basePrice, 0);

	const handleNavigate = () => {
		if (status !== TCommissionStatus.Active) return;

		navigate({
			to: `/${artist.username}/commissions/${commission.id}`,
		});
	};

	return (
		<article
			className={cn(
				"group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-3xl p-2 text-left transition-colors xl:flex-row",
				surfaceVariants({ variant: "secondary" }),
			)}
			onMouseEnter={() => {
				if (isTablet) return;
				setHoverPlaying(true);
			}}
			onMouseLeave={() => {
				if (isTablet) return;
				setHoverPlaying(false);
				setCurrentImageIndex(0);
			}}
			onClick={handleNavigate}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					handleNavigate();
				}
			}}
		>
			<div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl bg-muted xl:w-2/5">
				{shouldBlur ? (
					<div className="h-full w-full overflow-hidden bg-zinc-900">
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
				) : (
					<div className="h-full w-full transition-all duration-500">
						<Reel
							className="aspect-video h-full w-full"
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

				{shouldBlur && (
					<div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-4 bg-black/60 p-4 text-white backdrop-blur-sm">
						<OutlineEyeOff size={32} />
						<h4 className="mb-1 text-xl font-bold text-white">
							{t("components.profile.commissions.card.sensitive_content")}
						</h4>
						<p className="text-center text-sm text-white/70">
							{hasContentWarnings
								? t("components.profile.commissions.card.contains_tags", {
										tags: warningTags.map((tag) => tag.name).join(", "),
									})
								: t("components.profile.commissions.card.content_warning")}
						</p>

						<Button
							size="sm"
							className="w-fit border-none bg-white text-black hover:bg-white/90"
							onClick={(e) => {
								e.stopPropagation();
								setIsContentRevealed(true);
							}}
						>
							{t("components.profile.commissions.card.show_content")}
						</Button>
					</div>
				)}

				{hasContentWarnings && isContentRevealed && (
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="absolute top-2 right-2 z-20 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 hover:text-white"
								onClick={(e) => {
									e.stopPropagation();
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
				)}
			</div>

			<CommissionCardContent
				item={commission}
				status={status}
				artist={artist}
				discountedPrice={discountedPrice}
				originalPrice={originalPrice}
				discountRate={discountRate}
				shouldBlur={shouldBlur}
				setIsContentRevealed={setIsContentRevealed}
			/>
		</article>
	);
}

function CommissionCardContent({
	item,
	status,
	artist,
	discountedPrice,
	originalPrice,
	discountRate,
	shouldBlur,
	setIsContentRevealed,
}: {
	item: TCommissionDetailResponse;
	status: TCommissionStatus;
	artist: TUserProfile;
	discountedPrice: number;
	originalPrice: number;
	discountRate: number;
	shouldBlur: boolean;
	setIsContentRevealed: (value: boolean) => void;
}) {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const currency = item.currencyCode || "USD";

	return (
		<div className="flex flex-1 flex-col gap-3 p-2 sm:gap-4 sm:p-1 xl:pl-6 xl:pr-2">
			<div className="space-y-1 sm:space-y-2">
				<div className="relative flex gap-10">
					<div className="flex w-full flex-col gap-2 md:pr-14">
						<div className="flex items-start gap-2">
							<h3 className="min-w-0 line-clamp-2 text-start text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
								{item.title}
							</h3>
						</div>
					</div>

					<Button
						size="icon"
						className="absolute top-0 right-0 z-0 hidden shrink-0 bg-transparent text-primary shadow-none before:absolute before:bottom-0 before:-z-10 before:h-16 before:w-full before:rounded-b-full before:bg-primary/6 before:transition-all hover:bg-transparent hover:before:translate-y-1.5 hover:before:bg-primary/10 hover:[&>svg]:translate-y-1.5 xl:flex [&>svg]:transition-transform"
						onClick={(e) => e.stopPropagation()}
					>
						<OutlineBookmark />
					</Button>
				</div>

				<div className="relative">
					<div className="flex items-center justify-between text-sm">
						<div className="flex items-baseline gap-2 text-left">
							<span className="font-medium text-muted-foreground">
								{t("components.profile.commissions.card.from")}
							</span>
							<span className="font-semibold text-primary">
								{currency} {discountedPrice.toFixed(2)}
							</span>
							{discountRate > 0 && (
								<span className="flex gap-2 text-xs text-muted-foreground opacity-70">
									<span className="line-through">
										{currency} {originalPrice.toFixed(2)}
									</span>
									<span>(-{Math.round(discountRate * 100)}%)</span>
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

			<div className="mt-auto flex w-full gap-2">
				{status === TCommissionStatus.Active && (
					<>
						<Button
							size={"xl"}
							className="flex-1"
							onClick={(e) => {
								e.stopPropagation();

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

						<Button
							variant="secondary"
							size={"icon-xl"}
							onClick={(e) => e.stopPropagation()}
						>
							<OutlineChat />
						</Button>

						<Button
							variant="secondary"
							size={"icon-xl"}
							className="xl:hidden"
							onClick={(e) => e.stopPropagation()}
						>
							<OutlineBookmark />
						</Button>
					</>
				)}

				{status === TCommissionStatus.OnHold && (
					<>
						<Button
							size={"xl"}
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
							size={"icon-xl"}
							className="xl:hidden"
							onClick={(e) => e.stopPropagation()}
						>
							<OutlineBookmark />
						</Button>
					</>
				)}

				{status === TCommissionStatus.Paused && (
					<>
						<Button
							size={"xl"}
							variant="outline"
							className="flex-1"
							onClick={(e) => e.stopPropagation()}
						>
							{t("components.profile.commissions.card.get_notified")}
						</Button>

						<Button
							variant="secondary"
							size={"icon-xl"}
							onClick={(e) => e.stopPropagation()}
						>
							<OutlineChat />
						</Button>

						<Button
							variant="secondary"
							size={"icon-xl"}
							className="xl:hidden"
							onClick={(e) => e.stopPropagation()}
						>
							<OutlineBookmark />
						</Button>
					</>
				)}
			</div>
		</div>
	);
}

export function ProfileCommissions({
	artist,
	commissions,
}: ProfileCommissionsProps) {
	const { t } = useTranslation();
	const { user: currentUser } = useAuth();
	const isMe = currentUser?.username === artist.username;

	const [searchQuery, setSearchQuery] = useState("");
	const [filterState, setFilterState] =
		useState<ManagedFiltersState>(INITIAL_FILTER_STATE);

	const visibleCommissions = useMemo(() => {
		if (isMe) return commissions;
		return commissions.filter((c) => c.commissionStatus !== TCommissionStatus.Archived);
	}, [commissions, isMe]);

	const categoryOptions = useMemo(
		() =>
			Array.from(
				new Map(
					visibleCommissions.map((commission) => {
						const parentName = commission.category?.parentName;
						const name = commission.category?.name || "Uncategorized";
						
						return [
							getCommissionCategoryId(commission),
							{
								id: getCommissionCategoryId(commission),
								label: name,
								parentId: parentName || undefined,
							},
						];
					}),
				).values(),
			).sort((a, b) => a.label.localeCompare(b.label)),
		[visibleCommissions],
	);

	const statusOptions = useMemo(
		() =>
			Array.from(
				new Map(
					visibleCommissions.map((commission) => [
						String(commission.commissionStatus),
						{
							id: String(commission.commissionStatus),
							label: formatCommissionStatus(commission.commissionStatus),
						},
					]),
				).values(),
			),
		[visibleCommissions],
	);

	const tagOptions = useMemo(
		() =>
			Array.from(
				new Map(
					visibleCommissions.flatMap((commission) =>
						commission.tags.map((tag) => [
							tag.id,
							{ id: tag.id, label: tag.name },
						]),
					),
				).values(),
			).sort((a, b) => a.label.localeCompare(b.label)),
		[visibleCommissions],
	);

	const filterGroups = useMemo<FilterGroup<TCommissionDetailResponse>[]>(
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
				getItemValue: (commission) => commission.tags.map((tag) => tag.id),
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

	const filterValues = useMemo<Record<string, ManagedFilterValue>>(
		() => ({
			category: filterState.category,
			status: filterState.status,
			tags: filterState.tags,
			price: filterState.price,
		}),
		[filterState],
	);

	const filteredCommissions = useMemo(() => {
		const query = searchQuery.trim().toLowerCase();
		const selectedCategories = getSelectedValues(filterState.category?.value);
		const selectedStatuses = getSelectedValues(filterState.status?.value);
		const selectedTags = getSelectedValues(filterState.tags?.value);
		const selectedPrice = getSelectedNumbers(filterState.price?.value);

		return visibleCommissions.filter((commission) => {
			const categoryId = getCommissionCategoryId(commission);
			const categoryLabel = getCommissionCategoryLabel(commission);
			const tagIds = commission.tags.map((tag) => tag.id);
			const tagNames = commission.tags.map((tag) => tag.name);
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
	}, [visibleCommissions, filterState, searchQuery]);

	const groupedCommissions = useMemo<CategoryFolder[]>(() => {
		const map = new Map<string, CategoryFolder>();

		for (const commission of filteredCommissions) {
			const categoryLabel = getCommissionCategoryLabel(commission);
			const folderId = categoryLabel;

			if (!map.has(folderId)) {
				map.set(folderId, {
					id: folderId,
					label: categoryLabel,
					status: commission.commissionStatus, // will be recalculated below
					items: [],
				});
			}

			map.get(folderId)!.items.push(commission);
		}

		return Array.from(map.values()).map(folder => {
			const allPaused = folder.items.length > 0 && folder.items.every(c => c.commissionStatus === TCommissionStatus.Paused);
			if (allPaused) {
				// We use a special string for CLOSED or map it if TCommissionStatus doesn't have it
				// But we must respect the type. We can use a custom logic in render or override status
				return { ...folder, isClosed: true };
			}
			// Otherwise just use the first item's status or active
			const hasActive = folder.items.some(c => c.commissionStatus === TCommissionStatus.Active);
			return { ...folder, isClosed: false, status: hasActive ? TCommissionStatus.Active : folder.items[0].commissionStatus };
		}).sort((a, b) => a.label.localeCompare(b.label));
	}, [filteredCommissions]);

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

	return (
		<div className="flex w-full flex-col gap-6">
			<FilterBar
				data={visibleCommissions}
				groups={filterGroups}
				values={filterValues}
				onFilterChange={handleFilterChange}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				searchPlaceholder="Search by title, description, category, tag..."
				onClearAll={clearAllFilters}
				// FIXME: clear button do not works
			/>

			{groupedCommissions.length > 0 ? (
				<div className="flex flex-col gap-8">
					{groupedCommissions.map((folder) => (
						<section key={folder.id} className="space-y-6">
							<div className="flex items-center gap-2">
								<h2 className="text-xl font-bold text-foreground">
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
					))}
				</div>
			) : (
				<EmptyPage
					icon={OutlineFilter}
					title="Not found"
					description="No commissions found matching your filters."
				/>
			)}
		</div>
	);
}
