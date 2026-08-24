import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ContentWarningVariant = "default" | "compact" | "folder";

interface ContentWarningOverlayProps {
    children: ReactNode;
    warnings?: readonly string[] | null;
    className?: string;
    defaultRevealed?: boolean;
    revealed?: boolean;
    onRevealedChange?: (revealed: boolean) => void;
    showHideButton?: boolean;
    variant?: ContentWarningVariant;
    hasMedia?: boolean;
    onOverlayClick?: () => void;
}

function formatWarning(warning: string) {
    return warning
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

interface WarningLabelsProps {
    warnings?: readonly string[];
    additionalCount?: number;
    variant?: ContentWarningVariant;
}

// TODO: if post will have more than 3 warnings, show 2 and +N

function WarningLabels({
    warnings,
    additionalCount = 0,
    variant = "default",
}: WarningLabelsProps) {
    if (!warnings?.length) {
        return null;
    }

    const isCompact = variant === "compact";
    const isFolder = variant === "folder";

    return (
        <div
            className={cn(
                "flex max-w-full flex-wrap justify-center",
                isFolder
                    ? "mt-1 gap-0.5"
                    : isCompact
                      ? "mt-2 gap-1"
                      : "mt-4 gap-2",
            )}
        >
            {warnings.map((warning) => (
                <span
                    key={warning}
                    className={cn(
                        "max-w-full truncate rounded-full bg-white/10 font-medium text-white/90 ring-1 ring-white/15",
                        isFolder
                            ? "max-w-28 px-1.5 py-px text-[9px] leading-3"
                            : isCompact
                              ? "px-2 py-0.5 text-[11px]"
                              : "px-3 py-1 text-xs",
                    )}
                >
                    {formatWarning(warning)}
                </span>
            ))}

            {additionalCount > 0 ? (
                <span
                    className={cn(
                        "rounded-full bg-white/10 font-medium text-white/90 ring-1 ring-white/15",
                        isFolder
                            ? "px-1.5 py-px text-[9px] leading-3"
                            : "px-2 py-0.5 text-[11px]",
                    )}
                >
                    +{additionalCount}
                </span>
            ) : null}
        </div>
    );
}

export function ContentWarningOverlay({
    children,
    warnings,
    className,
    defaultRevealed = false,
    revealed: controlledRevealed,
    onRevealedChange,
    showHideButton = true,
    variant = "default",
    hasMedia = true,
    onOverlayClick,
}: ContentWarningOverlayProps) {
    const { t } = useTranslation();
    const [internalRevealed, setInternalRevealed] =
        useState(defaultRevealed);

    const hasWarnings = Boolean(warnings?.length);
    const isCompact = variant === "compact";
    const isFolder = variant === "folder";
    const isSmall = isCompact || isFolder;
    const isRevealed = controlledRevealed ?? internalRevealed;

    const setRevealed = (nextRevealed: boolean) => {
        if (controlledRevealed === undefined) {
            setInternalRevealed(nextRevealed);
        }

        onRevealedChange?.(nextRevealed);
    };

    if (!hasWarnings) {
        return (
            <div className={cn("relative isolate overflow-hidden", className)}>
                {children}
            </div>
        );
    }

    const displayedWarnings = isSmall ? warnings?.slice(0, 2) : warnings;
    const additionalWarningCount = Math.max(
        0,
        (warnings?.length ?? 0) - (displayedWarnings?.length ?? 0),
    );
    const warningBackdropClassName = hasMedia
        ? "bg-black/45 backdrop-blur-lg"
        : "bg-neutral-900";

    return (
        <div className={cn("relative isolate overflow-hidden", className)}>
            <div
                aria-hidden={!isRevealed}
                className={cn(
                    "size-full",
                    !isRevealed && "pointer-events-none select-none",
                    !isRevealed && !hasMedia && "opacity-0",
                )}
            >
                {children}
            </div>

            {!isRevealed && isSmall && onOverlayClick ? (
                <button
                    type="button"
                    aria-label={t(
                        "components.portfolio.content_warning.open",
                        "Open post with sensitive content",
                    )}
                    className={cn(
                        "absolute -inset-px z-30",
                        "flex cursor-pointer flex-col items-center justify-center",
                        isFolder ? "p-1.5" : "p-3",
                        "text-center text-white transition-colors",
                        warningBackdropClassName,
                        hasMedia && "hover:bg-black/50",
                        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white",
                    )}
                    onClick={(event) => {
                        event.stopPropagation();
                        onOverlayClick();
                    }}
                >
                    <div
                        className={cn(
                            "flex items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15",
                            isFolder ? "size-6" : "size-8",
                        )}
                    >
                        <EyeOff
                            aria-hidden="true"
                            className={isFolder ? "size-3" : "size-4"}
                        />
                    </div>

                    <p
                        className={cn(
                            "font-semibold leading-tight",
                            isFolder ? "mt-1 text-[11px]" : "mt-2 text-sm",
                        )}
                    >
                        {t(
                            "components.portfolio.content_warning.sensitive_content",
                            "Sensitive content",
                        )}
                    </p>

                    {!isFolder ? (
                        <WarningLabels
                            warnings={displayedWarnings}
                            additionalCount={additionalWarningCount}
                            variant={variant}
                        />
                    ) : null}
                </button>
            ) : null}

            {!isRevealed && isSmall && !onOverlayClick ? (
                <div
                    role="region"
                    aria-label={t(
                        "components.portfolio.content_warning.title",
                        "Content warning",
                    )}
                    className={cn(
                        "absolute -inset-px z-30",
                        "flex flex-col items-center justify-center",
                        isFolder ? "p-1.5" : "p-3",
                        "text-center text-white",
                        warningBackdropClassName,
                    )}
                    onClick={(event) => event.stopPropagation()}
                >
                    <div
                        className={cn(
                            "flex items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15",
                            isFolder ? "size-6" : "size-8",
                        )}
                    >
                        <EyeOff
                            aria-hidden="true"
                            className={isFolder ? "size-3" : "size-4"}
                        />
                    </div>

                    <p
                        className={cn(
                            "font-semibold leading-tight",
                            isFolder ? "mt-1 text-[11px]" : "mt-2 text-sm",
                        )}
                    >
                        {t(
                            "components.portfolio.content_warning.sensitive_content",
                            "Sensitive content",
                        )}
                    </p>

                    {!isFolder ? (
                        <WarningLabels
                            warnings={displayedWarnings}
                            additionalCount={additionalWarningCount}
                            variant={variant}
                        />
                    ) : null}

                    {!isFolder ? (
                        <Button
                            type="button"
                            size="sm"
                            className="mt-3 h-7 rounded-full bg-white px-3 text-xs text-black hover:bg-white/90"
                            onClick={(event) => {
                                event.stopPropagation();
                                setRevealed(true);
                            }}
                        >
                            <Eye aria-hidden="true" className="size-3.5" />
                            {t(
                                "components.portfolio.content_warning.show",
                                "Show",
                            )}
                        </Button>
                    ) : null}
                </div>
            ) : null}

            {!isRevealed && !isSmall ? (
                <div
                    role="region"
                    aria-label={t(
                        "components.portfolio.content_warning.title",
                        "Content warning",
                    )}
                    className={cn(
                        "absolute -inset-px z-30",
                        "flex items-center justify-center",
                        "p-6 text-center text-white",
                        warningBackdropClassName,
                    )}
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="flex w-full max-w-sm flex-col items-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
                            <ShieldAlert aria-hidden="true" className="size-6" />
                        </div>

                        <h2 className="mt-4 text-lg font-semibold">
                            {t(
                                "components.portfolio.content_warning.sensitive_content",
                                "Sensitive content",
                            )}
                        </h2>

                        <p className="mt-1 max-w-xs text-sm leading-relaxed text-white/70">
                            {t(
                                "components.portfolio.content_warning.description",
                                "This post contains material that some viewers may prefer not to see.",
                            )}
                        </p>

                        <WarningLabels
                            warnings={displayedWarnings}
                            variant="default"
                        />

                        <Button
                            type="button"
                            className="mt-6 min-w-36 bg-white text-black hover:bg-white/90"
                            onClick={(event) => {
                                event.stopPropagation();
                                setRevealed(true);
                            }}
                        >
                            <Eye aria-hidden="true" />
                            {t(
                                "components.portfolio.content_warning.show",
                                "Show content",
                            )}
                        </Button>
                    </div>
                </div>
            ) : null}

            {isRevealed && showHideButton ? (
                <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    aria-label={t(
                        "components.portfolio.content_warning.hide",
                        "Hide sensitive content",
                    )}
                    className={cn(
                        "absolute right-2 top-2 z-30 rounded-full border-0",
                        "bg-black/55 text-white backdrop-blur-md",
                        "hover:bg-black/70 hover:text-white",
                        isSmall && "size-8",
                    )}
                    onClick={(event) => {
                        event.stopPropagation();
                        setRevealed(false);
                    }}
                >
                    <EyeOff
                        aria-hidden="true"
                        className={cn(isSmall && "size-4")}
                    />
                </Button>
            ) : null}
        </div>
    );
}