import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { PostWithAuthor } from "@/types/post";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Heart, MessageCircle, Repeat2, Bookmark } from "lucide-react";
import UserAvatar from "@/components/layout/profile/avatar";
import { Button } from "@/components/ui/button";

interface PortfolioPostModalProps {
	post: PostWithAuthor;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PortfolioPostModal({
	post,
	open,
	onOpenChange,
}: PortfolioPostModalProps) {
	if (!post) return null;

	const image = post.images?.[0];

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-5xl p-0 overflow-hidden gap-0 sm:rounded-3xl h-[90vh] flex flex-col md:flex-row">
				<div className="flex-1 bg-black/5 flex items-center justify-center min-h-[40vh] md:min-h-full relative overflow-hidden">
					{image && (
						<img
							src={image.path}
							alt={image.alt || post.text}
							className="max-w-full max-h-full object-contain w-full h-full"
						/>
					)}
				</div>

				<div className="w-full md:w-[400px] bg-background flex flex-col border-l h-full">
					<DialogHeader className="p-4 border-b flex-shrink-0">
						<div className="flex items-center gap-3">
							<UserAvatar user={post.author} className="size-10" />
							<div className="flex flex-col text-left">
								<DialogTitle className="text-base font-bold">
									{post.author.display_name}
								</DialogTitle>
								<span className="text-xs text-muted-foreground">
									@{post.author.username}
								</span>
							</div>
						</div>
					</DialogHeader>

					<ScrollArea className="flex-1 p-4">
						<div className="space-y-4">
							<div>
								<h3 className="font-bold text-lg mb-2">
									{post.title || "Untitled"}
								</h3>
								<p className="text-sm whitespace-pre-wrap">{post.text}</p>
							</div>

							<div className="flex flex-wrap gap-2">
								{post.tags?.map((tag) => (
									<span
										key={tag}
										className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
									>
										#{tag}
									</span>
								))}
							</div>

							<div className="text-xs text-muted-foreground">
								{format(new Date(post.createdAt), "PPP p")}
							</div>
						</div>
					</ScrollArea>

					<div className="p-4 border-t flex-shrink-0">
						<div className="flex items-center justify-between mb-4">
							<Button variant="ghost" size="sm" className="gap-2">
								<Heart size={18} />
								<span>{post.likeCount}</span>
							</Button>
							<Button variant="ghost" size="sm" className="gap-2">
								<MessageCircle size={18} />
								<span>{post.commentCount}</span>
							</Button>
							<Button variant="ghost" size="sm" className="gap-2">
								<Repeat2 size={18} />
								<span>{post.repostCount}</span>
							</Button>
							<Button variant="ghost" size="sm">
								<Bookmark size={18} />
							</Button>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
