import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Edit2, MoreHorizontal, Plus, Tag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { CatalogResponse, CreateCatalogRequest } from "@/api/portfolio/catalogs/catalog-types";
import type { CreatePortfolioPostRequest, PortfolioPostResponse } from "@/api/portfolio/posts/post-types";
import { OutlineFolderAddOuLc, SolidFolderAddOuLc, SolidPlus } from "@/components/icons/icons";
import {
	FilterBar,
	type FilterGroup,
	type FilterValue,
	type ManagedFilterValue,
} from "@/components/layout/filter-bar";
import { CreatePostModal } from "@/components/layout/modal/profile/portfolio/create-post-modal";
import { CreateCatalogModal, RenameCatalogModal } from "@/components/layout/modal/profile/portfolio/portfolio";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useDeleteCatalog, useRemovePortfolioPostFromCatalog, useUpdateCatalog } from "@/hooks/portfolio/use-portfolio";
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
	onCreateCatalog?: (
		data: CreateCatalogRequest,
	) => Promise<CatalogResponse>;
	isCreatingCatalog?: boolean;
	onCreatePost?: (data: CreatePortfolioPostRequest) => Promise<void>;
	isCreatingPost?: boolean;
}

type ManagedFiltersState = Record<string, ManagedFilterValue>;

const INITIAL_FILTER_STATE: ManagedFiltersState = {
	tags: { value: [] },
};

function getStringFilterValues(
	value: FilterValue | undefined,
): string[] {
	if (typeof value === "string") {
		return value ? [value] : [];
	}

	if (!Array.isArray(value)) {
		return [];
	}

	return value.filter(
		(item): item is string => typeof item === "string",
	);
}

function getFallbackCover(
	posts: PortfolioPostResponse[],
): string | undefined {
	return posts
		.flatMap((post) => post.images ?? [])
		.sort(
			(a, b) =>
				(a.position ?? Number.MAX_SAFE_INTEGER) -
				(b.position ?? Number.MAX_SAFE_INTEGER),
		)
		.map(
			(image) =>
				image.fullSize?.path ?? image.thumbnail?.path,
		)
		.find(
			(path): path is string =>
				typeof path === "string" && path.length > 0,
		);
}

