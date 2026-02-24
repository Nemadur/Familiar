import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { OutlineFolderAddOuLc } from "@/components/icons/icons";
import { PortfolioPostModal } from "@/components/layout/profile/modals/portfolio-post-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Folder as FolderType } from "@/data/folders";
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

export function ProfilePortfolio({
	posts,
	folderId,
	username,
	folders,
	currentFolder: propCurrentFolder,
}: ProfilePortfolioProps) {
	const [activeType, setActiveType] = useState("ALL");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedPost, setSelectedPost] = useState<PostWithAuthor | null>(null);

	const { t } = useTranslation();

	// Dynamically generate filters from posts
	// 1. Fixed: All, Commissions
	// 2. Custom: Tags from posts
	const availableTags = Array.from(new Set(posts.flatMap((p) => p.tags || [])));

	const systemFilters = [
		{
			id: "ALL",
			label: t("components.portfolio.filters.all"),
			type: "system",
		},
		{
			id: "COMMISSIONS_ONLY",
			label: t("components.portfolio.filters.commissions_only"),
			type: "system",
		},
	];

	const customFilters = availableTags.map((tag) => ({
		id: tag,
		label: tag,
		type: "custom",
	}));

	const filteredPosts = useMemo(() => {
		if (activeType === "ALL") return posts;
		if (activeType === "COMMISSIONS_ONLY")
			return posts.filter((p) => p.isCommission);
		return posts.filter((p) => p.tags?.includes(activeType));
	}, [activeType, posts]);

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
			<div className="space-y-6">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" asChild>
						{backSlug ? (
							<Link
								to="/$username/$tab/folder/$folderSlug"
								params={{
									username: username || "",
									tab: "portfolio",
									folderSlug: backSlug,
								}}
							>
								<ArrowLeft />
							</Link>
						) : (
							<Link
								to="/$username/$tab"
								params={{ username: username || "", tab: "portfolio" }}
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
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{subfolders.map((folder) => (
							<Link
								key={folder.id}
								to="/$username/$tab/folder/$folderSlug/$subfolderSlug"
								params={{
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
					<ProfileFeed posts={folderPosts} onPostClick={setSelectedPost} />
				</div>

				{selectedPost && (
					<PortfolioPostModal
						post={selectedPost}
						open={!!selectedPost}
						onOpenChange={(open) => !open && setSelectedPost(null)}
					/>
				)}
			</div>
		);
	}

	const filteredFolders = folders
		.filter((f) => !f.parentId) // Only show root folders
		.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

	return (
		<div className="space-y-6">
			{/* Search and Filter Bar */}
			<div className="flex flex-col gap-6 md:flex-row md:items-center pb-3">
				<div className="relative w-full min-w-0 flex-1 overflow-x-auto whitespace-nowrap">
					<div className="flex w-max items-center space-x-2">
						{/* System Filters Group */}

						{systemFilters.map((f) => (
							<Button
								key={f.id}
								variant={activeType === f.id ? "default" : "outline"}
								onClick={() => setActiveType(f.id)}
							>
								{f.label}
							</Button>
						))}

						{/* Custom Filters */}
						{customFilters.map((f) => {
							return (
								<Button
									key={f.id}
									variant={activeType === f.id ? "default" : "outline"}
									onClick={() => setActiveType(f.id)}
									className="gap-2 rounded-full"
								>
									{f.label}
								</Button>
							);
						})}
					</div>
				</div>

				<div className="flex w-full items-center gap-2 md:w-auto">
					<div className="relative w-full md:w-64">
						<Input
							placeholder={t("components.portfolio.search_placeholder")}
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-8"
						/>
						{/* <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /> */}
					</div>
					<Button variant="outline" size="icon">
						<OutlineFolderAddOuLc className="h-4 w-4" />
					</Button>
				</div>
			</div>

			{/* Folders Grid */}
			{filteredFolders.length > 0 && (
				<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{filteredFolders.map((folder) => (
						<Link
							key={folder.id}
							to="/$username/$tab/folder/$folderSlug"
							params={{
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

			{/* Posts Grid */}
			{(!folderId || !currentFolder) && (
				<ProfileFeed posts={filteredPosts} onPostClick={setSelectedPost} />
			)}

			{selectedPost && (
				<PortfolioPostModal
					post={selectedPost}
					open={!!selectedPost}
					onOpenChange={(open) => !open && setSelectedPost(null)}
				/>
			)}
		</div>
	);
}
