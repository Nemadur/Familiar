"use client";

import { useEffect, useState } from "react";
import { useShape } from "src/lib/shape-context";
import { cn } from "src/lib/utils";

// ─── Lazy pdfjs loader ────────────────────────────────────────────────────
// Imports pdfjs-dist on first PDF, caches the module, and points the worker
// at the matching CDN build. Consumers don't need bundler-side worker config.
type PdfjsModule = typeof import("pdfjs-dist");
let pdfjsPromise: Promise<PdfjsModule> | null = null;

async function loadPdfjs(): Promise<PdfjsModule> {
	if (!pdfjsPromise) {
		pdfjsPromise = import("pdfjs-dist").then((mod) => {
			if (!mod.GlobalWorkerOptions.workerSrc) {
				mod.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${mod.version}/build/pdf.worker.min.mjs`;
			}
			return mod;
		});
	}
	return pdfjsPromise;
}

async function renderPdfFirstPage(
	file: File,
	targetWidth: number,
): Promise<string> {
	const pdfjs = await loadPdfjs();
	const buffer = await file.arrayBuffer();
	const pdf = await pdfjs.getDocument({ data: buffer }).promise;
	const page = await pdf.getPage(1);
	const baseViewport = page.getViewport({ scale: 1 });
	const scale = (targetWidth * 2) / baseViewport.width; // 2× for retina
	const viewport = page.getViewport({ scale });
	const canvas = document.createElement("canvas");
	canvas.width = viewport.width;
	canvas.height = viewport.height;
	await page.render({ canvas, viewport }).promise;
	return canvas.toDataURL("image/png");
}

// ─── File thumbnail ───────────────────────────────────────────────────────
// Read-only square preview of a File. Images use object-cover via
// `URL.createObjectURL`; PDFs render the first page via pdfjs; while either is
// resolving a spinner is shown. Self-contained (border + surface + sizing) so
// it can be reused both inside the composer's preview row and to render
// already-sent attachments in a chat transcript.
interface FileThumbnailProps {
	file: File | string;
	/** Side length of the square thumbnail in pixels. */
	size: number;
	className?: string;
}

function FileThumbnail({ file, size, className }: FileThumbnailProps) {
	const shape = useShape();

	const isUrl = typeof file === "string";
	const isImage = isUrl ? true : file.type.startsWith("image/");
	const isPdf = isUrl ? false : file.type === "application/pdf";

	// Create blob URL inside an effect (NOT useMemo) so the cleanup-revoke
	// and the URL-creation stay in sync. In React 18 StrictMode dev, a
	// useMemo-created URL gets revoked by the simulated effect-cleanup but
	// useMemo doesn't re-run on the simulated re-mount (no re-render happens),
	// leaving the DOM with a stale, revoked `blob:` URL — broken image.
	// Putting both in the same effect means the simulated re-mount creates a
	// fresh URL and updates state. The one-frame "before URL" state is
	// covered by the bg-accent (no fallback icon shown for images), so the
	// transition is visually clean.
	const [imageUrl, setImageUrl] = useState<string | null>(isUrl ? file : null);
	useEffect(() => {
		if (!isImage || isUrl) return;
		const url = URL.createObjectURL(file as File);
		setImageUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [isImage, file, isUrl]);

	// PDFs need async rendering — loading flash is unavoidable for the first
	// ~100–300ms while pdfjs loads. Falls back to the generic icon on error.
	const [pdfUrl, setPdfUrl] = useState<string | null>(null);
	useEffect(() => {
		if (!isPdf || isUrl) return;
		let cancelled = false;
		renderPdfFirstPage(file as File, size)
			.then((url) => {
				if (!cancelled) setPdfUrl(url);
			})
			.catch(() => {
				/* fall through to spinner */
			});
		return () => {
			cancelled = true;
		};
	}, [file, isPdf, size]);

	const previewUrl = imageUrl ?? pdfUrl;

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
		>
			{previewUrl ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={previewUrl}
					alt={isUrl ? "Attachment" : (file as File).name}
					className={cn(
						isUrl
							? "w-full h-auto max-h-[320px] object-cover"
							: "absolute inset-0 w-full h-full object-cover",
					)}
				/>
			) : (
				// Circular spinner while we wait for the preview to be ready.
				// Used for both images (brief URL-creation gap) and PDFs (longer
				// pdfjs render). The thin ring is mostly subtle (border-border)
				// with one quadrant accented (border-t-muted-foreground) so the
				// `animate-spin` rotation reads as a moving arc.
				<div className="absolute inset-0 flex items-center justify-center">
					<div
						className="size-6 rounded-full border-2 border-border border-t-muted-foreground animate-spin"
						aria-label="Loading preview"
						role="status"
					/>
				</div>
			)}
		</div>
	);
}

export type { FileThumbnailProps };
export { FileThumbnail, loadPdfjs, renderPdfFirstPage };
