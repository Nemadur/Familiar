"use client";

import { useEffect, useState } from "react";
import { cn } from "src/lib/utils";

const imageUrlPattern = /\.(?:avif|bmp|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i;
const pdfUrlPattern = /\.pdf(?:[?#].*)?$/i;

function getUrlPathname(value: string): string {
	try {
		return new URL(value, window.location.href).pathname;
	} catch {
		return value;
	}
}

function getAttachmentName(file: File | string): string {
	if (typeof file !== "string") return file.name;

	const pathname = getUrlPathname(file);
	const lastPart = pathname.split("/").filter(Boolean).at(-1);

	if (!lastPart) return "Attachment";

	try {
		return decodeURIComponent(lastPart);
	} catch {
		return lastPart;
	}
}

function isPdfAttachment(file: File | string): boolean {
	if (typeof file === "string") {
		return pdfUrlPattern.test(getUrlPathname(file));
	}

	return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function isImageAttachment(file: File | string): boolean {
	if (typeof file === "string") {
		const pathname = getUrlPathname(file);

		if (pdfUrlPattern.test(pathname)) return false;

		// For old/signed image URLs without clear extension, try rendering as img
		// and fall back to the generic card on image load error.
		return imageUrlPattern.test(pathname) || !/\.[a-z0-9]+$/i.test(pathname);
	}

	return file.type.startsWith("image/") || imageUrlPattern.test(file.name);
}

// ─── File thumbnail ───────────────────────────────────────────────────────
// Safe client-side preview:
// - images: displayed with object URLs / normal URLs
// - PDFs: NOT parsed/rendered in the browser; shown as a static card
// If first-page PDF thumbnails are required, generate them server-side in a
// sandboxed worker/container and send only a PNG/WebP thumbnail to the client.
interface FileThumbnailProps {
	file: File | string;
	/** Side length of the square thumbnail in pixels. */
	size: number;
	className?: string;
}

function FileThumbnail({ file, size, className }: FileThumbnailProps) {
	const isUrl = typeof file === "string";
	const isPdf = isPdfAttachment(file);
	const isImage = !isPdf && isImageAttachment(file);
	const name = getAttachmentName(file);

	const [imageUrl, setImageUrl] = useState<string | null>(
		isUrl && isImage ? file : null,
	);
	const [imageFailed, setImageFailed] = useState(false);

	useEffect(() => {
		setImageFailed(false);

		if (!isImage) {
			setImageUrl(null);
			return;
		}

		if (isUrl) {
			setImageUrl(file);
			return;
		}

		const url = URL.createObjectURL(file);
		setImageUrl(url);

		return () => URL.revokeObjectURL(url);
	}, [file, isImage, isUrl]);

	const previewUrl = imageUrl && !imageFailed ? imageUrl : null;

	return (
		<div
			className={cn(
				"relative shrink-0 overflow-hidden bg-primary/6 border border-border rounded-2xl flex items-center justify-center",
				className,
			)}
			style={{
				width: isUrl ? undefined : size,
				height: isUrl ? undefined : size,
				maxWidth: isUrl ? 320 : undefined,
			}}
			title={name}
		>
			{previewUrl ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={previewUrl}
					alt={name}
					className={cn(
						isUrl
							? "w-full h-auto max-h-[320px] object-cover"
							: "absolute inset-0 w-full h-full object-cover",
					)}
					onError={() => setImageFailed(true)}
				/>
			) : (
				<div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2 text-center">
					<div className="rounded-md border border-border bg-background/60 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
						{isPdf ? "PDF" : isImage ? "IMG" : "FILE"}
					</div>

					<div
						className="max-w-full truncate text-[0.65rem] leading-tight text-muted-foreground"
						title={name}
					>
						{name}
					</div>
				</div>
			)}
		</div>
	);
}

export type { FileThumbnailProps };
export { FileThumbnail };
