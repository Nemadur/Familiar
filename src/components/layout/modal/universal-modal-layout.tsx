import { DialogPortal } from "@radix-ui/react-dialog";
import type { MouseEvent, ReactNode } from "react";
import {
	useCallback,
	useRef,
	useState,
} from "react";
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

	detailsHeaderContent?: ReactNode;
	detailsFooterContent?: ReactNode;

	title?: string;

	showBookmark?: boolean;
	isBookmarked?: boolean;
	onBookmark?: (event: MouseEvent) => void;

	mediaClassName?: string;
	detailsClassName?: string;
	moreMenuContent?: ReactNode;

	/**
	 * Optional initial media aspect ratio.
	 *
	 * The modal automatically measures the first rendered image
	 * or video and locks its size to that ratio.
	 */
	mediaAspectRatio?: number;
}

export function UniversalModalLayout({
	open,
	onOpenChange,
	mediaContent,
	detailsContent,
	detailsHeaderContent,
	detailsFooterContent,
	title = "Details",
	showBookmark = false,
	isBookmarked = false,
	onBookmark,
	mediaClassName,
	detailsClassName,
	moreMenuContent,
	mediaAspectRatio,
}: UniversalModalLayoutProps) {
	const isTablet = useIsTablet();

	const { active: bookmarked, handleAction } =
		useLocalAction({
			initialActive: isBookmarked,
			initialCount: 0,
		});

	const [detectedMediaAspectRatio, setDetectedMediaAspectRatio] =
		useState(mediaAspectRatio ?? 1);

	/**
	 * Prevent later carousel images from changing the modal size.
	 *
	 * This ref remains true for the lifetime of this modal instance.
	 * Key UniversalModalLayout by post ID to reset it for another post.
	 */
	const hasMeasuredFirstMedia = useRef(false);

	const updateMediaAspectRatio = useCallback(
		(width: number, height: number) => {
			if (hasMeasuredFirstMedia.current) {
				return;
			}

			if (
				!Number.isFinite(width) ||
				!Number.isFinite(height) ||
				width <= 0 ||
				height <= 0
			) {
				return;
			}

			hasMeasuredFirstMedia.current = true;

			setDetectedMediaAspectRatio(
				width / height,
			);
		},
		[],
	);

	const safeMediaAspectRatio = Number.isFinite(
		detectedMediaAspectRatio,
	)
		? Math.min(
				Math.max(detectedMediaAspectRatio, 0.25),
				4,
			)
		: 1;

	const handleBookmarkClick = useCallback(
		(event: MouseEvent) => {
			event.stopPropagation();
			handleAction();
			onBookmark?.(event);
		},
		[handleAction, onBookmark],
	);

	const moreAction = moreMenuContent ? (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					aria-label="More options"
					className="rounded-full"
				>
					<OutlineMore />
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end">
				{moreMenuContent}
			</DropdownMenuContent>
		</DropdownMenu>
	) : (
		<Button
			variant="ghost"
			size="icon"
			aria-label="More options"
			className="rounded-full"
		>
			<OutlineMore />
		</Button>
	);

	if (isTablet) {
		return (
			<Drawer
				open={open}
				onOpenChange={onOpenChange}
			>
				<DrawerContent className="flex max-h-[96dvh] flex-col overflow-hidden p-0">
					<DrawerTitle className="sr-only">
						{title}
					</DrawerTitle>

					<DrawerDescription className="sr-only">
						View details
					</DrawerDescription>

					<div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-xl">
						<header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-3">
							<Button
								variant="ghost"
								size="icon"
								aria-label="Close"
								className="rounded-full"
								onClick={() =>
									onOpenChange(false)
								}
							>
								<OutlineClose />
							</Button>

							<div className="min-w-0 flex-1 px-2">
								{detailsHeaderContent}
							</div>

							<div className="flex shrink-0 items-center gap-1">
								{showBookmark && (
									<Button
										variant="ghost"
										size="icon"
										aria-label={
											bookmarked
												? "Remove bookmark"
												: "Save bookmark"
										}
										className={cn(
											"rounded-full",
											bookmarked &&
												"text-primary",
										)}
										onClick={
											handleBookmarkClick
										}
									>
										{bookmarked ? (
											<SolidBookmark />
										) : (
											<OutlineBookmark />
										)}
									</Button>
								)}

								{moreAction}
							</div>
						</header>

						<div
							className={cn(
								"flex min-h-75 w-full shrink-0 items-center justify-center overflow-hidden bg-black",
								mediaClassName,
							)}
						>
							{mediaContent}
						</div>

						<div
							className={cn(
								"min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background",
								detailsClassName,
							)}
						>
							{detailsContent}
						</div>

						{detailsFooterContent && (
							<footer className="shrink-0 border-t bg-background">
								{detailsFooterContent}
							</footer>
						)}
					</div>
				</DrawerContent>
			</Drawer>
		);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogPortal>
				<Button
					variant="ghost"
					size="icon"
					aria-label="Close"
					className="fixed right-4 top-4 z-60 rounded-full text-white hover:bg-white/15 hover:text-white"
					onClick={() => onOpenChange(false)}
				>
					<OutlineClose className="size-7" />
				</Button>
			</DialogPortal>

			<DialogContent
				showCloseButton={false}
				onInteractOutside={(event) => {
					if (
						event.target instanceof Element &&
						(
							event.target.closest(
								"[data-sonner-toast]",
							) ||
							event.target.closest(
								"[data-radix-menu-content]",
							) ||
							event.target.closest(
								'[role="alertdialog"]',
							)
						)
					) {
						event.preventDefault();
					}
				}}
				className={cn(
					"flex gap-0 overflow-hidden border-0 bg-background p-0 shadow-none",
					"h-[calc(100dvh-3rem)] max-h-[960px]",
					"!w-fit",
					"sm:!max-w-[calc(100vw-3rem)]",
					"rounded-sm",
				)}
			>
				<DialogTitle className="sr-only">
					{title}
				</DialogTitle>

				<DialogDescription className="sr-only">
					View details
				</DialogDescription>

				{/* Dynamic media section */}
				<section
					style={{
						aspectRatio:
							safeMediaAspectRatio,
						maxWidth:
							"calc(100vw - clamp(400px, 31vw, 500px) - 3rem)",
					}}
					onLoadCapture={(event) => {
						const target = event.target;

						if (
							target instanceof
							HTMLImageElement
						) {
							updateMediaAspectRatio(
								target.naturalWidth,
								target.naturalHeight,
							);
						}
					}}
					onLoadedMetadataCapture={(event) => {
						const target = event.target;

						if (
							target instanceof
							HTMLVideoElement
						) {
							updateMediaAspectRatio(
								target.videoWidth,
								target.videoHeight,
							);
						}
					}}
					className={cn(
						"relative h-full w-auto min-w-0 flex-none",
						"flex items-center justify-center",
						"overflow-hidden bg-black",
						mediaClassName,
					)}
				>
					{mediaContent}
				</section>

				{/* Fixed details section */}
				<aside
					className={cn(
						"flex h-full min-h-0 min-w-0 flex-none flex-col",
						"w-[clamp(400px,31vw,500px)]",
						"border-l bg-background",
					)}
				>
					<header className="flex min-h-15 shrink-0 items-center gap-3 border-b px-4 py-2">
						<div className="min-w-0 flex-1">
							{detailsHeaderContent}
						</div>

						<div className="flex shrink-0 items-center gap-1">
							{showBookmark && (
								<Button
									variant="ghost"
									size="icon"
									aria-label={
										bookmarked
											? "Remove bookmark"
											: "Save bookmark"
									}
									className={cn(
										"rounded-full",
										bookmarked &&
											"text-primary",
									)}
									onClick={
										handleBookmarkClick
									}
								>
									{bookmarked ? (
										<SolidBookmark />
									) : (
										<OutlineBookmark />
									)}
								</Button>
							)}

							{moreAction}
						</div>
					</header>

					<div
						className={cn(
							"min-h-0 flex-1 overflow-y-auto overscroll-contain",
							detailsClassName,
						)}
					>
						{detailsContent}
					</div>

					{detailsFooterContent && (
						<footer className="shrink-0 border-t bg-background">
							{detailsFooterContent}
						</footer>
					)}
				</aside>
			</DialogContent>
		</Dialog>
	);
}