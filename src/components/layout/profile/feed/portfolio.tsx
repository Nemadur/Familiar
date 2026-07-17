import { ScrollShadow } from "@heroui/react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { OutlineFolderAddOuLc, OutlineSearch } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import type { Folder as FolderType } from "@/data/folders";
import { getLocaleParam } from "@/lib/i18n";
import type { PostWithAuthor } from "@/types/post";
import { FolderCard } from "./folder-card";
import { ProfileFeed } from "./index";

interface ProfilePortfolioProps {
	posts: PostWithAuthor[];
	folderId?: string;
	username?: string;
	folders: FolderType[];
	currentFolder?: FolderType;
}

import { ColorPaletteDebugger } from "@/components/debug/color-palette-debugger";
import { FilterBar, type FilterGroup } from "@/components/layout/filter-bar";

export function ProfilePortfolio({
	posts,
	folderId,
	username,
	folders,
	currentFolder: propCurrentFolder,
}: ProfilePortfolioProps) {
	const locale = RouteLocale();
	const navigate = useNavigate();
	const { t } = useTranslation();

	// Initialize filter state
	const [filters, setFilters] = useState<Record<string, string[] | boolean>>({
		commissionsOnly: false,
		tags: [],
	});
	const [searchQuery, setSearchQuery] = useState("");

	// Extract options
	const availableTags = useMemo(
		() =>
			Array.from(
				new Set(
					posts.reduce<string[]>((acc, p) => {
						if (p.tags) acc.push(...p.tags);
						return acc;
					}, []),
				),
			).sort(),
		[posts],
	);

	// Define filter groups
	const filterGroups = useMemo<FilterGroup[]>(
		() => [
			{
				id: "commissionsOnly",
				label: t("components.portfolio.filters.commissions_only"),
				type: "select", // Actually a boolean toggle, but using select/checkbox logic in FilterBarV2 for now
				// But wait, FilterBarV2 'select' renders checkboxes.
				// Let's treat it as a single option "Show only commissions"
				options: [
					{
						id: "true",
						label: t("components.portfolio.filters.commissions_only"),
					},
				],
			},
			...(availableTags.length > 0
				? [
						{
							id: "tags",
							label: "Tags",
							type: "multiselect" as const,
							options: availableTags.map((tag) => ({
								id: tag,
								label: tag,
							})),
						},
					]
				: []),
		],
		[availableTags, t],
	);

	const filteredPosts = useMemo(() => {
		let result = posts;

		// 1. Commissions Only
		if (
			filters.commissionsOnly === true ||
			(Array.isArray(filters.commissionsOnly) &&
				filters.commissionsOnly.includes("true"))
		) {
			result = result.filter((p) => p.isCommission);
		}

		// 2. Tags
		const selectedTags = filters.tags as string[];
		if (selectedTags?.length > 0) {
			result = result.filter((p) =>
				selectedTags.some((tag) => p.tags?.includes(tag)),
			);
		}

		return result;
	}, [filters, posts]);

	const handleFilterChange = (groupId: string, value: string[] | boolean) => {
		setFilters((prev) => ({
			...prev,
			[groupId]: value,
		}));
	};

	const handleClearAll = () => {
		setFilters({
			commissionsOnly: [],
			tags: [],
		});
		setSearchQuery("");
	};

	const currentFolder =
		propCurrentFolder ||
		(folderId ? folders.find((f) => f.id === folderId) : null);

	if (folderId && currentFolder) {
		const folderPosts = posts.filter((p) =>
			p.folderIds?.includes(currentFolder.id),
		);

		const subfolders = folders.filter((f) => f.parentId === folderId);
		const parentFolder = currentFolder.parentId
			? folders.find((f) => f.id === currentFolder.parentId)
			: null;
		const backSlug = parentFolder?.slug || parentFolder?.id;

		return (
			<div className="flex h-full flex-1 flex-col space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" asChild>
						{backSlug ? (
							<Link
								to="/{-$locale}/$username/$tab/folder/$folderSlug"
								params={{
									locale,
									username: username || "",
									tab: "portfolio",
									folderSlug: backSlug,
								}}
							>
								<ArrowLeft />
							</Link>
						) : (
							<Link
								to="/{-$locale}/$username/$tab"
								params={{ locale, username: username || "", tab: "portfolio" }}
							>
								<ArrowLeft />
							</Link>
						)}
					</Button>
					<div>
						<div className="flex items-center gap-2 text-xl font-bold">
							{parentFolder && (
								<>
									<span className="text-muted-foreground">
										{parentFolder.name}
									</span>
									<span className="text-muted-foreground">/</span>
								</>
							)}
							<span>{currentFolder.name}</span>
						</div>
						<p className="text-muted-foreground text-sm">
							{t("components.portfolio.folder.items", {
								count: folderPosts.length + subfolders.length,
							})}
						</p>
					</div>
				</div>

				{/* Subfolders Grid */}
				{subfolders.length > 0 && (
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
						{subfolders.map((folder) => (
							<Link
								key={folder.id}
								to="/{-$locale}/$username/$tab/folder/$folderSlug/$subfolderSlug"
								params={{
									locale,
									username: username || "",
									tab: "portfolio",
									folderSlug: currentFolder.slug || currentFolder.id,
									subfolderSlug: folder.slug || folder.id,
								}}
								className="block"
							>
								<FolderCard folder={folder} />
							</Link>
						))}
					</div>
				)}

				{/* Folder Content */}
				<div className="space-y-2">
					<ProfileFeed
						posts={folderPosts}
						onPostClick={(post) => {
							if (currentFolder.parentId) {
								// Subfolder
								const parentFolder = folders.find(
									(f) => f.id === currentFolder.parentId,
								);
								if (parentFolder) {
									navigate({
										to: "/{-$locale}/$username/$tab/folder/$folderSlug/$subfolderSlug/$postId",
										params: {
											locale,
											username: username || "",
											tab: "portfolio",
											folderSlug: parentFolder.slug || parentFolder.id,
											subfolderSlug: currentFolder.slug || currentFolder.id,
											postId: post.id,
										},
									});
								}
							} else {
								// Folder
								navigate({
									to: "/{-$locale}/$username/$tab/folder/$folderSlug/$postId",
									params: {
										locale,
										username: username || "",
										tab: "portfolio",
										folderSlug: currentFolder.slug || currentFolder.id,
										postId: post.id,
									},
								});
							}
						}}
						variant="portfolio"
					/>
				</div>
			</div>
		);
	}

	const filteredFolders = folders.filter(
		(f) =>
			!f.parentId && f.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	// Show folders only when no filters are active (except search)
	// Or maybe show folders always when not in a folder?
	// Original logic: activeType === "ALL" && !folderId
	// New logic: no specific filters selected
	const hasActiveFilters =
		(Array.isArray(filters.commissionsOnly) &&
			filters.commissionsOnly.length > 0) ||
		(Array.isArray(filters.tags) && filters.tags.length > 0);

	const showFolders = !hasActiveFilters && !folderId;

	return (
		<div className="flex h-full flex-1 flex-col space-y-6">
			{/* Search and Filter Bar */}
			{/* <FilterBar
				groups={filterGroups}
				values={filters}
				onFilterChange={handleFilterChange}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				onClearAll={handleClearAll}
				extraActions={
					<Button variant={"outline"} size={"lg"}>
						<OutlineFolderAddOuLc />
						Add Folder
					</Button>
				}
			/> */}

			{/* Folders Grid */}
			{showFolders && filteredFolders.length > 0 && (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
					{filteredFolders.map((folder) => (
						<Link
							key={folder.id}
							to="/{-$locale}/$username/$tab/folder/$folderSlug"
							params={{
								locale,
								username: username || "",
								tab: "portfolio",
								folderSlug: folder.slug || folder.id,
							}}
							className="block"
						>
							<FolderCard folder={folder} />
						</Link>
					))}
				</div>
			)}

			{/* <ColorPaletteDebugger /> */}

			{/* Posts Grid */}
			{(!folderId || !currentFolder) && (
				<ProfileFeed
					posts={filteredPosts}
					onPostClick={(post) => {
						navigate({
							to: "/{-$locale}/$username/$tab/$commissionId",
							params: {
								locale,
								username: username || "",
								tab: "portfolio",
								commissionId: post.id,
							},
						});
					}}
					variant="portfolio"
				/>
			)}
		</div>
	);
}

function RouteLocale() {
	return getLocaleParam(document.documentElement.lang);
}
