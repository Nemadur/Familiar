import { Folder as FolderIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OutlineFolder } from "@/components/icons/icons";
import type { Folder } from "@/data/folders";
import { cn } from "@/lib/utils";

interface FolderCardProps {
	folder: Folder;
	className?: string;
	onClick?: () => void;
}

export function FolderCard({ folder, className, onClick }: FolderCardProps) {
	const { t } = useTranslation();
	const { name: title, count, images = [], hasSubfolders } = folder;

	// Prepare items for the stack (max 3)
	// Priority: Images -> Subfolder placeholder
	const displayItems: (string | "folder_placeholder")[] = [...images];
	if (hasSubfolders) {
		displayItems.push("folder_placeholder");
	}

	// Map to slots: Front (0), Middle (1), Back (2)
	// Note: We fill from Front to Back
	const frontItem = displayItems[0];
	const middleItem = displayItems[1];
	const backItem = displayItems[2];

	const renderItemContent = (
		item: string | "folder_placeholder" | undefined,
		opacity = 1,
	) => {
		if (!item) return null;
		if (item === "folder_placeholder") {
			// TODO: prepare for premium custom folder color and icon
			return (
				<div className="flex h-full w-full items-start pt-2 justify-center">
					<OutlineFolder className="size-8 text-muted-foreground" />
				</div>
			);
		}
		return (
			<img
				src={item}
				alt=""
				className="h-full w-full object-cover"
				style={{ opacity }}
			/>
		);
	};

	return (
		<div
			onClick={onClick}
			className={cn(
				"group perspective-1000 relative aspect-4/3 w-full cursor-pointer text-left",
				className,
			)}
		>
			{/* Folder Back (with Tab) */}
			<div className="absolute bottom-0 h-[85%] w-full rounded-xl rounded-tl-none bg-neutral-100 dark:bg-neutral-800">
				{/* Tab */}
				<div className="absolute -top-3 left-0 h-6 w-[40%] rounded-t-lg bg-neutral-100 dark:bg-neutral-800" />
				{/* Tab Connector Hider */}
				<div className="absolute -top-1 left-0 h-4 w-[40%] bg-neutral-100 dark:bg-neutral-800" />
			</div>

			{/* Card Stack (Inside) */}
			<div className="absolute inset-x-4 bottom-4 z-10 flex h-[70%] items-end justify-center transition-transform duration-300 ease-out group-hover:-translate-y-6 [&>div]:absolute [&>div]:transform [&>div]:overflow-hidden [&>div]:rounded-lg">
				{/* Card 3 (Back) - Slot 2 */}
				{backItem && (
					<div className="h-[90%] w-[90%] translate-x-[-10%] -rotate-6 transition-transform duration-300 group-hover:translate-x-[-15%] group-hover:-translate-y-2 group-hover:-rotate-12 bg-neutral-100 dark:bg-neutral-800">
						{renderItemContent(backItem, 0.8)}
					</div>
				)}

				{/* Card 2 (Middle) - Slot 1 */}
				{middleItem && (
					<div className="h-[90%] w-[90%] translate-x-[5%] rotate-3 bg-blue-500 transition-transform duration-300 group-hover:translate-x-[10%] group-hover:-translate-y-3 group-hover:rotate-6 dark:bg-neutral-800">
						{renderItemContent(middleItem, 0.9)}
					</div>
				)}

				{/* Card 1 (Front) - Slot 0 */}
				{frontItem && (
					<div className="flex h-[90%] w-[90%] items-center justify-center bg-neutral-200 dark:bg-neutral-700">
						{renderItemContent(frontItem)}
					</div>
				)}
			</div>

			{/* Folder Front */}
			{/* TODO: prepare for premium custom folder color and icon */}
			<div className="absolute bottom-0 z-20 flex h-[75%] w-full origin-bottom flex-col justify-end rounded-xl bg-neutral-100 dark:bg-neutral-900 p-4">
				{/* Folder Front Cutout/Detail */}
				<div className="absolute top-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-b-sm bg-border/20" />

				<div className="space-y-0.5">
					<h3 className="truncate font-semibold text-foreground leading-tight">
						{title}
					</h3>
					<p className="text-muted-foreground text-xs">
						{t("components.portfolio.folder.items", { count })}
					</p>
				</div>
			</div>
		</div>
	);
}