export function ProfilePortfolio({
	posts,
	folderId,
	username,
	folders,
	currentFolder: propCurrentFolder,
	canManageCatalogs = false,
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

	const handleRenameCatalog = async (catalogId: string, data: any) => {
		return updateCatalogMutation.mutateAsync({ catalogId, data });
	};

	const handleDeleteCatalog = async () => {
		if (!currentFolder) return;
		await deleteCatalogMutation.mutateAsync(currentFolder.id);
		setDeleteCatalogOpen(false);
		navigate({
			to: "/{-$locale}/user/$username/$tab",
			params: { locale, username: username ?? "", tab: "portfolio" },
		});
	};

	const handleRemovePostFromCatalog = async (postId: string) => {
		if (!currentFolder) return;
		await removePostMutation.mutateAsync({ postId, catalogId: currentFolder.id });
	};

	const availableTags = useMemo(
		() =>
			Array.from(
				new Set(posts.flatMap((post) => post.tags ?? [])),
			).sort((a, b) => a.localeCompare(b)),
		[posts],
	);

	const filterGroups = useMemo<FilterGroup<PortfolioPostResponse>[]>(
		() =>
			availableTags.length > 0
				? [
					{
						id: "tags",
						label: t(
							"components.portfolio.filters.tags",
							"Tags",
						),
						type: "multiselect",
						icon: Tag,
						getItemValue: (post) => post.tags ?? [],
						options: availableTags.map((tag) => ({
							id: tag,
							label: tag,
						})),
					},
				]
				: [],
		[availableTags, t],
	);

	const filteredPosts = useMemo(() => {
		let result = [...posts];
		const query = searchQuery.trim().toLowerCase();

		if (query) {
			result = result.filter((post) => {
				const titleMatches = post.title
					?.toLowerCase()
					.includes(query);
				const descriptionMatches = post.description
					?.toLowerCase()
					.includes(query);
				const tagMatches = post.tags?.some((tag) =>
					tag.toLowerCase().includes(query),
				);

				return Boolean(
					titleMatches || descriptionMatches || tagMatches,
				);
			});
		}

		const selectedTags = getStringFilterValues(filters.tags?.value);

		if (selectedTags.length > 0) {
			const operator = filters.tags?.operator;

			result = result.filter((post) => {
				const postTags = post.tags ?? [];

				if (operator === "contains") {
					return selectedTags.every((tag) =>
						postTags.includes(tag),
					);
				}

				if (
					operator === "is not" ||
					operator === "is none of"
				) {
					return selectedTags.every(
						(tag) => !postTags.includes(tag),
					);
				}

				return selectedTags.some((tag) =>
					postTags.includes(tag),
				);
			});
		}

		return result;
	}, [filters, posts, searchQuery]);

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
		(folderId
			? folders.find((folder) => folder.id === folderId)
			: undefined);

	const currentFolderPosts = currentFolder
		? postsByCatalogId.get(currentFolder.id) ?? []
		: [];

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
				resetScroll: false,
			});
		} else {
			navigate({
				to: "/{-$locale}/user/$username/$tab/$commissionId",
				params: {
					locale,
					username: username ?? "",
					tab: "portfolio",
					commissionId: post.id,
				},
				resetScroll: false,
			});
		}
	};

	if (folderId && currentFolder) {
		return (
			<div className="flex h-full flex-1 flex-col gap-6">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" asChild>
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

					<div className="flex min-w-0 flex-col gap-0.5">
						<h2 className="truncate text-xl font-bold">
							{currentFolder.name}
						</h2>

						<p className="text-sm text-muted-foreground">
							{t("components.portfolio.folder.items", {
								count: currentFolderPosts.length,
							})}
						</p>
					</div>

					{canManageCatalogs && (
						<div className="ml-auto">
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" size="icon">
										<MoreHorizontal className="size-5" />
										<span className="sr-only">Manage folder</span>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem onClick={() => setRenameCatalogOpen(true)}>
										<Edit2 className="mr-2" />
										{t("components.portfolio.folder.manage.rename", "Rename folder")}
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										variant="destructive"
										onClick={() => setDeleteCatalogOpen(true)}
									>
										<Trash2 className="mr-2" />
										{t("components.portfolio.folder.manage.delete", "Delete folder")}
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

							<AlertDialog open={deleteCatalogOpen} onOpenChange={setDeleteCatalogOpen}>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											{t("components.portfolio.folder.delete.title", "Delete folder?")}
										</AlertDialogTitle>
										<AlertDialogDescription>
											{t(
												"components.portfolio.folder.delete.description",
												"Are you sure you want to delete this folder? Posts inside it will not be deleted."
											)}
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>
											{t("components.portfolio.folder.delete.cancel", "Cancel")}
										</AlertDialogCancel>
										<AlertDialogAction
											onClick={(e) => {
												e.preventDefault();
												handleDeleteCatalog();
											}}
											className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
										>
											{deleteCatalogMutation.isPending
												? t("components.portfolio.folder.delete.deleting", "Deleting...")
												: t("components.portfolio.folder.delete.confirm", "Delete")}
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
						</div>
					)}
				</div>

				<ProfileFeed
					posts={currentFolderPosts}
					onPostClick={handlePostClick}
					variant="portfolio"
					onRemoveFromCatalog={canManageCatalogs ? handleRemovePostFromCatalog : undefined}
				/>
			</div>
		);
	}

	const normalizedSearchQuery = searchQuery.trim().toLowerCase();

	const filteredFolders = folders.filter((folder) =>
		folder.name.toLowerCase().includes(normalizedSearchQuery),
	);

	const selectedTags = getStringFilterValues(filters.tags?.value);
	const hasActiveFilters = selectedTags.length > 0;
	const showFolders = !hasActiveFilters && !folderId;

	return (
		<>
			<div className="flex h-full flex-1 flex-col gap-6">
				<FilterBar
					className="px-4"
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
						<div className="flex items-center gap-2">
							{canManageCatalogs && onCreateCatalog && (
								<Button
									type="button"
									size="xl"
									variant={"secondary"}
									onClick={() => setCreateCatalogOpen(true)}
								>
									<OutlineFolderAddOuLc />
									{t(
										"components.portfolio.folder.create.title",
										"New folder",
									)}
								</Button>
							)}
							<Button size="xl" type="button" onClick={() => setCreatePostOpen(true)}>
								<SolidPlus />
								{t("components.profile.actions.add_post", "Create post")}
							</Button>
						</div>
					}
				/>

				{showFolders && filteredFolders.length > 0 && (
					<section
						aria-label={t(
							"components.portfolio.folder.catalogs",
							"Portfolio folders",
						)}
						className="px-4"
					>
						<div className="scroll-fade-x scroll-fade-4 flex w-full min-w-0 px-3 gap-4 overflow-x-auto overscroll-x-contain pb-3">
							{filteredFolders.map((folder) => {
								const catalogPosts =
									postsByCatalogId.get(folder.id) ?? [];

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
										className="w-40 shrink-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
									>
										<FolderCard
											folder={folder}
											fallbackCoverSrc={getFallbackCover(
												catalogPosts,
											)}
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
					className="mx-4"
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

			{canManageCatalogs && onCreatePost && (
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