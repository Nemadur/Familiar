import { ImageOff, Images } from "lucide-react";
import { type CSSProperties, memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { PortfolioPostResponse } from "@/api/portfolio/posts/post-types";
import {
    OutlineEdit,
    OutlineMore,
    OutlineTrash,
    SolidChat,
    SolidHeart,
} from "@/components/icons/icons";
import { ContentWarningOverlay } from "@/components/layout/content-warning-overlay";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tile } from "@/lib/bento";
import { cn } from "@/lib/utils";

interface PortfolioFeedItemProps {
    p: Tile;
    post: PortfolioPostResponse;
    handlePostClick: (postId: string) => void;
    style: CSSProperties;
    isOwner: boolean;
    onRemoveFromCatalog?: (postId: string) => void;
}

interface NormalizedMedia {
    id: string;
    path: string;
    alt: string;
}

type PortfolioPostWithComments = PortfolioPostResponse & {
    commentCount?: number;
    commentsCount?: number;
};

export const PortfolioFeedItem = memo(function PortfolioFeedItem({
    p,
    post,
    handlePostClick,
    style,
    isOwner,
    onRemoveFromCatalog,
}: PortfolioFeedItemProps) {
    const { t, i18n } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const medias = useMemo<NormalizedMedia[]>(
        () =>
            [...(post.images ?? [])]
                .sort(
                    (a, b) =>
                        (a.position ?? Number.MAX_SAFE_INTEGER) -
                        (b.position ?? Number.MAX_SAFE_INTEGER),
                )
                .map((image, index) => {
                    const path =
                        image.fullSize?.path ?? image.thumbnail?.path ?? "";

                    return {
                        id: image.id ?? `${p.id}-${index}`,
                        path,
                        alt:
                            post.title ??
                            t(
                                "components.portfolio.post.image_alt",
                                "Portfolio image",
                            ),
                    };
                })
                .filter((image) => image.path.length > 0),
        [p.id, post.images, post.title, t],
    );

    const firstMedia = medias[0];
    const hasMedia = Boolean(firstMedia);
    const hasMultipleImages = medias.length > 1;
    const hasContentWarnings = (post.contentWarnings?.length ?? 0) > 0;
    const postWithComments = post as PortfolioPostWithComments;
    const likeCount = post.likeCount ?? 0;
    const commentCount =
        postWithComments.commentCount ?? postWithComments.commentsCount ?? 0;

    const formatCount = (count: number) =>
        count.toLocaleString(i18n.language);

    return (
        <article
            className="portfolio-feed-item group relative isolate cursor-pointer overflow-hidden rounded-none"
            style={{
                ...style,
                minWidth: 160,
                minHeight: 160,
                opacity: 1,
            }}
        >
            <div className="absolute inset-0">
                <ContentWarningOverlay
                    key={p.id}
                    warnings={post.contentWarnings}
                    variant="compact"
                    hasMedia={hasMedia}
                    showHideButton={false}
                    onOverlayClick={() => handlePostClick(p.id)}
                    className="size-full"
                >
                    {firstMedia ? (
                        <img
                            src={firstMedia.path}
                            alt={firstMedia.alt}
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                            className={cn(
                                "size-full object-cover",
                                "transition-[filter] duration-200 ease-out",
                                !hasContentWarnings && [
                                    "group-hover:brightness-[0.45]",
                                    "group-hover:blur-md",
                                    isMenuOpen && "brightness-[0.45] blur-md",
                                ],
                            )}
                        />
                    ) : (
                        <div className="flex size-full flex-col items-center justify-center gap-2 bg-muted/30 p-4 text-center">
                            <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                                <ImageOff
                                    aria-hidden="true"
                                    className="size-5"
                                />
                            </div>
                            <p className="line-clamp-2 max-w-36 text-xs font-medium leading-snug text-muted-foreground">
                                {post.title ||
                                    t(
                                        "components.portfolio.post.no_media",
                                        "No media available",
                                    )}
                            </p>
                        </div>
                    )}
                </ContentWarningOverlay>
            </div>

            {hasMedia && hasMultipleImages && !hasContentWarnings ? (
                <div className="pointer-events-none absolute right-2 top-2 z-20 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm">
                    <Images aria-hidden="true" className="size-3.5" />
                </div>
            ) : null}

            {hasMedia && !hasContentWarnings ? (
                <div
                    aria-hidden="true"
                    className={cn(
                        "pointer-events-none absolute -inset-px z-20",
                        "flex items-center justify-center gap-5",
                        "bg-black/35 text-white backdrop-blur-lg",
                        "transition-opacity duration-200",
                        isMenuOpen
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100",
                    )}
                >
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                        <SolidHeart className="size-5 fill-white" />
                        <span>{formatCount(likeCount)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                        <SolidChat className="size-5 fill-white" />
                        <span>{formatCount(commentCount)}</span>
                    </div>
                </div>
            ) : null}

            {!hasContentWarnings ? (
                <button
                    type="button"
                    className={cn(
                        "absolute inset-0 z-10 cursor-pointer",
                        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                    )}
                    aria-label={
                        post.title
                            ? `View post: ${post.title}`
                            : t(
                                  "components.portfolio.post.view",
                                  "View portfolio post",
                              )
                    }
                    onClick={() => handlePostClick(p.id)}
                />
            ) : null}

            {isOwner ? (
                <div
                    className={cn(
                        "absolute left-2 top-4 z-40 transition-opacity duration-150",
                        isMenuOpen
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100",
                    )}
                >
                    <DropdownMenu
                        modal={false}
                        open={isMenuOpen}
                        onOpenChange={setIsMenuOpen}
                    >
                        <DropdownMenuTrigger asChild>
                            <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                aria-label={t(
                                    "components.profile.portfolio.manage.options",
                                    "Post options",
                                )}
                                onClick={(event) => event.stopPropagation()}
                            >
                                <OutlineMore />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent
                            align="start"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <DropdownMenuItem
                                onSelect={(event) => {
                                    event.stopPropagation();
                                    // TODO: Implement editing.
                                }}
                            >
                                <OutlineEdit />
                                {t(
                                    "components.profile.portfolio.manage.edit",
                                    "Edit post",
                                )}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                variant="destructive"
                                onSelect={(event) => {
                                    event.stopPropagation();
                                    // TODO: Implement deleting.
                                }}
                            >
                                <OutlineTrash />
                                {t(
                                    "components.profile.portfolio.manage.delete",
                                    "Delete post",
                                )}
                            </DropdownMenuItem>

                            {onRemoveFromCatalog ? (
                                <DropdownMenuItem
                                    variant="destructive"
                                    onSelect={(event) => {
                                        event.stopPropagation();
                                        onRemoveFromCatalog(p.id);
                                    }}
                                >
                                    <OutlineTrash />
                                    {t(
                                        "components.profile.portfolio.manage.remove",
                                        "Remove from folder",
                                    )}
                                </DropdownMenuItem>
                            ) : null}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ) : null}
        </article>
    );
});

PortfolioFeedItem.displayName = "PortfolioFeedItem";