import { Typography } from "@heroui/react";
import { useTranslation } from "react-i18next";
import type { CatalogResponse } from "@/api/portfolio/catalogs/catalog-types";
import { OutlineFolder } from "@/components/icons/icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FolderCardProps {
	folder: CatalogResponse;
	className?: string;
	fallbackCoverSrc?: string;
	itemCount?: number;
}

export function FolderCard({
	folder,
	className,
	fallbackCoverSrc,
	itemCount,
}: FolderCardProps) {
	const { t } = useTranslation();
	const { name, description, thumbnail, fullSize } = folder;
	const coverSrc = fullSize?.path ?? thumbnail?.path ?? fallbackCoverSrc;

	return (
		<article
			className={cn(
				"group flex min-w-0 flex-col gap-2 group h-full",
				className,
			)}
		>
			<div className="relative aspect-4/3 w-full transition-transform group-hover:-translate-y-0.5 duration-100">
				<div
					aria-hidden="true"
					className="absolute inset-x-0 bottom-0 h-[92%] rounded-2xl rounded-tl-md bg-input"
				>
					<div className="absolute -top-2 left-0 h-5 w-[40%] rounded-t-xl bg-input" />
					<div className="absolute -top-px left-px h-3 w-[calc(40%-2px)] bg-input" />
				</div>

				<div className="absolute inset-x-0 bottom-0 h-[86%] overflow-hidden rounded-2xl bg-muted">
					{coverSrc ? (
						<img
							src={coverSrc}
							alt=""
							loading="lazy"
							decoding="async"
							draggable={false}
							className="absolute inset-0 size-full object-cover"
						/>
					) : (
						<div className="absolute inset-0 flex items-center justify-center">
							<OutlineFolder
								aria-hidden="true"
								className="size-9 text-muted-foreground/35"
							/>
						</div>
					)}

					{typeof itemCount === "number" && (
						<Badge
							size={"sm"}
							className="shrink-0 tabular-nums absolute bottom-2 right-2 bg-primary/50 backdrop-blur-md"
						>
							{/* {t("components.portfolio.folder.items", {
								count: itemCount,
							})} */}
							{itemCount}
						</Badge>
					)}

					{/* <div
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10"
					/> */}
				</div>
			</div>

			<div className="min-w-0 px-0.5">
				<Typography.Heading
					level={6}
					className="truncate leading-snug text-foreground!"
				>
					{name}
				</Typography.Heading>

				<div className="flex min-w-0 items-center gap-1 text-muted-foreground text-sm">
					{/* {typeof itemCount === "number" && (
						<span className="shrink-0 tabular-nums">
							{t("components.portfolio.folder.items", {
								count: itemCount,
							})}
						</span>
					)} */}

					{/* {typeof itemCount === "number" && description && (
						<span aria-hidden="true">·</span>
					)} */}

					{description && <span className="truncate">{description}</span>}
				</div>
			</div>
		</article>
	);
}
