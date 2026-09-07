import { Typography } from "@heroui/react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	Edit2,
	Folder,
	MoreHorizontal,
	Tag,
	Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
	CatalogResponse,
	CreateCatalogRequest,
} from "@/api/portfolio/catalogs/catalog-types";
import type {
	CreatePortfolioPostRequest,
	PortfolioPostResponse,
} from "@/api/portfolio/posts/post-types";
import { OutlineFolderAddOuLc, SolidPlus } from "@/components/icons/icons";
import {
	FilterBar,
	type FilterGroup,
	type FilterValue,
	type ManagedFilterValue,
} from "@/components/layout/filter-bar";
import { CreatePostModal } from "@/components/layout/modal/profile/portfolio/create-post-modal";
import {
	CreateCatalogModal,
	RenameCatalogModal,
} from "@/components/layout/modal/profile/portfolio/portfolio";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	useDeleteCatalog,
	useRemovePortfolioPostFromCatalog,
	useUpdateCatalog,
} from "@/hooks/portfolio/use-portfolio";
import { getLocaleParam } from "@/lib/i18n";
import { FolderCard } from "./folder-card";
import { ProfileFeed } from "./profile-feed";

interface ProfilePortfolioProps {
	posts: PortfolioPostResponse[];
	folderId?: string;
	username?: string;
	folders: CatalogResponse[];
	currentFolder?: CatalogResponse;

	canManageCatalogs?: boolean;
	canCreatePosts?: boolean;

	onCreateCatalog?: (data: CreateCatalogRequest) => Promise<CatalogResponse>;
	isCreatingCatalog?: boolean;

	onCreatePost?: (data: CreatePortfolioPostRequest) => Promise<void>;
	isCreatingPost?: boolean;
}

type ManagedFiltersState = Record<string, ManagedFilterValue>;

const INITIAL_FILTER_STATE: ManagedFiltersState = {
	tags: { value: [] },
	folders: { value: [] },
};

function getStringFilterValues(value: FilterValue | undefined): string[] {
	if (typeof value === "string") {
		return value ? [value] : [];
	}

	if (!Array.isArray(value)) {
		return [];
	}

	return value.filter((item): item is string => typeof item === "string");
}

function normalizeMultiOptionOperator(
	operator: ManagedFilterValue["operator"] | undefined,
): string {
	return String(operator ?? "")
		.trim()
		.replace(/([a-z\d])([A-Z])/g, "$1 $2")
		.replace(/[_-]+/g, " ")
		.replace(/\s+/g, " ")
		.toLowerCase();
}

/**
 * Applies the operators emitted by the Bazza multi-option filter. It accepts
 * both its internal camelCase keys and the translated labels rendered by the
 * filter bar so changing locale or adapter shape does not invert the result.
 */
function matchesMultiOptionFilter(
	itemValues: readonly string[],
	selectedValues: readonly string[],
	operator: ManagedFilterValue["operator"] | undefined,
): boolean {
	if (selectedValues.length === 0) return true;

	const values = new Set(itemValues);
	const includesAny = selectedValues.some((value) => values.has(value));
	const includesAll = selectedValues.every((value) => values.has(value));

	switch (normalizeMultiOptionOperator(operator)) {
		case "exclude":
		case "excludes":
		case "exclude all of":
		case "excludes all of":
		case "exclude if any of":
		case "excludes if any of":
		case "does not contain":
		case "is not":
		case "is none of":
			return !includesAny;

		case "exclude if all":
		case "excludes if all":
			return !includesAll;

		case "include all of":
		case "includes all of":
		case "contains":
		case "is all of":
			return includesAll;

		case "include":
		case "includes":
		case "include any of":
		case "includes any of":
		case "is":
		case "is any of":
		default:
			return includesAny;
	}
}

interface FolderPreview {
	coverSrc?: string;
	contentWarnings: string[];
}

