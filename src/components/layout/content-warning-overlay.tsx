import { Eye, EyeOff, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ContentWarningOverlayProps {
	children: ReactNode;
	warnings?: readonly string[] | null;
	className?: string;

	defaultRevealed?: boolean;
	revealed?: boolean;
	onRevealedChange?: (revealed: boolean) => void;

	showHideButton?: boolean;
	variant?: "default" | "compact";
	hasMedia?: boolean;

	/**
	 * In compact grid mode, clicking the warning opens
	 * the post instead of revealing it.
	 */
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
	compact?: boolean;
}

function WarningLabels({
	warnings,
	additionalCount = 0,
	compact = false,
}: WarningLabelsProps) {
	if (!warnings?.length) {
		return null;
	}

	return (
		<div
			className={cn(
				"flex max-w-full flex-wrap justify-center",
				compact ? "mt-2 gap-1" : "mt-4 gap-2",
			)}
		>
			{warnings.map((warning) => (
				<span
					key={warning}
					className={cn(
						"max-w-full truncate rounded-full bg-white/10 font-medium text-white/90 ring-1 ring-white/15",
						compact ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
					)}
				>
					{formatWarning(warning)}
				</span>
			))}

			{additionalCount > 0 && (
				<span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/90 ring-1 ring-white/15">
					+{additionalCount}
				</span>
			)}
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

	const [internalRevealed, setInternalRevealed] = useState(defaultRevealed);

	const hasWarnings = Boolean(warnings?.length);
	const isCompact = variant === "compact";

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

	const displayedWarnings = isCompact ? warnings?.slice(0, 2) : warnings;

	const additionalWarningCount = Math.max(
		0,
		(warnings?.length ?? 0) - (displayedWarnings?.length ?? 0),
	);

	const warningBackdropClassName = hasMedia
		? "bg-black/45 backdrop-blur-lg"
		: "bg-neutral-900";

	return (
		<div className={cn("relative isolate overflow-hidden", className)}>
			{/*
			 * Media remains unchanged.
			 * Do not apply blur or scale directly to this element.
			 */}
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

			{/* Compact grid overlay that opens the modal */}
			{!isRevealed && isCompact && onOverlayClick && (
				<button
					type="button"
					aria-label={t(
						"components.portfolio.content_warning.open",
						"Open post with sensitive content",
					)}
					className={cn(
						"absolute -inset-px z-30",
						"flex cursor-pointer flex-col items-center justify-center",
						"p-3 text-center text-white",
						"transition-colors",
						warningBackdropClassName,
						hasMedia && "hover:bg-black/50",
						"focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white",
					)}
					onClick={(event) => {
						event.stopPropagation();
						onOverlayClick();
					}}
				>
					<div className="flex size-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
						<EyeOff aria-hidden="true" className="size-4" />
					</div>

					<p className="mt-2 text-sm font-semibold leading-tight">
						{t(
							"components.portfolio.content_warning.sensitive_content",
							"Sensitive content",
						)}
					</p>

					<WarningLabels
						warnings={displayedWarnings}
						additionalCount={additionalWarningCount}
						compact
					/>
				</button>
			)}

			{/* Compact reveal mode */}
			{!isRevealed && isCompact && !onOverlayClick && (
				<div
					role="region"
					aria-label={t(
						"components.portfolio.content_warning.title",
						"Content warning",
					)}
					className={cn(
						"absolute -inset-px z-30",
						"flex flex-col items-center justify-center",
						"p-3 text-center text-white",
						warningBackdropClassName,
					)}
					onClick={(event) => event.stopPropagation()}
				>
					<div className="flex size-8 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
						<EyeOff aria-hidden="true" className="size-4" />
					</div>

					<p className="mt-2 text-sm font-semibold leading-tight">
						{t(
							"components.portfolio.content_warning.sensitive_content",
							"Sensitive content",
						)}
					</p>

					<WarningLabels
						warnings={displayedWarnings}
						additionalCount={additionalWarningCount}
						compact
					/>

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

						{t("components.portfolio.content_warning.show", "Show")}
					</Button>
				</div>
			)}

			{/* Full modal warning */}
			{!isRevealed && !isCompact && (
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

						<WarningLabels warnings={displayedWarnings} />

						<Button
							type="button"
							className="mt-6 min-w-36 bg-white text-black hover:bg-white/90"
							onClick={(event) => {
								event.stopPropagation();
								setRevealed(true);
							}}
						>
							<Eye aria-hidden="true" />

							{t("components.portfolio.content_warning.show", "Show content")}
						</Button>
					</div>
				</div>
			)}

			{/* Hide again after revealing */}
			{isRevealed && showHideButton && (
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
						isCompact && "size-8",
					)}
					onClick={(event) => {
						event.stopPropagation();
						setRevealed(false);
					}}
				>
					<EyeOff aria-hidden="true" className={cn(isCompact && "size-4")} />
				</Button>
			)}
		</div>
	);
}
