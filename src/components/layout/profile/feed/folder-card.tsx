import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import * as Icons from "@/components/icons/icons";
import type { Folder } from "@/data/folders";
import { getStyleFromHexShade } from "@/lib/colors";
import { cn } from "@/lib/utils";

interface FolderCardProps {
	folder: Folder;
	className?: string;
	onClick?: () => void;
}

export function FolderCard({ folder, className, onClick }: FolderCardProps) {
	const { t } = useTranslation();
	// Destructure premium props with defaults or overrides
	const {
		name: title,
		count,
		images = [],
		hasSubfolders,
		color: rawColor,
		icon: CustomIcon,
	} = folder;

	// Fake data logic: assign color/icon if not present for demo
	// In production, these would come from the DB
	const color =
		rawColor ||
		(folder.slug === "featured" || folder.slug === "premium"
			? "#8b5cf6" // Purple
			: undefined);

	// Resolve Icon
	let Icon: React.ElementType = Icons.OutlineFolder;

	if (CustomIcon) {
		if (typeof CustomIcon === "string") {
			// Cast to unknown first to avoid "any" lint error, then to Record
			const iconMap = Icons as unknown as Record<string, React.ElementType>;
			const resolved = iconMap[CustomIcon];
			if (resolved) {
				Icon = resolved;
			}
		} else {
			Icon = CustomIcon;
		}
	}

	// Generate styles if color is present
	const styles = useMemo(() => {
		if (!color) return {};
		return {
			front: getStyleFromHexShade(color, "100", "backgroundColor"),
			back: getStyleFromHexShade(color, "200", "backgroundColor"),
			text: getStyleFromHexShade(color, "950", "color"),
			icon: getStyleFromHexShade(color, "500", "color"),
		};
	}, [color]);

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

	return (
		<button
			onClick={onClick}
			type="button"
			role={onClick ? "button" : undefined}
			tabIndex={onClick ? 0 : undefined}
			className={cn(
				"group perspective-1000 relative aspect-4/3 w-full cursor-pointer text-left",
				className,
			)}
		>
			{/* Folder Back (with Tab) */}
			<div
				className="absolute bottom-0 h-[90%] w-full rounded-xl rounded-tl-none bg-sidebar-border dark:bg-muted transition-colors"
				style={styles.back}
			>
				{/* Tab */}
				<div
					className="absolute -top-3 left-0 h-6 w-[40%] rounded-t-lg bg-sidebar-border dark:bg-muted transition-colors"
					style={styles.back}
				/>
				{/* Tab Connector Hider */}
				<div
					className="absolute -top-1 left-0 h-4 w-[40%] bg-sidebar-border dark:bg-muted transition-colors"
					style={styles.back}
				/>
			</div>

			{/* Card Stack (Inside) */}
			<div className="absolute inset-x-4 bottom-3 z-10 flex h-[75%] items-end justify-center transition-transform duration-300 ease-out group-hover:-translate-y-6 [&>div]:absolute [&>div]:transform [&>div]:overflow-hidden [&>div]:rounded-lg">
				{/* Card 3 (Back) - Slot 2 */}
				{backItem && (
					<div className="h-[90%] w-[90%] translate-x-[-10%] -rotate-6 transition-transform duration-300 group-hover:translate-x-[-15%] group-hover:-translate-y-2 group-hover:-rotate-12 bg-neutral-100 dark:bg-neutral-800">
						<FolderItemContent
							item={backItem}
							customIcon={Icon}
							customColorStyle={styles.text}
						/>
					</div>
				)}

				{/* Card 2 (Middle) - Slot 1 */}
				{middleItem && (
					<div className="h-[90%] w-[90%] translate-x-[5%] rotate-3 bg-blue-500 transition-transform duration-300 group-hover:translate-x-[10%] group-hover:-translate-y-3 group-hover:rotate-6">
						<FolderItemContent
							item={middleItem}
							customIcon={Icon}
							customColorStyle={styles.text}
						/>
					</div>
				)}

				{/* Card 1 (Front) - Slot 0 */}
				{frontItem && (
					<div className="flex h-[90%] w-[90%] items-center justify-center bg-muted">
						<FolderItemContent
							item={frontItem}
							customIcon={Icon}
							customColorStyle={styles.text}
						/>
					</div>
				)}
			</div>

			{/* Folder Front */}
			<div
				className="absolute bottom-0 z-20 flex h-[80%] w-full origin-bottom flex-col justify-end rounded-xl bg-input p-3 transition-colors"
				style={styles.front}
			>
				{/* Folder Front Cutout/Detail */}
				<div
					className="absolute top-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-b-sm bg-sidebar-border dark:bg-muted transition-colors"
					style={styles.back}
				/>

				{/* Custom Icon (if no images or explicitly shown? Usually icon is shown if empty or on top) */}
				{/* Logic: if folder has color/icon, maybe show icon on front too? Or just use it for empty state? */}
				{/* For now, just show icon if folder is empty or use it as placeholder */}

				<div className="space-y-0.5">
					{color && (
						<div className="mb-0.5">
							<Icon
								className="size-7 shrink-0 text-muted-foreground"
								style={styles.icon}
							/>
						</div>
					)}
					<h3
						className="truncate font-semibold text-foreground leading-tight"
						style={styles.text}
					>
						{title}
					</h3>
					<p className="text-foreground text-xs opacity-70" style={styles.text}>
						{t("components.portfolio.folder.items", { count })}
					</p>
				</div>
			</div>
		</button>
	);
}

function FolderItemContent({
	item,
	customIcon: CustomIcon,
	customColorStyle,
}: {
	item: string | "folder_placeholder" | undefined;
	customIcon?: React.ElementType;
	customColorStyle?: React.CSSProperties;
}) {
	if (!item) return null;
	if (item === "folder_placeholder") {
		const Icon = CustomIcon || Icons.OutlineFolder;
		return (
			<div className="flex h-full w-full items-start pt-2 justify-center">
				<Icon
					className="size-8 text-muted-foreground"
					style={customColorStyle}
				/>
			</div>
		);
	}
	return <img src={item} alt="" className="h-full w-full object-cover" />;
}