function getFolderPreview(
	folder: CatalogResponse,
	posts: PortfolioPostResponse[],
): FolderPreview {
	const folderCoverPaths = new Set(
		[folder.fullSize?.path, folder.thumbnail?.path].filter(
			(path): path is string => Boolean(path),
		),
	);

	const postMatchingFolderCover = posts.find((post) =>
		(post.images ?? []).some((image) =>
			[image.fullSize?.path, image.thumbnail?.path].some(
				(path) => Boolean(path && folderCoverPaths.has(path)),
			),
		),
	);

	const previewPost =
		postMatchingFolderCover ??
		posts.find((post) =>
			(post.images ?? []).some(
				(image) => image.fullSize?.path || image.thumbnail?.path,
			),
		);

	const previewImage = [...(previewPost?.images ?? [])]
		.sort(
			(a, b) =>
				(a.position ?? Number.MAX_SAFE_INTEGER) -
				(b.position ?? Number.MAX_SAFE_INTEGER),
		)
		.find((image) => image.fullSize?.path || image.thumbnail?.path);

	return {
		coverSrc:
			folder.fullSize?.path ??
			folder.thumbnail?.path ??
			previewImage?.fullSize?.path ??
			previewImage?.thumbnail?.path,
		contentWarnings: previewPost?.contentWarnings ?? [],
	};
}

