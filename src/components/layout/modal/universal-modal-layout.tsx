import type { ReactNode } from "react";
import { useCallback } from "react";
import {
	OutlineBookmark,
	OutlineClose,
	OutlineMore,
	SolidBookmark,
} from "@/components/icons/icons";
import { useLocalAction } from "@/components/layout/feed/ctas";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerTitle,
} from "@/components/ui/drawer";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsTablet } from "@/hooks/ui/use-mobile";
import { cn } from "@/lib/utils";

interface UniversalModalLayoutProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mediaContent: ReactNode;
	detailsContent: ReactNode;
	title?: string; // For screen readers
	showBookmark?: boolean;
	isBookmarked?: boolean;
	onBookmark?: (e: React.MouseEvent) => void;
	mediaClassName?: string;
	moreMenuContent?: ReactNode;
}

export function UniversalModalLayout({
	open,
	onOpenChange,
	mediaContent,
	detailsContent,
	title = "Details",
	showBookmark = false,
	isBookmarked = false,
	onBookmark,
	mediaClassName,
	moreMenuContent,
}: UniversalModalLayoutProps) {
	const isTablet = useIsTablet();
	const { active: bookmarked, handleAction } = useLocalAction({
		initialActive: isBookmarked,
		initialCount: 0,
	});

	const handleBookmarkClick = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			handleAction();
			onBookmark?.(e);
		},
		[handleAction, onBookmark],
	);

	if (isTablet) {
		return (
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerContent className="flex flex-col">
					<DrawerTitle className="sr-only">{title}</DrawerTitle>
					<DrawerDescription className="sr-only">
						View details
					</DrawerDescription>

					<div className="flex flex-col flex-1 overflow-hidden rounded-t-xl min-h-0">
						{/* Mobile Header (Above Images) */}
						<div className="sticky top-0 z-50 flex shrink-0 items-center justify-between border-b bg-background px-4 py-2">
							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									size="icon"
									onClick={() => onOpenChange(false)}
								>
									<OutlineClose />
								</Button>
							</div>
							<div className="flex items-center gap-2">
								{showBookmark && (
									<Button
										variant="ghost"
										size="icon-xl"
										className={cn(
											"hidden xl:flex text-muted-foreground",
											bookmarked && "text-white bg-white/10 hover:bg-white/20",
										)}
										onClick={handleBookmarkClick}
									>
										{bookmarked ? <SolidBookmark /> : <OutlineBookmark />}
									</Button>
								)}
								{moreMenuContent ? (
									<DropdownMenu modal={false}>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon">
												<OutlineMore />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											{moreMenuContent}
										</DropdownMenuContent>
									</DropdownMenu>
								) : (
									<Button variant="ghost" size="icon">
										<OutlineMore />
									</Button>
								)}
							</div>
						</div>

						{/* Media Section */}
						<div className={cn("shrink-0 w-full", mediaClassName)}>
							{mediaContent}
						</div>

						{/* Details Section */}
						<div className="flex-1 overflow-y-auto">{detailsContent}</div>
					</div>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				onInteractOutside={(e) => {
					// Prevent closing when interacting with toast notifications or dropdown menus
					if (e.target instanceof Element && (e.target.closest('[data-sonner-toast]') || e.target.closest('[data-radix-menu-content]'))) {
						e.preventDefault();
					}
				}}
				className="flex h-[85vh] md:min-w-2xl lg:min-w-4xl xl:max-w-6xl flex-col overflow-hidden border-none bg-background p-0 sm:rounded-3xl"
			>
				<DialogTitle className="sr-only">{title}</DialogTitle>
				<DialogDescription className="sr-only">View details</DialogDescription>

				<div className="flex flex-col lg:flex-row h-full w-full lg:overflow-hidden overflow-y-auto">
					{/* Left Column: Media */}
					<div
						className={cn(
							"group relative w-full lg:w-[60%] lg:h-full lg:overflow-y-auto shrink-0 flex flex-col min-h-75 lg:min-h-0",
							// Use justify-center only if no scroll needed, but safe way is m-auto on child.
							// Removing justify-center to prevent top clipping on overflow.
							mediaClassName,
						)}
					>
						{mediaContent}
					</div>

					{/* Right Column: Details */}
					<div className="w-full lg:w-[40%] flex flex-col bg-background lg:border-l lg:h-full shrink-0">
						{/* Header Actions */}
						<div className="sticky top-0 z-20 hidden lg:flex shrink-0 items-center justify-end gap-2 border-b bg-background p-4">
							{showBookmark && (
								<Button
									size="icon-xl"
									className={cn(
										"relative z-0 hidden shrink-0 bg-transparent shadow-none before:absolute before:bottom-0 before:-z-10 before:h-16 before:w-full before:rounded-b-full before:transition-all hover:bg-transparent hover:before:translate-y-1.5 lg:flex [&>svg]:transition-transform hover:[&>svg]:translate-y-1.5",
										bookmarked
											? "text-white before:bg-white/10 hover:before:bg-white/20"
											: "text-primary hover:before:bg-primary/10 before:bg-primary/6",
									)}
									onClick={handleBookmarkClick}
								>
									{bookmarked ? <SolidBookmark /> : <OutlineBookmark />}
								</Button>
							)}
							<div className="flex items-center flex-1 w-full justify-end gap-2">
								{showBookmark && (
									/* Mobile/Tablet Bookmark (Standard) */
									<Button
										variant="ghost"
										size="icon-xl"
										onClick={handleBookmarkClick}
										className={cn("lg:hidden", bookmarked && "text-white")}
									>
										{bookmarked ? <SolidBookmark /> : <OutlineBookmark />}
									</Button>
								)}
								{moreMenuContent ? (
									<DropdownMenu modal={false}>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="icon">
												<OutlineMore />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											{moreMenuContent}
										</DropdownMenuContent>
									</DropdownMenu>
								) : (
									<Button variant="ghost" size="icon">
										<OutlineMore />
									</Button>
								)}
								<Button
									variant="ghost"
									size="icon"
									className="hidden lg:flex"
									onClick={() => onOpenChange(false)}
								>
									<OutlineClose />
								</Button>
							</div>
						</div>

						<div className="flex-1 md:overflow-y-auto flex flex-col min-h-0">
							{detailsContent}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
