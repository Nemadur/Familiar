import { useEffect, useState } from "react";

/**
 * A hook that takes an image URL and generates a low-res blurred base64/blob version of it.
 * This is fully client-side and can accept an image URL from any source.
 *
 * @param src The source URL of the image
 * @param shouldBlur Whether the blur effect should be generated
 */
export function useBlurredImage(src: string | undefined, shouldBlur: boolean) {
	const [blurredSrc, setBlurredSrc] = useState<string | null>(null);

	useEffect(() => {
		if (!shouldBlur || !src) {
			setBlurredSrc(null);
			return;
		}

		let isActive = true;
		const img = new Image();
		img.crossOrigin = "Anonymous";
		img.src = src;

		img.onload = () => {
			if (!isActive) return;

			const canvas = document.createElement("canvas");
			// Small size for performance and natural blur effect
			const w = 16;
			const h = (w / img.width) * img.height;
			canvas.width = w;
			canvas.height = h;

			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			ctx.imageSmoothingEnabled = true;
			ctx.imageSmoothingQuality = "medium";
			ctx.drawImage(img, 0, 0, w, h);

			// Export as blob url
			canvas.toBlob(
				(blob) => {
					if (!isActive || !blob) return;
					const url = URL.createObjectURL(blob);
					setBlurredSrc(url);
				},
				"image/jpeg",
				0.5,
			);
		};

		img.onerror = () => {
			console.error("Failed to load image for blurring:", src);
		};

		return () => {
			isActive = false;
		};
	}, [src, shouldBlur]);

	// Separate effect to cleanup blobs
	useEffect(() => {
		return () => {
			if (blurredSrc) {
				URL.revokeObjectURL(blurredSrc);
			}
		};
	}, [blurredSrc]);

	return blurredSrc;
}
