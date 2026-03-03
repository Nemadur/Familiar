import { MoreHorizontal, X } from "lucide-react";
import type { ReactNode } from "react";
import { OutlineBookmark, OutlineClose } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface UniversalModalLayoutProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mediaContent: ReactNode;
	detailsContent: ReactNode;
	title?: string; // For screen readers
	showBookmark?: boolean;
	mediaClassName?: string;
}

export function UniversalModalLayout({
	open,
	onOpenChange,
	mediaContent,
	detailsContent,
	title = "Details",
	showBookmark = true,
	mediaClassName,
}: UniversalModalLayoutProps) {
	const isMobile = useIsMobile();

	if (isMobile) {
		return (
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerContent className="flex flex-col">
					<DrawerTitle className="sr-only">{title}</DrawerTitle>
					<DrawerDescription className="sr-only">
						View details
					</DrawerDescription>

					<div className="flex flex-col flex-1 overflow-hidden rounded-t-xl min-h-0">
						{/* Media Section */}
						<div
							className={cn("shrink-0 bg-background w-full", mediaClassName)}
						>
							{mediaContent}
						</div>

						{/* Details Section */}
						<div className="flex-1 overflow-y-auto bg-background">
							{detailsContent}
						</div>
					</div>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className="flex h-[85vh] w-full max-w-[90vw] md:max-w-xl lg:max-w-[90vw] flex-col overflow-hidden border-none bg-background p-0 sm:rounded-3xl"
			>
				<DialogTitle className="sr-only">{title}</DialogTitle>
				<DialogDescription className="sr-only">View details</DialogDescription>
				<DialogClose className="absolute top-4 right-4 z-50 rounded-full bg-background/50 p-2 transition-colors hover:bg-background md:hidden">
					<OutlineClose />
				</DialogClose>

				<div className="flex flex-col lg:flex-row h-full w-full lg:overflow-hidden overflow-y-auto">
					{/* Left Column: Media */}
					<div
						className={cn(
							"group relative w-full lg:w-[60%] bg-zinc-950 lg:h-full lg:overflow-y-auto shrink-0 flex flex-col min-h-[300px] lg:min-h-0",
							// Use justify-center only if no scroll needed, but safe way is m-auto on child.
							// Removing justify-center to prevent top clipping on overflow.
							mediaClassName,
						)}
					>
						{mediaContent}
					</div>

					{/* Right Column: Details */}
					<div className="w-full lg:w-[40%] flex flex-col bg-background border-l lg:h-full shrink-0">
						{/* Header Actions */}
						<div className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b bg-background px-6 py-4">
							<div className="flex items-center gap-2 text-muted-foreground text-sm">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8"
									onClick={() => onOpenChange(false)}
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
							{showBookmark && (
								<>
									{/* Desktop Bookmark (Fancy) */}
									<Button
										size={"icon"}
										className="absolute right-16 top-3.5 z-0 hidden shrink-0 bg-transparent text-primary shadow-none before:absolute before:bottom-0 before:-z-10 before:h-16 before:w-full before:rounded-b-full before:bg-primary/6 before:transition-all hover:bg-transparent hover:before:translate-y-1.5 hover:before:bg-primary/10 lg:flex [&>svg]:transition-transform hover:[&>svg]:translate-y-1.5"
									>
										<OutlineBookmark />
									</Button>
								</>
							)}
							<div className="flex items-center gap-2">
								{showBookmark && (
									/* Mobile/Tablet Bookmark (Standard) */
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 lg:hidden"
									>
										<OutlineBookmark className="h-4 w-4" />
									</Button>
								)}
								<Button variant="ghost" size="icon" className="h-8 w-8">
									<MoreHorizontal className="h-4 w-4" />
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
