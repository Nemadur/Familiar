import { Typography } from "@heroui/react";

import type { CatalogResponse } from "@/api/portfolio/catalogs/catalog-types";
import { OutlineFolder } from "@/components/icons/icons";
import { ContentWarningOverlay } from "@/components/layout/content-warning-overlay";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FolderCardProps {
    folder: CatalogResponse;
    className?: string;
    fallbackCoverSrc?: string;
    itemCount?: number;
    /** Content warnings from the exact post used as this folder's preview. */
    contentWarnings: string[];
}

export function FolderCard({
    folder,
    className,
    fallbackCoverSrc,
    itemCount,
    contentWarnings,
}: FolderCardProps) {
    const { name, description, thumbnail, fullSize } = folder;
    const coverSrc = fullSize?.path ?? thumbnail?.path ?? fallbackCoverSrc;

    return (
        <article
            className={cn(
                "group flex h-full min-w-0 flex-col gap-2",
                className,
            )}
        >
            <div className="relative aspect-4/3 w-full transition-transform duration-100 group-hover:-translate-y-0.5">
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[92%] rounded-2xl rounded-tl-md bg-input"
                >
                    <div className="absolute -top-2 left-0 h-5 w-[40%] rounded-t-xl bg-input" />
                    <div className="absolute -top-px left-px h-3 w-[calc(40%-2px)] bg-input" />
                </div>

                <div className="absolute inset-x-0 bottom-0 h-[86%] overflow-hidden rounded-2xl bg-muted">
                    <ContentWarningOverlay
                        warnings={contentWarnings}
                        variant="folder"
                        hasMedia={Boolean(coverSrc)}
                        showHideButton={false}
                        className="pointer-events-none size-full"
                    >
                        {coverSrc ? (
                            <img
                                src={coverSrc}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                draggable={false}
                                className="size-full object-cover"
                            />
                        ) : (
                            <div className="flex size-full items-center justify-center">
                                <OutlineFolder
                                    aria-hidden="true"
                                    className="size-9 text-muted-foreground/35"
                                />
                            </div>
                        )}
                    </ContentWarningOverlay>

                    {typeof itemCount === "number" ? (
                        <Badge
                            size="sm"
                            className="absolute bottom-2 right-2 z-20 shrink-0 bg-primary/50 tabular-nums backdrop-blur-md"
                        >
                            {itemCount}
                        </Badge>
                    ) : null}
                </div>
            </div>

            <div className="min-w-0 px-0.5">
                <Typography.Heading
                    level={6}
                    className="truncate leading-snug text-foreground!"
                >
                    {name}
                </Typography.Heading>

                {description ? (
                    <div className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
                        <span className="truncate">{description}</span>
                    </div>
                ) : null}
            </div>
        </article>
    );
}