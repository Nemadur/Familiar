import { Typography } from "@heroui/react";
import { Edit2, EyeOff, MoreHorizontal, Trash2 } from "lucide-react";
import {
    type CSSProperties,
    memo,
    useCallback,
    useMemo,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import type { PortfolioPostResponse } from "@/api/portfolio/posts/post-types";
import { OutlineEdit, OutlineEyeOff, OutlineImage, OutlineTrash, SolidImage } from "@/components/icons/icons";
import {
    Reel,
    ReelContent,
    ReelImage,
    type ReelItem,
    ReelProgress,
} from "@/components/kibo-ui/reel";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBlurredImage } from "@/hooks/ui/use-blurred-image";
import type { Tile } from "@/lib/bento";
import { cn } from "@/lib/utils";

interface PortfolioFeedItemProps {
    p: Tile;
    post: PortfolioPostResponse;
    handlePostClick: (postId: string) => void;
    style: CSSProperties;
    onRemoveFromCatalog?: (postId: string) => void;
}

type NormalizedMedia = {
    id: string;
    path: string;
    alt: string;
};

export const PortfolioFeedItem = memo(function PortfolioFeedItem({
    p,
    post,
    handlePostClick,
    style,
    onRemoveFromCatalog,
}: PortfolioFeedItemProps) {
    const { t } = useTranslation();

    const [isHovered, setIsHovered] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isContentRevealed, setIsContentRevealed] = useState(false);

    const medias = useMemo<NormalizedMedia[]>(
        () =>
            [...(post.images ?? [])]
                .sort(
                    (a, b) =>
                        (a.position ?? Number.MAX_SAFE_INTEGER) -
                        (b.position ?? Number.MAX_SAFE_INTEGER),
                )
                .map((image) => ({
                    id: image.id,
                    path:
                        image.fullSize?.path ??
                        image.thumbnail?.path ??
                        "",
                    alt: post.title ?? "",
                }))
                .filter((image) => image.path.length > 0),
        [post.images, post.title],
    );

    const firstMedia = medias[0];
    const hasMultipleImages = medias.length > 1;

    const hasContentWarnings = (post.contentWarnings?.length ?? 0) > 0;
    const shouldBlur = hasContentWarnings && !isContentRevealed;

    const blurredImageSrc = useBlurredImage(
        firstMedia?.path,
        shouldBlur,
    );

    // const reelItems = useMemo<ReelItem[]>(
    //     () =>
    //         medias.map((media) => ({
    //             id: media.id,
    //             type: "image",
    //             src: media.path,
    //             duration: 1,
    //             alt: media.alt,
    //         })),
    //     [medias],
    // );

    const handleMouseEnter = useCallback(() => {
        if (hasMultipleImages) {
            setIsHovered(true);
        }
    }, [hasMultipleImages]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
    }, []);

    return (
        <article
            className={cn(
                "portfolio-feed-item group overflow-hidden rounded-p hover:after:opacity-100 after:opacity-0 after:transition-opacity after:duration-150 cursor-pointer after:absolute after:inset-0 after:bg-black/30 after:backdrop-blur-sm",
                // !shouldBlur && "cursor-pointer",
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{
                ...style,
                minWidth: 160,
                minHeight: 160,
                opacity: 1,
            }}
        >
            <div className="absolute inset-0">
                {shouldBlur ? (
                    <div className="relative h-full w-full">
                        <div
                            className="h-full w-full bg-cover bg-center opacity-50 blur-3xl"
                            style={{
                                backgroundImage: `url(${blurredImageSrc ?? firstMedia?.path})`,
                            }}
                        />

                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 p-4 text-center backdrop-blur-sm">
                            <EyeOff
                                className="mb-4 text-white"
                                size={32}
                            />

                            <h4 className="mb-1 font-semibold text-white text-xl">
                                {t(
                                    "components.profile.commissions.card.sensitive_content",
                                )}
                            </h4>

                            <p className="mb-4 text-sm text-white/70">
                                {post.contentWarnings
                                    ?.map((warning) =>
                                        warning
                                            .replace(/_/g, " ")
                                            .toLowerCase(),
                                    )
                                    .join(", ")}
                            </p>

                            <Button
                                size="sm"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setIsContentRevealed(true);
                                }}
                            >
                                {t(
                                    "components.profile.commissions.card.show_content",
                                )}
                            </Button>
                        </div>
                    </div>
                ) : hasMultipleImages ? (
                    <>
                        <img
                            src={firstMedia.path}
                            alt={firstMedia.alt}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                        />

                        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-linear-to-b from-black/80 via-black/40 to-transparent" />

                        {/* TODO: change icon to multiple images */}
                        <OutlineImage className="text-white z-10 absolute top-4 right-4" />

                        {hasContentWarnings && isContentRevealed && (
                            <HideContentButton
                                onHide={() =>
                                    setIsContentRevealed(false)
                                }
                            />
                        )}
                    </>
                    // <Reel
                    //     className="relative h-full w-full"
                    //     data={reelItems}
                    //     index={currentImageIndex}
                    //     onIndexChange={setCurrentImageIndex}
                    //     playing={isHovered}
                    //     autoPlay={false}
                    //     muted
                    //     resetOnPause
                    // >
                    //     <ReelProgress className="top-auto right-auto bottom-3 left-1/2 z-30 w-1/2 -translate-x-1/2 px-1" />

                    //     <ReelContent>
                    //         {(reelItem) => (
                    //             <ReelImage
                    //                 src={reelItem.src}
                    //                 alt={reelItem.alt ?? ""}
                    //                 duration={reelItem.duration}
                    //                 className="h-full w-full object-cover"
                    //             />
                    //         )}
                    //     </ReelContent>

                    //     <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

                    //     {hasContentWarnings && isContentRevealed && (
                    //         <HideContentButton
                    //             onHide={() =>
                    //                 setIsContentRevealed(false)
                    //             }
                    //         />
                    //     )}
                    // </Reel>
                ) : firstMedia ? (
                    <>
                        <img
                            src={firstMedia.path}
                            alt={firstMedia.alt}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                            draggable={false}
                        />

                        {/* <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-linear-to-t from-black/80 via-black/40 to-transparent" /> */}

                        {hasContentWarnings && isContentRevealed && (
                            <HideContentButton
                                onHide={() =>
                                    setIsContentRevealed(false)
                                }
                            />
                        )}
                    </>
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-muted/30 p-4 text-center">
                        <span className="text-muted-foreground font-medium line-clamp-3">
                            {post.title || t("components.portfolio.post.untitled", "Untitled post")}
                        </span>

                        {hasContentWarnings && isContentRevealed && (
                            <HideContentButton
                                onHide={() =>
                                    setIsContentRevealed(false)
                                }
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Interaction Layer */}
            {!shouldBlur && (
                <button
                    type="button"
                    className="absolute inset-0 z-10 cursor-pointer rounded-p focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                    aria-label={
                        post.title
                            ? `View post: ${post.title}`
                            : "View portfolio post"
                    }
                    onClick={() => handlePostClick(p.id)}
                />
            )}

            {/* {post.title && !shouldBlur && (
                <div
                    className={cn(
                        "pointer-events-none absolute inset-x-0 bottom-0 z-20",
                        "flex items-end px-3 pt-8 min-h-28 pb-10",
                        // hasMultipleImages
                        //     ? "min-h-28 pb-10"
                        //     : "min-h-24 pb-6",
                    )}
                >
                    <Typography.Paragraph size={"base"} className="line-clamp-2 text-white!">
                        {post.title}
                    </Typography.Paragraph>
                </div>
            )} */}

            {(onRemoveFromCatalog || true) && (
                <div className="absolute left-2 top-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="bg-black/40 text-white hover:bg-black/60 border-0"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem
                                onSelect={(e) => {
                                    e.stopPropagation();
                                    // TODO: Implement Edit
                                }}
                            >
                                <OutlineEdit />
                                 {t("components.profile.portfolio.manage.edit", "Edit post")}
                            </DropdownMenuItem>
                            {onRemoveFromCatalog && (
                                <DropdownMenuItem
                                    variant="destructive"
                                    onSelect={(e) => {
                                        e.stopPropagation();
                                        onRemoveFromCatalog(p.id);
                                    }}
                                >
                                    <OutlineTrash />
                                    {t("components.profile.portfolio.manage.remove", "Remove from folder")}
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </article>
    );
});

function HideContentButton({
    onHide,
}: {
    onHide: () => void;
}) {
    const { t } = useTranslation();

    return (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 z-20"
                        aria-label={t(
                            "components.profile.commissions.card.hide_content",
                        )}
                        onClick={(event) => {
                            event.stopPropagation();
                            onHide();
                        }}
                    >
                        <OutlineEyeOff aria-hidden="true" />
                    </Button>
                </TooltipTrigger>

                <TooltipContent side="left">
                    {t(
                        "components.profile.commissions.card.hide_content",
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

PortfolioFeedItem.displayName = "PortfolioFeedItem";