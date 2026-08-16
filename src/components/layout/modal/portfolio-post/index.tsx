import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Edit2, Flag, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { EmptyPage } from "@/components/layout/empty-page";
import { UniversalModalLayout } from "@/components/layout/modal/universal-modal-layout";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { useArtistPortfolioPost, useDeletePortfolioPost } from "@/hooks/portfolio/use-portfolio";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth";

interface PortfolioPostModalProps {
	postId: string;
	username: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function normalizeUsername(value?: string | null) {
	return decodeURIComponent(value ?? "")
		.replace(/^@/, "")
		.trim()
		.toLowerCase();
}

export function PortfolioPostModal({
	postId,
	username,
	open,
	onOpenChange,
}: PortfolioPostModalProps) {
	const { t } = useTranslation();
	const { user: authenticatedUser } = useAuth();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const isCurrentUser = Boolean(
		authenticatedUser &&
		normalizeUsername(authenticatedUser.username) === normalizeUsername(username)
	);

	const { data: post, isPending, isError } = useArtistPortfolioPost(username, postId);
	const deletePostMutation = useDeletePortfolioPost();

	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const handleDelete = async () => {
		try {
			await deletePostMutation.mutateAsync(postId);
			toast.success(t("components.portfolio.post.delete.success", "Post deleted successfully"));
			setDeleteDialogOpen(false);
			onOpenChange(false);
			queryClient.invalidateQueries({ queryKey: ["portfolio"] });
			queryClient.invalidateQueries({ queryKey: ["profile-content"] });
		} catch (error) {
			toast.error(t("components.portfolio.post.delete.error", "Failed to delete post"));
		}
	};

	if (!open) return null;

	if (isPending) {
		return (
			<UniversalModalLayout
				open={open}
				onOpenChange={onOpenChange}
				title={t("components.portfolio.post.loading", "Loading post...")}
				mediaContent={
					<div className="flex items-center justify-center h-full min-h-[300px]">
						<Spinner />
					</div>
				}
				detailsContent={
					<div className="flex items-center justify-center h-full min-h-[300px]">
						<Spinner />
					</div>
				}
			/>
		);
	}

	if (isError || !post) {
		return (
			<UniversalModalLayout
				open={open}
				onOpenChange={onOpenChange}
				title={t("components.portfolio.post.error", "Error")}
				mediaContent={
					<div className="flex items-center justify-center h-full min-h-[300px] text-muted-foreground">
						{t("components.portfolio.post.not_found", "Post not found or could not be loaded.")}
					</div>
				}
				detailsContent={<div />}
			/>
		);
	}

	const images = post.images?.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)) || [];

	return (
		<>
			<UniversalModalLayout
				open={open}
				onOpenChange={onOpenChange}
				title={post.title || t("components.portfolio.post.untitled", "Untitled")}
				mediaClassName="bg-muted/10 flex flex-col min-h-0 lg:overflow-hidden"
				moreMenuContent={
					<>
						{isCurrentUser ? (
							<>
								<DropdownMenuItem
									onSelect={(e) => {
										e.preventDefault();
										toast.info("Edit feature coming soon!");
									}}
								>
									<Edit2 className="mr-2 size-4" />
									{t("components.portfolio.post.manage.edit", "Edit post")}
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									variant="destructive"
									onSelect={(e) => {
										e.preventDefault();
										setDeleteDialogOpen(true);
									}}
								>
									<Trash2 className="mr-2 size-4" />
									{t("components.portfolio.post.manage.delete", "Delete post")}
								</DropdownMenuItem>
							</>
						) : (
							<DropdownMenuItem
								onSelect={(e) => {
									e.preventDefault();
									toast.info("Report feature coming soon!");
								}}
							>
								<Flag className="mr-2 size-4" />
								{t("components.portfolio.post.manage.report", "Report post")}
							</DropdownMenuItem>
						)}
					</>
				}
				mediaContent={
					<div className="flex flex-col h-full min-h-0">
						<div className="flex-1 min-h-0">
							<div className="scroll-fade overflow-y-auto h-full p-4 lg:p-6 flex flex-col gap-4">
								{images.length > 0 ? (
									images.map((img, index) => {
										const path = img.fullSize?.path || img.thumbnail?.path;
										if (!path) return null;
										return (
											<div
												key={img.id || index}
												className="relative w-full overflow-hidden flex items-center justify-center shrink-0"
											>
												<img
													src={path}
													alt={`${post.title} - ${index + 1}`}
													className="w-full h-auto object-contain rounded-xl shadow-sm"
												/>
											</div>
										);
									})
								) : (
									<div className="flex items-center justify-center h-full min-h-[250px] text-muted-foreground">
										<EmptyPage title={t("components.portfolio.post.no_media", "No media available")} />
									</div>
								)}
							</div>
						</div>
					</div>
				}
				detailsContent={
					<div className="flex flex-col min-h-full h-full min-h-0">
						<div className="flex-1 min-h-0">
							<div className="scroll-fade overflow-y-auto h-full p-6 space-y-6">
								{/* Header & Actions */}
								<div className="flex items-start justify-between gap-4">
									<h1 className="font-bold text-2xl leading-tight break-words">{post.title}</h1>
								</div>

								{/* Description */}
								{post.description && (
									<div className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">
										{post.description}
									</div>
								)}

								{/* Tags */}
								{(post.tags && post.tags.length > 0) || (post.contentWarnings && post.contentWarnings.length > 0) ? (
									<div className="space-y-4 pt-4 border-t">
										{post.tags && post.tags.length > 0 && (
											<div className="space-y-2">
												<p className="uppercase text-xs font-semibold text-muted-foreground tracking-wider">
													{t("components.portfolio.post.tags", "Tags")}
												</p>
												<div className="flex flex-wrap gap-2">
													{post.tags.map((tag) => (
														<Badge key={tag} variant="secondary" className="px-3 py-1 text-sm font-normal">
															{tag}
														</Badge>
													))}
												</div>
											</div>
										)}

										{post.contentWarnings && post.contentWarnings.length > 0 && (
											<div className="space-y-2">
												<p className="uppercase text-xs font-semibold text-muted-foreground tracking-wider">
													{t("components.portfolio.post.warnings", "Content Warnings")}
												</p>
												<div className="flex flex-wrap gap-2">
													{post.contentWarnings.map((warning) => (
														<Badge key={warning} variant="destructive" className="px-3 py-1 text-sm font-normal bg-destructive/10 text-destructive hover:bg-destructive/20 border-transparent">
															{warning}
														</Badge>
													))}
												</div>
											</div>
										)}
									</div>
								) : null}
							</div>
						</div>

						{/* Delete Confirmation */}
						<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>
										{t("components.portfolio.post.delete.title", "Delete post?")}
									</AlertDialogTitle>
									<AlertDialogDescription>
										{t(
											"components.portfolio.post.delete.description",
											"Are you sure you want to delete this post? This action cannot be undone."
										)}
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>
										{t("components.portfolio.post.delete.cancel", "Cancel")}
									</AlertDialogCancel>
									<AlertDialogAction
										onClick={(e) => {
											e.preventDefault();
											handleDelete();
										}}
										className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									>
										{deletePostMutation.isPending
											? t("components.portfolio.post.delete.deleting", "Deleting...")
											: t("components.portfolio.post.delete.confirm", "Delete")}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				}
			/>
		</>
	);
}