export function ProfilePortfolio({
	posts,
	folderId,
	username,
	folders,
	currentFolder: propCurrentFolder,
	canManageCatalogs = false,
	canCreatePosts = false,
	onCreateCatalog,
	isCreatingCatalog = false,
	onCreatePost,
	isCreatingPost = false,
}: ProfilePortfolioProps) {
	const locale = RouteLocale();
	const navigate = useNavigate();
	const { t } = useTranslation();

	const [filters, setFilters] =
		useState<ManagedFiltersState>(INITIAL_FILTER_STATE);
	const [searchQuery, setSearchQuery] = useState("");
	const [createCatalogOpen, setCreateCatalogOpen] = useState(false);
	const [createPostOpen, setCreatePostOpen] = useState(false);
	const [renameCatalogOpen, setRenameCatalogOpen] = useState(false);
	const [deleteCatalogOpen, setDeleteCatalogOpen] = useState(false);

	const updateCatalogMutation = useUpdateCatalog();
	const deleteCatalogMutation = useDeleteCatalog();
	const removePostMutation = useRemovePortfolioPostFromCatalog();

	const canCreateCatalog = canManageCatalogs && Boolean(onCreateCatalog);
	const canCreatePost = canCreatePosts && Boolean(onCreatePost);
	const hasCreateActions = canCreateCatalog || canCreatePost;

	const postsByCatalogId = useMemo(() => {
		const result = new Map<string, PortfolioPostResponse[]>();

		for (const post of posts) {
			for (const catalogId of post.catalogIds ?? []) {
				const catalogPosts = result.get(catalogId);

				if (catalogPosts) {
					catalogPosts.push(post);
				} else {
					result.set(catalogId, [post]);
				}
			}
		}

		return result;
	}, [posts]);

	const currentFolder =
		propCurrentFolder ??
		(folderId ? folders.find((folder) => folder.id === folderId) : undefined);

	const currentFolderPosts = useMemo(
		() =>
			currentFolder ? (postsByCatalogId.get(currentFolder.id) ?? []) : [],
		[currentFolder, postsByCatalogId],
	);

	const filterSourcePosts =
		folderId && currentFolder ? currentFolderPosts : posts;
	const folderFilterOptions = useMemo(() => {
		const folderNames = folders.map((folder) =>
			folder.name.trim().replace(/\s+/g, " "),
		);
		const totalByName = new Map<string, number>();

		for (const name of folderNames) {
			const key = name.toLocaleLowerCase();
			totalByName.set(key, (totalByName.get(key) ?? 0) + 1);
		}

		const occurrenceByName = new Map<string, number>();

		return folders.map((folder, index) => {
			const name = folderNames[index] || folder.name;
			const key = name.toLocaleLowerCase();
			const occurrence = (occurrenceByName.get(key) ?? 0) + 1;
			const total = totalByName.get(key) ?? 1;

			occurrenceByName.set(key, occurrence);

			return {
				id: folder.id,
				label: total > 1 ? `${name} (${occurrence})` : name,
			};
		});
	}, [folders]);

	useEffect(() => {
		setFilters(INITIAL_FILTER_STATE);
		setSearchQuery("");
	}, []);

	const handleRenameCatalog = async (catalogId: string, data: any) => {
		return updateCatalogMutation.mutateAsync({
			catalogId,
			data,
		});
	};

	const handleDeleteCatalog = async () => {
		if (!currentFolder) return;

		await deleteCatalogMutation.mutateAsync(currentFolder.id);
		setDeleteCatalogOpen(false);

		navigate({
			to: "/{-$locale}/user/$username/$tab",
			params: {
				locale,
				username: username ?? "",
				tab: "portfolio",
			},
		});
	};

	const handleRemovePostFromCatalog = async (postId: string) => {
		if (!currentFolder) return;

		await removePostMutation.mutateAsync({
			postId,
			catalogId: currentFolder.id,
		});
	};

	const availableTags = useMemo(
		() =>
			Array.from(
				new Set(filterSourcePosts.flatMap((post) => post.tags ?? [])),
			).sort((a, b) => a.localeCompare(b)),
		[filterSourcePosts],
	);

	const filterGroups = useMemo<FilterGroup<PortfolioPostResponse>[]>(
		() => {
			const groups: FilterGroup<PortfolioPostResponse>[] = [];

			if (availableTags.length > 0) {
				groups.push({
					id: "tags",
					label: t("components.portfolio.filters.tags", "Tags"),
					type: "multiselect",
					icon: Tag,
					getItemValue: (post) => post.tags ?? [],
					options: availableTags.map((tag) => ({
						id: tag,
						label: tag,
					})),
				});
			}

			if (!folderId && folderFilterOptions.length > 0) {
				groups.push({
					id: "folders",
					label: t(
						"components.portfolio.filters.folders",
						"Folders",
					),
					type: "multiselect",
					icon: Folder,
					getItemValue: (post) => post.catalogIds ?? [],
					options: folderFilterOptions,
				});
			}

			return groups;
		},
		[availableTags, folderFilterOptions, folderId, t],
	);

	const filteredPosts = useMemo(() => {
		let result = [...filterSourcePosts];
		const query = searchQuery.trim().toLowerCase();

		if (query) {
			result = result.filter((post) => {
				const titleMatches = post.title?.toLowerCase().includes(query);
				const descriptionMatches = post.description
					?.toLowerCase()
					.includes(query);
				const tagMatches = post.tags?.some((tag) =>
					tag.toLowerCase().includes(query),
				);

				return Boolean(titleMatches || descriptionMatches || tagMatches);
			});
		}

		const selectedTags = getStringFilterValues(filters.tags?.value);

		if (selectedTags.length > 0) {
			result = result.filter((post) =>
				matchesMultiOptionFilter(
					post.tags ?? [],
					selectedTags,
					filters.tags?.operator,
				),
			);
		}

		const selectedFolderIds = getStringFilterValues(filters.folders?.value);

		if (selectedFolderIds.length > 0) {
			result = result.filter((post) =>
				matchesMultiOptionFilter(
					post.catalogIds ?? [],
					selectedFolderIds,
					filters.folders?.operator,
				),
			);
		}

		return result;
	}, [filterSourcePosts, filters, searchQuery]);

	const handleFilterChange = (
		groupId: string,
		value: FilterValue,
		operator?: ManagedFilterValue["operator"],
	) => {
		setFilters((previous) => ({
			...previous,
			[groupId]: {
				value,
				operator,
			},
		}));
	};

	const handleClearAll = () => {
		setFilters(INITIAL_FILTER_STATE);
		setSearchQuery("");
	};

	const handlePostClick = (post: PortfolioPostResponse) => {
		if (!post.id) return;

		if (folderId) {
			navigate({
				to: "/{-$locale}/user/$username/$tab/folder/$folderSlug/$postId",
				params: {
					locale,
					username: username ?? "",
					tab: "portfolio",
					folderSlug: folderId,
					postId: post.id,
				},
				state: {
					isModal: true,
				},
				resetScroll: false,
			});
		} else {
			navigate({
				to: "/{-$locale}/user/$username/$tab/$postId",
				params: {
					locale,
					username: username ?? "",
					tab: "portfolio",
					postId: post.id,
				},
				state: {
					isModal: true,
				},
				resetScroll: false,
			});
		}
	};

	if (folderId && currentFolder) {
		const folderDescription = currentFolder.description?.trim();

		return (
			<div className="flex h-full flex-1 flex-col gap-6">
				<section
					aria-label={currentFolder.name}
					className="px-4 lg:px-0 xl:px-4"
				>
					<div className="flex min-w-0 items-start gap-3">
						<Button
							variant="ghost"
							size="icon-xl"
							className="shrink-0"
							asChild
						>
							<Link
								to="/{-$locale}/user/$username/$tab"
								params={{
									locale,
									username: username ?? "",
									tab: "portfolio",
								}}
							>
								<ArrowLeft aria-hidden="true" />
								<span className="sr-only">
									{t(
										"components.portfolio.folder.back",
										"Back to portfolio",
									)}
								</span>
							</Link>
						</Button>

						<div className="min-w-0 flex-1 pt-1">
							<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
								<Typography.Heading
									level={4}
									className="min-w-0 truncate text-xl font-bold sm:text-2xl"
								>
									{currentFolder.name}
								</Typography.Heading>

								<span className="text-xs text-muted-foreground tabular-nums">
									{t("components.portfolio.folder.items", {
										count: currentFolderPosts.length,
									})}
								</span>
							</div>

							{folderDescription ? (
								<Typography.Paragraph
									size="sm"
									className="mt-1 max-w-3xl whitespace-pre-line break-words leading-relaxed text-muted-foreground!"
								>
									{folderDescription}
								</Typography.Paragraph>
							) : null}
						</div>

						{canManageCatalogs && (
							<div className="shrink-0">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon">
											<MoreHorizontal className="size-5" />
											<span className="sr-only">Manage folder</span>
										</Button>
									</DropdownMenuTrigger>

									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() => setRenameCatalogOpen(true)}
										>
											<Edit2 className="mr-2" />
											{t(
												"components.portfolio.folder.manage.rename",
												"Rename folder",
											)}
										</DropdownMenuItem>

										<DropdownMenuSeparator />

										<DropdownMenuItem
											variant="destructive"
											onClick={() => setDeleteCatalogOpen(true)}
										>
											<Trash2 className="mr-2" />
											{t(
												"components.portfolio.folder.manage.delete",
												"Delete folder",
											)}
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>

								<RenameCatalogModal
									open={renameCatalogOpen}
									onOpenChange={setRenameCatalogOpen}
									catalog={currentFolder}
									onRenameCatalog={handleRenameCatalog}
									isRenaming={updateCatalogMutation.isPending}
								/>

								<AlertDialog
									open={deleteCatalogOpen}
									onOpenChange={setDeleteCatalogOpen}
								>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle>
												{t(
													"components.portfolio.folder.delete.title",
													"Delete folder?",
												)}
											</AlertDialogTitle>

											<AlertDialogDescription>
												{t(
													"components.portfolio.folder.delete.description",
													"Are you sure you want to delete this folder? Posts inside it will not be deleted.",
												)}
											</AlertDialogDescription>
										</AlertDialogHeader>

										<AlertDialogFooter>
											<AlertDialogCancel>
												{t(
													"components.portfolio.folder.delete.cancel",
													"Cancel",
												)}
											</AlertDialogCancel>

											<AlertDialogAction
												onClick={(event) => {
													event.preventDefault();
													void handleDeleteCatalog();
												}}
												className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
											>
												{deleteCatalogMutation.isPending
													? t(
														"components.portfolio.folder.delete.deleting",
														"Deleting...",
													)
													: t(
														"components.portfolio.folder.delete.confirm",
														"Delete",
													)}
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						)}
					</div>
				</section>

				<FilterBar
					className="px-4 lg:px-0 xl:px-4"
					data={currentFolderPosts}
					groups={filterGroups}
					values={filters}
					onFilterChange={handleFilterChange}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					onClearAll={handleClearAll}
					searchPlaceholder={t(
						"components.portfolio.folder.filters.search_placeholder",
						"Search this folder...",
					)}
				/>

				<ProfileFeed
					posts={filteredPosts}
					onPostClick={handlePostClick}
					variant="portfolio"
					className="lg:mx-0 xl:mx-4"
					onRemoveFromCatalog={
						canManageCatalogs ? handleRemovePostFromCatalog : undefined
					}
				/>
			</div>
		);
	}

	const normalizedSearchQuery = searchQuery.trim().toLowerCase();

	const filteredFolders = folders.filter((folder) =>
		folder.name.toLowerCase().includes(normalizedSearchQuery),
	);

	const selectedTags = getStringFilterValues(filters.tags?.value);
	const selectedFolderIds = getStringFilterValues(filters.folders?.value);
	const hasActiveFilters =
		selectedTags.length > 0 || selectedFolderIds.length > 0;
	const showFolders = !hasActiveFilters && !folderId;

	return (
		<>
			<div className="flex h-full flex-1 flex-col gap-6">
				<FilterBar
					className="px-4 lg:px-0 xl:px-4"
					data={posts}
					groups={filterGroups}
					values={filters}
					onFilterChange={handleFilterChange}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					onClearAll={handleClearAll}
					searchPlaceholder={t(
						"components.portfolio.filters.search_placeholder",
						"Search portfolio...",
					)}
					endAction={
						hasCreateActions ? (
							<div className="flex items-center gap-2">
								{canCreateCatalog && (
									<Button
										type="button"
										size="xl"
										variant="secondary"
										onClick={() => setCreateCatalogOpen(true)}
									>
										<OutlineFolderAddOuLc />
										{t(
											"components.portfolio.folder.create.title",
											"New folder",
										)}
									</Button>
								)}

								{canCreatePost && (
									<Button
										size="xl"
										type="button"
										onClick={() => setCreatePostOpen(true)}
									>
										<SolidPlus />
										{t("components.profile.actions.add_post", "Create post")}
									</Button>
								)}
							</div>
						) : undefined
					}
				/>

				{showFolders && filteredFolders.length > 0 && (
					<section
						aria-label={t(
							"components.portfolio.folder.catalogs",
							"Portfolio folders",
						)}
						className="lg:px-0 xl:px-4"
					>
						<div className="relative flex w-full min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-px-3 scroll-fade-x scroll-fade-4 px-3 pb-3 lg:scroll-px-0 lg:px-0 xl:scroll-px-3 xl:px-3">
							{filteredFolders.map((folder) => {
								const catalogPosts = postsByCatalogId.get(folder.id) ?? [];
								const preview = getFolderPreview(folder, catalogPosts);

								return (
									<Link
										key={folder.id}
										to="/{-$locale}/user/$username/$tab/folder/$folderSlug"
										params={{
											locale,
											username: username ?? "",
											tab: "portfolio",
											folderSlug: folder.id,
										}}
										className="w-40 shrink-0 snap-start rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									>
										<FolderCard
											folder={folder}
											fallbackCoverSrc={preview.coverSrc}
											contentWarnings={preview.contentWarnings}
											itemCount={catalogPosts.length}
										/>
									</Link>
								);
							})}
						</div>
					</section>
				)}

				<ProfileFeed
					posts={filteredPosts}
					onPostClick={handlePostClick}
					variant="portfolio"
					className="lg:mx-0 xl:mx-4"
				/>
			</div>

			{canManageCatalogs && onCreateCatalog && (
				<CreateCatalogModal
					open={createCatalogOpen}
					onOpenChange={setCreateCatalogOpen}
					onCreateCatalog={onCreateCatalog}
					isCreating={isCreatingCatalog}
				/>
			)}

			{canCreatePosts && onCreatePost && (
				<CreatePostModal
					open={createPostOpen}
					onOpenChange={setCreatePostOpen}
					onCreatePost={onCreatePost}
					isCreating={isCreatingPost}
					catalogs={folders}
				/>
			)}
		</>
	);
}

function RouteLocale() {
	return getLocaleParam(document.documentElement.lang);
}
