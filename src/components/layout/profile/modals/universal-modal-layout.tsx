import { MoreHorizontal, X } from "lucide-react";
import type { ReactNode } from "react";
import { OutlineBookmark } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "@/components/ui/dialog";

interface UniversalModalLayoutProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mediaContent: ReactNode;
	detailsContent: ReactNode;
	title?: string; // For screen readers
	showBookmark?: boolean;
}

export function UniversalModalLayout({
	open,
	onOpenChange,
	mediaContent,
	detailsContent,
	title = "Details",
	showBookmark = true,
}: UniversalModalLayoutProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className="flex h-[85vh] w-full max-w-[90vw] md:max-w-7xl flex-col overflow-hidden border-none bg-background p-0 sm:rounded-3xl"
			>
				<DialogTitle className="sr-only">{title}</DialogTitle>
				<DialogDescription className="sr-only">View details</DialogDescription>
				<DialogClose className="absolute top-4 right-4 z-50 rounded-full bg-background/50 p-2 transition-colors hover:bg-background md:hidden">
					<X className="h-4 w-4" />
				</DialogClose>

				<div className="flex flex-col md:flex-row h-full w-full md:overflow-hidden overflow-y-auto">
					{/* Left Column: Media */}
					<div className="group relative w-full md:w-[60%] bg-zinc-950 md:h-full md:overflow-y-auto shrink-0 flex flex-col justify-center min-h-[300px] md:min-h-0">
						{mediaContent}
					</div>

					{/* Right Column: Details */}
					<div className="w-full md:w-[40%] flex flex-col bg-background border-l md:h-full shrink-0">
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
								<Button
									size={"icon"}
									className="absolute right-16 top-3.5 z-0 shrink-0 bg-transparent text-primary shadow-none before:absolute before:bottom-0 before:-z-10 before:h-16 before:w-full before:rounded-b-full before:bg-primary/6 before:transition-all hover:bg-transparent hover:before:translate-y-1.5 hover:before:bg-primary/10 [&>svg]:transition-transform hover:[&>svg]:translate-y-1.5"
								>
									<OutlineBookmark />
								</Button>
							)}
							<div className="flex items-center gap-2">
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
